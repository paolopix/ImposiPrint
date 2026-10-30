import { jsPDF } from 'jspdf';
import { ComputedLayout, LayoutConfig, PhotoPosition, SheetSettings } from '../types';
import { computeCropMarkLines } from './cropMarksRenderer';

// Pre-load an image to an HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Render an image into an offscreen canvas at 300 DPI with the desired fit mode
function renderImageToCanvas(
  img: HTMLImageElement,
  targetWidthMm: number,
  targetHeightMm: number,
  fitMode: 'cover' | 'contain' | 'fill'
): HTMLCanvasElement {
  // 300 DPI: 300 / 25.4 ≈ 11.811 pixels per millimeter
  const dpmm = 300 / 25.4;
  const canvasW = Math.max(1, Math.round(targetWidthMm * dpmm));
  const canvasH = Math.max(1, Math.round(targetHeightMm * dpmm));

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (fitMode === 'fill') {
    ctx.drawImage(img, 0, 0, canvasW, canvasH);
    return canvas;
  }

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = canvasW / canvasH;

  if (fitMode === 'contain') {
    // Fill transparent or white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);

    let drawW: number;
    let drawH: number;
    let drawX: number;
    let drawY: number;

    if (imgRatio > targetRatio) {
      drawW = canvasW;
      drawH = canvasW / imgRatio;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    } else {
      drawH = canvasH;
      drawW = canvasH * imgRatio;
      drawX = (canvasW - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    return canvas;
  }

  // fitMode === 'cover'
  let srcX = 0;
  let srcY = 0;
  let srcW = img.naturalWidth;
  let srcH = img.naturalHeight;

  if (imgRatio > targetRatio) {
    // Image is wider than target: crop left & right
    srcW = img.naturalHeight * targetRatio;
    srcX = (img.naturalWidth - srcW) / 2;
  } else {
    // Image is taller than target: crop top & bottom
    srcH = img.naturalWidth / targetRatio;
    srcY = (img.naturalHeight - srcH) / 2;
  }

  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvasW, canvasH);
  return canvas;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export interface PdfExportOptions {
  fileName?: string;
  onProgress?: (progress: number, statusText: string) => void;
}

export async function exportLayoutToPdf(
  layout: ComputedLayout,
  config: LayoutConfig,
  options?: PdfExportOptions
): Promise<void> {
  const onProgress = options?.onProgress || (() => {});
  const fileName =
    options?.fileName ||
    `imposiprint_${config.paperSize.toLowerCase()}_${Date.now()}.pdf`;

  onProgress(5, 'Inizializzazione documento PDF...');

  const pdf = new jsPDF({
    orientation: layout.effectiveOrientation,
    unit: 'mm',
    format: [layout.sheetWidthMm, layout.sheetHeightMm],
    compress: true,
  });

  // Pre-load all unique images
  const uniqueUrls = new Set<string>();
  for (const page of layout.pages) {
    for (const slot of page) {
      if (slot.image?.url) {
        uniqueUrls.add(slot.image.url);
      }
    }
  }

  onProgress(15, `Caricamento ${uniqueUrls.size} risorse immagini...`);
  const imageCache = new Map<string, HTMLImageElement>();
  let loadedCount = 0;

  for (const url of uniqueUrls) {
    try {
      const img = await loadImage(url);
      imageCache.set(url, img);
      loadedCount++;
      onProgress(
        15 + Math.round((loadedCount / Math.max(1, uniqueUrls.size)) * 25),
        `Caricamento immagini (${loadedCount}/${uniqueUrls.size})...`
      );
    } catch (err) {
      console.warn(`Impossibile caricare l'immagine ${url}:`, err);
    }
  }

  // Pre-compute crop marks
  const cropLines = computeCropMarkLines(layout, config.cropMarks);
  const rgb = hexToRgb(config.cropMarks.color);

  const totalPages = layout.pages.length;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      pdf.addPage([layout.sheetWidthMm, layout.sheetHeightMm], layout.effectiveOrientation);
    }

    const currentSlots = layout.pages[pageIdx];
    const baseProgress = 40 + Math.round((pageIdx / totalPages) * 50);

    // Draw images
    for (let sIdx = 0; sIdx < currentSlots.length; sIdx++) {
      const slot = currentSlots[sIdx];
      if (slot.image?.url && imageCache.has(slot.image.url)) {
        const img = imageCache.get(slot.image.url)!;
        const effectiveFitMode = slot.image.fitMode || config.fitMode;
        const canvas = renderImageToCanvas(
          img,
          slot.widthMm,
          slot.heightMm,
          effectiveFitMode
        );
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        pdf.addImage(
          dataUrl,
          'JPEG',
          slot.xMm,
          slot.yMm,
          slot.widthMm,
          slot.heightMm,
          undefined,
          'FAST'
        );
      }
    }

    // Draw vector crop marks
    if (cropLines.length > 0) {
      pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
      pdf.setLineWidth(config.cropMarks.lineWidthMm || 0.25);

      for (const line of cropLines) {
        pdf.line(line.x1, line.y1, line.x2, line.y2);
      }
    }

    onProgress(
      baseProgress,
      `Generazione pagina ${pageIdx + 1} di ${totalPages}...`
    );
  }

  onProgress(95, 'Compressione e salvataggio file...');
  pdf.save(fileName);
  onProgress(100, 'Esportazione completata!');
}

