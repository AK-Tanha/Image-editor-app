import React from 'react';
import { ShieldCheck, AlertCircle, Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import { ImageAnalysis } from '../types';

interface DiagnosticCardProps {
  analysis: ImageAnalysis | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  hasApiKey: boolean;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  analysis,
  isAnalyzing,
  onRunAnalysis,
  hasApiKey,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 shadow-lg text-xs text-zinc-300 flex items-center justify-center gap-3 py-8">
        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="font-medium text-zinc-200">
          Neural Vision model analyzing image degradation & frequency patterns...
        </span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 shadow-lg text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-200">Neural Degradation Diagnostic</h4>
            <p className="text-[11px] text-zinc-400">
              Run Gemini Vision to scan blur, compression artifacts, and recommend optimal settings.
            </p>
          </div>
        </div>
        <button
          onClick={onRunAnalysis}
          disabled={!hasApiKey}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-medium text-zinc-200 hover:text-white transition-colors shrink-0 disabled:opacity-50"
          title={!hasApiKey ? 'Requires Gemini API key' : 'Analyze image'}
        >
          Scan Image
        </button>
      </div>
    );
  }

  // Quality score color mapping
  const score = analysis.qualityScore;
  const scoreColor =
    score > 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    score > 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 shadow-lg space-y-3 text-xs text-zinc-300">
      {/* Title & Quality Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-zinc-100 uppercase tracking-wide text-[11px]">
            Neural Network Diagnostic Report
          </h4>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${scoreColor}`}>
          Input Fidelity: {score}/100
        </div>
      </div>

      {/* Degradation matrix pill tags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block">Detected Subject</span>
          <strong className="text-zinc-200 font-medium truncate block">
            {analysis.detectedSubject}
          </strong>
        </div>

        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block">Blur Level</span>
          <strong
            className={`font-medium ${
              analysis.blurLevel === 'Severe' || analysis.blurLevel === 'Moderate'
                ? 'text-rose-400'
                : 'text-zinc-200'
            }`}
          >
            {analysis.blurLevel}
          </strong>
        </div>

        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block">JPEG Artifacts</span>
          <strong
            className={`font-medium ${
              analysis.compressionArtifacts === 'High' || analysis.compressionArtifacts === 'Medium'
                ? 'text-amber-400'
                : 'text-zinc-200'
            }`}
          >
            {analysis.compressionArtifacts}
          </strong>
        </div>

        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block">Face Landmarks</span>
          <strong className="text-zinc-200 font-medium">
            {analysis.faceDetected ? 'Detected (Active)' : 'None'}
          </strong>
        </div>
      </div>

      {/* Neural Diagnosis Summary */}
      <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed">
        {analysis.neuralDiagnosisSummary}
      </div>

      {/* Targeted recovery features */}
      {analysis.keyFeaturesToRestore?.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Target Reconstructed Frequencies:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.keyFeaturesToRestore.map((feat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-[10px] text-indigo-300"
              >
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
