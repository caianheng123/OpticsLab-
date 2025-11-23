import React from 'react';
import { BookOpen, Camera, Eye, Search, Zap, ArrowRight, PlayCircle, PenTool, TrendingUp, AlertTriangle } from 'lucide-react';
import { LensType } from '../types';

interface WikiArticleProps {
  setLensType: (t: LensType) => void;
  setFocalLength: (f: number) => void;
  setObjectDistance: (d: number) => void;
  setObjectHeight: (h: number) => void;
  scrollToSim: () => void;
}

const WikiArticle: React.FC<WikiArticleProps> = ({
  setLensType,
  setFocalLength,
  setObjectDistance,
  setObjectHeight,
  scrollToSim
}) => {
  
  const setScenario = (type: LensType, f: number, u: number, h: number) => {
    setLensType(type);
    setFocalLength(f);
    setObjectDistance(u);
    setObjectHeight(h);
    scrollToSim();
  };

  return (
    <article className="prose prose-slate max-w-none lg:prose-lg bg-white p-8 rounded-xl shadow-sm border border-slate-200 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                物理学霸笔记
            </span>
            <span className="text-slate-400 text-sm">Last updated: 2024</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
          凸透镜成像规律：<span className="text-indigo-600">从原理到口诀的全总结</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          这篇笔记整理了透镜成像的核心考点，包括三条特殊光线作图法、静态成像规律表以及动态变化规律。结合上方的实验室，助你彻底攻克光学难点。
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-10 not-prose">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">笔记目录 / Contents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm font-medium">
            <a href="#part1" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
                三条特殊光线 (作图基础)
            </a>
            <a href="#part2" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                两个“分界点” (f 与 2f)
            </a>
            <a href="#part3" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
                静态成像规律表 (核心背诵)
            </a>
            <a href="#part4" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">4</span>
                动态变化规律 (物近像远)
            </a>
        </div>
      </div>

      {/* Part 1: Special Rays */}
      <section id="part1">
        <h2 className="flex items-center gap-3 text-slate-800">
            <PenTool className="w-6 h-6 text-indigo-500" />
            1. 三条特殊光线
        </h2>
        <p>
            理解成像的本质是光的折射。在作图时，我们只需要画出物体顶端发出的三条特殊光线中的两条，它们的交点就是像的位置。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose my-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-1 w-8 bg-red-500 rounded-full mb-3"></div>
                <h4 className="font-bold text-slate-800 mb-2">光线一：平行入射</h4>
                <p className="text-sm text-slate-600">平行于主光轴的光线，折射后<strong>过焦点</strong>。</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-1 w-8 bg-emerald-500 rounded-full mb-3"></div>
                <h4 className="font-bold text-slate-800 mb-2">光线二：过光心</h4>
                <p className="text-sm text-slate-600">穿过透镜中心（光心）的光线，<strong>传播方向不变</strong>。</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-1 w-8 bg-blue-500 rounded-full mb-3"></div>
                <h4 className="font-bold text-slate-800 mb-2">光线三：过焦点</h4>
                <p className="text-sm text-slate-600">从焦点发出（或经过焦点）的光线，折射后<strong>平行射出</strong>。</p>
            </div>
        </div>
      </section>

      {/* Part 2: Boundary Points */}
      <section id="part2">
        <h2 className="flex items-center gap-3 text-slate-800">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            2. 两个关键“分界点”
        </h2>
        <p>在记忆规律前，必须死记硬背这两个分界点，它们是解题的锚点。</p>
        
        <div className="my-6 space-y-4 not-prose">
            <div className="flex items-start gap-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="bg-amber-100 p-2 rounded text-amber-700 font-bold shrink-0">焦点 F</div>
                <div>
                    <h4 className="font-bold text-amber-900">虚实像的分界点</h4>
                    <p className="text-sm text-amber-800 mt-1">
                        物体在焦点以内（u &lt; f）成虚像；<br/>
                        物体在焦点以外（u &gt; f）成实像。<br/>
                        物体在焦点上（u = f）不成像。
                    </p>
                </div>
                <button 
                    onClick={() => setScenario(LensType.CONVEX, 100, 100, 60)}
                    className="ml-auto text-xs bg-white text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors shrink-0"
                >
                    演示 u=f
                </button>
            </div>

            <div className="flex items-start gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="bg-indigo-100 p-2 rounded text-indigo-700 font-bold shrink-0">二倍焦距 2F</div>
                <div>
                    <h4 className="font-bold text-indigo-900">放大/缩小像的分界点</h4>
                    <p className="text-sm text-indigo-800 mt-1">
                        物体在2倍焦距外，成缩小像；<br/>
                        物体在2倍焦距内，成放大像；<br/>
                        物体在2倍焦距上，成等大像。
                    </p>
                </div>
                <button 
                    onClick={() => setScenario(LensType.CONVEX, 100, 200, 60)}
                    className="ml-auto text-xs bg-white text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors shrink-0"
                >
                    演示 u=2f
                </button>
            </div>
        </div>
      </section>

      {/* Part 3: The 5 Cases Table */}
      <section id="part3">
        <h2 className="flex items-center gap-3 text-slate-800">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            3. 静态成像规律表 (必考)
        </h2>
        <p>这是所有光学题的基础。点击右侧按钮，在上方实验室中观察现象。</p>
        
        <div className="not-prose overflow-hidden rounded-xl border border-slate-200 shadow-sm my-6">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                        <th className="p-4">物距 (u)</th>
                        <th className="p-4">像的性质</th>
                        <th className="p-4 hidden sm:table-cell">应用</th>
                        <th className="p-4 text-right">实验操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {/* u > 2f */}
                    <tr className="group hover:bg-indigo-50/30 transition-colors">
                        <td className="p-4 font-mono text-indigo-600 font-bold">u &gt; 2f</td>
                        <td className="p-4">
                            <span className="block font-bold text-slate-700">倒立、缩小、实像</span>
                            <span className="text-xs text-slate-400">像距 f &lt; v &lt; 2f</span>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-slate-600">照相机 📷</td>
                        <td className="p-4 text-right">
                            <button onClick={() => setScenario(LensType.CONVEX, 100, 300, 60)} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors">
                                <PlayCircle className="w-5 h-5" />
                            </button>
                        </td>
                    </tr>
                    {/* f < u < 2f */}
                    <tr className="group hover:bg-indigo-50/30 transition-colors">
                        <td className="p-4 font-mono text-indigo-600 font-bold">f &lt; u &lt; 2f</td>
                        <td className="p-4">
                            <span className="block font-bold text-slate-700">倒立、放大、实像</span>
                            <span className="text-xs text-slate-400">像距 v &gt; 2f</span>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-slate-600">投影仪 📽️</td>
                        <td className="p-4 text-right">
                            <button onClick={() => setScenario(LensType.CONVEX, 100, 150, 50)} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors">
                                <PlayCircle className="w-5 h-5" />
                            </button>
                        </td>
                    </tr>
                    {/* u < f */}
                    <tr className="group hover:bg-indigo-50/30 transition-colors">
                        <td className="p-4 font-mono text-indigo-600 font-bold">u &lt; f</td>
                        <td className="p-4">
                            <span className="block font-bold text-slate-700">正立、放大、虚像</span>
                            <span className="text-xs text-slate-400">像物同侧</span>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-slate-600">放大镜 🔍</td>
                        <td className="p-4 text-right">
                            <button onClick={() => setScenario(LensType.CONVEX, 100, 60, 40)} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors">
                                <PlayCircle className="w-5 h-5" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </section>

      {/* Part 4: Dynamic Laws */}
      <section id="part4">
        <h2 className="flex items-center gap-3 text-slate-800">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            4. 动态变化规律 (难点)
        </h2>
        <p>当物体移动时，像怎么动？这是选择题和实验题的压轴考点。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 not-prose">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Camera className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold mb-4 border-b border-indigo-400 pb-2">成实像时 (u &gt; f)</h3>
                <div className="text-lg font-medium space-y-4">
                    <p>口诀：<span className="text-yellow-300 font-bold text-2xl">物近 像远 像变大</span></p>
                    <p className="text-sm opacity-90 leading-relaxed">
                        当物体靠近透镜（u↓）时，像会远离透镜（v↑），同时像会变大。
                        <br/>反之亦然。
                    </p>
                </div>
                <button 
                    onClick={() => {
                        setScenario(LensType.CONVEX, 100, 300, 60);
                        setTimeout(() => scrollToSim(), 100);
                        // Hint user to drag
                    }}
                    className="mt-6 bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-4 rounded-lg w-full transition-colors flex items-center justify-center gap-2"
                >
                    <PlayCircle className="w-4 h-4" /> 试一试：拖动蜡烛靠近透镜
                </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Search className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold mb-4 border-b border-emerald-400 pb-2">成虚像时 (u &lt; f)</h3>
                <div className="text-lg font-medium space-y-4">
                    <p>口诀：<span className="text-yellow-300 font-bold text-2xl">物近 像近 像变小</span></p>
                    <p className="text-sm opacity-90 leading-relaxed">
                        当物体在焦点内靠近透镜（u↓）时，像也会靠近透镜，且像变小（但始终比物体大）。
                        <br/>(注意：这里的变小是指相对于原来的像变小了)
                    </p>
                </div>
                <button 
                    onClick={() => {
                        setScenario(LensType.CONVEX, 100, 90, 40);
                        setTimeout(() => scrollToSim(), 100);
                    }}
                    className="mt-6 bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-4 rounded-lg w-full transition-colors flex items-center justify-center gap-2"
                >
                    <PlayCircle className="w-4 h-4" /> 试一试：在焦点内移动
                </button>
            </div>
        </div>
      </section>

      {/* Summary Footer */}
      <div className="mt-12 bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-4">学以致用</h3>
        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            纸上得来终觉浅。请点击下方的按钮，回到顶部的“自由实验室”，试着遮住透镜的一半，看看像会发生什么变化？（提示：像依然完整，但变暗了）
        </p>
        <button 
            onClick={scrollToSim}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
        >
            回到实验室验证 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </article>
  );
};

export default WikiArticle;