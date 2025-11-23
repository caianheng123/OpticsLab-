import React from 'react';
import { LensType } from '../types';
import { Calculator, Info } from 'lucide-react';

interface InfoPanelProps {
  lensType: LensType;
  focalLength: number;
  objectDistance: number;
  objectHeight: number;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  lensType,
  focalLength,
  objectDistance,
  objectHeight,
}) => {
  const u = -objectDistance;
  const f = lensType === LensType.CONVEX ? focalLength : -focalLength;
  
  let v = (u * f) / (u + f);
  if (Math.abs(u + f) < 0.1) v = Infinity;

  const m = v === Infinity ? Infinity : v / u;
  
  // Determine image properties
  let nature = '';
  let orientation = '';
  let size = '';

  if (v === Infinity) {
    nature = '不成像 (平行光)';
    orientation = 'N/A';
    size = 'N/A';
  } else {
    // Real vs Virtual
    // In our convention: light goes L->R. Real image is on Right (positive v). Virtual on Left (negative v).
    if (v > 0) nature = '实像 (Real)';
    else nature = '虚像 (Virtual)';

    // Upright vs Inverted
    if (m > 0) orientation = '正立 (Upright)';
    else orientation = '倒立 (Inverted)';

    // Magnified vs Diminished
    if (Math.abs(m) > 1) size = '放大 (Magnified)';
    else if (Math.abs(m) < 1) size = '缩小 (Diminished)';
    else size = '等大 (Same Size)';
  }

  // Educational Text
  const getEduText = () => {
    if (lensType === LensType.CONCAVE) return "凹透镜总是成正立、缩小的虚像。";
    
    // Convex cases
    const absU = Math.abs(u);
    if (absU > 2 * focalLength) return "物距 > 2f: 成倒立、缩小的实像 (如照相机)。";
    if (Math.abs(absU - 2 * focalLength) < 1) return "物距 = 2f: 成倒立、等大的实像 (测焦距)。";
    if (absU > focalLength && absU < 2 * focalLength) return "f < 物距 < 2f: 成倒立、放大的实像 (如投影仪)。";
    if (Math.abs(absU - focalLength) < 1) return "物距 = f: 不成像 (光线平行)。";
    if (absU < focalLength) return "物距 < f: 成正立、放大的虚像 (如放大镜)。";
    return "";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <Calculator className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">成像数据分析</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">像距 (v)</span>
            <div className="text-xl font-mono font-bold text-indigo-600">
                {v === Infinity ? "∞" : Math.abs(v).toFixed(1)}
            </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">放大倍数 (M)</span>
            <div className="text-xl font-mono font-bold text-indigo-600">
                {m === Infinity ? "∞" : Math.abs(m).toFixed(2)}x
            </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">虚实</span>
            <div className="text-lg font-medium text-slate-700">{nature}</div>
        </div>
         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">大小与方向</span>
            <div className="text-sm font-medium text-slate-700 mt-1">{size}</div>
            <div className="text-sm font-medium text-slate-700">{orientation}</div>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-lg text-indigo-900">
        <Info className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
            <h4 className="font-bold text-sm mb-1">规律总结</h4>
            <p className="text-sm leading-relaxed opacity-90">
                {getEduText()}
            </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
