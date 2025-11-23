import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LensType, Point } from '../types';

interface SimulationCanvasProps {
  lensType: LensType;
  focalLength: number;
  objectDistance: number;
  objectHeight: number;
  setObjectDistance: (val: number) => void;
  setFocalLength: (val: number) => void;
  narration?: string; // Optional prop for subtitles
}

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); // Reset when text content changes (new zone)
    
    if (!text) return;

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex++;
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(intervalId);
      }
    }, 50); // Speed of typing: 50ms per character

    return () => clearInterval(intervalId);
  }, [text]);

  return <p className="text-lg md:text-xl font-medium tracking-wide leading-relaxed text-left inline-block">{displayedText}</p>;
};

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  lensType,
  focalLength,
  objectDistance,
  objectHeight,
  setObjectDistance,
  setFocalLength,
  narration = "",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDraggingObj, setIsDraggingObj] = useState(false);
  const [isDraggingFocus, setIsDraggingFocus] = useState(false);

  // SVG Configuration
  const width = 800;
  const height = 400;
  const origin: Point = { x: width / 2, y: height / 2 };

  // Physics Calculations
  // Coordinate system: Lens center is (0,0). Object is at x = -objectDistance.
  // We map this to SVG coordinates: svgX = origin.x + physX.
  const u = -objectDistance;
  // For concave lens, focal length is effectively negative in the lens equation
  const f = lensType === LensType.CONVEX ? focalLength : -focalLength;
  
  // Lens equation: 1/v = 1/f - 1/u => v = (u*f) / (u+f)
  // Handle case where u = -f (parallel rays, v -> infinity)
  let v = (u * f) / (u + f);
  
  // Avoid division by zero or infinite rendering
  if (Math.abs(u + f) < 0.1) {
    v = Infinity; // Represents parallel rays
  }

  const magnification = v === Infinity ? 0 : v / u;
  const imageHeight = magnification * objectHeight; // inverted if negative
  const imageDistance = v; // Coordinate

  // Helpers to convert Physics Coords to SVG Coords
  const toSvg = (x: number, y: number): Point => ({
    x: origin.x + x,
    y: origin.y - y, // SVG y-axis is down, physics y-axis is up
  });

  const objectTip = toSvg(u, objectHeight);
  const objectBase = toSvg(u, 0);
  const imageTip = toSvg(v === Infinity ? 0 : v, imageHeight);
  const imageBase = toSvg(v === Infinity ? 0 : v, 0);
  
  // Ray Tracing Points
  // 1. Parallel Ray: Object Tip -> Lens (parallel to axis) -> Focus
  const ray1Start = objectTip;
  const ray1LensHit = toSvg(0, objectHeight); // Hits lens at same height
  let ray1End: Point;
  
  // 2. Central Ray: Object Tip -> Optical Center -> Straight through
  const ray2Start = objectTip;
  const ray2End = toSvg(500, -500 * (objectHeight / u)); // Extrapolate far to right

  // 3. Focal Ray: Object Tip -> Through/Towards Focus -> Lens -> Parallel
  const ray3Start = objectTip;
  let ray3LensHit: Point;
  let ray3End: Point;

  // Calculate specific endpoints for better visualization based on lens type
  if (lensType === LensType.CONVEX) {
    // Ray 1: Parallel -> Focus (f, 0)
    // Line eq: y - 0 = m(x - f). Slope m from (0, h) to (f, 0) => m = -h/f
    // Extrapolate to right edge
    const m1 = -objectHeight / focalLength;
    ray1End = toSvg(400, m1 * (400 - focalLength));

    // Ray 3: Through Focus (-f, 0) -> Lens -> Parallel
    const slope3 = (0 - objectHeight) / (-focalLength - u);
    // Intersection with lens (x=0). y = m(x - x1) + y1
    const yHit = slope3 * (-u) + objectHeight; 
    
    ray3LensHit = toSvg(0, yHit);
    ray3End = toSvg(400, yHit); // Goes parallel to right
  } else {
    // CONCAVE LENS
    // Ray 1: Parallel -> Diverges as if from Focus (-f, 0)
    const m1 = objectHeight / focalLength; 
    ray1End = toSvg(400, m1 * (400 + focalLength)); // x relative to focus (-f)

    // Ray 3: Headed towards Focus (f, 0) on right side -> Lens -> Parallel
    const m3 = -objectHeight / (focalLength - u);
    const yHit3 = m3 * (-u) + objectHeight;
    ray3LensHit = toSvg(0, yHit3);
    ray3End = toSvg(400, yHit3);
  }

  // --- Interaction Handlers ---
  const handleMouseDown = (e: React.MouseEvent, target: 'obj' | 'focus') => {
    e.preventDefault();
    if (target === 'obj') setIsDraggingObj(true);
    if (target === 'focus') setIsDraggingFocus(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!svgRef.current) return;
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    // Mouse Pos in SVG coords
    const mouseX = (e.clientX - CTM.e) / CTM.a;
    
    // Convert SVG X to Physics X
    // svgX = origin.x + physX => physX = svgX - origin.x
    const physX = mouseX - origin.x;

    if (isDraggingObj) {
      // Object is always on left, so physX should be negative
      // Limit to reasonable range
      const newDist = Math.max(20, Math.min(450, -physX));
      setObjectDistance(newDist);
    }

    if (isDraggingFocus) {
        // Dragging the right-side focus point to adjust f
        // Focus is symmetric, we just use the magnitude
        const newF = Math.max(50, Math.min(200, Math.abs(physX)));
        setFocalLength(newF);
    }
  }, [isDraggingObj, isDraggingFocus, origin.x, setObjectDistance, setFocalLength]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingObj(false);
    setIsDraggingFocus(false);
  }, []);

  useEffect(() => {
    if (isDraggingObj || isDraggingFocus) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingObj, isDraggingFocus, handleMouseMove, handleMouseUp]);

  // Virtual Ray Extrapolations (Dashed lines)
  const renderVirtualLines = () => {
    const lines = [];
    const dashedStyle = { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4,4' };

    if (lensType === LensType.CONVEX) {
       // Virtual Image conditions: |u| < f
       if (Math.abs(u) < focalLength) {
         lines.push(
            <line key="v1" x1={ray1LensHit.x} y1={ray1LensHit.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />
         );
         lines.push(
            <line key="v2" x1={origin.x} y1={origin.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />
         );
         lines.push(
            <line key="v3" x1={ray3LensHit.x} y1={ray3LensHit.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />
         );
       }
    } else {
        // CONCAVE: Always virtual
        lines.push(
            <line key="vc1" x1={ray1LensHit.x} y1={ray1LensHit.y} x2={toSvg(-focalLength, 0).x} y2={toSvg(-focalLength, 0).y} {...dashedStyle} />
        );
        lines.push(
             <line key="vc3" x1={ray3LensHit.x} y1={ray3LensHit.y} x2={imageTip.x - 200} y2={imageTip.y} {...dashedStyle} />
        );
    }
    return lines;
  };

  return (
    <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative select-none group">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full cursor-crosshair"
      >
        <defs>
          <marker id="arrowhead-obj" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker id="arrowhead-img" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" opacity="0.6" />
          </marker>
        </defs>

        {/* Grid / Axis */}
        <line x1="0" y1={origin.y} x2={width} y2={origin.y} stroke="#cbd5e1" strokeWidth="2" />
        <line x1={origin.x} y1="0" x2={origin.x} y2={height} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />

        {/* Focal Points */}
        {[ -focalLength, focalLength, -2 * focalLength, 2 * focalLength ].map((pos) => {
            const p = toSvg(pos, 0);
            const label = Math.abs(pos) === focalLength ? 'F' : '2F';
            return (
                <g key={pos} className="group/focus cursor-pointer">
                    <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="4" 
                        fill="#475569" 
                        className={Math.abs(pos) === focalLength ? "hover:fill-indigo-500 hover:scale-150 transition-all" : ""}
                        onMouseDown={(e) => Math.abs(pos) === focalLength && handleMouseDown(e, 'focus')}
                    />
                    <text x={p.x} y={p.y + 20} textAnchor="middle" className="text-xs fill-slate-500 font-mono select-none pointer-events-none">
                        {pos < 0 ? label + "'" : label}
                    </text>
                </g>
            )
        })}

        {/* The Lens */}
        <g transform={`translate(${origin.x}, ${origin.y})`}>
          {lensType === LensType.CONVEX ? (
            <path
              d="M 0,-150 Q 30,0 0,150 Q -30,0 0,-150"
              fill="rgba(165, 243, 252, 0.3)"
              stroke="#0891b2"
              strokeWidth="2"
            />
          ) : (
            <path
              d="M -15,-150 Q 0,0 -15,150 L 15,150 Q 0,0 15,-150 Z"
              fill="rgba(165, 243, 252, 0.3)"
              stroke="#0891b2"
              strokeWidth="2"
            />
          )}
        </g>

        {/* Object (Draggable) */}
        <g 
            className="cursor-move"
            onMouseDown={(e) => handleMouseDown(e, 'obj')}
        >
            <line
                x1={objectBase.x} y1={objectBase.y}
                x2={objectTip.x} y2={objectTip.y}
                stroke="#ef4444" strokeWidth="4"
                markerEnd="url(#arrowhead-obj)"
            />
            {/* Hit area for easier dragging */}
            <rect 
                x={objectTip.x - 15} 
                y={Math.min(objectTip.y, objectBase.y)} 
                width="30" 
                height={Math.abs(objectTip.y - objectBase.y)} 
                fill="transparent" 
            />
             <text x={objectBase.x} y={objectBase.y + 20} textAnchor="middle" className="text-sm font-bold fill-red-500 select-none">
                物体
            </text>
        </g>

        {/* Image (Result) */}
        {v !== Infinity && (
            <g className="opacity-70">
                <line
                    x1={imageBase.x} y1={imageBase.y}
                    x2={imageTip.x} y2={imageTip.y}
                    stroke="#6366f1" strokeWidth="4"
                    markerEnd="url(#arrowhead-img)"
                    strokeDasharray={ (v * u > 0) ? "5,5" : "" } // Dashed if on same side (Virtual)
                />
                 <text x={imageBase.x} y={imageBase.y + 20} textAnchor="middle" className="text-sm font-bold fill-indigo-500 select-none">
                    像
                </text>
            </g>
        )}

        {/* Rays */}
        <g style={{ mixBlendMode: 'multiply' }}>
            {/* Virtual Extensions */}
            {renderVirtualLines()}

            {/* Ray 1 (Red): Parallel -> Focus */}
            <path
                d={`M ${ray1Start.x},${ray1Start.y} L ${ray1LensHit.x},${ray1LensHit.y} L ${ray1End.x},${ray1End.y}`}
                stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6"
            />
             {/* Ray 2 (Green): Center */}
             <path
                d={`M ${ray2Start.x},${ray2Start.y} L ${ray2End.x},${ray2End.y}`}
                stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6"
            />
            {/* Ray 3 (Blue): Focus -> Parallel */}
            <path
                d={`M ${ray3Start.x},${ray3Start.y} L ${ray3LensHit.x},${ray3LensHit.y} L ${ray3End.x},${ray3End.y}`}
                stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6"
            />
        </g>
      </svg>
      
      {/* Dynamic Subtitle Overlay with Typewriter Effect */}
      {narration && (
         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] pointer-events-none z-20">
            <div className="bg-black/75 backdrop-blur-sm text-white px-8 py-5 rounded-xl shadow-2xl border border-white/10 animate-in fade-in duration-300 min-h-[5rem] flex items-center justify-center">
                <TypewriterText text={narration} />
            </div>
         </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 p-2 rounded-lg text-xs shadow-sm border border-slate-200 pointer-events-none z-10">
          <div className="flex items-center gap-2 mb-1"><div className="w-3 h-0.5 bg-red-500"></div> 平行光线 (Parallel)</div>
          <div className="flex items-center gap-2 mb-1"><div className="w-3 h-0.5 bg-emerald-500"></div> 穿过光心 (Center)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500"></div> 穿过焦点 (Focal)</div>
      </div>
    </div>
  );
};

export default SimulationCanvas;