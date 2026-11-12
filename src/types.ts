export type EnhancementMode = 'auto' | 'face' | 'anime' | 'landscape' | 'vintage';

export type UpscaleFactor = '2x' | '4x' | '8x';

export type ModelOption = 'gemini-3.1-flash-lite-image' | 'gemini-nano-banana-2.1';

export interface ImageAnalysis {
  detectedSubject: string;
  qualityScore: number;
  blurLevel: 'None' | 'Mild' | 'Moderate' | 'Severe';
  compressionArtifacts: 'None' | 'Low' | 'Medium' | 'High';
  noiseLevel: 'Clean' | 'Light Grain' | 'Noticeable Noise' | 'Severe Noise';
  faceDetected: boolean;
  recommendedMode: EnhancementMode;
  recommendedScale: UpscaleFactor;
  neuralDiagnosisSummary: string;
  keyFeaturesToRestore: string[];
}

export interface EnhancementSettings {
  mode: EnhancementMode;
  scale: UpscaleFactor;
  model: ModelOption;
  denoise: number;       // 0 to 100
  sharpness: number;     // 0 to 100
  microContrast: number; // 0 to 100
  saturation: number;    // -50 to +50
  faceClarity: number;   // 0 to 100
  customPrompt: string;
}

export interface ImageMetrics {
  width: number;
  height: number;
  megapixels: number;
  fileSizeBytes?: number;
  aspectRatio: string;
}

export interface EnhancementResult {
  originalUrl: string;
  enhancedUrl: string;
  originalMetrics: ImageMetrics;
  enhancedMetrics: ImageMetrics;
  mode: EnhancementMode;
  scale: UpscaleFactor;
  modelUsed?: string;
  timestamp: string;
  durationMs: number;
  engine: 'gemini' | 'client-neural';
}

export interface SampleImage {
  id: string;
  name: string;
  tag: string;
  description: string;
  presetMode: EnhancementMode;
  presetScale: UpscaleFactor;
  dataUrl: string;
  thumbnail: string;
}

export type ViewMode = 'split' | 'side-by-side' | 'loupe' | 'difference';
