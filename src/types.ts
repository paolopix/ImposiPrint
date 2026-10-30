export interface CropTransform {
  x: number; // offset in px relative to center
  y: number; // offset in px relative to center
  scale: number; // scale multiplier
  rotation: number; // angle in degrees (-180 to 180)
  flipHorizontal: boolean;
}

export interface ImageAdjustments {
  brightness: number; // 50 to 150 %
  contrast: number; // 50 to 150 %
  saturation: number; // 0 to 150 %
  grayscale: boolean;
}

export type PaperFormat = 'A5' | 'A6';
export type SheetOrientation = 'portrait' | 'landscape';

export interface SheetSettings {
  paperFormat: PaperFormat; // 'A5' (148x210 mm) | 'A6' (105x148 mm)
  paperWidthMm: number; // 148 mm for A5, 105 mm for A6 (verticale)
  paperHeightMm: number; // 210 mm for A5, 148 mm for A6 (verticale)
  photoWidthMm: number; // 35 mm
  photoHeightMm: number; // 45 mm
  spacingMm: number; // 10 mm (1 cm)
  count: number; // 4
  layout: '2x2' | 'row' | 'column';
  borderWidthPt: number; // 0.25 pt (sottile) to 1 pt
  borderColor: string; // e.g. '#9ca3af'
  showBorder: boolean;
  showCropMarks: boolean;
  cropMarkLengthMm: number;
  orientation: SheetOrientation; // 'portrait' (verticale) | 'landscape' (orizzontale)
}

export interface BiometricGuideSettings {
  showGuides: boolean;
  showFaceOval: boolean;
  showEyeLine: boolean;
  showCenterLine: boolean;
  showThirdsGrid: boolean;
}
