import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LensType } from '../types';
import { Bot, Send, Sparkles, Loader2, Eraser } from 'lucide-react';

interface AITutorProps {
  lensType: LensType;
  focalLength: number;
  objectDistance: number;
}

const AITutor: React.FC<AITutorProps> = ({ lensType, focalLength, objectDistance }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of response
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const handleAskAI = async (customPrompt?: string) => {
    // Prevent empty submissions
    const promptText = customPrompt || question;
    if (!promptText.trim()) return;

    if (!process.env.API_KEY) {
        setResponse("Error: API Key not found. Please ensure process.env.API_KEY is configured.");
        return;
    }

    setIsLoading(true);
    // Only clear response if it's a new main inquiry, but usually we want to clear for a new answer
    setResponse('');
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Calculate physics state for context
        const u = objectDistance;
        const f = focalLength;
        const lensName = lensType === LensType.CONVEX ? "凸透镜 (Convex Lens)" : "凹透镜 (Concave Lens)";
        let imageState = "";
        
        // Simple physics logic for context
        if (lensType === LensType.CONVEX) {
             if (u > 2 * f) imageState = "倒立、缩小的实像 (Real, Inverted, Diminished)";
             else if (Math.abs(u - 2 * f) < 1) imageState = "倒立、等大的实像 (Real, Inverted, Same Size)";
             else if (u > f && u < 2 * f) imageState = "倒立、放大的实像 (Real, Inverted, Magnified)";
             else if (Math.abs(u - f) < 1) imageState = "不成像 (No Image - Parallel rays)";
             else imageState = "正立、放大的虚像 (Virtual, Upright, Magnified)";
        } else {
             imageState = "正立、缩小的虚像 (Virtual, Upright, Diminished)";
        }

        const context = `
            当前实验状态 (Current Simulation State):
            - 透镜类型 (Lens Type): ${lensName}
            - 焦距 (Focal Length f): ${f}
            - 物距 (Object Distance u): ${Math.round(u)}
            - 成像性质 (Image Nature): ${imageState}
        `;

        const finalPrompt = `
            Context: ${context}
            
            User Question: ${promptText}
            
            System Instruction: 
            You are a friendly and knowledgeable physics teacher (AI Tutor). 
            Answer the student's question based on the provided experiment context.
            Explain the physics principles (u vs f relation) clearly and concisely.
            Use Chinese (Simplified) for the response.
            Format the response with simple paragraphs.
        `;

        const result = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: finalPrompt,
        });

        for await (const chunk of result) {
            setResponse(prev => prev + chunk.text);
        }

    } catch (error) {
        console.error("AI Error:", error);
        setResponse("抱歉，连接 AI 助教时出现问题。请检查网络或 API Key 设置。");
    } finally {
        setIsLoading(false);
        if (!customPrompt) setQuestion(''); // Clear input if it wasn't a preset button click
    }
  };

  const clearChat = () => {
    setResponse('');
    setQuestion('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">AI 实验助教</h2>
        </div>
        {response && !isLoading && (
            <button onClick={clearChat} title="清除对话" className="text-slate-400 hover:text-red-500 transition-colors">
                <Eraser className="w-4 h-4" />
            </button>
        )}
      </div>

      {/* Response Area */}
      <div 
        ref={responseRef}
        className="min-h-[160px] max-h-[300px] bg-indigo-50/50 rounded-lg p-4 mb-4 border border-indigo-100/50 overflow-y-auto text-sm leading-relaxed text-slate-700 whitespace-pre-wrap shadow-inner"
      >
        {response ? (
            <div className="animate-in fade-in duration-300">
                <span className="font-bold text-indigo-600 block mb-1">AI 回答：</span>
                {response}
                {isLoading && <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-400 animate-pulse align-middle"></span>}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-4">
                <div className="bg-white p-3 rounded-full shadow-sm">
                    <Sparkles className="w-6 h-6 text-indigo-300" />
                </div>
                <p className="text-xs text-center max-w-[200px]">
                    我是你的 AI 物理助教。<br/>关于当前的实验现象，有什么想问的吗？
                </p>
                {!isLoading && (
                    <button 
                        onClick={() => handleAskAI("请分析当前的成像状态和原因。")}
                        className="text-xs bg-white text-indigo-600 border border-indigo-200 py-1.5 px-3 rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                        ✨ 分析当前成像
                    </button>
                )}
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAskAI()}
            placeholder="输入你的问题 (例如: 为什么像是虚像?)"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            disabled={isLoading}
        />
        <button 
            onClick={() => handleAskAI()}
            disabled={isLoading || (!question.trim() && !response)} 
            className={`
                p-2 rounded-lg transition-all flex items-center justify-center min-w-[40px]
                ${isLoading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95'
                }
            `}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default AITutor;