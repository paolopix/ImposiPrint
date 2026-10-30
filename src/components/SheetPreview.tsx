import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info
} from 'lucide-react';
import { ComputedLayout, FitMode, LayoutConfig, UploadedImage } from '../types';
import { computeCropMarkLines } from '../utils/cropMarksRenderer';
import { Ruler } from './Ruler';
import { FitDropdown } from './FitDropdown';

interface SheetPreviewProps {
  layout: ComputedLayout;
  config: LayoutConfig;
  showRulers: boolean;
  showMarginGuides: boolean;
  showDimensionsBadge: boolean;
  images: UploadedImage[];
  onSelectImageSlot?: (slotIndex: number) => void;
  onUpdateImageFitMode: (imageId: string, fitMode: FitMode) => void;
}

export const SheetPreview: React.FC<SheetPreviewProps> = ({
  layout,
  config,
  showRulers,
  showMarginGuides,
  showDimensionsBadge,
  images,
  onUpdateImageFitMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);

  // Keep page index bounded
  useEffect(() => {
    if (currentPage >= layout.totalPages) {
      setCurrentPage(Math.max(0, layout.totalPages - 1));
    }
  }, [layout.totalPages, currentPage]);

  // Compute auto-fit scale
  const handleAutoFit = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const padding = showRulers ? 90 : 60;
    const availW = container.clientWidth - padding;
    const availH = container.clientHeight - padding;

    if (availW <= 0 || availH <= 0) return;

    // Millimeters to pixels scale
    const scaleX = availW / layout.sheetWidthMm;
    const scaleY = availH / layout.sheetHeightMm;
    const bestScale = Math.min(scaleX, scaleY);

    setZoomScale(Math.max(0.2, Math.min(4, bestScale)));
    setIsAutoFit(true);
  };

  useEffect(() => {
    handleAutoFit();
    const handleResize = () => {
      if (isAutoFit) handleAutoFit();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout.sheetWidthMm, layout.sheetHeightMm, layout.effectiveOrientation, showRulers]);

  const setManualZoom = (newScale: number) => {
    setIsAutoFit(false);
    setZoomScale(Math.max(0.2, Math.min(5, newScale)));
  };

  // 1:1 real screen scale (typical 96 DPI: 1 inch = 25.4 mm => 96 / 25.4 ≈ 3.78 px/mm)
  const setActualSize = () => {
    setIsAutoFit(false);
    setZoomScale(3.7795);
  };

  const cropLines = computeCropMarkLines(layout, config.cropMarks);
  const currentSlots = layout.pages[currentPage] || [];

  const sheetPixelW = layout.sheetWidthMm * zoomScale;
  const sheetPixelH = layout.sheetHeightMm * zoomScale;

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-900/40 overflow-hidden relative select-none">
      {/* Top Floating Control Bar */}
      <div className="no-print h-12 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-4 flex items-center justify-between text-xs text-neutral-300 z-20 shrink-0">
        {/* Pagination */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800 p-0.5">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-md hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 disabled:hover:bg-transparent"
              title="Pagina precedente"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-mono text-neutral-200 tabular-nums">
              Pagina {currentPage + 1} di {Math.max(1, layout.totalPages)}
            </span>
            <button
              type="button"
              disabled={currentPage >= layout.totalPages - 1}
              onClick={() => setCurrentPage((p) => Math.min(layout.totalPages - 1, p + 1))}
              className="p-1.5 rounded-md hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 disabled:hover:bg-transparent"
              title="Pagina successiva"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-neutral-400 text-[11px] ml-2">
            <span>
              Foglio {config.paperSize} ({layout.sheetWidthMm} × {layout.sheetHeightMm} mm)
            </span>
            <span className="text-neutral-600">·</span>
            <span>
              {layout.effectiveOrientation === 'portrait' ? 'Verticale' : 'Orizzontale'}
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-neutral-900 rounded-lg border border-neutral-800 p-0.5">
          <button
            type="button"
            onClick={() => setManualZoom(zoomScale * 0.85)}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300"
            title="Riduci zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 font-mono text-neutral-200 tabular-nums text-[11px] min-w-12 text-center">
            {Math.round((zoomScale / 3.7795) * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setManualZoom(zoomScale * 1.15)}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300"
            title="Aumenta zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />

          <button
            type="button"
            onClick={handleAutoFit}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              isAutoFit ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Adatta
          </button>

          <button
            type="button"
            onClick={setActualSize}
            className="px-2 py-1 rounded text-[11px] font-medium text-neutral-400 hover:text-white"
            title="Scala reale al 100% (300 DPI su schermo)"
          >
            1:1 Reale
          </button>
        </div>
      </div>

      {/* Main Preview Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 flex items-center justify-center relative bg-radial from-neutral-900/60 to-neutral-950"
      >
        <div className="inline-flex flex-col items-start relative transition-transform">
          {/* Top Ruler */}
          {showRulers && (
            <div className="flex items-end mb-1 ml-6">
              <Ruler
                orientation="horizontal"
                lengthMm={layout.sheetWidthMm}
                scale={zoomScale}
              />
            </div>
          )}

          <div className="inline-flex items-start">
            {/* Left Ruler */}
            {showRulers && (
              <div className="mr-1 mt-0">
                <Ruler
                  orientation="vertical"
                  lengthMm={layout.sheetHeightMm}
                  scale={zoomScale}
                />
              </div>
            )}

            {/* Paper Sheet Representation */}
            <div
              className="relative bg-white text-black shadow-2xl transition-all overflow-hidden"
              style={{
                width: `${sheetPixelW}px`,
                height: `${sheetPixelH}px`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Printable Margins Guide Box (Dashed cyan lines) */}
              {showMarginGuides && (
                <div
                  className="absolute pointer-events-none border border-dashed border-cyan-500/60 z-10"
                  style={{
                    left: `${layout.effectiveLeftMm * zoomScale}px`,
                    top: `${layout.effectiveTopMm * zoomScale}px`,
                    width: `${layout.gridWidthMm * zoomScale}px`,
                    height: `${layout.gridHeightMm * zoomScale}px`,
                  }}
                >
                  <span className="absolute -top-4 left-0 text-[9px] font-mono text-cyan-600 bg-white/90 px-1 rounded shadow-xs">
                    Area griglia stampabile
                  </span>
                </div>
              )}

              {/* Image Slots */}
              {currentSlots.map((slot) => {
                const xPx = slot.xMm * zoomScale;
                const yPx = slot.yMm * zoomScale;
                const wPx = slot.widthMm * zoomScale;
                const hPx = slot.heightMm * zoomScale;

                const hasImage = !!slot.image;
                const effectiveFit = slot.image?.fitMode || config.fitMode;

                let objectFitClass = 'object-cover';
                if (effectiveFit === 'contain') objectFitClass = 'object-contain';
                if (effectiveFit === 'fill') objectFitClass = 'object-fill';

                return (
                  <div
                    key={`${slot.pageIndex}-${slot.row}-${slot.col}`}
                    className="absolute bg-neutral-100 border border-neutral-300/80 overflow-hidden group flex items-center justify-center transition-colors"
                    style={{
                      left: `${xPx}px`,
                      top: `${yPx}px`,
                      width: `${wPx}px`,
                      height: `${hPx}px`,
                    }}
                  >
                    {hasImage ? (
                      <div className="w-full h-full relative overflow-hidden bg-white">
                        <img
                          src={slot.image!.url}
                          alt={slot.image!.name}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full ${objectFitClass}`}
                        />

                        {/* 3 Puntini con Menù a Discesa in alto a sinistra per scegliere l'adattamento (Cover, Contain, Stretch) */}
                        <div className="absolute top-1 left-1 z-30">
                          <FitDropdown
                            currentFit={effectiveFit}
                            onSelectFit={(mode) => onUpdateImageFitMode(slot.image!.id, mode)}
                            size="sm"
                          />
                        </div>

                        {/* Hover Overlay with info */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5 text-white pointer-events-none">
                          <span className="text-[10px] font-semibold truncate leading-tight">
                            {slot.image!.name}
                          </span>
                          <div className="flex items-center justify-between text-[9px] font-mono text-neutral-300">
                            <span>{config.imageWidthCm} × {config.imageHeightCm} cm</span>
                            <span className="uppercase text-indigo-300">{effectiveFit}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-400 p-2 text-center select-none">
                        <span className="text-[10px] font-mono text-neutral-400">
                          Slot #{slot.slotIndex + 1}
                        </span>
                        <span className="text-[9px] text-neutral-400">Vuoto</span>
                      </div>
                    )}

                    {/* Dimensions Badge */}
                    {showDimensionsBadge && (
                      <div
                        className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[8px] font-mono px-1 rounded pointer-events-none select-none tabular-nums"
                        style={{ fontSize: `${Math.max(7, Math.min(11, 9 * (zoomScale / 2)))}px` }}
                      >
                        {config.imageWidthCm}×{config.imageHeightCm} cm
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Vector SVG Crop Marks Overlay (Real-time Preview!) */}
              {config.cropMarks.enabled && cropLines.length > 0 && (
                <svg
                  className="absolute inset-0 pointer-events-none z-20"
                  width={sheetPixelW}
                  height={sheetPixelH}
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
                      strokeLinecap="square"
                    />
                  ))}
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Status Bar */}
      <div className="no-print h-9 bg-neutral-950 border-t border-neutral-800 px-4 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-neutral-300 font-medium">Anteprima di Stampa Attiva</span>
          </div>
          <span className="text-neutral-700">|</span>
          <span>
            {layout.slotsPerPage} immagini per foglio ({layout.cols} col × {layout.rows} righe)
          </span>
          <span className="text-neutral-700">|</span>
          <span>
            Spazio tra immagini: <strong className="text-neutral-300 font-mono">{config.gapXMm} mm</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {config.cropMarks.enabled ? (
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <Scissors className="w-3 h-3" />
              Segni di taglio attivi ({config.cropMarks.style})
            </span>
          ) : (
            <span className="text-neutral-500">Nessun segno di taglio</span>
          )}
          <span className="text-neutral-700">|</span>
          <span>
            PDF pronto per stampa 300 DPI
          </span>
        </div>
      </div>
    </div>
  );
};
