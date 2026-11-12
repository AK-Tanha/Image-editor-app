import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageComparison } from './components/ImageComparison';
import { ControlsPanel } from './components/ControlsPanel';
import { DiagnosticCard } from './components/DiagnosticCard';
import { SampleGallery } from './components/SampleGallery';
import { Histogram } from './components/Histogram';
import { HelpModal } from './components/HelpModal';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import {
  loadImage,
  getImageMetrics,
  processClientNeuralUpscale,
  generateDifferenceMap,
} from './utils/neuralFilters';
import {
  EnhancementSettings,
  ImageMetrics,
  ImageAnalysis,
  SampleImage,
} from './types';
import { AlertCircle, X, Sparkles, Wand2 } from 'lucide-react';

export default function App() {
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [enhancedUrl, setEnhancedUrl] = useState<string>('');
  const [differenceMapUrl, setDifferenceMapUrl] = useState<string>('');
  const [originalMetrics, setOriginalMetrics] = useState<ImageMetrics | null>(null);
  const [enhancedMetrics, setEnhancedMetrics] = useState<ImageMetrics | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string>(SAMPLE_IMAGES[0].id);

  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [engineUsed, setEngineUsed] = useState<'gemini' | 'client-neural'>('client-neural');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<EnhancementSettings>({
    mode: 'face',
    scale: '4x',
    model: 'gemini-3.1-flash-lite-image',
    sharpness: 70,
    denoise: 35,
    microContrast: 40,
    saturation: 10,
    faceClarity: 60,
    customPrompt: '',
  });

  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const enhancedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  // Initialize with the first sample image
  useEffect(() => {
    const initialSample = SAMPLE_IMAGES[0];
    loadAndProcessInitialSample(initialSample);
  }, []);

  // Global paste handler for pasting images from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleUploadFile(blob);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [settings]);

  // Initial load helper
  const loadAndProcessInitialSample = async (sample: SampleImage) => {
    try {
      setIsProcessing(true);
      setOriginalUrl(sample.dataUrl);
      setActiveSampleId(sample.id);
      setSettings((prev) => ({
        ...prev,
        mode: sample.presetMode,
        scale: sample.presetScale,
      }));

      const origImg = await loadImage(sample.dataUrl);
      const origMetrics = getImageMetrics(origImg);
      setOriginalMetrics(origMetrics);

      // Create initial original canvas
      const origCanvas = document.createElement('canvas');
      origCanvas.width = origMetrics.width;
      origCanvas.height = origMetrics.height;
      const oCtx = origCanvas.getContext('2d');
      if (oCtx) oCtx.drawImage(origImg, 0, 0);
      originalCanvasRef.current = origCanvas;

      // Run initial fast local neural enhancement
      const clientEnhancedUrl = await processClientNeuralUpscale(origImg, {
        ...settings,
        mode: sample.presetMode,
        scale: sample.presetScale,
      });

      setEnhancedUrl(clientEnhancedUrl);
      const enhImg = await loadImage(clientEnhancedUrl);
      const enhMetrics = getImageMetrics(enhImg);
      setEnhancedMetrics(enhMetrics);

      // Create enhanced canvas
      const enhCanvas = document.createElement('canvas');
      enhCanvas.width = enhMetrics.width;
      enhCanvas.height = enhMetrics.height;
      const eCtx = enhCanvas.getContext('2d');
      if (eCtx) eCtx.drawImage(enhImg, 0, 0);
      enhancedCanvasRef.current = enhCanvas;

      // Difference map
      const diffUrl = generateDifferenceMap(origCanvas, enhCanvas);
      setDifferenceMapUrl(diffUrl);
      setEngineUsed('client-neural');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle sample selection
  const handleSelectSample = (sample: SampleImage) => {
    setAnalysis(null);
    setErrorMessage(null);
    loadAndProcessInitialSample(sample);
  };

  // Handle uploading custom file
  const handleUploadFile = async (file: File) => {
    try {
      setErrorMessage(null);
      setAnalysis(null);
      setActiveSampleId('');
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        setOriginalUrl(dataUrl);
        const origImg = await loadImage(dataUrl);
        const origMetrics = getImageMetrics(origImg, file.size);
        setOriginalMetrics(origMetrics);

        const origCanvas = document.createElement('canvas');
        origCanvas.width = origMetrics.width;
        origCanvas.height = origMetrics.height;
        const oCtx = origCanvas.getContext('2d');
        if (oCtx) oCtx.drawImage(origImg, 0, 0);
        originalCanvasRef.current = origCanvas;

        // Auto client-side upscale first so user sees immediate results
        const enhancedResult = await processClientNeuralUpscale(origImg, settings);
        setEnhancedUrl(enhancedResult);
        const enhImg = await loadImage(enhancedResult);
        const enhMetrics = getImageMetrics(enhImg);
        setEnhancedMetrics(enhMetrics);

        const enhCanvas = document.createElement('canvas');
        enhCanvas.width = enhMetrics.width;
        enhCanvas.height = enhMetrics.height;
        const eCtx = enhCanvas.getContext('2d');
        if (eCtx) eCtx.drawImage(enhImg, 0, 0);
        enhancedCanvasRef.current = enhCanvas;

        const diff = generateDifferenceMap(origCanvas, enhCanvas);
        setDifferenceMapUrl(diff);
        setEngineUsed('client-neural');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Failed to read image file: ' + err.message);
      setIsProcessing(false);
    }
  };

  // Run Gemini Cloud AI Enhancement
  const handleEnhanceWithGemini = async () => {
    if (!originalUrl) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalUrl,
          mimeType: originalUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          mode: settings.mode,
          scale: settings.scale,
          modelChoice: settings.model,
          customInstruction: settings.customPrompt,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gemini neural enhancement failed.');
      }

      setEnhancedUrl(data.enhancedImage);
      const enhImg = await loadImage(data.enhancedImage);
      const enhMetrics = getImageMetrics(enhImg);
      setEnhancedMetrics(enhMetrics);

      if (originalCanvasRef.current) {
        const enhCanvas = document.createElement('canvas');
        enhCanvas.width = enhMetrics.width;
        enhCanvas.height = enhMetrics.height;
        const eCtx = enhCanvas.getContext('2d');
        if (eCtx) eCtx.drawImage(enhImg, 0, 0);
        enhancedCanvasRef.current = enhCanvas;

        const diff = generateDifferenceMap(originalCanvasRef.current, enhCanvas);
        setDifferenceMapUrl(diff);
      }

      setEngineUsed('gemini');
    } catch (err: any) {
      console.warn('Gemini enhancement error, falling back to local neural shaders:', err);
      setErrorMessage(
        `${err.message}. Running local high-precision neural shader fallback instead.`
      );
      // Run fallback local upscale
      handleEnhanceClientFast();
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Fast Client Neural Upscale
  const handleEnhanceClientFast = async () => {
    if (!originalUrl) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const origImg = await loadImage(originalUrl);
      const enhancedResult = await processClientNeuralUpscale(origImg, settings);
      setEnhancedUrl(enhancedResult);

      const enhImg = await loadImage(enhancedResult);
      const enhMetrics = getImageMetrics(enhImg);
      setEnhancedMetrics(enhMetrics);

      if (originalCanvasRef.current) {
        const enhCanvas = document.createElement('canvas');
        enhCanvas.width = enhMetrics.width;
        enhCanvas.height = enhMetrics.height;
        const eCtx = enhCanvas.getContext('2d');
        if (eCtx) eCtx.drawImage(enhImg, 0, 0);
        enhancedCanvasRef.current = enhCanvas;

        const diff = generateDifferenceMap(originalCanvasRef.current, enhCanvas);
        setDifferenceMapUrl(diff);
      }

      setEngineUsed('client-neural');
    } catch (err: any) {
      setErrorMessage('Local neural filter error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Gemini Neural Vision Analysis
  const handleRunAnalysis = async () => {
    if (!originalUrl) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalUrl,
          mimeType: originalUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze image.');
      }

      setAnalysis(data.analysis);
      // Automatically apply recommended mode and scale
      if (data.analysis.recommendedMode) {
        setSettings((prev) => ({
          ...prev,
          mode: data.analysis.recommendedMode,
          scale: data.analysis.recommendedScale || prev.scale,
        }));
      }
    } catch (err: any) {
      setErrorMessage('Analysis diagnostic error: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Download high-resolution image
  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!enhancedUrl) return;
    const link = document.createElement('a');
    link.href = enhancedUrl;
    link.download = `neuralpixel-enhanced-${settings.mode}-${settings.scale}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    if (!enhancedUrl) return;
    try {
      const res = await fetch(enhancedUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  // Reset workspace
  const handleReset = () => {
    loadAndProcessInitialSample(SAMPLE_IMAGES[0]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        hasApiKey={hasApiKey}
        onReset={handleReset}
        onOpenHelp={() => setIsHelpOpen(true)}
        isProcessing={isProcessing}
        engineUsed={engineUsed}
      />

      {/* Error alert toast */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full mt-3">
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg text-rose-400 hover:text-white hover:bg-rose-900 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-5 space-y-5">
        {/* Top Section: Comparison Viewer + Controls Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left/Center: Interactive Visual Comparison */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <ImageComparison
              originalUrl={originalUrl}
              enhancedUrl={enhancedUrl}
              differenceMapUrl={differenceMapUrl}
              originalMetrics={originalMetrics}
              enhancedMetrics={enhancedMetrics}
              isProcessing={isProcessing}
              scaleFactor={settings.scale}
              mode={settings.mode}
            />

            {/* Neural Vision Diagnostic Card */}
            <DiagnosticCard
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onRunAnalysis={handleRunAnalysis}
              hasApiKey={hasApiKey}
            />

            {/* Histogram graph */}
            <Histogram
              originalCanvasRef={originalCanvasRef.current}
              enhancedCanvasRef={enhancedCanvasRef.current}
            />
          </div>

          {/* Right: Controls Panel */}
          <div className="lg:col-span-4 sticky top-16">
            <ControlsPanel
              settings={settings}
              onUpdateSettings={(newSettings) =>
                setSettings((prev) => ({ ...prev, ...newSettings }))
              }
              onEnhanceWithGemini={handleEnhanceWithGemini}
              onEnhanceClientFast={handleEnhanceClientFast}
              onDownload={handleDownload}
              onCopyClipboard={handleCopyClipboard}
              isProcessing={isProcessing}
              hasEnhancedImage={Boolean(enhancedUrl)}
              hasApiKey={hasApiKey}
            />
          </div>
        </div>

        {/* Bottom: Curated Low-Res Benchmark Samples & Upload Dropzone */}
        <SampleGallery
          onSelectSample={handleSelectSample}
          onUploadFile={handleUploadFile}
          activeSampleId={activeSampleId}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-4 text-center text-xs text-zinc-500">
        <p>
          NeuralPixel AI • Generative Neural Super-Resolution & Real-ESRGAN / GFPGAN style photo enhancement
        </p>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
