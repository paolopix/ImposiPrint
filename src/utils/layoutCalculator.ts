import { PAPER_SIZES } from '../constants';
import { ComputedLayout, GridSlot, LayoutConfig, UploadedImage } from '../types';

interface EvaluationResult {
  orientation: 'portrait' | 'landscape';
  sheetWidthMm: number;
  sheetHeightMm: number;
  cols: number;
  rows: number;
  slotsPerPage: number;
  efficiencyPercent: number;
}

function evaluateOrientation(
  orientation: 'portrait' | 'landscape',
  rawW: number,
  rawH: number,
  config: LayoutConfig
): EvaluationResult {
  const isLandscape = orientation === 'landscape';
  const sheetWidthMm = isLandscape ? Math.max(rawW, rawH) : Math.min(rawW, rawH);
  const sheetHeightMm = isLandscape ? Math.min(rawW, rawH) : Math.max(rawW, rawH);

  const imgWMm = config.imageWidthCm * 10;
  const imgHMm = config.imageHeightCm * 10;

  const availW = Math.max(0, sheetWidthMm - (config.margins.left + config.margins.right));
  const availH = Math.max(0, sheetHeightMm - (config.margins.top + config.margins.bottom));

  let cols = 0;
  let rows = 0;

  if (imgWMm > 0 && availW >= imgWMm) {
    cols = Math.floor((availW + config.gapXMm) / (imgWMm + config.gapXMm));
  }

  if (imgHMm > 0 && availH >= imgHMm) {
    rows = Math.floor((availH + config.gapYMm) / (imgHMm + config.gapYMm));
  }

  const slotsPerPage = cols * rows;
  const totalArea = sheetWidthMm * sheetHeightMm;
  const imagesArea = slotsPerPage * (imgWMm * imgHMm);
  const efficiencyPercent = totalArea > 0 ? (imagesArea / totalArea) * 100 : 0;

  return {
    orientation,
    sheetWidthMm,
    sheetHeightMm,
    cols,
    rows,
    slotsPerPage,
    efficiencyPercent,
  };
}

export function computeLayout(
  config: LayoutConfig,
  images: UploadedImage[],
  fillRemainingSlotsWithRepeat: boolean = false
): ComputedLayout {
  let baseW: number;
  let baseH: number;

  if (config.paperSize === 'custom') {
    baseW = config.customPaperWidthMm || 210;
    baseH = config.customPaperHeightMm || 297;
  } else {
    const dims = PAPER_SIZES[config.paperSize];
    baseW = dims.widthMm;
    baseH = dims.heightMm;
  }

  let chosenEvaluation: EvaluationResult;

  if (config.orientation === 'auto') {
    const portraitEval = evaluateOrientation('portrait', baseW, baseH, config);
    const landscapeEval = evaluateOrientation('landscape', baseW, baseH, config);

    if (landscapeEval.slotsPerPage > portraitEval.slotsPerPage) {
      chosenEvaluation = landscapeEval;
    } else if (portraitEval.slotsPerPage > landscapeEval.slotsPerPage) {
      chosenEvaluation = portraitEval;
    } else {
      // Tie-breaker: choose the one with higher area efficiency
      chosenEvaluation =
        landscapeEval.efficiencyPercent > portraitEval.efficiencyPercent
          ? landscapeEval
          : portraitEval;
    }
  } else {
    chosenEvaluation = evaluateOrientation(config.orientation, baseW, baseH, config);
  }

  const {
    orientation: effectiveOrientation,
    sheetWidthMm,
    sheetHeightMm,
    cols,
    rows,
    slotsPerPage,
    efficiencyPercent,
  } = chosenEvaluation;

  const imgWMm = config.imageWidthCm * 10;
  const imgHMm = config.imageHeightCm * 10;

  const gridWidthMm = cols > 0 ? cols * imgWMm + (cols - 1) * config.gapXMm : 0;
  const gridHeightMm = rows > 0 ? rows * imgHMm + (rows - 1) * config.gapYMm : 0;

  const availW = Math.max(0, sheetWidthMm - (config.margins.left + config.margins.right));
  const availH = Math.max(0, sheetHeightMm - (config.margins.top + config.margins.bottom));

  const extraW = Math.max(0, availW - gridWidthMm);
  const extraH = Math.max(0, availH - gridHeightMm);

  const effectiveLeftMm = config.autoCenter
    ? config.margins.left + extraW / 2
    : config.margins.left;
  const effectiveTopMm = config.autoCenter
    ? config.margins.top + extraH / 2
    : config.margins.top;

  // Flatten images queue based on copies
  const flattenedImages: UploadedImage[] = [];
  for (const img of images) {
    const count = Math.max(1, img.copies || 1);
    for (let c = 0; c < count; c++) {
      flattenedImages.push(img);
    }
  }

  // If fillRemainingSlotsWithRepeat is requested and we have images, repeat to fill at least 1 full page (or multiple full pages)
  if (fillRemainingSlotsWithRepeat && flattenedImages.length > 0 && slotsPerPage > 0) {
    const remainder = flattenedImages.length % slotsPerPage;
    if (remainder > 0) {
      const needed = slotsPerPage - remainder;
      for (let i = 0; i < needed; i++) {
        flattenedImages.push(flattenedImages[i % flattenedImages.length]);
      }
    }
  }

  // Calculate total pages
  let totalPages = 1;
  if (slotsPerPage > 0) {
    totalPages = Math.max(1, Math.ceil(flattenedImages.length / slotsPerPage));
  }

  const pages: GridSlot[][] = [];

  let imagePointer = 0;
  for (let p = 0; p < totalPages; p++) {
    const pageSlots: GridSlot[] = [];
    let slotIdx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xMm = effectiveLeftMm + c * (imgWMm + config.gapXMm);
        const yMm = effectiveTopMm + r * (imgHMm + config.gapYMm);

        const assignedImage =
          imagePointer < flattenedImages.length
            ? flattenedImages[imagePointer]
            : undefined;

        pageSlots.push({
          pageIndex: p,
          row: r,
          col: c,
          xMm,
          yMm,
          widthMm: imgWMm,
          heightMm: imgHMm,
          image: assignedImage,
          slotIndex: slotIdx,
        });

        imagePointer++;
        slotIdx++;
      }
    }

    pages.push(pageSlots);
  }

  return {
    sheetWidthMm,
    sheetHeightMm,
    cols,
    rows,
    slotsPerPage,
    totalSlots: slotsPerPage * totalPages,
    totalPages,
    effectiveOrientation,
    gridWidthMm,
    gridHeightMm,
    effectiveLeftMm,
    effectiveTopMm,
    pages,
    efficiencyPercent: Number(efficiencyPercent.toFixed(1)),
  };
}
