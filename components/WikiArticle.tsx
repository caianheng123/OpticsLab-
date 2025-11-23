import React from 'react';
import { BookOpen, Camera, Eye, Search, Zap, ArrowRight, PlayCircle } from 'lucide-react';
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
    <article className="prose prose-slate max-w-none lg:prose-lg bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600 inline-block">
          透镜成像规律全解
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          从原理到应用，带你彻底搞懂初中物理核心考点。结合交互式实验，让光学知识看得见、摸得着。
        </p>
      </div>

      <nav className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-8 not-prose">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">目录 Guide</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-medium text-indigo-600">
            <li><a href="#section-basics" className="hover:underline hover:text-indigo-800">1. 透镜基础知识</a></li>
            <li><a href="#section-convex" className="hover:underline hover:text-indigo-800">2. 凸透镜成像的五种情况 (核心)</a></li>
            <li><a href="#section-concave" className="hover:underline hover:text-indigo-800">3. 凹透镜成像规律</a></li>
            <li><a href="#section-summary" className="hover:underline hover:text-indigo-800">4. 总结与记忆口诀</a></li>
        </ul>
      </nav>

      <section id="section-basics">
        <h2>1. 透镜基础知识</h2>
        <p>
          透镜是利用光的<strong>折射</strong>原理制成的光学元件。在初中物理中，我们主要研究两类透镜：<strong>凸透镜</strong>和<strong>凹透镜</strong>。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 not-prose">
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div> 凸透镜 (Convex Lens)
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li><strong>特点：</strong>中间厚、边缘薄。</li>
                    <li><strong>光学性质：</strong>对光线有<strong>会聚</strong>作用。</li>
                    <li><strong>焦点 (F)：</strong>平行于主光轴的光线经折射后会聚于一点。</li>
                </ul>
            </div>
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div> 凹透镜 (Concave Lens)
                </h3>
                <ul className="text-sm text-emerald-800 space-y-2">
                    <li><strong>特点：</strong>中间薄、边缘厚。</li>
                    <li><strong>光学性质：</strong>对光线有<strong>发散</strong>作用。</li>
                    <li><strong>焦点 (F)：</strong>平行光经折射后发散，其反向延长线交于一点（虚焦点）。</li>
                </ul>
            </div>
        </div>

        <h3>关键术语定义</h3>
        <ul>
            <li><strong>光心 (O)：</strong>透镜的中心，通过该点的光线传播方向不变。</li>
            <li><strong>焦距 (f)：</strong>焦点到光心的距离。它是衡量透镜折光能力的重要参数，焦距越小，折光能力越强。</li>
            <li><strong>物距 (u)：</strong>物体到透镜光心的距离。</li>
            <li><strong>像距 (v)：</strong>像到透镜光心的距离。</li>
        </ul>
      </section>

      <hr className="my-8 border-slate-200" />

      <section id="section-convex">
        <h2>2. 凸透镜成像的五种情况</h2>
        <p>
          这是考试的重中之重。凸透镜的成像性质取决于<strong>物距 (u)</strong> 与 <strong>焦距 (f)</strong> 的关系。
          我们可以把 \(f\) 和 \(2f\) 看作两个“分界点”。
        </p>

        {/* Case 1: Camera */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 my-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-indigo-700 m-0 flex items-center gap-2">
                    <Camera className="w-6 h-6" /> 情况一：照相机原理 (u &gt; 2f)
                </h3>
                <button 
                    onClick={() => setScenario(LensType.CONVEX, 100, 300, 60)}
                    className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" /> 点击演示
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 text-sm text-slate-700 space-y-2">
                    <p><strong>条件：</strong>当物体位于二倍焦距以外时（\(u > 2f\)）。</p>
                    <p><strong>现象：</strong>在透镜另一侧的 \(f\) 和 \(2f\) 之间，成<strong>倒立、缩小</strong>的<strong>实像</strong>。</p>
                    <p className="bg-indigo-100 p-2 rounded text-indigo-800 font-medium mt-2">
                        应用：照相机、摄像机、人的眼睛（晶状体）。
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col items-center justify-center">
                    <div className="text-xs text-slate-400 mb-1">示意图</div>
                    <div className="w-full h-24 bg-slate-100 rounded relative overflow-hidden">
                        {/* CSS Drawing of diagram */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-400"></div>
                        <div className="absolute top-2 bottom-2 left-1/2 w-[1px] bg-blue-300"></div>
                        <div className="absolute left-[10%] top-[30%] w-1 h-[20%] bg-red-500"></div>
                        <div className="absolute right-[30%] top-[45%] w-1 h-[10%] bg-indigo-500"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Case 2: Measuring Focal Length */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 my-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-indigo-700 m-0 flex items-center gap-2">
                    <Zap className="w-6 h-6" /> 情况二：测焦距 (u = 2f)
                </h3>
                <button 
                    onClick={() => setScenario(LensType.CONVEX, 100, 200, 60)}
                    className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" /> 点击演示
                </button>
            </div>
            <p className="text-sm text-slate-700">
                <strong>条件：</strong>当物体恰好位于二倍焦距上时（\(u = 2f\)）。<br/>
                <strong>现象：</strong>在透镜另一侧 \(2f\) 处，成<strong>倒立、等大</strong>的<strong>实像</strong>。<br/>
                <strong>重要性：</strong>这是像由“缩小”变“放大”的分界点。
            </p>
        </div>

        {/* Case 3: Projector */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 my-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-indigo-700 m-0 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" /> 情况三：投影仪原理 (f &lt; u &lt; 2f)
                </h3>
                <button 
                    onClick={() => setScenario(LensType.CONVEX, 100, 150, 40)}
                    className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" /> 点击演示
                </button>
            </div>
             <div className="text-sm text-slate-700 space-y-2">
                <p><strong>条件：</strong>当物体位于一倍焦距和二倍焦距之间时。</p>
                <p><strong>现象：</strong>在透镜另一侧 \(2f\) 以外，成<strong>倒立、放大</strong>的<strong>实像</strong>。</p>
                <p className="bg-indigo-100 p-2 rounded text-indigo-800 font-medium mt-2">
                    应用：投影仪、幻灯机、电影放映机。
                </p>
            </div>
        </div>

        {/* Case 4: No Image */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 my-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-600 m-0 flex items-center gap-2">
                    <Eye className="w-6 h-6" /> 情况四：不成像 (u = f)
                </h3>
                <button 
                    onClick={() => setScenario(LensType.CONVEX, 100, 100, 60)}
                    className="flex items-center gap-1 bg-slate-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" /> 点击演示
                </button>
            </div>
            <p className="text-sm text-slate-700">
                <strong>条件：</strong>物体位于焦点上。<br/>
                <strong>现象：</strong>折射光线平行射出，不能相交，所以<strong>不成像</strong>。<br/>
                <strong>意义：</strong>这是实像与虚像的分界点。
            </p>
        </div>

        {/* Case 5: Magnifying Glass */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 my-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-indigo-700 m-0 flex items-center gap-2">
                    <Search className="w-6 h-6" /> 情况五：放大镜原理 (u &lt; f)
                </h3>
                <button 
                    onClick={() => setScenario(LensType.CONVEX, 100, 60, 40)}
                    className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" /> 点击演示
                </button>
            </div>
             <div className="text-sm text-slate-700 space-y-2">
                <p><strong>条件：</strong>当物体位于一倍焦距以内时。</p>
                <p><strong>现象：</strong>在透镜同侧成<strong>正立、放大</strong>的<strong>虚像</strong>。</p>
                <p>注意：虚像不能呈现在光屏上，只能透过透镜观察。</p>
                <p className="bg-indigo-100 p-2 rounded text-indigo-800 font-medium mt-2">
                    应用：放大镜、老花镜。
                </p>
            </div>
        </div>
      </section>

      <section id="section-concave">
        <h2>3. 凹透镜成像规律</h2>
        <p>
            相比凸透镜，凹透镜的规律非常简单。
        </p>
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 my-6 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-emerald-800 m-0">
                    始终唯一：正立、缩小、虚像
                </h3>
                <button 
                    onClick={() => setScenario(LensType.CONCAVE, 100, 200, 80)}
                    className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" /> 点击演示
                </button>
            </div>
            <p className="text-sm text-emerald-900">
                无论物体距离凹透镜多远，它始终成<strong>正立、缩小</strong>的<strong>虚像</strong>。像和物体在透镜的同一侧。
                <br/><br/>
                <strong>应用：</strong>近视眼镜。
            </p>
        </div>
      </section>

      <section id="section-summary">
        <h2>4. 总结与记忆口诀</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-md">
                <h3 className="text-white text-lg font-bold mb-4 border-b border-indigo-400 pb-2">口诀一：一倍二倍分界限</h3>
                <p className="font-medium leading-loose">
                    一倍焦距分虚实，<br/>
                    二倍焦距分大小。<br/>
                    实像倒立异侧倒，<br/>
                    虚像正立同侧正。
                </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-xl shadow-md">
                <h3 className="text-white text-lg font-bold mb-4 border-b border-blue-400 pb-2">口诀二：物近像远像变大</h3>
                <p className="font-medium leading-loose">
                    成实像时：<br/>
                    物近像远像变大，<br/>
                    物远像近像变小。
                </p>
                <p className="text-xs text-blue-100 mt-2 opacity-80">(注：物近指物体靠近焦点)</p>
            </div>
        </div>
      </section>
      
      <div className="mt-12 text-center">
        <p className="text-slate-500 mb-4">掌握了吗？回到上方实验室自己动手试一试！</p>
        <button 
            onClick={scrollToSim}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition-all hover:scale-105"
        >
            回到实验室 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </article>
  );
};

export default WikiArticle;