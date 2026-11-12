import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Download,
  Copy,
  Check,
  User,
  Palette,
  Mountain,
  History,
  Wand2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  RotateCcw,
} from 'lucide-react';
import { EnhancementMode, UpscaleFactor, EnhancementSettings, ModelOption } from '../types';

interface ControlsPanelProps {
  settings: EnhancementSettings;
  onUpdateSettings: (newSettings: Partial<EnhancementSettings>) => void;
  onEnhanceWithGemini: () => void;
  onEnhanceClientFast: () => void;
  onDownload: (format: 'png' | 'jpeg') => void;
  onCopyClipboard: () => void;
  isProcessing: boolean;
  hasEnhancedImage: boolean;
  hasApiKey: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onUpdateSettings,
  onEnhanceWithGemini,
  onEnhanceClientFast,
  onDownload,
  onCopyClipboard,
  isProcessing,
  hasEnhancedImage,
  hasApiKey,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');

  const modes: Array<{
    id: EnhancementMode;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }> = [
    {
      id: 'auto',
      label: 'Universal Super-Res',
      icon: <Wand2 className="w-4 h-4 text-indigo-400" />,
      desc: 'Balanced restoration for all photo types',
    },
    {
      id: 'face',
      label: 'Portrait & Face',
      icon: <User className="w-4 h-4 text-pink-400" />,
      desc: 'Lifelike eyes, skin pores, hair strands & facial landmarks',
    },
    {
      id: 'anime',
      label: 'Anime & Illustration',
      icon: <Palette className="w-4 h-4 text-purple-400" />,
      desc: 'Crisp lineart, anti-aliasing & flat shading de-noise',
    },
    {
      id: 'landscape',
      label: 'Scenery & Urban',
      icon: <Mountain className="w-4 h-4 text-emerald-400" />,
      desc: 'Foliage, architectural edges & atmospheric micro-contrast',
    },
    {
      id: 'vintage',
      label: 'Vintage Photo Repair',
      icon: <History className="w-4 h-4 text-amber-400" />,
      desc: 'Faded tones, scratch removal & organic film grain fix',
    },
  ];

  const scales: UpscaleFactor[] = ['2x', '4x', '8x'];

  const handleCopy = () => {
    onCopyClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetSliders = () => {
    onUpdateSettings({
      sharpness: 65,
      denoise: 30,
      microContrast: 35,
      saturation: 0,
      faceClarity: 50,
      customPrompt: '',
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 shadow-xl text-zinc-200">
      {/* 1. Mode Selection */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          1. Neural Enhancement Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          {modes.map((m) => {
            const isSelected = settings.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onUpdateSettings({ mode: m.id })}
                className={`flex items-start gap-3 p-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-950/50 text-white'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-indigo-600/30' : 'bg-zinc-800'
                  }`}
                >
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{m.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {m.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Upscale Factor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            2. Upscale Multiplier
          </label>
          <span className="text-[11px] text-zinc-500">Target Pixel Density</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {scales.map((s) => {
            const isSelected = settings.scale === s;
            return (
              <button
                key={s}
                onClick={() => onUpdateSettings({ scale: s })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span className="text-sm">{s}</span>
                <span className="text-[10px] font-normal opacity-80">
                  {s === '2x' ? 'HD (2× Pixels)' : s === '4x' ? 'Ultra HD (4×)' : 'Extreme 8K (8×)'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        {/* Primary Gemini AI Enhance Button */}
        <button
          onClick={onEnhanceWithGemini}
          disabled={isProcessing}
          className="w-full relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 group-hover:scale-105 transition-transform" />
          <div className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-[11px] bg-zinc-950 text-white group-hover:bg-opacity-80 transition-colors">
            <Sparkles className={`w-4 h-4 text-cyan-400 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>
              {isProcessing
                ? 'Processing Neural Networks...'
                : 'Enhance with Gemini Neural AI'}
            </span>
          </div>
        </button>

        {/* Instant Local Shader Filter */}
        <button
          onClick={onEnhanceClientFast}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Instant Local Neural Shader (0ms Latency)</span>
        </button>
      </div>

      {/* 4. Fine-Tuning Controls (Accordion) */}
      <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40">
        <button
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="w-full flex items-center justify-between p-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-850 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fine-Tuning & Model Configuration</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-3 border-t border-zinc-800/80 space-y-3.5 text-xs bg-zinc-950/60">
            {/* Model Selection */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Gemini Neural Model
              </label>
              <select
                value={settings.model}
                onChange={(e) =>
                  onUpdateSettings({ model: e.target.value as ModelOption })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-3.1-flash-lite-image">
                  Gemini 3.1 Flash-Lite Image (Fast & Responsive)
                </option>
                <option value="gemini-nano-banana-2.1">
                  Gemini Nano-Banana 2.1 (Ultra 4K Generative Upscaler)
                </option>
              </select>
            </div>

            {/* Sharpness Slider */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Edge Sharpness</span>
                <span className="font-mono text-zinc-300">{settings.sharpness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sharpness}
                onChange={(e) =>
                  onUpdateSettings({ sharpness: parseInt(e.target.value, 10) })
                }
                className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Denoise Slider */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Noise Suppression (Denoise)</span>
                <span className="font-mono text-zinc-300">{settings.denoise}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.denoise}
                onChange={(e) =>
                  onUpdateSettings({ denoise: parseInt(e.target.value, 10) })
                }
                className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Micro Contrast Slider */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Micro-Contrast (CLAHE)</span>
                <span className="font-mono text-zinc-300">{settings.microContrast}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.microContrast}
                onChange={(e) =>
                  onUpdateSettings({ microContrast: parseInt(e.target.value, 10) })
                }
                className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Saturation Slider */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400">Color Vibrance</span>
                <span className="font-mono text-zinc-300">
                  {settings.saturation > 0 ? `+${settings.saturation}` : settings.saturation}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={settings.saturation}
                onChange={(e) =>
                  onUpdateSettings({ saturation: parseInt(e.target.value, 10) })
                }
                className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Custom Prompt Instruction */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Custom Neural Prompt (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Focus on sharpening eye reflections & hair"
                value={settings.customPrompt}
                onChange={(e) => onUpdateSettings({ customPrompt: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Reset Fine-Tuning */}
            <button
              onClick={resetSliders}
              className="w-full py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Parameters to Defaults</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Export & Download Bar */}
      {hasEnhancedImage && (
        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Export High-Resolution Image
          </label>
          <div className="flex items-center gap-2">
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'jpeg')}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="png">PNG (Lossless)</option>
              <option value="jpeg">JPEG (High-Q)</option>
            </select>

            <button
              onClick={() => onDownload(downloadFormat)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ({settings.scale})</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Copy Enhanced Image to Clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
