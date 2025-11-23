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

// Improved Candle Component - Textbook Style
// The 'height' prop now represents the TOTAL height from base to flame tip.
// This ensures the rays (which start at y=height) appear to originate exactly from the flame tip.
const Candle = ({ x, baseY, height, isImage = false, opacity = 1 }: { x: number, baseY: number, height: number, isImage?: boolean, opacity?: number }) => {
    const isInverted = height < 0;
    const totalHeight = Math.abs(height);
    
    // Textbook Proportions: The flame is a significant part of the total height
    // We calculate backwards: Total Height = Body + Wick + Flame
    const flameRatio = 0.35; // Flame is 35% of the object
    const wickRatio = 0.05;  // Wick is 5%
    
    // Calculate dimensions ensuring minimum visibility
    const flameHeight = Math.max(10, totalHeight * flameRatio);
    const wickHeight = Math.max(2, totalHeight * wickRatio);
    const bodyHeight = Math.max(5, totalHeight - flameHeight - wickHeight);
    
    const width = Math.max(8, bodyHeight * 0.35); // Aspect ratio for the body
    const flameWidth = flameHeight * 0.55;

    // Coordinate Calculations (Y axis increases downwards in SVG, but we handle relative to baseY)
    // We build from the base upwards (or downwards if inverted)
    
    const direction = isInverted ? 1 : -1; // 1 for down (inverted), -1 for up (upright)

    const bodyTopY = baseY + (bodyHeight * direction);
    const wickTopY = bodyTopY + (wickHeight * direction);
    const flameTipY = wickTopY + (flameHeight * direction); // This should visually match (baseY + height)

    return (
        <g opacity={opacity} className="select-none pointer-events-none">
            {/* Candle Body - Textbook Red Cylinder */}
            <rect 
                x={x - width/2} 
                y={Math.min(baseY, bodyTopY)} 
                width={width} 
                height={bodyHeight} 
                rx={2}
                fill="url(#candleBodyGradient)" 
                stroke="#9f1239"
                strokeWidth="1"
            />
            
            {/* Wax Top Surface (Perspective) */}
            <ellipse 
                cx={x} 
                cy={bodyTopY} 
                rx={width/2} 
                ry={width/6} 
                fill="#fb7185" 
                stroke="#9f1239"
                strokeWidth="0.5"
            />
            
            {/* Wick - Simple black line */}
            <line 
                x1={x} y1={bodyTopY}
                x2={x} y2={wickTopY}
                stroke="#1f2937" 
                strokeWidth="2"
                strokeLinecap="round"
            />
            
            {/* Flame - Textbook Style (Teardrop shape) */}
            <g 
                className={isImage ? "" : "flame-flicker"} 
                style={{ 
                    transformBox: 'fill-box', 
                    transformOrigin: isInverted ? 'center top' : 'center bottom' 
                }}
            >
                {/* Outer Flame (Orange) */}
                <path 
                    d={`M ${x},${wickTopY} 
                        Q ${x - flameWidth},${wickTopY + (flameHeight * 0.4 * direction)} ${x},${flameTipY} 
                        Q ${x + flameWidth},${wickTopY + (flameHeight * 0.4 * direction)} ${x},${wickTopY} Z`}
                    fill="#f59e0b"
                    fillOpacity="0.9"
                    stroke="#d97706"
                    strokeWidth="0.5"
                />
                
                {/* Inner Flame (Yellow/White) */}
                <path 
                    d={`M ${x},${wickTopY + (2 * direction)} 
                        Q ${x - flameWidth * 0.4},${wickTopY + (flameHeight * 0.3 * direction)} ${x},${flameTipY - (flameHeight * 0.2 * direction)} 
                        Q ${x + flameWidth * 0.4},${wickTopY + (flameHeight * 0.3 * direction)} ${x},${wickTopY + (2 * direction)} Z`}
                    fill="#fef3c7"
                />
            </g>
        </g>
    );
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
  const u = -objectDistance;
  const f = lensType === LensType.CONVEX ? focalLength : -focalLength;
  
  let v = (u * f) / (u + f);
  if (Math.abs(u + f) < 0.1) {
    v = Infinity;
  }

  const magnification = v === Infinity ? 0 : v / u;
  const imageHeight = magnification * objectHeight; // inverted if negative
  
  // Helpers to convert Physics Coords to SVG Coords
  const toSvg = (x: number, y: number): Point => ({
    x: origin.x + x,
    y: origin.y - y,
  });

  // Critical for Textbook Accuracy:
  // The rays MUST originate from the tip of the object.
  // We align the Candle visual so the flame tip is exactly at `objectHeight`.
  const objectTip = toSvg(u, objectHeight);
  const objectBase = toSvg(u, 0);
  const imageTip = toSvg(v === Infinity ? 0 : v, imageHeight);
  const imageBase = toSvg(v === Infinity ? 0 : v, 0);
  
  // Ray Tracing Points
  const ray1Start = objectTip;
  const ray1LensHit = toSvg(0, objectHeight);
  let ray1End: Point;
  
  // Ray 2: Through Optical Center (0,0)
  // Slope = (0 - objectHeight) / (0 - u) = objectHeight/u
  // In SVG coords: starts at objectTip, goes through origin.
  const ray2Start = objectTip;
  // Calculate a point far to the right based on slope
  const ray2End = toSvg(500, -500 * (objectHeight / u)); 

  const ray3Start = objectTip;
  let ray3LensHit: Point;
  let ray3End: Point;

  if (lensType === LensType.CONVEX) {
    // Ray 1: Parallel -> Focal Point
    const m1 = -objectHeight / focalLength;
    ray1End = toSvg(400, m1 * (400 - focalLength));

    // Ray 3: Through Focal Point -> Parallel
    const slope3 = (0 - objectHeight) / (-focalLength - u);
    const yHit = slope3 * (-u) + objectHeight; 
    
    ray3LensHit = toSvg(0, yHit);
    ray3End = toSvg(400, yHit); 
  } else {
    // Concave logic
    const m1 = objectHeight / focalLength; 
    ray1End = toSvg(400, m1 * (400 + focalLength));

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
    
    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const physX = mouseX - origin.x;

    if (isDraggingObj) {
      const newDist = Math.max(20, Math.min(450, -physX));
      setObjectDistance(newDist);
    }

    if (isDraggingFocus) {
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

  const renderVirtualLines = () => {
    const lines = [];
    const dashedStyle = { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4,4' };

    if (lensType === LensType.CONVEX) {
       if (Math.abs(u) < focalLength) {
         lines.push(<line key="v1" x1={ray1LensHit.x} y1={ray1LensHit.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />);
         lines.push(<line key="v2" x1={origin.x} y1={origin.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />);
         lines.push(<line key="v3" x1={ray3LensHit.x} y1={ray3LensHit.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />);
       }
    } else {
        lines.push(<line key="vc1" x1={ray1LensHit.x} y1={ray1LensHit.y} x2={toSvg(-focalLength, 0).x} y2={toSvg(-focalLength, 0).y} {...dashedStyle} />);
        lines.push(<line key="vc3" x1={ray3LensHit.x} y1={ray3LensHit.y} x2={imageTip.x - 200} y2={imageTip.y} {...dashedStyle} />);
    }
    return lines;
  };

  return (
    <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative select-none group">
      <style>{`
        @keyframes flicker {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.02, 0.98); opacity: 0.95; }
            100% { transform: scale(0.98, 1.02); opacity: 1; }
        }
        .flame-flicker {
            animation: flicker 0.2s infinite alternate ease-in-out;
        }
      `}</style>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full cursor-crosshair"
      >
        <defs>
          <linearGradient id="candleBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="#be123c" />
             <stop offset="25%" stopColor="#e11d48" />
             <stop offset="50%" stopColor="#fb7185" />
             <stop offset="75%" stopColor="#e11d48" />
             <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
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

        {/* Object (Candle) - Draggable */}
        <g 
            className="cursor-move"
            onMouseDown={(e) => handleMouseDown(e, 'obj')}
        >
            <Candle x={objectBase.x} baseY={objectBase.y} height={objectHeight} />
            
            {/* Hit area for easier dragging */}
            <rect 
                x={objectTip.x - 20} 
                y={Math.min(objectTip.y, objectBase.y)} 
                width="40" 
                height={Math.abs(objectTip.y - objectBase.y)} 
                fill="transparent" 
            />
             <text x={objectBase.x} y={objectBase.y + 20} textAnchor="middle" className="text-sm font-bold fill-red-700 select-none">
                蜡烛
            </text>
        </g>

        {/* Image (Result Candle) */}
        {v !== Infinity && (
            <g>
                <Candle 
                    x={imageBase.x} 
                    baseY={imageBase.y} 
                    height={imageHeight} 
                    isImage={true}
                    opacity={v * u > 0 ? 0.6 : 0.8} // More transparent if virtual
                />
                 <text x={imageBase.x} y={imageBase.y + (imageHeight < 0 ? -20 : 20)} textAnchor="middle" className="text-sm font-bold fill-indigo-500 select-none">
                    像
                </text>
            </g>
        )}

        {/* Rays */}
        <g style={{ mixBlendMode: 'multiply' }}>
            {renderVirtualLines()}
            <path d={`M ${ray1Start.x},${ray1Start.y} L ${ray1LensHit.x},${ray1LensHit.y} L ${ray1End.x},${ray1End.y}`} stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6" />
            <path d={`M ${ray2Start.x},${ray2Start.y} L ${ray2End.x},${ray2End.y}`} stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6" />
            <path d={`M ${ray3Start.x},${ray3Start.y} L ${ray3LensHit.x},${ray3LensHit.y} L ${ray3End.x},${ray3End.y}`} stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
        </g>
      </svg>
      
      {/* Movie-style Subtitle Overlay */}
      {narration && (
         <div className="absolute bottom-8 w-full text-center pointer-events-none z-20">
            <p className="inline-block px-4 text-xl md:text-2xl font-semibold text-white tracking-wide leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300"
               style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' }}
            >
                {narration}
            </p>
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