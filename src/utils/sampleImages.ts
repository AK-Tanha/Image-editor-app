import { SampleImage } from '../types';

/**
 * Procedurally generates high-fidelity low-res images simulating authentic compression,
 * downsampling, lens blur, and noise patterns so users have instant rich samples.
 */
function createSyntheticSample(type: 'portrait' | 'kitten' | 'cyberpunk' | 'anime' | 'vintage'): string {
  const canvas = document.createElement('canvas');
  // High detail buffer first
  const width = 360;
  const height = 360;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (type === 'portrait') {
    // Warm photographic gradient backdrop
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#2d1b24');
    bg.addColorStop(0.5, '#4a2c3a');
    bg.addColorStop(1, '#1b1319');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Shoulders & neck
    ctx.fillStyle = '#c58f78';
    ctx.beginPath();
    ctx.ellipse(180, 340, 95, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head oval
    ctx.fillStyle = '#dfab94';
    ctx.beginPath();
    ctx.ellipse(180, 190, 75, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft face shading
    const faceShadow = ctx.createRadialGradient(160, 175, 20, 180, 190, 85);
    faceShadow.addColorStop(0, 'rgba(255,230,215,0.4)');
    faceShadow.addColorStop(0.8, 'rgba(180,120,95,0.3)');
    faceShadow.addColorStop(1, 'rgba(120,70,50,0.6)');
    ctx.fillStyle = faceShadow;
    ctx.beginPath();
    ctx.ellipse(180, 190, 75, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#221410';
    ctx.beginPath();
    ctx.arc(180, 150, 82, Math.PI, Math.PI * 2);
    ctx.bezierCurveTo(270, 190, 260, 270, 240, 290);
    ctx.bezierCurveTo(210, 210, 200, 180, 180, 180);
    ctx.bezierCurveTo(160, 180, 150, 210, 120, 290);
    ctx.bezierCurveTo(100, 270, 90, 190, 98, 150);
    ctx.fill();

    // Eyes (Low-res blurry pupils)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(155, 185, 14, 8, -0.05, 0, Math.PI * 2);
    ctx.ellipse(205, 185, 14, 8, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Irises
    ctx.fillStyle = '#3a6b5c';
    ctx.beginPath();
    ctx.arc(155, 185, 6, 0, Math.PI * 2);
    ctx.arc(205, 185, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#331b14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(140, 173);
    ctx.quadraticCurveTo(155, 168, 170, 172);
    ctx.moveTo(190, 172);
    ctx.quadraticCurveTo(205, 168, 220, 173);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#9e624b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(180, 185);
    ctx.lineTo(177, 212);
    ctx.lineTo(183, 214);
    ctx.stroke();

    // Lips
    ctx.fillStyle = '#b74c58';
    ctx.beginPath();
    ctx.ellipse(180, 235, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'kitten') {
    // Cozy blurred background
    const bg = ctx.createRadialGradient(180, 180, 40, 180, 180, 200);
    bg.addColorStop(0, '#534439');
    bg.addColorStop(1, '#231b15');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Fluffy cat body
    ctx.fillStyle = '#c79d77';
    ctx.beginPath();
    ctx.ellipse(180, 260, 95, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cat head
    ctx.beginPath();
    ctx.ellipse(180, 175, 70, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cat ears
    ctx.fillStyle = '#9b714f';
    ctx.beginPath();
    ctx.moveTo(125, 140);
    ctx.lineTo(105, 85);
    ctx.lineTo(150, 120);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(235, 140);
    ctx.lineTo(255, 85);
    ctx.lineTo(210, 120);
    ctx.fill();

    // Inner pink ears
    ctx.fillStyle = '#d6878b';
    ctx.beginPath();
    ctx.moveTo(127, 135);
    ctx.lineTo(112, 95);
    ctx.lineTo(145, 122);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(233, 135);
    ctx.lineTo(248, 95);
    ctx.lineTo(215, 122);
    ctx.fill();

    // Large glowing cat eyes
    ctx.fillStyle = '#d4e157';
    ctx.beginPath();
    ctx.arc(150, 168, 15, 0, Math.PI * 2);
    ctx.arc(210, 168, 15, 0, Math.PI * 2);
    ctx.fill();

    // Vertical slit pupils
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.ellipse(150, 168, 4, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(210, 168, 4, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pink nose
    ctx.fillStyle = '#e57373';
    ctx.beginPath();
    ctx.moveTo(180, 192);
    ctx.lineTo(173, 185);
    ctx.lineTo(187, 185);
    ctx.fill();

  } else if (type === 'cyberpunk') {
    // Dark moody neon street
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#090817');
    bg.addColorStop(0.6, '#13112d');
    bg.addColorStop(1, '#05030a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Skyscrapers silhouettes
    ctx.fillStyle = '#1c1735';
    ctx.fillRect(30, 80, 70, 280);
    ctx.fillRect(110, 40, 90, 320);
    ctx.fillRect(210, 95, 65, 265);
    ctx.fillRect(285, 60, 60, 300);

    // Neon signs & glowing window strips
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.fillRect(45, 110, 40, 6);
    ctx.fillRect(45, 130, 40, 6);
    ctx.fillRect(130, 70, 50, 12);
    ctx.fillRect(130, 100, 50, 12);

    ctx.fillStyle = '#ff0077';
    ctx.shadowColor = '#ff0077';
    ctx.fillRect(230, 120, 25, 60);
    ctx.fillRect(300, 90, 30, 8);
    ctx.fillRect(300, 110, 30, 8);

    ctx.shadowBlur = 0;
    // Wet pavement reflection
    const roadGrad = ctx.createLinearGradient(0, 270, 0, 360);
    roadGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    roadGrad.addColorStop(0.5, 'rgba(255, 0, 119, 0.35)');
    roadGrad.addColorStop(1, 'rgba(10, 5, 20, 0.9)');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, 270, width, 90);

  } else if (type === 'anime') {
    // Pastel sky background
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#a1c4fd');
    bg.addColorStop(1, '#c2e9fb');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Anime girl hair (Back)
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.ellipse(180, 200, 95, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Skin
    ctx.fillStyle = '#fff0e5';
    ctx.beginPath();
    ctx.ellipse(180, 195, 65, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Big Anime Eyes
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.ellipse(150, 190, 18, 22, -0.05, 0, Math.PI * 2);
    ctx.ellipse(210, 190, 18, 22, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(145, 180, 6, 0, Math.PI * 2);
    ctx.arc(205, 180, 6, 0, Math.PI * 2);
    ctx.arc(155, 198, 3, 0, Math.PI * 2);
    ctx.arc(215, 198, 3, 0, Math.PI * 2);
    ctx.fill();

    // Anime Hair bangs
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(100, 160);
    ctx.quadraticCurveTo(140, 210, 155, 170);
    ctx.quadraticCurveTo(180, 225, 195, 170);
    ctx.quadraticCurveTo(220, 210, 260, 160);
    ctx.lineTo(250, 110);
    ctx.lineTo(110, 110);
    ctx.fill();

  } else if (type === 'vintage') {
    // Sepia aged paper
    const bg = ctx.createRadialGradient(180, 180, 20, 180, 180, 200);
    bg.addColorStop(0, '#d8bc98');
    bg.addColorStop(0.7, '#a58661');
    bg.addColorStop(1, '#4e3926');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 1940s vintage building silhouette
    ctx.fillStyle = '#3a2b1d';
    ctx.fillRect(80, 120, 200, 170);
    ctx.fillStyle = '#654c34';
    ctx.beginPath();
    ctx.moveTo(60, 120);
    ctx.lineTo(180, 60);
    ctx.lineTo(300, 120);
    ctx.fill();

    // Arched windows
    ctx.fillStyle = '#221911';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(120 + i * 60, 170, 15, Math.PI, 0);
      ctx.rect(105 + i * 60, 170, 30, 40);
      ctx.fill();
    }
  }

  // --- Degrade into authentic low-resolution with pixelation, blur, and JPEG compression noise ---
  // Downscale heavily to 120x120
  const lowCanvas = document.createElement('canvas');
  const lowRes = 110;
  lowCanvas.width = lowRes;
  lowCanvas.height = lowRes;
  const lowCtx = lowCanvas.getContext('2d')!;
  lowCtx.imageSmoothingQuality = 'low';
  lowCtx.drawImage(canvas, 0, 0, lowRes, lowRes);

  // Add sensor noise & compression blockiness to pixel buffer
  const imgData = lowCtx.getImageData(0, 0, lowRes, lowRes);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Random noise grain
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  lowCtx.putImageData(imgData, 0, 0);

  // Return as low-resolution JPEG with 35% quality to simulate heavy DCT compression
  return lowCanvas.toDataURL('image/jpeg', 0.35);
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-portrait',
    name: 'Blurry Studio Portrait',
    tag: 'Face & Hair',
    description: 'Soft out-of-focus portrait with low pixel density and indistinct eye reflections.',
    presetMode: 'face',
    presetScale: '4x',
    dataUrl: createSyntheticSample('portrait'),
    thumbnail: createSyntheticSample('portrait'),
  },
  {
    id: 'sample-kitten',
    name: 'Low-Res Fluffy Kitten',
    tag: 'Fur & Whiskers',
    description: 'Cute kitten photo ruined by heavy JPEG compression blur and fuzzy fur details.',
    presetMode: 'auto',
    presetScale: '4x',
    dataUrl: createSyntheticSample('kitten'),
    thumbnail: createSyntheticSample('kitten'),
  },
  {
    id: 'sample-cyberpunk',
    name: 'Pixelated Neon City',
    tag: 'Architecture',
    description: 'Distant cityscape with pixelated building edges and noisy light reflections.',
    presetMode: 'landscape',
    presetScale: '4x',
    dataUrl: createSyntheticSample('cyberpunk'),
    thumbnail: createSyntheticSample('cyberpunk'),
  },
  {
    id: 'sample-anime',
    name: 'Compressed Anime Art',
    tag: 'Illustration',
    description: 'Anime character with compression ringing artifacts and jaggy lineart.',
    presetMode: 'anime',
    presetScale: '4x',
    dataUrl: createSyntheticSample('anime'),
    thumbnail: createSyntheticSample('anime'),
  },
  {
    id: 'sample-vintage',
    name: '1940s Historic Photo',
    tag: 'Vintage Restoration',
    description: 'Faded historical landmark with physical grain, sepia discoloration, and scratches.',
    presetMode: 'vintage',
    presetScale: '4x',
    dataUrl: createSyntheticSample('vintage'),
    thumbnail: createSyntheticSample('vintage'),
  },
];
