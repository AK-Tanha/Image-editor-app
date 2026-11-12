import React, { useEffect, useRef } from 'react';
import { BarChart3 } from 'lucide-react';

interface HistogramProps {
  originalCanvasRef?: HTMLCanvasElement | null;
  enhancedCanvasRef?: HTMLCanvasElement | null;
}

export const Histogram: React.FC<HistogramProps> = ({
  originalCanvasRef,
  enhancedCanvasRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += width / 4) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += height / 4) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // If enhanced canvas is available, extract distribution
    const sourceCanvas = enhancedCanvasRef || originalCanvasRef;
    if (!sourceCanvas) return;

    try {
      const srcCtx = sourceCanvas.getContext('2d');
      if (!srcCtx) return;

      const sampleSize = 100;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = sampleSize;
      offCanvas.height = sampleSize;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(sourceCanvas, 0, 0, sampleSize, sampleSize);
      const imgData = offCtx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imgData.data;

      const rBins = new Array(64).fill(0);
      const gBins = new Array(64).fill(0);
      const bBins = new Array(64).fill(0);

      for (let i = 0; i < data.length; i += 4) {
        const rBin = Math.floor(data[i] / 4);
        const gBin = Math.floor(data[i + 1] / 4);
        const bBin = Math.floor(data[i + 2] / 4);
        rBins[rBin]++;
        gBins[gBin]++;
        bBins[bBin]++;
      }

      const maxVal = Math.max(...rBins, ...gBins, ...bBins) || 1;

      // Draw RGB curves
      const drawChannel = (bins: number[], color: string) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        const step = width / (bins.length - 1);

        for (let i = 0; i < bins.length; i++) {
          const x = i * step;
          const y = height - (bins[i] / maxVal) * (height - 6) - 3;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawChannel(rBins, 'rgba(239, 68, 68, 0.7)');   // Red
      drawChannel(gBins, 'rgba(34, 197, 94, 0.7)');   // Green
      drawChannel(bBins, 'rgba(59, 130, 246, 0.7)');  // Blue
    } catch {
      // Fallback
    }
  }, [originalCanvasRef, enhancedCanvasRef]);

  return (
    <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 shadow-md">
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Color & Luminance Dynamic Histogram</span>
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-rose-400">● Red</span>
          <span className="text-emerald-400">● Green</span>
          <span className="text-blue-400">● Blue</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={320}
        height={60}
        className="w-full h-14 rounded-lg bg-zinc-900 border border-zinc-800"
      />
    </div>
  );
};
