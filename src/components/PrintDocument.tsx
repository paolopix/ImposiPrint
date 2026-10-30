import React from 'react';
import { ComputedLayout, LayoutConfig } from '../types';
import { computeCropMarkLines } from '../utils/cropMarksRenderer';

interface PrintDocumentProps {
  layout: ComputedLayout;
  config: LayoutConfig;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({ layout, config }) => {
  const cropLines = computeCropMarkLines(layout, config.cropMarks);

  let objectFitClass = 'object-cover';
  if (config.fitMode === 'contain') objectFitClass = 'object-contain';
  if (config.fitMode === 'fill') objectFitClass = 'object-fill';

  return (
    <div id="imposiprint-print-root" className="print-only">
      <style>{`
        @page {
          size: ${layout.sheetWidthMm}mm ${layout.sheetHeightMm}mm ${layout.effectiveOrientation};
          margin: 0mm;
        }
      `}</style>

      {layout.pages.map((pageSlots, pageIndex) => (
        <div
          key={pageIndex}
          className="print-page-sheet relative bg-white overflow-hidden"
          style={{
            width: `${layout.sheetWidthMm}mm`,
            height: `${layout.sheetHeightMm}mm`,
            position: 'relative',
          }}
        >
          {/* Images */}
          {pageSlots.map((slot) => {
            if (!slot.image) return null;
            const effectiveFitMode = slot.image.fitMode || config.fitMode;
            let slotObjectFitClass = 'object-cover';
            if (effectiveFitMode === 'contain') slotObjectFitClass = 'object-contain';
            if (effectiveFitMode === 'fill') slotObjectFitClass = 'object-fill';

            return (
              <div
                key={`${pageIndex}-${slot.row}-${slot.col}`}
                style={{
                  position: 'absolute',
                  left: `${slot.xMm}mm`,
                  top: `${slot.yMm}mm`,
                  width: `${slot.widthMm}mm`,
                  height: `${slot.heightMm}mm`,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={slot.image.url}
                  alt={slot.image.name}
                  className={`w-full h-full ${slotObjectFitClass}`}
                  style={{ display: 'block' }}
                />
              </div>
            );
          })}

          {/* Vector Crop Marks */}
          {config.cropMarks.enabled && cropLines.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${layout.sheetWidthMm}mm`,
                height: `${layout.sheetHeightMm}mm`,
                pointerEvents: 'none',
              }}
              viewBox={`0 0 ${layout.sheetWidthMm} ${layout.sheetHeightMm}`}
            >
              {cropLines.map((line, idx) => (
                <line
                  key={idx}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={config.cropMarks.color}
                  strokeWidth={config.cropMarks.lineWidthMm || 0.25}
                  strokeDasharray={config.cropMarks.style === 'grid' ? '1,1' : undefined}
                />
              ))}
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};
