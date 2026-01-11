
import React, { useEffect, useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Icons } from '../constants';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

export const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const result = await GeminiService.hasKey();
      setHasKey(result);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    await GeminiService.openKeySelector();
    setHasKey(true); // Proceed anyway as per instructions (handling race condition)
  };

  if (hasKey === null) return null;

  if (!hasKey) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-zinc-950 text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
          <Icons.Sparkles />
        </div>
        <h1 className="text-3xl font-outfit font-bold mb-4">API Key Required</h1>
        <p className="text-zinc-400 mb-8 max-w-xs leading-relaxed">
          Gemini 3 Pro Image generation requires a paid API key from a billing-enabled Google Cloud project.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full max-w-xs py-4 px-6 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 active:scale-95"
        >
          Select API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 text-sm text-zinc-500 underline"
        >
          Learn about billing
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
