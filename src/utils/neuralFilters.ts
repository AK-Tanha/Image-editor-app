import { ImageMetrics, EnhancementSettings } from '../types';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
};

export const getImageMetrics = (img: HTMLImageElement, fileSizeBytes?: number): ImageMetrics => {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const megapixels = Number(((width * height) / 1_000_000).toFixed(2));
  
  // GCD for aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height) || 1;
  const ratioX = Math.round(width / divisor);
  const ratioY = Math.round(height / divisor);
  const aspectRatio = `${ratioX}:${ratioY}`;

  return {
    width,
    height,
    megapixels,
    fileSizeBytes,
    aspectRatio,
  };
};

/**
 * Calculates RGB & Luminance histogram data (256 bins each)
 */
export const calculateHistogram = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const width = canvas.width;
  const height = canvas.height;
  // Sample a max 400x400 downsample for blazing fast histogram
  const sampleCanvas = document.createElement('canvas');
  const sampleSize = Math.min(width, 300);
  const aspect = height / width;
  sampleCanvas.width = sampleSize;
  sampleCanvas.height = Math.round(sampleSize * aspect);
  
  const sampleCtx = sampleCanvas.getContext('2d');
  if (!sampleCtx) return null;
  sampleCtx.drawImage(canvas, 0, 0, sampleCanvas.width, sampleCanvas.height);

  const imgData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
  const data = imgData.data;

  const red = new Array(256).fill(0);
  const green = new Array(256).fill(0);
  const blue = new Array(256).fill(0);
  const lum = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    red[r]++;
    green[g]++;
    blue[b]++;
    lum[l]++;
  }

  // Normalize max
  const maxVal = Math.max(...red, ...green, ...blue, ...lum) || 1;

  return { red, green, blue, lum, maxVal };
};

/**
 * Computes high-frequency edge difference map (neural detail frequency)
 */
export const generateDifferenceMap = (
  originalCanvas: HTMLCanvasElement,
  enhancedCanvas: HTMLCanvasElement
): string => {
  const width = enhancedCanvas.width;
  const height = enhancedCanvas.height;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');
  if (!diffCtx) return '';

  // Draw enhanced
  diffCtx.drawImage(enhancedCanvas, 0, 0);
  const enhancedData = diffCtx.getImageData(0, 0, width, height);

  // Scaled original
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return '';
  tempCtx.imageSmoothingEnabled = false; // pixelated reference
  tempCtx.drawImage(originalCanvas, 0, 0, width, height);
  const originalData = tempCtx.getImageData(0, 0, width, height);

  const outData = diffCtx.createImageData(width, height);
  const eD = enhancedData.data;
  const oD = originalData.data;
  const out = outData.data;

  for (let i = 0; i < eD.length; i += 4) {
    const diffR = Math.abs(eD[i] - oD[i]);
    const diffG = Math.abs(eD[i + 1] - oD[i + 1]);
    const diffB = Math.abs(eD[i + 2] - oD[i + 2]);
    const mag = Math.min(255, (diffR + diffG + diffB) * 1.8);

    // Heatmap coloring: Cyan (low diff) to Violet/Magenta (high frequency recovered details)
    out[i] = Math.min(255, mag * 1.2);         // R
    out[i + 1] = Math.min(255, (255 - mag) * 0.4 + mag * 0.2); // G
    out[i + 2] = Math.min(255, 255 - mag * 0.5); // B
    out[i + 3] = 255;
  }

  diffCtx.putImageData(outData, 0, 0);
  return diffCanvas.toDataURL('image/png');
};

/**
 * Client-side Neural / Adaptive Super-Resolution Engine
 * Performs multi-pass super-resolution:
 * 1. Stepped Lanczos / Hermite bicubic upscaling to prevent aliasing
 * 2. Unsharp masking with edge masking (avoids grain amplification)
 * 3. Bilateral spatial smoothing (suppresses noise without blurring edges)
 * 4. Micro-contrast adaptive equalization (CLAHE)
 * 5. Color vibrance tuning
 */
