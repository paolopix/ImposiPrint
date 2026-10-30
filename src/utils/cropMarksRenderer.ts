import { ComputedLayout, CropMarkConfig } from '../types';

export interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Computes exact vector line segments in millimeters for crop marks
 * based on the layout and configuration.
 */
export function computeCropMarkLines(
  layout: ComputedLayout,
  cropConfig: CropMarkConfig
): LineSegment[] {
  if (!cropConfig.enabled || cropConfig.style === 'none' || layout.slotsPerPage === 0) {
    return [];
  }

  const lines: LineSegment[] = [];
  const { lengthMm, offsetMm, style } = cropConfig;
  const page0Slots = layout.pages[0];
  if (!page0Slots || page0Slots.length === 0) return [];

  // Collect all unique X and Y cut coordinates
  const xCutCoords = new Set<number>();
  const yCutCoords = new Set<number>();

  for (const slot of page0Slots) {
    xCutCoords.add(Number(slot.xMm.toFixed(3)));
    xCutCoords.add(Number((slot.xMm + slot.widthMm).toFixed(3)));
    yCutCoords.add(Number(slot.yMm.toFixed(3)));
    yCutCoords.add(Number((slot.yMm + slot.heightMm).toFixed(3)));
  }

  const sortedX = Array.from(xCutCoords).sort((a, b) => a - b);
  const sortedY = Array.from(yCutCoords).sort((a, b) => a - b);

  if (style === 'corners') {
    // Standard corner marks for each individual image slot
    for (const slot of page0Slots) {
      const x1 = slot.xMm;
      const x2 = slot.xMm + slot.widthMm;
      const y1 = slot.yMm;
      const y2 = slot.yMm + slot.heightMm;

      // Top-Left corner
      lines.push({ x1: x1 - offsetMm - lengthMm, y1: y1, x2: x1 - offsetMm, y2: y1 });
      lines.push({ x1: x1, y1: y1 - offsetMm - lengthMm, x2: x1, y2: y1 - offsetMm });

      // Top-Right corner
      lines.push({ x1: x2 + offsetMm, y1: y1, x2: x2 + offsetMm + lengthMm, y2: y1 });
      lines.push({ x1: x2, y1: y1 - offsetMm - lengthMm, x2: x2, y2: y1 - offsetMm });

      // Bottom-Left corner
      lines.push({ x1: x1 - offsetMm - lengthMm, y1: y2, x2: x1 - offsetMm, y2: y2 });
      lines.push({ x1: x1, y1: y2 + offsetMm, x2: x1, y2: y2 + offsetMm + lengthMm });

      // Bottom-Right corner
      lines.push({ x1: x2 + offsetMm, y1: y2, x2: x2 + offsetMm + lengthMm, y2: y2 });
      lines.push({ x1: x2, y1: y2 + offsetMm, x2: x2, y2: y2 + offsetMm + lengthMm });
    }
  } else if (style === 'perimeter') {
    // Ticks extending outward into the sheet margins at each cut coordinate
    const sheetW = layout.sheetWidthMm;
    const sheetH = layout.sheetHeightMm;
    const marginL = layout.effectiveLeftMm;
    const marginR = sheetW - (layout.effectiveLeftMm + layout.gridWidthMm);
    const marginT = layout.effectiveTopMm;
    const marginB = sheetH - (layout.effectiveTopMm + layout.gridHeightMm);

    // Top and bottom ticks along X cut coordinates
    for (const x of sortedX) {
      // Top tick extending from margin inwards or outwards
      const topY1 = Math.max(0, marginT - offsetMm - lengthMm);
      const topY2 = Math.max(0, marginT - offsetMm);
      lines.push({ x1: x, y1: topY1, x2: x, y2: topY2 });

      // Bottom tick
      const bottomY1 = sheetH - marginB + offsetMm;
      const bottomY2 = Math.min(sheetH, sheetH - marginB + offsetMm + lengthMm);
      lines.push({ x1: x, y1: bottomY1, x2: x, y2: bottomY2 });
    }

    // Left and right ticks along Y cut coordinates
    for (const y of sortedY) {
      // Left tick
      const leftX1 = Math.max(0, marginL - offsetMm - lengthMm);
      const leftX2 = Math.max(0, marginL - offsetMm);
      lines.push({ x1: leftX1, y1: y, x2: leftX2, y2: y });

      // Right tick
      const rightX1 = sheetW - marginR + offsetMm;
      const rightX2 = Math.min(sheetW, sheetW - marginR + offsetMm + lengthMm);
      lines.push({ x1: rightX1, y1: y, x2: rightX2, y2: y });
    }
  } else if (style === 'crosses') {
    // Corner marks around perimeter and small crosshairs at all internal grid intersections
    for (const x of sortedX) {
      for (const y of sortedY) {
        // Small cross at intersection
        const half = lengthMm / 2;
        lines.push({ x1: x - half, y1: y, x2: x + half, y2: y });
        lines.push({ x1: x, y1: y - half, x2: x, y2: y + half });
      }
    }
  } else if (style === 'grid') {
    // Continuous subtle cut guide lines through the entire printable area
    for (const x of sortedX) {
      lines.push({
        x1: x,
        y1: layout.effectiveTopMm - offsetMm - lengthMm,
        x2: x,
        y2: layout.effectiveTopMm + layout.gridHeightMm + offsetMm + lengthMm,
      });
    }
    for (const y of sortedY) {
      lines.push({
        x1: layout.effectiveLeftMm - offsetMm - lengthMm,
        y1: y,
        x2: layout.effectiveLeftMm + layout.gridWidthMm + offsetMm + lengthMm,
        y2: y,
      });
    }
  }

  return lines;
}
