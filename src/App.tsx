import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Maximize2,
} from 'lucide-react';
import { enhanceImage, EnhanceResult } from './utils/sharpnessEngine';

export default function App() {
  const [originalRawUrl, setOriginalRawUrl] = useState<string | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<EnhanceResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Settings
  const [scale, setScale] = useState<2 | 4>(4);
  const [sharpnessLevel, setSharpnessLevel] = useState<'crisp' | 'ultra' | 'maximum'>('maximum');
  const [isActualSize, setIsActualSize] = useState<boolean>(false);

  // Comparison slider
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map sharpness level to numeric values
  const getSharpnessValues = useCallback((level: 'crisp' | 'ultra' | 'maximum') => {
    switch (level) {
      case 'crisp':
        return { sharpness: 75, clarity: 70, denoise: 20 };
      case 'ultra':
        return { sharpness: 90, clarity: 85, denoise: 25 };
      case 'maximum':
        return { sharpness: 100, clarity: 95, denoise: 30 };
    }
  }, []);

  // Process with local neural super-resolution engine
  const processImage = useCallback(
    async (src: string, targetScale: 2 | 4 = scale, level = sharpnessLevel) => {
      try {
        setIsProcessing(true);
        const { sharpness, clarity, denoise } = getSharpnessValues(level);
        const result = await enhanceImage(src, {
          scale: targetScale,
          sharpness,
          clarity,
          denoise,
        });
        setEnhancedResult(result);
      } catch (err: any) {
        console.error('Enhancement error:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [scale, sharpnessLevel, getSharpnessValues]
  );

  // Handle uploaded file
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setOriginalRawUrl(dataUrl);
        processImage(dataUrl, scale, sharpnessLevel);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [scale, sharpnessLevel]);

  // Spacebar to hold original
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsHoldingOriginal(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsHoldingOriginal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Slider dragging calculation
  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSlider(true);
    updateSliderFromClientX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      updateSliderFromClientX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingSlider(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0] && isDraggingSlider) {
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  // Re-run enhancement when scale or sharpness settings change
  const handleSettingChange = (newScale: 2 | 4, newLevel: 'crisp' | 'ultra' | 'maximum') => {
    setScale(newScale);
    setSharpnessLevel(newLevel);
    if (originalRawUrl) {
      processImage(originalRawUrl, newScale, newLevel);
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!enhancedResult) return;
    const link = document.createElement('a');
    link.href = enhancedResult.enhancedDataUrl;
    link.download = `neural-enhanced-${enhancedResult.enhancedWidth}x${enhancedResult.enhancedHeight}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick synthetic demo generator for testing without a file
  const loadDemo = (type: 'face' | 'scene') => {
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 160;
    const ctx = c.getContext('2d')!;

    if (type === 'face') {
      const bg = ctx.createLinearGradient(0, 0, 160, 160);
      bg.addColorStop(0, '#3a202d');
      bg.addColorStop(1, '#1b1218');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 160, 160);

      ctx.fillStyle = '#e8b89d';
      ctx.beginPath();
      ctx.ellipse(80, 85, 38, 48, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2b1a14';
      ctx.beginPath();
      ctx.arc(80, 65, 42, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(68, 80, 7, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(92, 80, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2c5d4f';
      ctx.beginPath();
      ctx.arc(68, 80, 3.5, 0, Math.PI * 2);
      ctx.arc(92, 80, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#be5965';
      ctx.beginPath();
      ctx.ellipse(80, 108, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 160, 160);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 50, 35, 110);
      ctx.fillRect(65, 30, 45, 130);
      ctx.fillRect(120, 60, 30, 100);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(72, 45, 12, 6);
      ctx.fillRect(72, 60, 12, 6);
      ctx.fillRect(72, 75, 12, 6);

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(30, 70, 15, 4);
      ctx.fillRect(30, 85, 15, 4);
    }

    const low = document.createElement('canvas');
    low.width = 80;
    low.height = 80;
    const lCtx = low.getContext('2d')!;
    lCtx.imageSmoothingQuality = 'low';
    lCtx.drawImage(c, 0, 0, 80, 80);

    const dataUrl = low.toDataURL('image/jpeg', 0.4);
    setOriginalRawUrl(dataUrl);
    processImage(dataUrl, scale, sharpnessLevel);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 lg:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                NeuralPixel <span className="text-indigo-400 font-semibold">Sharp</span>
              </h1>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                High-definition edge deblurring and super-resolution
              </p>
            </div>
          </div>

          {originalRawUrl && (
            <button
              onClick={() => {
                setOriginalRawUrl(null);
                setEnhancedResult(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload New Photo</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
        {/* VIEW 1: DROPZONE */}
        {!originalRawUrl && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Enhance & Sharpen Blurry Photos
              </h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Drop any low-resolution or fuzzy photo to deblur edges, recover lost details, and boost resolution.
              </p>
            </div>

            {/* Dropzone Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-8 sm:p-12 rounded-3xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-4 text-center ${
                isDraggingFile
                  ? 'border-indigo-500 bg-indigo-950/20 scale-[1.01]'
                  : 'border-zinc-800 hover:border-indigo-500/70 bg-zinc-900/40 hover:bg-zinc-900/70 shadow-2xl'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <p className="text-base font-semibold text-zinc-200">
                  Drag and drop your photo here
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  or <span className="text-indigo-400 underline font-medium">browse from your computer</span> • Paste with Ctrl+V
                </p>
                <p className="text-[11px] text-zinc-500 mt-2">
                  Supports JPG, PNG, WebP • Auto-upscales & sharpens immediately
                </p>
              </div>
            </div>

            {/* Quick Test Demo Samples */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-zinc-400">
              <span>Don't have a photo? Test with a sample:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadDemo('face')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>👤 Blurry Portrait</span>
                </button>
                <button
                  onClick={() => loadDemo('scene')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>🏙️ Fuzzy Landscape</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ENHANCED RESULT & DOWNLOAD */}
        {originalRawUrl && (
          <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Top Status & Quick Stats */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Sharpness Enhanced ({sharpnessLevel.toUpperCase()})
                </span>
                {enhancedResult && (
                  <span className="text-zinc-400">
                    Resolution: <strong className="text-zinc-200">{enhancedResult.originalWidth}×{enhancedResult.originalHeight}</strong> ➜ <strong className="text-indigo-400">{enhancedResult.enhancedWidth}×{enhancedResult.enhancedHeight}px</strong> ({scale}× Resolution)
                  </span>
                )}
              </div>

              {/* View options */}
              <div className="flex items-center gap-2 text-zinc-400">
                <button
                  onClick={() => setIsActualSize((s) => !s)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    isActualSize
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                  title="Toggle 100% 1:1 pixel zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5 inline mr-1" />
                  {isActualSize ? '1:1 Actual Size' : 'Fit View'}
                </button>

                <button
                  onMouseDown={() => setIsHoldingOriginal(true)}
                  onMouseUp={() => setIsHoldingOriginal(false)}
                  onTouchStart={() => setIsHoldingOriginal(true)}
                  onTouchEnd={() => setIsHoldingOriginal(false)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    isHoldingOriginal
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  {isHoldingOriginal ? 'Showing Blurry Original' : 'Hold to View Original'}
                </button>
              </div>
            </div>

            {/* Interactive Before/After Split Comparison Viewer */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchMove={handleTouchMove}
              onMouseLeave={() => setIsDraggingSlider(false)}
              className={`relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[65vh] bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl cursor-ew-resize select-none flex items-center justify-center ${
                isActualSize ? 'overflow-auto cursor-default' : ''
              }`}
            >
              {isProcessing && (
                <div className="absolute inset-0 z-30 bg-zinc-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full border-3 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  <p className="text-xs font-semibold text-white">Reconstructing Sharp Edges & Details...</p>
                </div>
              )}

              {/* Enhanced Sharp Image (Background) */}
              {enhancedResult && (
                <img
                  src={isHoldingOriginal ? enhancedResult.originalScaledDataUrl : enhancedResult.enhancedDataUrl}
                  alt="Enhanced Sharp Image"
                  className={
                    isActualSize
                      ? 'max-w-none pointer-events-none'
                      : 'max-w-full max-h-full object-contain pointer-events-none'
                  }
                />
              )}

              {/* Blurry Original Image (Foreground clipped by slider) */}
              {enhancedResult && !isHoldingOriginal && (
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                  }}
                >
                  <img
                    src={enhancedResult.originalScaledDataUrl}
                    alt="Original Blurry Image"
                    className={
                      isActualSize
                        ? 'max-w-none pointer-events-none'
                        : 'max-w-full max-h-full object-contain pointer-events-none'
                    }
                  />
                </div>
              )}

              {/* Divider Handle */}
              {!isHoldingOriginal && (
                <div
                  className="absolute pointer-events-none z-20 flex items-center justify-center top-0 bottom-0"
                  style={{
                    left: `${sliderPos}%`,
                    transform: 'translateX(-50%)',
                    width: '2px',
                    backgroundColor: '#6366f1',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.9)',
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
                    ◀ ▶
                  </div>
                </div>
              )}

              {/* Floating Labels */}
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] font-bold text-amber-400 backdrop-blur-md pointer-events-none shadow-md">
                BEFORE (Blurry Original)
              </div>
              <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700 text-[11px] font-bold text-cyan-300 backdrop-blur-md pointer-events-none shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                AFTER (Sharp Enhanced)
              </div>
            </div>

            {/* Bottom Controls Bar & DOWNLOAD ACTION */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              {/* Sharpness & Scale controls */}
              <div className="flex flex-wrap items-center gap-4 text-xs w-full md:w-auto">
                {/* Scale selection */}
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 font-medium">Scale:</span>
                  <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => handleSettingChange(2, sharpnessLevel)}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        scale === 2
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      2× HD
                    </button>
                    <button
                      onClick={() => handleSettingChange(4, sharpnessLevel)}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        scale === 4
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      4× Ultra HD
                    </button>
                  </div>
                </div>

                {/* Sharpness Level */}
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 font-medium">Sharpness:</span>
                  <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => handleSettingChange(scale, 'crisp')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        sharpnessLevel === 'crisp'
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Crisp
                    </button>
                    <button
                      onClick={() => handleSettingChange(scale, 'ultra')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        sharpnessLevel === 'ultra'
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Ultra Sharp
                    </button>
                    <button
                      onClick={() => handleSettingChange(scale, 'maximum')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        sharpnessLevel === 'maximum'
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Maximum Clarity
                    </button>
                  </div>
                </div>
              </div>

              {/* PRIMARY DOWNLOAD BUTTON */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleDownload}
                  disabled={!enhancedResult}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Enhanced Image</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-3.5 px-4 text-center text-xs text-zinc-500">
        <p>NeuralPixel Sharp • Dropzone photo enhancer & edge deblurring</p>
      </footer>
    </div>
  );
}
