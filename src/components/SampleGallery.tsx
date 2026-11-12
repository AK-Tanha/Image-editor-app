import React from 'react';
import { Upload, Image as ImageIcon, Sparkles, FolderHeart } from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { SampleImage } from '../types';

interface SampleGalleryProps {
  onSelectSample: (sample: SampleImage) => void;
  onUploadFile: (file: File) => void;
  activeSampleId?: string;
}

export const SampleGallery: React.FC<SampleGalleryProps> = ({
  onSelectSample,
  onUploadFile,
  activeSampleId,
}) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 shadow-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderHeart className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Curated Low-Res Benchmark Samples
          </h3>
        </div>
        <span className="text-[11px] text-zinc-500">
          Click any sample to test neural upscaling instantly
        </span>
      </div>

      {/* Grid of Samples */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {SAMPLE_IMAGES.map((sample) => {
          const isActive = activeSampleId === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`group relative flex flex-col rounded-xl overflow-hidden border text-left transition-all ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
              }`}
            >
              <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                <img
                  src={sample.thumbnail}
                  alt={sample.name}
                  className="w-full h-full object-cover [image-rendering:pixelated] group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-zinc-950/80 text-[9px] font-semibold text-zinc-300 backdrop-blur-sm">
                  Low-Res
                </span>
              </div>
              <div className="p-2 bg-zinc-900/90 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-200 truncate group-hover:text-indigo-400 transition-colors">
                    {sample.name}
                  </div>
                  <span className="text-[10px] text-zinc-500 block">
                    {sample.tag}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dropzone bar */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="mt-2 border-2 border-dashed border-zinc-800 hover:border-indigo-500/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all text-xs"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-zinc-300">
              Have your own low-res or blurry photo?
            </p>
            <p className="text-[11px] text-zinc-500">
              Drag & drop here, paste from clipboard (Ctrl+V), or browse (JPEG, PNG, WebP)
            </p>
          </div>
        </div>

        <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition-colors">
          Browse File
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
