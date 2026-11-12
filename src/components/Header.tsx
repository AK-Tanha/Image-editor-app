import React from 'react';
import { Sparkles, Cpu, Layers, HelpCircle, RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  onReset: () => void;
  onOpenHelp: () => void;
  isProcessing: boolean;
  engineUsed?: 'gemini' | 'client-neural';
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  onReset,
  onOpenHelp,
  isProcessing,
  engineUsed,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                NeuralPixel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Super-Resolution
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Deep Neural Network Photo Restoration & High-Frequency Upscaling
            </p>
          </div>
        </div>

        {/* Status badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Engine Indicator */}
          {engineUsed && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Engine: <strong className="text-white font-medium">{engineUsed === 'gemini' ? 'Gemini Generative' : 'Neural Shader'}</strong>
              </span>
            </div>
          )}

          {/* Gemini API Key status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                : 'bg-amber-950/40 border-amber-800/50 text-amber-400'
            }`}
            title={hasApiKey ? 'Gemini API connected' : 'Local neural engine active. Configure API key in Secrets for Gemini Cloud enhancement'}
          >
            <Zap className={`w-3.5 h-3.5 ${hasApiKey ? 'fill-emerald-400/20' : 'fill-amber-400/20'}`} />
            <span className="hidden sm:inline">
              {hasApiKey ? 'Gemini AI Ready' : 'Local Shader Mode'}
            </span>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title="Reset workspace"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>

          {/* Help button */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Neural Super-Resolution Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
