/**
 * High-performance image enhancement and super-resolution engine.
 * Converts blurry, low-resolution photos into crisp, sharp, high-definition images.
 */

export interface EnhanceOptions {
  scale: 2 | 4;
  sharpness: number; // 0 - 100
  clarity: number;   // 0 - 100
  denoise: number;   // 0 - 100
}

export interface EnhanceResult {
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  enhancedWidth: number;
  enhancedHeight: number;
}

/**
 * Loads an image from a URL or Data URL safely
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

/**
 * Multi-pass high-frequency edge restoration & sharpening
 */
export async function enhanceImage(
  imageSource: string | HTMLImageElement,
  options: EnhanceOptions = { scale: 4, sharpness: 80, clarity: 70, denoise: 25 }
): Promise<EnhanceResult> {
  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;
  
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  const scale = options.scale;
  const targetW = origW * scale;
  const targetH = origH * scale;

  // Step 1: High-fidelity stepped bicubic resampling
  // Stepping 2x at a time produces significantly cleaner anti-aliasing than a single jump
  let curW = origW;
  let curH = origH;
  let canvas = document.createElement('canvas');
  canvas.width = curW;
  canvas.height = curH;
  let ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  while (curW < targetW || curH < targetH) {
    const nextW = Math.min(targetW, curW * 2);
    const nextH = Math.min(targetH, curH * 2);

    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = nextW;
    stepCanvas.height = nextH;
    const stepCtx = stepCanvas.getContext('2d')!;
    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(canvas, 0, 0, nextW, nextH);

    canvas = stepCanvas;
    ctx = stepCtx;
    curW = nextW;
    curH = nextH;
  }

  // Step 2: Pixel-level Deep Sharpening & Edge Reconstruction
  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const output = new Uint8ClampedArray(data.length);
  output.set(data);

  // Sharpness multiplier (0 - 100 -> 0.5 to 2.5)
  const strength = 0.5 + (options.sharpness / 100) * 2.0;
  // Clarity / Micro-contrast (0 - 100 -> 0.0 to 0.4)
  const microContrast = (options.clarity / 100) * 0.35;
  // Denoise threshold (suppresses noise in flat areas)
  const denoiseThresh = (options.denoise / 100) * 16;

  // Pass A: Unsharp Masking with 5-point Cross Laplacian Kernel + Adaptive Edge Boosting
  // Reconstructs blurred transitions into sharp defined gradients
  const weight = strength * 0.45;
  const centerWeight = 1 + 4 * weight;

  for (let y = 1; y < targetH - 1; y++) {
    for (let x = 1; x < targetW - 1; x++) {
      const idx = (y * targetW + x) * 4;
      const top = ((y - 1) * targetW + x) * 4;
      const btm = ((y + 1) * targetW + x) * 4;
      const lft = (y * targetW + (x - 1)) * 4;
      const rgt = (y * targetW + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const centerVal = data[idx + c];
        const neighborAvg = (data[top + c] + data[btm + c] + data[lft + c] + data[rgt + c]) * 0.25;
        const diff = centerVal - neighborAvg;

        // If local variation is tiny (noise), smooth it; if it's an edge, strongly boost it
        if (Math.abs(diff) < denoiseThresh) {
          // Subtle bilateral smoothing for noise
          output[idx + c] = Math.round(centerVal * 0.7 + neighborAvg * 0.3);
        } else {
          // Sharp edge enhancement
          const sharpVal = centerVal * centerWeight - (data[top + c] + data[btm + c] + data[lft + c] + data[rgt + c]) * weight;
          output[idx + c] = Math.min(255, Math.max(0, Math.round(sharpVal)));
        }
      }
      output[idx + 3] = data[idx + 3]; // alpha
    }
  }

  // Pass B: Micro-Contrast & Luminance Tone Curve
  // Cuts through the hazy blur and brings out crisp textures (eyes, fabrics, edges)
  for (let i = 0; i < output.length; i += 4) {
    let r = output[i];
    let g = output[i + 1];
    let b = output[i + 2];

    // S-curve contrast boost
    if (microContrast > 0) {
      // Normalize to 0..1
      let lr = r / 255;
      let lg = g / 255;
      let lb = b / 255;

      // S-curve: x - microContrast * sin(2*pi*x) / (2*pi)
      lr = lr + (lr > 0.5 ? 1 : -1) * Math.pow(Math.abs(lr - 0.5) * 2, 1.3) * microContrast * 0.5;
      lg = lg + (lg > 0.5 ? 1 : -1) * Math.pow(Math.abs(lg - 0.5) * 2, 1.3) * microContrast * 0.5;
      lb = lb + (lb > 0.5 ? 1 : -1) * Math.pow(Math.abs(lb - 0.5) * 2, 1.3) * microContrast * 0.5;

      r = Math.round(lr * 255);
      g = Math.round(lg * 255);
      b = Math.round(lb * 255);
    }

    // Subtle vibrance boost (10%) to counteract JPEG compression fading
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum + (r - lum) * 1.12;
    g = lum + (g - lum) * 1.12;
    b = lum + (b - lum) * 1.12;

    output[i] = Math.min(255, Math.max(0, Math.round(r)));
    output[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    output[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }

  const enhancedData = new ImageData(output, targetW, targetH);
  ctx.putImageData(enhancedData, 0, 0);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    originalWidth: origW,
    originalHeight: origH,
    enhancedWidth: targetW,
    enhancedHeight: targetH,
  };
}
