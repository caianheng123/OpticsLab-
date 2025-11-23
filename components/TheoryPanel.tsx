import React, { useState } from 'react';
import { BookOpen, List, Target } from 'lucide-react';

const TheoryPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rays' | 'rules'>('rules');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">原理解析</h2>
        </div>
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
            <button
                onClick={() => setActiveTab('rules')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'rules' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                成像规律表
            </button>
            <button
                onClick={() => setActiveTab('rays')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'rays' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                三条特殊光线
            </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'rules' ? (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <List className="w-4 h-4" /> 凸透镜成像规律 (Convex Lens Rules)
            </h3>
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="bg-slate-100 text-slate-600">
                        <th className="p-3 rounded-tl-lg">物距 (u)</th>
                        <th className="p-3">像距 (v)</th>
                        <th className="p-3">成像性质</th>
                        <th className="p-3 rounded-tr-lg">应用实例</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-3 font-mono text-indigo-700">u &gt; 2f</td>
                        <td className="p-3 font-mono text-slate-600">f &lt; v &lt; 2f</td>
                        <td className="p-3"><span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">倒立、缩小、实像</span></td>
                        <td className="p-3 text-slate-600">照相机、眼睛</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-3 font-mono text-indigo-700">u = 2f</td>
                        <td className="p-3 font-mono text-slate-600">v = 2f</td>
                        <td className="p-3"><span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">倒立、等大、实像</span></td>
                        <td className="p-3 text-slate-600">测焦距</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-3 font-mono text-indigo-700">f &lt; u &lt; 2f</td>
                        <td className="p-3 font-mono text-slate-600">v &gt; 2f</td>
                        <td className="p-3"><span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">倒立、放大、实像</span></td>
                        <td className="p-3 text-slate-600">投影仪、幻灯机</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-3 font-mono text-indigo-700">u = f</td>
                        <td className="p-3 font-mono text-slate-600">/</td>
                        <td className="p-3"><span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs">不成像 (光线平行)</span></td>
                        <td className="p-3 text-slate-600">获得平行光</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-3 font-mono text-indigo-700">u &lt; f</td>
                        <td className="p-3 font-mono text-slate-600">/ (同侧)</td>
                        <td className="p-3"><span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">正立、放大、虚像</span></td>
                        <td className="p-3 text-slate-600">放大镜</td>
                    </tr>
                </tbody>
            </table>
            <div className="mt-4 text-xs text-slate-500 p-3 bg-slate-50 rounded border border-slate-100">
                <strong>注：</strong> 凹透镜始终成 <span className="text-slate-700 font-bold">正立、缩小的虚像</span>，与物距无关。
            </div>
          </div>
        ) : (
          <div>
             <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> 凸透镜的三条特殊光线
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="h-1 bg-red-500 w-8 mb-2 rounded-full"></div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">1. 平行于主光轴的光线</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        光线平行于主光轴射入，折射后<strong>通过焦点 (F)</strong>。
                    </p>
                </div>
                <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="h-1 bg-emerald-500 w-8 mb-2 rounded-full"></div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">2. 过光心的光线</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        通过透镜中心（光心）的光线，<strong>传播方向不改变</strong>。
                    </p>
                </div>
                <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="h-1 bg-blue-500 w-8 mb-2 rounded-full"></div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">3. 过焦点的光线</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        从焦点发出（或经过焦点）的光线，折射后<strong>平行于主光轴</strong>射出。
                    </p>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheoryPanel;