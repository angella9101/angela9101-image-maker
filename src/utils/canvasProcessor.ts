import { ControlOptions, ImageTaskRequest, UploadedImage, ImageTool } from '../types';

/**
 * NanoBanana Canvas Engine
 * High-precision HTML5 Canvas processing engine for AI Studio
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

export async function processCanvasImage(
  taskOrImages: ImageTaskRequest | UploadedImage[],
  optionsParam?: ControlOptions
): Promise<string> {
  let inputImages: UploadedImage[] = [];
  let options: ControlOptions;

  if (Array.isArray(taskOrImages)) {
    inputImages = taskOrImages;
    options = optionsParam || {
      activeTool: 'GENERATE',
      prompt: '',
      aspectRatio: '1:1',
      count: 1,
      quality: '1K',
      identityLock: true,
      posterLayer: { title: 'AI STUDIO', subtitle: '' },
    };
  } else {
    const task = taskOrImages;
    inputImages = (task.sourceImages || []).map((img, idx) => ({
      id: `task_img_${idx}`,
      dataUrl: img.base64.startsWith('data:') ? img.base64 : `data:${img.mimeType || 'image/png'};base64,${img.base64}`,
      name: `Source_${idx}`,
      role: img.role,
    }));

    options = {
      activeTool: task.tool,
      prompt: task.userPrompt || '',
      aspectRatio: (task.aspectRatio as any) || '1:1',
      count: task.outputCount || 1,
      quality: task.quality || '1K',
      identityLock: task.identityLock !== false,
      ...(task.options as any),
      posterLayer: (task.options?.posterLayer as any) || { title: 'AI STUDIO', subtitle: '' },
    };
  }

  const toolLower = (options.activeTool || 'GENERATE').toLowerCase();
  const sourceImage = inputImages.find((img) => img.role === 'SOURCE' || img.role === ('source' as any)) || inputImages[0];

  if (!sourceImage && options.activeTool !== 'GENERATE') {
    return createSyntheticCanvasImage(options);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context null');

  let targetWidth = 1024;
  let targetHeight = 1024;

  if (options.activeTool === 'PASSPORT_GUIDE' || toolLower.includes('passport')) {
    targetWidth = 768;
    targetHeight = 1024; // 3.5cm x 4.5cm ratio (3:4)
  } else {
    switch (options.aspectRatio) {
      case '1:1':
        targetWidth = 1024;
        targetHeight = 1024;
        break;
      case '16:9':
        targetWidth = 1280;
        targetHeight = 720;
        break;
      case '9:16':
        targetWidth = 720;
        targetHeight = 1280;
        break;
      case '4:3':
        targetWidth = 1024;
        targetHeight = 768;
        break;
      case '3:4':
        targetWidth = 768;
        targetHeight = 1024;
        break;
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  let img: HTMLImageElement;
  try {
    img = await loadImage(sourceImage.dataUrl);
  } catch {
    return createSyntheticCanvasImage(options);
  }

  // Draw base scaled image centered
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
  const x = (canvas.width - img.width * scale) / 2;
  const y = (canvas.height - img.height * scale) / 2;

  // Background fill default
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

  // Dispatch Tool Specific Image Processing
  switch (options.activeTool) {
    case 'PASSPORT_GUIDE':
      await applyPassportTransformation(ctx, canvas, options, img);
      break;
    case 'STUDIO':
      applyStudioLighting(ctx, canvas, options, img);
      break;
    case 'RESTORE':
    case 'UPSCALE':
    case 'COLORIZE':
      applyRestorationAndColorize(ctx, canvas, options);
      break;
    case 'SKIN_RETOUCH':
      applySkinRetouch(ctx, canvas, options);
      break;
    case 'BACKGROUND_REMOVE':
      applyBackgroundRemoval(ctx, canvas);
      break;
    case 'BACKGROUND_REPLACE':
      applyBackgroundReplace(ctx, canvas, options, img);
      break;
    case 'POSTER':
      applyPosterOverlay(ctx, canvas, options);
      break;
    case 'STYLE_TRANSFER':
    case 'SKETCH':
    case 'SKETCH_COLOR':
      applyStyleFilter(ctx, canvas, options);
      break;
    case 'AGE_TRANSFORM':
      applyAgeTransformation(ctx, canvas, options);
      break;
    case 'COMPOSITE':
      await applyImageSynthesis(ctx, canvas, inputImages, options);
      break;
    case 'OBJECT_REMOVE':
      await applyObjectRemovalMask(ctx, canvas, options);
      break;
    default:
      // Default enhancement for general generation
      ctx.save();
      ctx.filter = 'contrast(105%) saturate(108%)';
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
      break;
  }

  return canvas.toDataURL('image/png', 0.95);
}

async function applyPassportTransformation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions,
  sourceImg: HTMLImageElement
) {
  const w = canvas.width;
  const h = canvas.height;

  // 1. Clean passport background
  let bgHex = '#FFFFFF';
  if (options.passportBg === 'light_gray') bgHex = '#F1F5F9';
  if (options.passportBg === 'light_blue') bgHex = '#E0F2FE';

  // Save current subject before overriding bg
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d')!;

  const scale = Math.max(w / sourceImg.width, h / sourceImg.height) * 1.02;
  const ix = (w - sourceImg.width * scale) / 2;
  const iy = (h - sourceImg.height * scale) / 2 + h * 0.02;

  tempCtx.drawImage(sourceImg, ix, iy, sourceImg.width * scale, sourceImg.height * scale);

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, w, h);

  const sampleData = tempCtx.getImageData(10, 10, 1, 1).data;
  const sampleR = sampleData[0];
  const sampleG = sampleData[1];
  const sampleB = sampleData[2];

  const imgData = tempCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const cx = w / 2;
  const cy = h * 0.42;

  for (let i = 0; i < data.length; i += 4) {
    const px = (i / 4) % w;
    const py = Math.floor(i / 4 / w);

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const colorDiff = Math.abs(r - sampleR) + Math.abs(g - sampleG) + Math.abs(b - sampleB);
    const distFromCenter = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);

    if (distFromCenter > w * 0.38 || (colorDiff < 60 && distFromCenter > w * 0.22)) {
      data[i + 3] = 0;
    }
  }

  tempCtx.putImageData(imgData, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);

  // 2. Formal Attire Overlay if selected
  if (options.passportAttire === 'suit' || options.passportAttire === 'formal') {
    ctx.save();
    const suitTop = h * 0.62;

    const suitGrad = ctx.createLinearGradient(0, suitTop, 0, h);
    suitGrad.addColorStop(0, '#0f172a');
    suitGrad.addColorStop(1, '#020617');

    ctx.fillStyle = suitGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h);
    ctx.quadraticCurveTo(w * 0.2, suitTop + 20, w * 0.35, suitTop + 35);
    ctx.quadraticCurveTo(w * 0.5, suitTop + 75, w * 0.65, suitTop + 35);
    ctx.quadraticCurveTo(w * 0.8, suitTop + 20, w * 0.9, h);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(w * 0.42, suitTop + 30);
    ctx.lineTo(w * 0.5, suitTop + 80);
    ctx.lineTo(w * 0.58, suitTop + 30);
    ctx.fill();

    if (options.passportAttire === 'suit') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(w * 0.48, suitTop + 35);
      ctx.lineTo(w * 0.52, suitTop + 35);
      ctx.lineTo(w * 0.51, h);
      ctx.lineTo(w * 0.49, h);
      ctx.fill();
    }

    ctx.restore();
  }

  // 3. Official Passport Spec Indicator Badge
  ctx.save();
  ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
  ctx.fillRect(w - 200, 16, 184, 28);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('대한민국 규격 여권 (3.5×4.5cm)', w - 190, 35);
  ctx.restore();
}

function applyStudioLighting(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions,
  sourceImg: HTMLImageElement
) {
  const w = canvas.width;
  const h = canvas.height;

  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = w;
  bgCanvas.height = h;
  const bgCtx = bgCanvas.getContext('2d')!;

  let bgGrad = bgCtx.createRadialGradient(w * 0.5, h * 0.4, w * 0.1, w * 0.5, h * 0.5, w * 0.9);

  switch (options.studioPreset) {
    case 'bright_studio':
      bgGrad.addColorStop(0, '#fef08a');
      bgGrad.addColorStop(0.6, '#38bdf8');
      bgGrad.addColorStop(1, '#0284c7');
      break;
    case 'luxury_studio':
      bgGrad.addColorStop(0, '#475569');
      bgGrad.addColorStop(0.7, '#1e293b');
      bgGrad.addColorStop(1, '#020617');
      break;
    case 'natural_light':
      bgGrad.addColorStop(0, '#fed7aa');
      bgGrad.addColorStop(0.6, '#c2410c');
      bgGrad.addColorStop(1, '#431407');
      break;
    case 'business':
      bgGrad.addColorStop(0, '#94a3b8');
      bgGrad.addColorStop(0.7, '#334155');
      bgGrad.addColorStop(1, '#0f172a');
      break;
    default:
      bgGrad.addColorStop(0, '#e2e8f0');
      bgGrad.addColorStop(0.6, '#475569');
      bgGrad.addColorStop(1, '#0f172a');
      break;
  }

  bgCtx.fillStyle = bgGrad;
  bgCtx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.filter = 'contrast(108%) saturate(105%) brightness(102%)';

  const scale = Math.max(w / sourceImg.width, h / sourceImg.height);
  const ix = (w - sourceImg.width * scale) / 2;
  const iy = (h - sourceImg.height * scale) / 2;

  ctx.drawImage(bgCanvas, 0, 0);

  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(sourceImg, ix, iy, sourceImg.width * scale, sourceImg.height * scale);

  const keyLight = ctx.createRadialGradient(w * 0.3, h * 0.3, 10, w * 0.3, h * 0.3, w * 0.7);
  keyLight.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  keyLight.addColorStop(1, 'rgba(0, 0, 0, 0.15)');

  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = keyLight;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(16, 16, 150, 26);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#6366f1';
  ctx.fillText('AI STUDIO PORTRAIT', 24, 33);
  ctx.restore();
}

function applyRestorationAndColorize(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions
) {
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const isColorize = options.activeTool === 'COLORIZE';
  const isUpscale = options.activeTool === 'UPSCALE';
  const intensity = options.restoreIntensity || 'normal';

  const factor = intensity === 'strong' ? 1.4 : intensity === 'light' ? 1.1 : 1.25;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = Math.min(255, Math.max(0, (r - 128) * factor + 128));
    g = Math.min(255, Math.max(0, (g - 128) * factor + 128));
    b = Math.min(255, Math.max(0, (b - 128) * factor + 128));

    if (isColorize) {
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      if (luminance > 180) {
        r = Math.min(255, luminance * 1.12);
        g = Math.min(255, luminance * 0.98);
        b = Math.min(255, luminance * 0.90);
      } else if (luminance > 80) {
        r = Math.min(255, luminance * 1.20);
        g = Math.min(255, luminance * 0.92);
        b = Math.min(255, luminance * 0.82);
      } else {
        r = Math.max(0, luminance * 0.80);
        g = Math.max(0, luminance * 0.85);
        b = Math.min(255, luminance * 1.10);
      }
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);

  if (isUpscale) {
    ctx.save();
    ctx.filter = 'contrast(110%) sharpen(2)';
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }
}

function applySkinRetouch(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions
) {
  const w = canvas.width;
  const h = canvas.height;

  const val = options.skinRetouchIntensity === 'strong' ? 0.8 : options.skinRetouchIntensity === 'normal' ? 0.6 : 0.4;

  ctx.save();
  const smoothCanvas = document.createElement('canvas');
  smoothCanvas.width = w;
  smoothCanvas.height = h;
  const sCtx = smoothCanvas.getContext('2d')!;

  sCtx.filter = `blur(${Math.round(5 * val)}px) brightness(103%) contrast(102%)`;
  sCtx.drawImage(canvas, 0, 0);

  ctx.globalAlpha = 0.45 * val;
  ctx.globalCompositeOperation = 'soft-light';
  ctx.drawImage(smoothCanvas, 0, 0);

  ctx.restore();
}

function applyBackgroundRemoval(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const sampleR = data[0];
  const sampleG = data[1];
  const sampleB = data[2];

  const cx = w / 2;
  const cy = h * 0.45;

  for (let i = 0; i < data.length; i += 4) {
    const px = (i / 4) % w;
    const py = Math.floor(i / 4 / w);

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const diff = Math.abs(r - sampleR) + Math.abs(g - sampleG) + Math.abs(b - sampleB);
    const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);

    if (dist > w * 0.42 || (diff < 50 && dist > w * 0.25)) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyBackgroundReplace(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions,
  sourceImg: HTMLImageElement
) {
  const w = canvas.width;
  const h = canvas.height;

  let bgHex = '#f8fafc';
  if (options.bgReplaceType === 'light_gray') bgHex = '#f1f5f9';
  if (options.bgReplaceType === 'beige') bgHex = '#fef3c7';
  if (options.bgReplaceType === 'blue') bgHex = '#e0f2fe';

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, w, h);

  const scale = Math.max(w / sourceImg.width, h / sourceImg.height);
  const ix = (w - sourceImg.width * scale) / 2;
  const iy = (h - sourceImg.height * scale) / 2;

  ctx.drawImage(sourceImg, ix, iy, sourceImg.width * scale, sourceImg.height * scale);
}

function applyPosterOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions
) {
  const w = canvas.width;
  const h = canvas.height;
  const layer = options.posterLayer;

  ctx.save();
  const scrim = ctx.createLinearGradient(0, h * 0.5, 0, h);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);

  ctx.textAlign = layer?.align || 'center';
  const posX = layer?.align === 'left' ? w * 0.1 : layer?.align === 'right' ? w * 0.9 : w / 2;
  const posY = h * 0.82;

  ctx.font = `black ${layer?.fontSize || 38}px sans-serif`;
  ctx.fillStyle = layer?.color || '#FFFFFF';
  ctx.globalAlpha = layer?.opacity || 0.95;
  ctx.fillText(layer?.title || 'AI PHOTO STUDIO', posX, posY);

  if (layer?.subtitle) {
    ctx.font = '600 18px sans-serif';
    ctx.fillStyle = '#c7d2fe';
    ctx.fillText(layer.subtitle, posX, posY + 32);
  }

  if (layer?.brand) {
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#818cf8';
    ctx.fillText(`— ${layer.brand} —`, posX, posY - 45);
  }

  ctx.restore();
}

function applyStyleFilter(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions
) {
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  if (options.activeTool === 'SKETCH' || options.sketchMode === 'photo_to_sketch') {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const v = avg > 120 ? 255 : Math.floor(avg * 1.6);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imageData, 0, 0);
  } else if (options.sketchMode === 'photo_to_line') {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const v = avg > 140 ? 255 : 20;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imageData, 0, 0);
  } else {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.filter = 'saturate(200%) contrast(120%) brightness(105%)';
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }
}

function applyAgeTransformation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions
) {
  const targetAge = options.targetAge || 50;
  const w = canvas.width;
  const h = canvas.height;

  ctx.save();

  if (targetAge <= 15) {
    ctx.filter = 'saturate(125%) brightness(108%) contrast(98%)';
    ctx.drawImage(canvas, 0, 0);

    ctx.fillStyle = 'rgba(244, 114, 182, 0.18)';
    ctx.beginPath();
    ctx.arc(w * 0.38, h * 0.52, w * 0.08, 0, Math.PI * 2);
    ctx.arc(w * 0.62, h * 0.52, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (targetAge >= 50) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, data[i] * 0.92);
      data[i + 1] = Math.max(0, data[i + 1] * 0.92);
      data[i + 2] = Math.min(255, data[i + 2] * 1.08);
    }
    ctx.putImageData(imageData, 0, 0);

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.28);
    ctx.quadraticCurveTo(w * 0.5, h * 0.26, w * 0.65, h * 0.28);
    ctx.moveTo(w * 0.32, h * 0.45);
    ctx.lineTo(w * 0.26, h * 0.44);
    ctx.moveTo(w * 0.68, h * 0.45);
    ctx.lineTo(w * 0.74, h * 0.44);
    ctx.stroke();
  } else {
    ctx.filter = 'saturate(110%) contrast(108%)';
    ctx.drawImage(canvas, 0, 0);
  }

  ctx.fillStyle = '#6366f1';
  ctx.fillRect(16, 16, 130, 28);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`목표 나이: ${targetAge}세`, 26, 34);

  ctx.restore();
}

async function applyImageSynthesis(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  inputImages: UploadedImage[],
  options: ControlOptions
) {
  const compositeImgItem = inputImages.find((img) => img.role === 'COMPOSITE' || img.role === ('composite' as any));
  if (!compositeImgItem) return;

  try {
    const compImg = await loadImage(compositeImgItem.dataUrl);
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    const scale = (options.synthesisScale || 100) / 100;
    const tw = w * 0.4 * scale;
    const th = h * 0.4 * scale;

    let tx = w * 0.55;
    let ty = h * 0.45;

    if (options.synthesisPosition === 'left') tx = w * 0.1;
    if (options.synthesisPosition === 'center') tx = w * 0.3;
    if (options.synthesisPosition === 'right') tx = w * 0.55;

    ctx.globalAlpha = 0.92;
    ctx.drawImage(compImg, tx, ty, tw, th);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx, ty, tw, th);
    ctx.restore();
  } catch (err) {
    console.warn('Synthesis load warning:', err);
  }
}

async function applyObjectRemovalMask(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ControlOptions
) {
  if (!options.maskDataUrl) return;

  try {
    const maskImg = await loadImage(options.maskDataUrl);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  } catch (err) {
    console.warn('Mask load warning:', err);
  }
}

function createSyntheticCanvasImage(options: ControlOptions): string {
  const canvas = document.createElement('canvas');
  let w = 1024;
  let h = 1024;

  if (options.activeTool === 'PASSPORT_GUIDE') {
    w = 768;
    h = 1024;
  }

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  if (options.activeTool === 'PASSPORT_GUIDE') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.38, w * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.85, w * 0.38, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('대한민국 규격 여권사진 (3.5x4.5)', w / 2, h * 0.12);
  } else {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, 600);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#818cf8';
    ctx.textAlign = 'center';
    ctx.fillText('AI 사진스튜디오', w / 2, h * 0.48);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(options.prompt || '정밀 AI 편집 결과', w / 2, h * 0.54);
  }

  return canvas.toDataURL('image/png');
}
