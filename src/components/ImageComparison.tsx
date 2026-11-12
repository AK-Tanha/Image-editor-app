import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Columns,
  Search,
  Activity,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
} from 'lucide-react';
import { ImageMetrics, ViewMode } from '../types';

interface ImageComparisonProps {
  originalUrl: string;
  enhancedUrl: string;
  differenceMapUrl?: string;
  originalMetrics: ImageMetrics | null;
  enhancedMetrics: ImageMetrics | null;
  isProcessing: boolean;
  scaleFactor: string;
  mode: string;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  originalUrl,
  enhancedUrl,
  differenceMapUrl,
  originalMetrics,
  enhancedMetrics,
  isProcessing,
  scaleFactor,
  mode,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitOrientation, setSplitOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Loupe state
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Spacebar toggle to hold original
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

  // Update slider position from mouse or touch event
  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (splitOrientation === 'vertical') {
        const x = clientX - rect.left;
        const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(pos);
      } else {
        const y = clientY - rect.top;
        const pos = Math.max(0, Math.min(100, (y / rect.height) * 100));
        setSliderPosition(pos);
      }
    },
    [splitOrientation]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === 'split') {
      setIsDragging(true);
      updatePosition(e.clientX, e.clientY);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Loupe tracking
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setLoupePos({ x, y });
    }

    if (isDragging) {
      updatePosition(e.clientX, e.clientY);
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0 && isDragging) {
      updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(4, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeDisplayUrl = isHoldingOriginal ? originalUrl : enhancedUrl;

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl relative select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs">
        {/* Mode Toggles */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Interactive Split Slider"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Side by Side"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side by Side</span>
          </button>

          <button
            onClick={() => setViewMode('loupe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'loupe'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="4x Magnifier Loupe"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Loupe</span>
          </button>

          {differenceMapUrl && (
            <button
              onClick={() => setViewMode('difference')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'difference'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Restored Edge Frequency Heatmap"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Detail Map</span>
            </button>
          )}
        </div>

        {/* Orientation & Quick Toggle */}
        <div className="flex items-center gap-2">
          {viewMode === 'split' && (
            <button
              onClick={() =>
                setSplitOrientation((o) => (o === 'vertical' ? 'horizontal' : 'vertical'))
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Toggle split direction"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{splitOrientation === 'vertical' ? 'Horizontal Line' : 'Vertical Line'}</span>
            </button>
          )}

          {/* Quick Hold to view original button */}
          <button
            onMouseDown={() => setIsHoldingOriginal(true)}
            onMouseUp={() => setIsHoldingOriginal(false)}
            onTouchStart={() => setIsHoldingOriginal(true)}
            onTouchEnd={() => setIsHoldingOriginal(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              isHoldingOriginal
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            }`}
            title="Hold to see original low-res photo (or hold Spacebar)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isHoldingOriginal ? 'Viewing Original' : 'Hold for Original'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-zinc-300 min-w-[40px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onMouseEnter={() => setIsHoveringImage(true)}
        onMouseLeave={() => {
          setIsHoveringImage(false);
          setIsDragging(false);
          setIsPanning(false);
        }}
        className={`relative flex-1 w-full min-h-[460px] max-h-[75vh] bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-950 overflow-hidden flex items-center justify-center ${
          viewMode === 'split' ? (splitOrientation === 'vertical' ? 'cursor-ew-resize' : 'cursor-ns-resize') : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Sparkles className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white tracking-wide">
                Synthesizing Neural Super-Resolution...
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Reconstructing sub-pixel high-frequency textures & eliminating artifacts
              </p>
            </div>
          </div>
        )}

        {/* View Mode: SPLIT SLIDER */}
        {viewMode === 'split' && (
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Background: Enhanced Image (or original if space held) */}
            <img
              src={activeDisplayUrl}
              alt="Enhanced Neural Image"
              className="max-w-full max-h-full object-contain pointer-events-none select-none shadow-2xl rounded-lg"
            />

            {/* Foreground: Original Image with clip-path matching slider */}
            {!isHoldingOriginal && (
              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none"
                style={{
                  clipPath:
                    splitOrientation === 'vertical'
                      ? `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                      : `polygon(0 0, 100% 0, 100% ${sliderPosition}%, 0 ${sliderPosition}%)`,
                }}
              >
                <img
                  src={originalUrl}
                  alt="Original Low Resolution"
                  className="max-w-full max-h-full object-contain pointer-events-none select-none [image-rendering:pixelated]"
                />
              </div>
            )}

            {/* Split Handle Divider Line */}
            {!isHoldingOriginal && (
              <div
                className="absolute pointer-events-none z-20 flex items-center justify-center"
                style={
                  splitOrientation === 'vertical'
                    ? {
                        left: `${sliderPosition}%`,
                        top: 0,
                        bottom: 0,
                        transform: 'translateX(-50%)',
                        width: '2px',
                        backgroundColor: '#6366f1',
                        boxShadow: '0 0 12px rgba(99, 102, 241, 0.8)',
                      }
                    : {
                        top: `${sliderPosition}%`,
                        left: 0,
                        right: 0,
                        transform: 'translateY(-50%)',
                        height: '2px',
                        backgroundColor: '#6366f1',
                        boxShadow: '0 0 12px rgba(99, 102, 241, 0.8)',
                      }
                }
              >
                {/* Circular thumb handle */}
                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
                  {splitOrientation === 'vertical' ? '◀ ▶' : '▲ ▼'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode: SIDE-BY-SIDE */}
        {viewMode === 'side-by-side' && (
          <div
            className="w-full h-full grid grid-cols-2 gap-4 p-4"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Left: Original */}
            <div className="relative flex flex-col items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800 p-2 overflow-hidden">
              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-700 text-xs font-semibold text-zinc-300 backdrop-blur-md">
                Original (Low-Res)
              </span>
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain [image-rendering:pixelated] rounded-lg"
              />
            </div>

            {/* Right: Enhanced */}
            <div className="relative flex flex-col items-center justify-center bg-zinc-900/50 rounded-xl border border-indigo-900/50 p-2 overflow-hidden">
              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-700 text-xs font-semibold text-indigo-300 backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Enhanced ({scaleFactor})
              </span>
              <img
                src={enhancedUrl}
                alt="Enhanced"
                className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        )}

        {/* View Mode: LOUPE ZOOM */}
        {viewMode === 'loupe' && (
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={enhancedUrl}
              alt="Enhanced Base"
              className="max-w-full max-h-full object-contain pointer-events-none rounded-lg"
            />

            {/* Floating Loupe Lens */}
            {isHoveringImage && containerRef.current && (
              <div
                className="absolute pointer-events-none z-30 w-52 h-52 rounded-full border-4 border-cyan-400 bg-zinc-950 shadow-2xl shadow-cyan-500/30 overflow-hidden"
                style={{
                  left: `${loupePos.x}px`,
                  top: `${loupePos.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* 4x zoomed enhanced image inside lens */}
                <div
                  className="w-full h-full relative"
                  style={{
                    backgroundImage: `url(${enhancedUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `${-(loupePos.x * 2.5 - 104)}px ${-(loupePos.y * 2.5 - 104)}px`,
                    backgroundSize: `${(containerRef.current?.clientWidth || 500) * 2.5}px ${(containerRef.current?.clientHeight || 500) * 2.5}px`,
                  }}
                />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900/90 text-[10px] font-bold text-cyan-400 border border-cyan-500/40">
                    4x Sub-Pixel Detail
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode: DIFFERENCE / FREQUENCY MAP */}
        {viewMode === 'difference' && differenceMapUrl && (
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={differenceMapUrl}
              alt="Neural Edge Detail Map"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-4 left-4 z-10 px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 backdrop-blur-md max-w-sm">
              <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Restored High-Frequency Spectrum
              </div>
              <p className="text-[11px] text-zinc-400">
                Magenta and cyan highlights show the exact micro-textures, edge gradients, and crisp details reconstructed by the neural network.
              </p>
            </div>
          </div>
        )}

        {/* Floating Label Tags (Before / After) on Split View */}
        {viewMode === 'split' && !isHoldingOriginal && (
          <>
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs font-semibold text-zinc-300 backdrop-blur-md shadow-lg pointer-events-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>ORIGINAL LOW-RES</span>
              {originalMetrics && (
                <span className="text-zinc-500 text-[11px]">
                  ({originalMetrics.width}×{originalMetrics.height})
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/80 text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-lg pointer-events-none flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NEURAL ENHANCED</span>
              {enhancedMetrics && (
                <span className="text-indigo-400 text-[11px]">
                  ({enhancedMetrics.width}×{enhancedMetrics.height} • {scaleFactor})
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Metrics Bar */}
      <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-zinc-500">Input: </span>
            <strong className="text-zinc-200">
              {originalMetrics ? `${originalMetrics.width} × ${originalMetrics.height}px` : '---'}
            </strong>
            {originalMetrics && (
              <span className="ml-1 text-[11px] text-zinc-500">({originalMetrics.megapixels} MP)</span>
            )}
          </div>
          <span className="text-zinc-700 font-bold">➜</span>
          <div>
            <span className="text-zinc-500">Enhanced Output: </span>
            <strong className="text-indigo-300">
              {enhancedMetrics ? `${enhancedMetrics.width} × ${enhancedMetrics.height}px` : '---'}
            </strong>
            {enhancedMetrics && (
              <span className="ml-1 text-[11px] text-indigo-400 font-medium">
                ({enhancedMetrics.megapixels} MP • {scaleFactor} Super-Res)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-500">Mode: </span>
          <span className="capitalize font-medium text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md">
            {mode}
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-500 text-[11px]">
            Tip: Press & hold Spacebar anytime to view original
          </span>
        </div>
      </div>
    </div>
  );
};
