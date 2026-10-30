import { CropTransform, ImageAdjustments } from '../types';

export const BASE_CROP_WIDTH = 350;
export const BASE_CROP_HEIGHT = 450;

// High resolution print dimensions (approx 600 DPI for pristine passport quality)
export const HIGH_RES_WIDTH = 827; // 35mm @ 600 DPI
export const HIGH_RES_HEIGHT = 1063; // 45mm @ 600 DPI

/**
 * Renders the cropped photo to an HTMLCanvasElement with exact transformations and filters applied.
 */
export function renderCroppedPhotoCanvas(
  img: HTMLImageElement,
  transform: CropTransform,
  adjustments: ImageAdjustments,
  targetWidth: number = HIGH_RES_WIDTH,
  targetHeight: number = HIGH_RES_HEIGHT
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Fill with neutral pure white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Apply visual adjustments filter
  const filters: string[] = [];
  if (adjustments.brightness !== 100) {
    filters.push(`brightness(${adjustments.brightness}%)`);
  }
  if (adjustments.contrast !== 100) {
    filters.push(`contrast(${adjustments.contrast}%)`);
  }
  if (adjustments.saturation !== 100) {
    filters.push(`saturate(${adjustments.saturation}%)`);
  }
  if (adjustments.grayscale) {
    filters.push('grayscale(100%)');
  }

  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
  }

  // Calculate resolution multiplier between base interactive preview and output resolution
  const scaleRatio = targetWidth / BASE_CROP_WIDTH;

  ctx.save();
  // Move origin to center of crop canvas
  ctx.translate(targetWidth / 2, targetHeight / 2);

  // Apply user translation (scaled up to high resolution)
  ctx.translate(transform.x * scaleRatio, transform.y * scaleRatio);

  // Apply rotation
  ctx.rotate((transform.rotation * Math.PI) / 180);

  // Apply scale
  const flip = transform.flipHorizontal ? -1 : 1;
  ctx.scale(transform.scale * scaleRatio * flip, transform.scale * scaleRatio);

  // High quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw image centered at origin
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  ctx.restore();

  return canvas;
}

/**
 * Returns a high-res Data URL of the cropped photo.
 */
export function getCroppedPhotoDataUrl(
  img: HTMLImageElement,
  transform: CropTransform,
  adjustments: ImageAdjustments,
  targetWidth: number = HIGH_RES_WIDTH,
  targetHeight: number = HIGH_RES_HEIGHT
): string {
  const canvas = renderCroppedPhotoCanvas(img, transform, adjustments, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', 0.96);
}

/**
 * Reads a File and loads it into an HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Loads an image from a Data URL or URL string
 */
export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Calculates initial zoom scale to cover the 35x45 frame appropriately
 */
export function calculateFitScale(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number = BASE_CROP_WIDTH,
  targetHeight: number = BASE_CROP_HEIGHT
): number {
  const scaleX = targetWidth / imgWidth;
  const scaleY = targetHeight / imgHeight;
  // Use cover scale so there are no empty gaps initially
  return Math.max(scaleX, scaleY);
}

/**
 * Triggers a direct browser download of a dataURL or Blob
 */
export function downloadFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
