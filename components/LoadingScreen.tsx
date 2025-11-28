import React, { useEffect, useState } from 'react';
import { LOADING_MESSAGES } from '../constants';
import { Sparkles, BrainCircuit } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-500 blur-3xl opacity-20 rounded-full w-32 h-32 animate-pulse" />
        <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
          <BrainCircuit className="w-12 h-12 text-brand-600 animate-spin-slow" />
        </div>
      </div>

      <div className="mt-8 text-center space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-slate-900 flex items-center justify-center gap-2">
           Analzying Product Context <span className="animate-pulse">...</span>
        </h3>
        
        <div className="h-12 flex items-center justify-center overflow-hidden">
          <p 
            key={messageIndex} 
            className="text-slate-500 text-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-500"
          >
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>
      </div>

      {/* Progress bar aesthetic */}
      <div className="mt-8 w-64 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-600 rounded-full w-1/3 animate-progress"></div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
        .animate-spin-slow {
            animation: spin 8s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
