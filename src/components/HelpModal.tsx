import React from 'react';
import { X, Sparkles, Cpu, Layers, HelpCircle, CheckCircle, Zap } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Neural Network Super-Resolution Guide
              </h3>
              <p className="text-xs text-zinc-400">
                How deep learning generative networks reconstruct high-frequency image details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs leading-relaxed">
          {/* Section 1: Traditional vs Neural */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Traditional Upscaling vs. Neural Super-Resolution
            </h4>
            <p className="text-zinc-400">
              Traditional algorithms (Bilinear, Bicubic, Lanczos) simply interpolate neighboring pixels, which results in blurry edges and pixelated staircasing. In contrast, <strong>NeuralPixel AI</strong> utilizes deep convolutional and generative latent diffusion networks trained on millions of high-resolution images to <em>synthesize missing sub-pixel frequencies</em>.
            </p>
          </div>

          {/* Section 2: Modes */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Specialized Neural Enhancement Presets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <strong className="text-pink-400 block mb-1">👤 Portrait & Face Restorer</strong>
                Reconstructs lifelike iris reflections, sharp eyelashes, realistic skin pores (preventing plastic look), and hair fibers.
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <strong className="text-purple-400 block mb-1">🎨 Anime & Illustration</strong>
                Vector-crisp lineart reconstruction, eliminates ringing around ink lines, and purifies cel-shaded colors.
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <strong className="text-emerald-400 block mb-1">🏔️ Scenery & Architecture</strong>
                Reconstructs foliage leaves, brickwork, asphalt texture, and cuts through atmospheric haze blur.
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <strong className="text-amber-400 block mb-1">🕰️ Vintage & Faded Photos</strong>
                Removes physical scratches, dust, paper texture, fixes color fading, and tames heavy film grain.
              </div>
            </div>
          </div>

          {/* Section 3: Dual Engines */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 space-y-1.5">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Dual-Engine Pipeline
            </div>
            <p className="text-zinc-400">
              • <strong>Gemini Cloud Neural Engine:</strong> Full generative AI detail synthesis that hallucinates authentic crisp textures from low-resolution inputs.
              <br />
              • <strong>Instant Local Shader Engine:</strong> High-performance in-browser adaptive unsharp masking and bilateral filtering with 0ms server latency.
            </p>
          </div>

          {/* Section 4: Hotkeys */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">Keyboard Shortcuts & Inspection Tools</h4>
            <div className="grid grid-cols-2 gap-2 text-zinc-400">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200 text-[10px]">
                  Spacebar
                </kbd>
                <span>Hold to view original photo</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 font-mono text-zinc-200 text-[10px]">
                  Loupe Mode
                </kbd>
                <span>Inspect 4x magnified pixels</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-md shadow-indigo-600/30 transition-colors"
          >
            Got it, Let's Enhance
          </button>
        </div>
      </div>
    </div>
  );
};
