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
