import React, { useState } from 'react';
import { LensType } from './types';
import SimulationCanvas from './components/SimulationCanvas';
import ControlPanel from './components/ControlPanel';
import InfoPanel from './components/InfoPanel';
import TheoryPanel from './components/TheoryPanel';
import VideoResources from './components/VideoResources';
import AITutor from './components/AITutor';
import { GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  // Application State
  const [lensType, setLensType] = useState<LensType>(LensType.CONVEX);
  const [focalLength, setFocalLength] = useState<number>(100);
  const [objectDistance, setObjectDistance] = useState<number>(180);
  const [objectHeight, setObjectHeight] = useState<number>(60);
  
  // Narration state lifted up so ControlPanel can set it and SimulationCanvas can display it
  const [narration, setNarration] = useState<string>("");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              物理实验室：透镜成像
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Interactive Optics Simulator
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Canvas & Info & Theory (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 1. Simulation Area */}
            <div className="h-[400px] lg:h-[500px] shadow-lg rounded-xl overflow-hidden bg-white ring-1 ring-slate-900/5 z-10 relative">
                <SimulationCanvas 
                    lensType={lensType}
                    focalLength={focalLength}
                    objectDistance={objectDistance}
                    objectHeight={objectHeight}
                    setObjectDistance={setObjectDistance}
                    setFocalLength={setFocalLength}
                    narration={narration}
                />
            </div>
            
            {/* 2. Real-time Info */}
            <InfoPanel 
                 lensType={lensType}
                 focalLength={focalLength}
                 objectDistance={objectDistance}
                 objectHeight={objectHeight}
            />

            {/* 3. Theory & Explanations */}
            <TheoryPanel />
          </div>

          {/* Right Column: Controls & AI & Videos (4 cols) */}
          <div className="lg:col-span-4">
             {/* 1. Controls Container */}
             <div className="flex flex-col gap-6">
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

                {/* 2. AI Tutor (New) */}
                <AITutor 
                    lensType={lensType}
                    focalLength={focalLength}
                    objectDistance={objectDistance}
                />
                
                {/* 3. Video Resources */}
                <VideoResources />
             </div>
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
             Physics Simulation &copy; 2024
          </div>
      </footer>
    </div>
  );
};

export default App;