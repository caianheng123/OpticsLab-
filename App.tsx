import React, { useState, useRef } from 'react';
import { LensType } from './types';
import SimulationCanvas from './components/SimulationCanvas';
import ControlPanel from './components/ControlPanel';
import InfoPanel from './components/InfoPanel';
import TheoryPanel from './components/TheoryPanel';
import VideoResources from './components/VideoResources';
import AITutor from './components/AITutor';
import WikiArticle from './components/WikiArticle';
import { GraduationCap, BookOpen, FlaskConical } from 'lucide-react';

type AppMode = 'LAB' | 'WIKI';

const App: React.FC = () => {
  // Application State
  const [mode, setMode] = useState<AppMode>('WIKI'); // Default to Wiki for educational entry
  const [lensType, setLensType] = useState<LensType>(LensType.CONVEX);
  const [focalLength, setFocalLength] = useState<number>(100);
  const [objectDistance, setObjectDistance] = useState<number>(180);
  const [objectHeight, setObjectHeight] = useState<number>(60);
  
  // Narration state
  const [narration, setNarration] = useState<string>("");

  const canvasRef = useRef<HTMLDivElement>(null);

  const scrollToSim = () => {
    // Switch to Lab mode if not already
    // Or just scroll to the simulation component if we are in Wiki mode and it is visible
    // For better UX, let's keep the user in their mode but ensure the canvas is in view
    // Since we embedded the canvas in the wiki view (top), we just scroll up.
    canvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 leading-tight">
                物理实验室
                </h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Interactive Physics Wiki</p>
            </div>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <button
                onClick={() => setMode('WIKI')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    mode === 'WIKI' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">互动百科</span>
             </button>
             <button
                onClick={() => setMode('LAB')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    mode === 'LAB' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <FlaskConical className="w-4 h-4" /> <span className="hidden sm:inline">自由实验室</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Universal Simulation Area - Always visible but styled differently based on mode? 
            Actually, let's keep it consistent. It is the "Hero" of the page. 
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-8">
                <div ref={canvasRef} className="h-[400px] lg:h-[480px] shadow-xl rounded-2xl overflow-hidden bg-white ring-1 ring-slate-900/5 z-10 relative">
                    <SimulationCanvas 
                        lensType={lensType}
                        focalLength={focalLength}
                        objectDistance={objectDistance}
                        objectHeight={objectHeight}
                        setObjectDistance={setObjectDistance}
                        setFocalLength={setFocalLength}
                        narration={narration}
                    />
                    {/* Mode indicator overlay */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">
                        {mode === 'WIKI' ? '📖 百科演示模式' : '🧪 自由探索模式'}
                    </div>
                </div>
                
                {/* Data Panel - Always useful below canvas */}
                <div className="mt-4">
                    <InfoPanel 
                        lensType={lensType}
                        focalLength={focalLength}
                        objectDistance={objectDistance}
                        objectHeight={objectHeight}
                    />
                </div>
            </div>

            {/* Sidebar / Controls */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                 <ControlPanel 
                    lensType={lensType}
                    setLensType={setLensType}
                    focalLength={focalLength}
                    setFocalLength={setFocalLength}
                    objectDistance={objectDistance}
                    setObjectDistance={setObjectDistance}
                    objectHeight={objectHeight}
                    setObjectHeight={setObjectHeight}
                    setNarration={setNarration}
                />
                 <AITutor 
                    lensType={lensType}
                    focalLength={focalLength}
                    objectDistance={objectDistance}
                />
            </div>
        </div>

        {/* Mode Specific Content */}
        {mode === 'WIKI' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <WikiArticle 
                    setLensType={setLensType}
                    setFocalLength={setFocalLength}
                    setObjectDistance={setObjectDistance}
                    setObjectHeight={setObjectHeight}
                    scrollToSim={scrollToSim}
                />
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="lg:col-span-8 flex flex-col gap-6">
                    <TheoryPanel />
                 </div>
                 <div className="lg:col-span-4">
                    <VideoResources />
                 </div>
            </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-500">
             <p className="font-medium text-sm">初中物理互动实验室</p>
             <p className="text-xs mt-2 opacity-60">Physics Simulation & Wiki &copy; 2024</p>
          </div>
      </footer>
    </div>
  );
};

export default App;