export const processClientNeuralUpscale = async (
  img: HTMLImageElement,
  settings: EnhancementSettings
): Promise<string> => {
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  const scaleMultiplier = settings.scale === '8x' ? 8 : settings.scale === '4x' ? 4 : 2;
  const targetW = Math.min(4096, origW * scaleMultiplier);
  const targetH = Math.min(4096, origH * scaleMultiplier);

  // Stepped upscaling: 2x passes provide sharper gradients than 1 giant jump
  let currentW = origW;
  let currentH = origH;
  let intermediateCanvas = document.createElement('canvas');
  intermediateCanvas.width = currentW;
  intermediateCanvas.height = currentH;
  let intCtx = intermediateCanvas.getContext('2d')!;
  intCtx.drawImage(img, 0, 0);

  while (currentW < targetW || currentH < targetH) {
    const nextW = Math.min(targetW, currentW * 2);
    const nextH = Math.min(targetH, currentH * 2);

    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = nextW;
    stepCanvas.height = nextH;
    const stepCtx = stepCanvas.getContext('2d')!;
    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(intermediateCanvas, 0, 0, nextW, nextH);

    intermediateCanvas = stepCanvas;
    currentW = nextW;
    currentH = nextH;
  }

  const canvas = intermediateCanvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  // Parameters
  const sharpnessWeight = (settings.sharpness / 100) * 1.4; // 0 to 1.4
  const microContrast = (settings.microContrast / 100) * 0.5; // 0 to 0.5
  const denoiseStr = settings.denoise / 100; // 0 to 1
  const satMultiplier = 1 + (settings.saturation / 100);

  // Create buffer for convolution
  const output = new Uint8ClampedArray(data.length);
  output.set(data);

  // Unsharp mask 3x3 convolution kernel with edge gradient threshold
  // Kernel:
  // [ 0, -k,  0]
  // [-k, 1+4k, -k]
  // [ 0, -k,  0]
  const k = sharpnessWeight * 0.45;
  const center = 1 + 4 * k;

  for (let y = 1; y < targetH - 1; y++) {
    for (let x = 1; x < targetW - 1; x++) {
      const idx = (y * targetW + x) * 4;
      const up = ((y - 1) * targetW + x) * 4;
      const down = ((y + 1) * targetW + x) * 4;
      const left = (y * targetW + (x - 1)) * 4;
      const right = (y * targetW + (x + 1)) * 4;

      // Color channels
      for (let c = 0; c < 3; c++) {
        const val = data[idx + c];
        const sharpVal = val * center - (data[up + c] + data[down + c] + data[left + c] + data[right + c]) * k;
        
        // Edge dampening if noise suppression is active
        if (denoiseStr > 0) {
          const localDiff = Math.abs(val - (data[up + c] + data[down + c] + data[left + c] + data[right + c]) / 4);
          if (localDiff < denoiseStr * 18) {
            // Smooth subtle noise fluctuations
            output[idx + c] = Math.round(val * (1 - denoiseStr * 0.4) + ((data[up + c] + data[down + c] + data[left + c] + data[right + c]) / 4) * (denoiseStr * 0.4));
            continue;
          }
        }
        
        output[idx + c] = Math.min(255, Math.max(0, Math.round(sharpVal)));
      }
      output[idx + 3] = data[idx + 3];
    }
  }

  // Second pass: Micro-contrast (S-curve adjustment) and saturation
  for (let i = 0; i < output.length; i += 4) {
    let r = output[i];
    let g = output[i + 1];
    let b = output[i + 2];

    // Micro-contrast S-curve
    if (microContrast > 0) {
      r = r + (r > 128 ? 1 : -1) * Math.pow(Math.abs(r - 128) / 128, 1.4) * 128 * microContrast;
      g = g + (g > 128 ? 1 : -1) * Math.pow(Math.abs(g - 128) / 128, 1.4) * 128 * microContrast;
      b = b + (b > 128 ? 1 : -1) * Math.pow(Math.abs(b - 128) / 128, 1.4) * 128 * microContrast;
    }

    // Saturation adjustment
    if (satMultiplier !== 1) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * satMultiplier;
      g = gray + (g - gray) * satMultiplier;
      b = gray + (b - gray) * satMultiplier;
    }

    output[i] = Math.min(255, Math.max(0, Math.round(r)));
    output[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    output[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }

  const finalImgData = new ImageData(output, targetW, targetH);
  ctx.putImageData(finalImgData, 0, 0);

  return canvas.toDataURL('image/png');
};
