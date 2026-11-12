import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 50MB limit for high-resolution images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared GoogleGenAI client with required 'aistudio-build' User-Agent header
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Check API status endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    modelSupported: ['gemini-3.1-flash-lite-image', 'gemini-nano-banana-2.1', 'gemini-3.8-flash'],
  });
});

// Diagnostic analysis endpoint using gemini-3.8-flash
app.post('/api/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const ai = getAIClient();
    if (!ai) {
      return res.status(400).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Analyze this image as a deep learning computer vision neural enhancement expert.
Examine degradation, resolution loss, pixelation, blurriness, JPEG block artifacts, sensor noise, dynamic range, and subject details.
Provide a structured diagnostic assessment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSubject: {
              type: Type.STRING,
              description: 'e.g. Portrait / Face, Landscape, Anime / Illustration, Architecture, Vintage Photo, Pet / Wildlife, or General Object',
            },
            qualityScore: {
              type: Type.INTEGER,
              description: 'Overall input quality score from 1 to 100 (where 100 is pristine 4K and 20 is heavily degraded)',
            },
            blurLevel: {
              type: Type.STRING,
              description: 'One of: "None", "Mild", "Moderate", "Severe"',
            },
            compressionArtifacts: {
              type: Type.STRING,
              description: 'One of: "None", "Low", "Medium", "High"',
            },
            noiseLevel: {
              type: Type.STRING,
              description: 'One of: "Clean", "Light Grain", "Noticeable Noise", "Severe Noise"',
            },
            faceDetected: {
              type: Type.BOOLEAN,
              description: 'Whether human faces requiring facial landmark restoration are present',
            },
            recommendedMode: {
              type: Type.STRING,
              description: 'Best enhancement preset: "face", "anime", "landscape", "vintage", or "auto"',
            },
            recommendedScale: {
              type: Type.STRING,
              description: 'Recommended upscale factor: "2x", "4x", or "8x"',
            },
            neuralDiagnosisSummary: {
              type: Type.STRING,
              description: '2-3 sentences explaining the degradation issues detected and what the neural network will reconstruct (textures, edges, eyes, etc.)',
            },
            keyFeaturesToRestore: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 key visual elements that will benefit most from super-resolution (e.g. "Eyelash & iris clarity", "Brick mortar micro-contrast")',
            },
          },
          required: [
            'detectedSubject',
            'qualityScore',
            'blurLevel',
            'compressionArtifacts',
            'noiseLevel',
            'faceDetected',
            'recommendedMode',
            'recommendedScale',
            'neuralDiagnosisSummary',
            'keyFeaturesToRestore',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze image.',
      code: error.status || 500,
    });
  }
});

// Image Neural Enhancement endpoint using gemini-3.1-flash-lite-image or gemini-nano-banana-2.1
app.post('/api/enhance', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      mode = 'auto',
      scale = '4x',
      modelChoice = 'gemini-3.1-flash-lite-image',
      customInstruction = '',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const ai = getAIClient();
    if (!ai) {
      return res.status(400).json({
        error: 'Gemini API key is not configured in environment.',
        noApiKey: true,
      });
    }

    // Specific neural prompt per mode to guide high-fidelity reconstruction
    let modeGuidance = '';
    switch (mode) {
      case 'face':
        modeGuidance = `PORTRAIT & FACE RESTORATION MODE:
Prioritize deep facial landmark restoration. Reconstruct sharp, lifelike eyes with realistic reflections, clear pupil boundaries, natural eyelash details, crisp eyebrows, detailed skin pores without plastic smoothing, fine hair strands, and well-defined lips. Retain original identity, likeness, expressions, and lighting accurately.`;
        break;
      case 'anime':
        modeGuidance = `ANIME & DIGITAL ART CLARIFIER MODE:
Reconstruct clean, anti-aliased vector-crisp lineart. Eliminate all JPEG ringing and mosquito artifacts around lines. Smooth out flat cel shading while preserving vibrant color saturation and gradient nuances. Make outlines razor-sharp and colors pure and clear.`;
        break;
      case 'landscape':
        modeGuidance = `SCENERY & ARCHITECTURE SUPER-RESOLUTION MODE:
Reconstruct microscopic high-frequency details: leaves on foliage, grass blades, architectural masonry, stone textures, glass reflections, water ripples, cloud edges, and distant horizons. Eliminate atmospheric haze blur and boost micro-contrast while maintaining natural daylight ambiance.`;
        break;
      case 'vintage':
        modeGuidance = `VINTAGE & OLD PHOTO RESTORATION MODE:
Repair physical degradation: remove cracks, surface scratches, speckles, and dust spots. Neutralize faded yellowing or discoloration while preserving authentic period tones. Reconstruct lost facial and structural definitions, reduce excessive film grain into smooth organic texture, and restore deep dynamic range.`;
        break;
      case 'auto':
      default:
        modeGuidance = `UNIVERSAL SUPER-RESOLUTION MODE:
Upscale this photo to ${scale} resolution with ultra-high fidelity. Synthesize realistic fine micro-textures (fabrics, surfaces, skin, hair, foliage, materials). Eliminate pixelation, blur, compression blocks, and noise. Sharpen all blurry edges into clean, crisp boundaries. Retain faithful color palette, lighting, composition, and subjects.`;
        break;
    }

    const prompt = `Act as an advanced generative neural network super-resolution and photograph restoration system (similar to Real-ESRGAN and diffusion latent upscalers).
Your goal is to transform this low-resolution, blurry, or compressed photo into a high-quality, razor-sharp, ultra-high-definition masterpiece.

${modeGuidance}

${customInstruction ? `User specific tuning: ${customInstruction}` : ''}

CRITICAL RULES:
1. Maintain strict fidelity to the original subject, identity, composition, framing, and colors. Do not hallucinate unrelated objects or alter who or what is in the scene.
2. The output MUST be a complete, crystal-clear, high-resolution photographic image.
3. Eliminate all pixelation steps, block compression artifacts, and optical blur.`;

    const selectedModel = modelChoice === 'gemini-nano-banana-2.1' 
      ? 'gemini-nano-banana-2.1' 
      : 'gemini-3.1-flash-lite-image';

    const generateConfig: any = {};
    if (selectedModel === 'gemini-nano-banana-2.1') {
      generateConfig.imageConfig = {
        imageSize: scale === '8x' ? '4K' : scale === '4x' ? '2K' : '1K',
        aspectRatio: '1:1', // Will follow original shape closely
      };
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: generateConfig,
    });

    // Find the image part in the candidates response
    let enhancedDataUrl: string | null = null;
    let textFeedback: string = '';

    for (const candidate of response.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          enhancedDataUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textFeedback += part.text + ' ';
        }
      }
      if (enhancedDataUrl) break;
    }

    if (!enhancedDataUrl) {
      return res.status(422).json({
        error: 'The neural model did not return an enhanced image part.',
        details: textFeedback,
      });
    }

    res.json({
      success: true,
      enhancedImage: enhancedDataUrl,
      meta: {
        model: selectedModel,
        mode,
        scale,
        feedback: textFeedback.trim(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Enhancement error:', error);
    res.status(500).json({
      error: error.message || 'Image enhancement failed.',
      status: error.status || 500,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuralPixel AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
