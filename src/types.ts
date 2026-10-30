export type PaperSize = 'A6' | 'A5' | 'A4' | 'A3' | 'custom';

export type Orientation = 'portrait' | 'landscape' | 'auto';

export type FitMode = 'cover' | 'contain' | 'fill';

export type CropMarkStyle = 'corners' | 'crosses' | 'perimeter' | 'grid' | 'none';

export interface PaperDimensions {
  widthMm: number;
  heightMm: number;
}

export interface Margins {
  top: number; // in mm
  bottom: number;
  left: number;
  right: number;
}

export interface CropMarkConfig {
  enabled: boolean;
  style: CropMarkStyle;
  lengthMm: number;
  offsetMm: number; // distance from image edge
  lineWidthMm: number;
  color: string;
}

export interface LayoutConfig {
  paperSize: PaperSize;
  customPaperWidthMm: number;
  customPaperHeightMm: number;
  orientation: Orientation;
  imageWidthCm: number;
  imageHeightCm: number;
  lockAspectRatio: boolean;
  gapXMm: number;
  gapYMm: number;
  linkGaps: boolean;
  fitMode: FitMode;
  margins: Margins;
  linkMargins: boolean;
  autoCenter: boolean;
  cropMarks: CropMarkConfig;
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  copies: number;
  fitMode?: FitMode;
}

export interface GridSlot {
  pageIndex: number;
  row: number;
  col: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  image?: UploadedImage;
  slotIndex: number;
}

export interface ComputedLayout {
  sheetWidthMm: number;
  sheetHeightMm: number;
  cols: number;
  rows: number;
  slotsPerPage: number;
  totalSlots: number;
  totalPages: number;
  effectiveOrientation: 'portrait' | 'landscape';
  gridWidthMm: number;
  gridHeightMm: number;
  effectiveLeftMm: number;
  effectiveTopMm: number;
  pages: GridSlot[][];
  efficiencyPercent: number; // percentage of paper covered by images
}

export interface PrintPreset {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  config: LayoutConfig;
}

export type PaperFormat = 'A5' | 'A6';
export type SheetOrientation = 'portrait' | 'landscape';

export interface SheetSettings {
  paperFormat: PaperFormat;
  paperWidthMm: number;
  paperHeightMm: number;
  orientation: SheetOrientation;
  spacingMm: number;
  showBorder: boolean;
  borderWidthPt: number;
  borderColor: string;
  showCropMarks: boolean;
  layout: '2x2' | 'row' | 'column';
}

export interface CropTransform {
  scale: number;
  rotation: number;
  x: number;
  y: number;
  flipHorizontal?: boolean;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
}

export interface BiometricGuideSettings {
  showGuides: boolean;
  showFaceOval?: boolean;
  showEyeLine?: boolean;
  showCenterLine?: boolean;
  showThirdsGrid?: boolean;
}

export interface PhotoPosition {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

