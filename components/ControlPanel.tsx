import React, { useState, useEffect, useRef } from 'react';
import { LensType } from '../types';
import { Settings2, Minus, Plus, Maximize, MoveHorizontal, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface ControlPanelProps {
  lensType: LensType;
  setLensType: (type: LensType) => void;
  focalLength: number;
  setFocalLength: (val: number) => void;
  objectDistance: number;
  setObjectDistance: React.Dispatch<React.SetStateAction<number>>;
  objectHeight: number;
  setObjectHeight: (val: number) => void;
  setNarration: (text: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  lensType,
  setLensType,
  focalLength,
  setFocalLength,
  objectDistance,
  setObjectDistance,
  objectHeight,
  setObjectHeight,
  setNarration,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [enableAudio, setEnableAudio] = useState(true);
  const lastZoneRef = useRef<string>("");
  
  // Animation refs
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isSpeakingRef = useRef<boolean>(false);
  
  // Voice state
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Initialize Voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Select a standard Chinese voice
      const bestVoice = voices.find(v => v.lang === 'zh-CN' && !v.name.includes('Yaoyao')) 
                     || voices.find(v => v.lang === 'zh-CN');
      if (bestVoice) {
        setSelectedVoice(bestVoice);
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Animation Loop with Audio Sync and Snap-to-Grid
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      
      const animate = (time: number) => {
        const deltaTime = time - lastTimeRef.current;
        
        // Cap updates
        if (deltaTime >= 16) { 
            // If speaking, hold position (perfect sync)
            if (enableAudio && isSpeakingRef.current) {
                lastTimeRef.current = time;
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            setObjectDistance((prev) => {
                if (prev <= 30) {
                    setIsPlaying(false);
                    return 30;
                }

                const f = focalLength;
                
                // Base speed logic
                let unitsPerSecond = 30; 

                if (lensType === LensType.CONCAVE) {
                    unitsPerSecond = 30; 
                } else {
                    // Convex Logic Speed Profile
                    if (prev > 2 * f + 50) {
                        unitsPerSecond = 60; // Travel to start fast
                    } else if (Math.abs(prev - 2 * f) <= 20) {
                        unitsPerSecond = 15; // Slow down approach
                    } else if (prev > f + 50 && prev < 2 * f - 50) {
                        unitsPerSecond = 50; // Travel between 2f and f fast
                    } else if (Math.abs(prev - f) <= 20) {
                        unitsPerSecond = 15; // Slow down approach
                    } else {
                        unitsPerSecond = 20; // Default
                    }
                }

                const step = unitsPerSecond * (deltaTime / 1000);
                let nextU = prev - step;

                // --- SNAP TO GRID LOGIC FOR PERFECT SYNC ---
                // If we are passing 2F, snap exactly to 2F
                if (prev > 2 * f && nextU <= 2 * f + 0.5) {
                    // We are about to cross or hit 2f
                    // Force it to exactly 2f so the narration "u=2f" triggers on the exact frame
                    // The 'useEffect' for narration below will see exactly 2*f and trigger speech.
                    // The next frame of this loop will see 'isSpeaking=true' and pause here.
                    return 2 * f;
                }

                // If we are passing F, snap exactly to F
                if (prev > f && nextU <= f + 0.5) {
                    return f;
                }
                
                return Math.max(30, nextU);
            });
            lastTimeRef.current = time;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
        cancelAnimationFrame(animationRef.current);
    }
    
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, focalLength, lensType, setObjectDistance, enableAudio]);

  // Audio/Text Narration Logic - Formal & Educational
  useEffect(() => {
    if (!isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isSpeakingRef.current = false;
      setNarration("");
      lastZoneRef.current = "";
      return;
    }

    let text = "";
    let zone = "";

    // Define Zones precisely so they don't flap
    const f = focalLength;
    const u = objectDistance;

    if (lensType === LensType.CONCAVE) {
        zone = "concave_all";
        text = "现在演示凹透镜成像。凹透镜对光线具有发散作用。请注意观察，无论物体距离透镜多远，始终在透镜同侧形成正立、缩小的虚像。";
    } else {
        // Convex Zones
        // Use exact floating point comparison with small epsilon for the snap points
        const epsilon = 0.5;

        if (u > 2 * f + epsilon) {
            zone = "u > 2f";
            text = "当物距大于二倍焦距时，凸透镜成倒立、缩小的实像。这一原理被广泛应用于照相机和摄像机中。";
        } else if (Math.abs(u - 2 * f) <= epsilon) {
            zone = "u = 2f";
            text = "当物距等于二倍焦距时，像距也等于二倍焦距。此时，凸透镜成倒立、等大的实像。这是测量焦距的重要方法。";
        } else if (u < 2 * f - epsilon && u > f + epsilon) {
            zone = "f < u < 2f";
            text = "当物距处于一倍焦距和二倍焦距之间时，凸透镜成倒立、放大的实像。投影仪和幻灯机就是利用这一原理制成的。";
        } else if (Math.abs(u - f) <= epsilon) {
            zone = "u = f";
            text = "当物距等于一倍焦距时，折射光线平行射出，不能成像。此处是实像与虚像的分界点。";
        } else if (u < f - epsilon) {
            zone = "u < f";
            text = "当物距小于一倍焦距时，凸透镜成正立、放大的虚像。我们需要透过透镜观察。放大镜就是利用这一原理工作的。";
        }
    }

    // Trigger update if zone changed
    if (zone && zone !== lastZoneRef.current) {
        lastZoneRef.current = zone;
        setNarration(text);
        
        if (enableAudio && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop previous utterance
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9; 
            utterance.pitch = 1.0; 
            utterance.volume = 1.0;
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            utterance.onstart = () => {
                isSpeakingRef.current = true;
            };

            utterance.onend = () => {
                isSpeakingRef.current = false;
            };

            utterance.onerror = () => {
                 isSpeakingRef.current = false;
            }
            
            window.speechSynthesis.speak(utterance);
        } else {
            // If audio is disabled, simulate a delay
            isSpeakingRef.current = true;
            setTimeout(() => {
                if (isPlaying && zone === lastZoneRef.current) {
                    isSpeakingRef.current = false;
                }
            }, text.length * 150 + 1000);
        }
    }
  }, [objectDistance, focalLength, lensType, isPlaying, enableAudio, selectedVoice, setNarration]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
          }
      };
  }, []);

  const togglePlay = () => {
    if (objectDistance <= 30 && !isPlaying) {
      setObjectDistance(450);
    }
    setIsPlaying(!isPlaying);
  };

  const resetExperiment = () => {
    setIsPlaying(false);
    setObjectDistance(180);
    setFocalLength(100);
    setObjectHeight(60);
    setNarration("");
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
        <Settings2 className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">实验控制台</h2>
      </div>

      {/* Animation Controls */}
      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex flex-col gap-3">
        <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                动态演示模式
                {isPlaying && <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>}
            </label>
            <button 
                onClick={() => setEnableAudio(!enableAudio)}
                className={`p-1.5 rounded-full transition-colors ${enableAudio ? 'text-indigo-600 hover:bg-indigo-200/50' : 'text-slate-400 hover:bg-slate-200/50'}`}
                title={enableAudio ? "关闭语音解说" : "开启语音解说"}
            >
                {enableAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
        </div>
        
        <div className="flex gap-2">
            <button
                onClick={togglePlay}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-bold transition-all ${
                    isPlaying 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                }`}
            >
                {isPlaying ? <><Pause className="w-4 h-4" /> 暂停演示</> : <><Play className="w-4 h-4" /> 开始演示</>}
            </button>
            <button
                onClick={resetExperiment}
                className="p-2 bg-white border border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50"
                title="重置实验"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
        </div>

        {!isPlaying && (
            <p className="text-xs text-indigo-600/70">
                点击“开始演示”观看成像规律的连续变化过程。
            </p>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Lens Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-600 block">透镜类型</label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setLensType(LensType.CONVEX)}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
              lensType === LensType.CONVEX
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            凸透镜
          </button>
          <button
            onClick={() => setLensType(LensType.CONCAVE)}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
              lensType === LensType.CONCAVE
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            凹透镜
          </button>
        </div>
      </div>

      {/* Focal Length Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Maximize className="w-4 h-4" /> 焦距 (f)
          </label>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
            {focalLength}
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="200"
          step="5"
          value={focalLength}
          onChange={(e) => setFocalLength(Number(e.target.value))}
          disabled={isPlaying}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
        />
      </div>

      {/* Object Distance Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <MoveHorizontal className="w-4 h-4" /> 物距 (u)
          </label>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
            {Math.round(objectDistance)}
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="450"
          step="1"
          value={objectDistance}
          onChange={(e) => setObjectDistance(Number(e.target.value))}
          disabled={isPlaying}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
        />
      </div>

       {/* Object Height Slider */}
       <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Plus className="w-4 h-4" /> 蜡烛高度 (h)
          </label>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
            {objectHeight}
          </span>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setObjectHeight(Math.max(20, objectHeight - 5))}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
                <Minus className="w-4 h-4" />
            </button>
            <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={objectHeight}
            onChange={(e) => setObjectHeight(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
             <button 
                onClick={() => setObjectHeight(Math.min(120, objectHeight + 5))}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;