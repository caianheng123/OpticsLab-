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
    // In physics diagrams, the object height 'h' usually points to the tip of the flame.
    const flameRatio = 0.30; 
    const wickRatio = 0.05;  
    
    // Calculate dimensions ensuring minimum visibility
    const flameHeight = Math.max(10, totalHeight * flameRatio);
    const wickHeight = Math.max(2, totalHeight * wickRatio);
    const bodyHeight = Math.max(5, totalHeight - flameHeight - wickHeight);
    
    const width = Math.max(8, bodyHeight * 0.4); // Aspect ratio for the body
    const flameWidth = flameHeight * 0.6;

    // Coordinate Calculations 
    // We need to stack them so the TIP of the flame is exactly at (baseY - height) [for upright]
    
    const direction = isInverted ? 1 : -1; // 1 for down (inverted), -1 for up (upright)

    // Base of the candle is at baseY.
    // Body Top is at baseY + bodyHeight * direction
    const bodyTopY = baseY + (bodyHeight * direction);
    const wickTopY = bodyTopY + (wickHeight * direction);
    // The flame tip is at baseY + totalHeight * direction.
    // We use this to draw the flame curve.
    const flameTipY = baseY + (totalHeight * direction); 

    return (
        <g opacity={opacity} className="select-none pointer-events-none">
            {/* Candle Body - Textbook Red Cylinder */}
            <rect 
                x={x - width/2} 
                y={Math.min(baseY, bodyTopY)} 
                width={width} 
                height={bodyHeight} 
                fill="#dc2626" 
                stroke="#7f1d1d"
                strokeWidth="1"
            />
            
            {/* Wax Top Surface (Perspective ellipse) */}
            <ellipse 
                cx={x} 
                cy={bodyTopY} 
                rx={width/2} 
                ry={width/6} 
                fill="#fca5a5" 
                stroke="#7f1d1d"
                strokeWidth="0.5"
            />
            
            {/* Wick - Simple black line */}
            <line 
                x1={x} y1={bodyTopY}
                x2={x} y2={wickTopY}
                stroke="#000000" 
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
                    fillOpacity="0.95"
                    stroke="#d97706"
                    strokeWidth="0.5"
                />
                
                {/* Inner Flame (Yellow/White) - Bright center */}
                <path 
                    d={`M ${x},${wickTopY + (2 * direction)} 
                        Q ${x - flameWidth * 0.4},${wickTopY + (flameHeight * 0.3 * direction)} ${x},${flameTipY - (flameHeight * 0.25 * direction)} 
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
  const u = -objectDistance; // u is negative in our coordinate system (left of lens)
  const f = lensType === LensType.CONVEX ? focalLength : -focalLength;
  
  // Lens Formula: 1/f = 1/v - 1/u  => 1/v = 1/f + 1/u => v = (uf)/(u+f)
  let v = (u * f) / (u + f);
  
  // Handle edge case where object is at focal point
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
  // The rays MUST originate from the TIP of the object (coordinate y = objectHeight).
  // The Candle component is now calibrated so its visual tip is exactly at `objectHeight`.
  const objectTip = toSvg(u, objectHeight);
  const objectBase = toSvg(u, 0);
  const imageTip = toSvg(v === Infinity ? 0 : v, imageHeight);
  const imageBase = toSvg(v === Infinity ? 0 : v, 0);
  
  // --- Ray Tracing Calculations ---

  // Ray 1: Parallel to Principal Axis -> Refracts through Focal Point (or appears to)
  const ray1Start = objectTip;
  const ray1LensHit = toSvg(0, objectHeight); // Hits lens at same height as object
  let ray1End: Point;
  
  // Ray 2: Through Optical Center (0,0) -> Goes straight through
  // This line equation is y = (objectHeight/u) * x
  const ray2Start = objectTip;
  // Calculate a point far to the right (x=500) based on slope
  // Slope m = (0 - objectHeight) / (0 - u) = objectHeight/u. 
  // Wait, in standard cartesian: slope = (y2-y1)/(x2-x1). (0 - h) / (0 - u) = h/u.
  // In SVG coords (y inverted): We just draw line from Tip to Origin to Far Side.
  // We extend it to x=400 (right edge relative to origin).
  // y_at_400 = slope * 400 = (imageHeight/v) * 400. Or just use geometry.
  // Ideally, it goes to the Image Tip if real.
  const ray2End = toSvg(400, (imageHeight / (v === Infinity ? 1 : v)) * 400); 
  // Fallback if v is weird: just project the line from objectTip through origin
  const ray2SlopeSvg = (origin.y - objectTip.y) / (origin.x - objectTip.x);
  const ray2EndFallback = {
      x: width,
      y: origin.y + ray2SlopeSvg * (width - origin.x)
  };


  const ray3Start = objectTip;
  let ray3LensHit: Point;
  let ray3End: Point;

  if (lensType === LensType.CONVEX) {
    // Ray 1: Parallel -> Focal Point (F on the right, which is +focalLength)
    // Passes through (focalLength, 0)
    // Slope = (0 - objectHeight) / (focalLength - 0) = -h/f
    const m1 = -objectHeight / focalLength;
    ray1End = toSvg(400, m1 * (400 - focalLength));

    // Ray 3: Through Focal Point (Left F, -focalLength) -> Refracts Parallel
    // Hitting lens at y?
    // Line eq through (-f, 0) and (u, h).
    // Slope = (h - 0) / (u - (-f)) = h / (u+f)
    // y_hit = slope * (0 - (-f)) = slope * f = h*f/(u+f).
    // Wait, simpler: It goes through F'(-f,0) to Lens(0, yHit).
    // Intersection with x=0.
    const slope3 = (0 - objectHeight) / (-focalLength - u);
    // y at x=0
    const yHit = slope3 * (0 - u) + objectHeight; 
    
    ray3LensHit = toSvg(0, yHit);
    ray3End = toSvg(400, yHit); // Parallel out
  } else {
    // Concave logic
    // Ray 1: Parallel -> Diverges as if coming from Focal Point (Left F, -focalLength)
    const m1 = objectHeight / focalLength; // Slope from (-f, 0) to (0, h) is h/f
    ray1End = toSvg(400, objectHeight + m1 * 400); // Extrapolating outwards? No.
    // Ray 1 hits (0, h). It refracts as if coming from (-f, 0).
    // So line equation from (-f,0) through (0,h).
    // y = mx + c => m = h/f, c = h. 
    // At x=400, y = h/f * 400 + h.
    ray1End = toSvg(400, (objectHeight/focalLength)*400 + objectHeight);


    // Ray 3: Aiming at Focal Point (Right F, +focalLength) -> Refracts Parallel
    // Ray goes from (u, h) towards (+f, 0).
    // Hits lens at x=0.
    // Slope = (0 - h) / (f - u).
    // y_hit = h + slope * (0 - u) = h - slope*u.
    const m3 = -objectHeight / (focalLength - u);
    const yHit3 = objectHeight + m3 * (0 - u);
    
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
      // Limit dragging to left side
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
       // Virtual Image Case (u < f)
       if (Math.abs(u) < focalLength) {
         // Extend refracted rays backwards to meet at image
         lines.push(<line key="v1" x1={ray1LensHit.x} y1={ray1LensHit.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />);
         lines.push(<line key="v2" x1={origin.x} y1={origin.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />); // Center ray backtrace
         lines.push(<line key="v3" x1={ray3LensHit.x} y1={ray3LensHit.y} x2={imageTip.x} y2={imageTip.y} {...dashedStyle} />);
       }
    } else {
        // Concave always virtual
        // Ray 1 backtrace to F
        lines.push(<line key="vc1" x1={ray1LensHit.x} y1={ray1LensHit.y} x2={toSvg(-focalLength, 0).x} y2={toSvg(-focalLength, 0).y} {...dashedStyle} />);
        // Ray 3 is parallel out, so backtrace is horizontal
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
          {/* A gradient for the lens glass effect */}
          <linearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="rgba(165, 243, 252, 0.2)" />
             <stop offset="50%" stopColor="rgba(165, 243, 252, 0.1)" />
             <stop offset="100%" stopColor="rgba(165, 243, 252, 0.2)" />
          </linearGradient>
        </defs>

        {/* Principal Axis */}
        <line x1="0" y1={origin.y} x2={width} y2={origin.y} stroke="#94a3b8" strokeWidth="2" />
        {/* Optical Center Line (Vertical) */}
        <line x1={origin.x} y1="0" x2={origin.x} y2={height} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />

        {/* Focal Points */}
        {[ -focalLength, focalLength, -2 * focalLength, 2 * focalLength ].map((pos) => {
            const p = toSvg(pos, 0);
            const label = Math.abs(pos) === focalLength ? 'F' : '2F';
            const isLeft = pos < 0;
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
                    <text x={p.x} y={p.y + 20} textAnchor="middle" className="text-xs fill-slate-500 font-mono font-bold select-none pointer-events-none">
                        {isLeft ? label : label + "'"}
                    </text>
                </g>
            )
        })}

        {/* The Lens */}
        <g transform={`translate(${origin.x}, ${origin.y})`}>
          {lensType === LensType.CONVEX ? (
            <path
              d="M 0,-160 Q 35,0 0,160 Q -35,0 0,-160"
              fill="url(#lensGradient)"
              stroke="#0891b2"
              strokeWidth="2"
            />
          ) : (
            <path
              d="M -15,-160 Q 0,0 -15,160 L 15,160 Q 0,0 15,-160 Z"
              fill="url(#lensGradient)"
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
            
            {/* Drag Handle Area */}
            <rect 
                x={objectBase.x - 20} 
                y={origin.y - objectHeight - 20} 
                width="40" 
                height={objectHeight + 40} 
                fill="transparent" 
            />
             <text x={objectBase.x} y={objectBase.y + 25} textAnchor="middle" className="text-sm font-bold fill-red-700 select-none">
                蜡烛 (Object)
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
                    opacity={v * u > 0 ? 0.5 : 0.85} // Virtual image is more ghost-like
                />
                 <text x={imageBase.x} y={imageBase.y + (imageHeight < 0 ? -20 : 25)} textAnchor="middle" className="text-sm font-bold fill-indigo-600 select-none">
                    像 (Image)
                </text>
            </g>
        )}

        {/* Rays - Layered on top for clarity */}
        <g style={{ mixBlendMode: 'multiply' }} className="pointer-events-none">
            {renderVirtualLines()}
            
            {/* Ray 1: Red - Parallel to Axis */}
            <path d={`M ${ray1Start.x},${ray1Start.y} L ${ray1LensHit.x},${ray1LensHit.y} L ${ray1End.x},${ray1End.y}`} stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.7" />
            <circle cx={ray1Start.x} cy={ray1Start.y} r="2" fill="#ef4444" />
            
            {/* Ray 2: Green - Through Optical Center */}
            {/* Using fallback to ensure it draws across screen even if image is far */}
            <path d={`M ${ray2Start.x},${ray2Start.y} L ${ray2EndFallback.x},${ray2EndFallback.y}`} stroke="#10b981" strokeWidth="2" fill="none" opacity="0.7" />
            
            {/* Ray 3: Blue - Through Focus */}
            <path d={`M ${ray3Start.x},${ray3Start.y} L ${ray3LensHit.x},${ray3LensHit.y} L ${ray3End.x},${ray3End.y}`} stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.7" />
        </g>
        
        {/* Optical Center Marker */}
        <circle cx={origin.x} cy={origin.y} r="3" fill="black" />
        <text x={origin.x + 5} y={origin.y + 15} className="text-xs font-bold font-serif">O</text>

      </svg>
      
      {/* Movie-style Subtitle Overlay */}
      {narration && (
         <div className="absolute bottom-8 w-full text-center pointer-events-none z-20">
            <p className="inline-block px-4 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-lg md:text-xl font-semibold text-white tracking-wide leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
                {narration}
            </p>
         </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/95 p-3 rounded-lg text-xs shadow-md border border-slate-200 pointer-events-none z-10">
          <div className="flex items-center gap-2 mb-1.5"><div className="w-4 h-0.5 bg-red-500"></div> ① 平行于主光轴</div>
          <div className="flex items-center gap-2 mb-1.5"><div className="w-4 h-0.5 bg-emerald-500"></div> ② 穿过光心</div>
          <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-blue-500"></div> ③ 穿过/对准焦点</div>
      </div>
    </div>
  );
};

export default SimulationCanvas;