export function calculatePhotoGrid(sheetSettings: SheetSettings): { positions: PhotoPosition[] } {
  const isLandscape = sheetSettings.orientation === 'landscape';
  const pageWidth = isLandscape ? sheetSettings.paperHeightMm : sheetSettings.paperWidthMm;
  const pageHeight = isLandscape ? sheetSettings.paperWidthMm : sheetSettings.paperHeightMm;

  const photoW = 35; // mm
  const photoH = 45; // mm
  const spacing = sheetSettings.spacingMm;
  const positions: PhotoPosition[] = [];

  if (sheetSettings.layout === 'row') {
    const totalW = 4 * photoW + 3 * spacing;
    const startX = (pageWidth - totalW) / 2;
    const startY = (pageHeight - photoH) / 2;
    for (let i = 0; i < 4; i++) {
      positions.push({
        index: i,
        x: startX + i * (photoW + spacing),
        y: startY,
        width: photoW,
        height: photoH,
      });
    }
  } else if (sheetSettings.layout === 'column') {
    const totalH = 4 * photoH + 3 * spacing;
    const startX = (pageWidth - photoW) / 2;
    const startY = (pageHeight - totalH) / 2;
    for (let i = 0; i < 4; i++) {
      positions.push({
        index: i,
        x: startX,
        y: startY + i * (photoH + spacing),
        width: photoW,
        height: photoH,
      });
    }
  } else {
    // 2x2 grid
    const totalW = 2 * photoW + spacing;
    const totalH = 2 * photoH + spacing;
    const startX = (pageWidth - totalW) / 2;
    const startY = (pageHeight - totalH) / 2;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const index = row * 2 + col;
        positions.push({
          index,
          x: startX + col * (photoW + spacing),
          y: startY + row * (photoH + spacing),
          width: photoW,
          height: photoH,
        });
      }
    }
  }

  return { positions };
}

export function downloadPdf(canvas: HTMLCanvasElement, sheetSettings: SheetSettings): void {
  const isLandscape = sheetSettings.orientation === 'landscape';
  const pageWidth = isLandscape ? sheetSettings.paperHeightMm : sheetSettings.paperWidthMm;
  const pageHeight = isLandscape ? sheetSettings.paperWidthMm : sheetSettings.paperHeightMm;

  const pdf = new jsPDF({
    orientation: sheetSettings.orientation,
    unit: 'mm',
    format: [pageWidth, pageHeight],
    compress: true,
  });

  const { positions } = calculatePhotoGrid(sheetSettings);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.96);

  positions.forEach((pos) => {
    pdf.addImage(dataUrl, 'JPEG', pos.x, pos.y, pos.width, pos.height);

    if (sheetSettings.showBorder) {
      pdf.setDrawColor(sheetSettings.borderColor || '#64748b');
      pdf.setLineWidth(sheetSettings.borderWidthPt ? sheetSettings.borderWidthPt * 0.352778 : 0.2);
      pdf.rect(pos.x, pos.y, pos.width, pos.height);
    }

    if (sheetSettings.showCropMarks) {
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.2);
      const markLen = 3;
      pdf.line(pos.x - markLen, pos.y, pos.x, pos.y);
      pdf.line(pos.x, pos.y - markLen, pos.x, pos.y);
      pdf.line(pos.x + pos.width, pos.y, pos.x + pos.width + markLen, pos.y);
      pdf.line(pos.x + pos.width, pos.y - markLen, pos.x + pos.width, pos.y);
      pdf.line(pos.x - markLen, pos.y + pos.height, pos.x, pos.y + pos.height);
      pdf.line(pos.x, pos.y + pos.height, pos.x, pos.y + pos.height + markLen);
      pdf.line(pos.x + pos.width, pos.y + pos.height, pos.x + pos.width + markLen, pos.y + pos.height);
      pdf.line(pos.x + pos.width, pos.y + pos.height, pos.x + pos.width, pos.y + pos.height + markLen);
    }
  });

  pdf.save(`fototessere_${sheetSettings.paperFormat.toLowerCase()}_${Date.now()}.pdf`);
}

export function printPdf(canvas: HTMLCanvasElement, sheetSettings: SheetSettings): void {
  downloadPdf(canvas, sheetSettings);
  window.print();
}

