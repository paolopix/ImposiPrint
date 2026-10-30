import React, { useState } from 'react';
import { SheetSettings, PaperFormat, SheetOrientation, PhotoPosition } from '../types';
import { calculatePhotoGrid, downloadPdf, printPdf } from '../utils/pdfGenerator';
import { downloadFile } from '../utils/imageUtils';
import {
  Download,
  Printer,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  RotateCw,
} from 'lucide-react';

interface Props {
  croppedCanvas: HTMLCanvasElement | null;
  sheetSettings: SheetSettings;
  onSheetSettingsChange?: (s: SheetSettings) => void;
}

export const A5Preview: React.FC<Props> = ({
  croppedCanvas,
  sheetSettings,
  onSheetSettingsChange,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isLandscape = sheetSettings.orientation === 'landscape';
  const pageWidth = isLandscape ? sheetSettings.paperHeightMm : sheetSettings.paperWidthMm;
  const pageHeight = isLandscape ? sheetSettings.paperWidthMm : sheetSettings.paperHeightMm;

  const { positions } = calculatePhotoGrid(sheetSettings);
  const croppedDataUrl = croppedCanvas ? croppedCanvas.toDataURL('image/jpeg', 0.95) : null;

  const handleDownloadPdf = async () => {
    if (!croppedCanvas) return;
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 100)); // allow UI tick
      downloadPdf(croppedCanvas, sheetSettings);
      setSuccessToast(`PDF ${sheetSettings.paperFormat} scaricato con successo!`);
      setTimeout(() => setSuccessToast(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!croppedCanvas) return;
    setIsPrinting(true);
    try {
      printPdf(croppedCanvas, sheetSettings);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadSingle = () => {
    if (!croppedCanvas) return;
    const url = croppedCanvas.toDataURL('image/png');
    downloadFile(url, 'fototessera-35x45mm.png');
    setSuccessToast('Foto singola salvata in PNG!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const setPaperFormat = (format: PaperFormat) => {
    if (!onSheetSettingsChange) return;
    if (format === 'A5') {
      onSheetSettingsChange({
        ...sheetSettings,
        paperFormat: 'A5',
        paperWidthMm: 148,
        paperHeightMm: 210,
      });
    } else {
      onSheetSettingsChange({
        ...sheetSettings,
        paperFormat: 'A6',
        paperWidthMm: 105,
        paperHeightMm: 148,
        layout: '2x2', // 2x2 fits nicely on A6
      });
    }
  };

  const setOrientation = (orientation: SheetOrientation) => {
    if (!onSheetSettingsChange) return;
    onSheetSettingsChange({
      ...sheetSettings,
      orientation,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col justify-between h-full">
      {/* Header section with layout badges and quick toggles */}
      <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>
                Anteprima Foglio {sheetSettings.paperFormat} ({pageWidth} × {pageHeight} mm)
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              4 copie 35×45 mm • Distanza: {sheetSettings.spacingMm / 10} cm •{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {isLandscape ? 'Orizzontale' : 'Verticale'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              {sheetSettings.paperFormat}
            </span>
          </div>
        </div>

        {/* Quick Format & Orientation Switcher Bar */}
        {onSheetSettingsChange && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Format toggle: A5 vs A6 */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-[10px] font-semibold text-slate-500 px-1">Formato:</span>
              <button
                type="button"
                onClick={() => setPaperFormat('A5')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  sheetSettings.paperFormat === 'A5'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                A5
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('A6')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  sheetSettings.paperFormat === 'A6'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                A6
              </button>
            </div>

            {/* Orientation toggle: Verticale vs Orizzontale */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-[10px] font-semibold text-slate-500 px-1">Orientamento:</span>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  !isLandscape
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Verticale
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  isLandscape
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Orizzontale
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Sheet Container Viewport */}
      <div className="my-4 flex-1 flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden relative min-h-[340px]">
        {/* Realistic paper simulation */}
        <div
          className="relative bg-white shadow-2xl transition-all duration-300 border border-slate-300"
          style={{
            aspectRatio: `${pageWidth} / ${pageHeight}`,
            width: isLandscape ? '100%' : 'auto',
            height: isLandscape ? 'auto' : '100%',
            maxHeight: isLandscape ? '360px' : '440px',
            maxWidth: '100%',
          }}
        >
          {/* Subtle paper texture border */}
          <div className="absolute inset-0 pointer-events-none border border-slate-200/60" />

          {/* Render 4 Photos at calculated percentages of the page */}
          {positions.map((pos: PhotoPosition) => {
            const leftPct = (pos.x / pageWidth) * 100;
            const topPct = (pos.y / pageHeight) * 100;
            const widthPct = (pos.width / pageWidth) * 100;
            const heightPct = (pos.height / pageHeight) * 100;

            return (
              <div
                key={pos.index}
                className="absolute overflow-hidden"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {/* Photo image */}
                {croppedDataUrl ? (
                  <img
                    src={croppedDataUrl}
                    alt={`Foto ${pos.index + 1}`}
                    className="w-full h-full object-cover block"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                    35×45 mm
                  </div>
                )}

                {/* Subtle border around each photo ("leggero riquadro tutto attorno") */}
                {sheetSettings.showBorder && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      borderWidth: `${Math.max(1, Math.round(sheetSettings.borderWidthPt * 1.5))}px`,
                      borderStyle: 'solid',
                      borderColor: sheetSettings.borderColor,
                    }}
                  />
                )}

                {/* Corner cut mark indicators on preview */}
                {sheetSettings.showCropMarks && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-slate-400 pointer-events-none" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-slate-400 pointer-events-none" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-slate-400 pointer-events-none" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-slate-400 pointer-events-none" />
                  </>
                )}
              </div>
            );
          })}

          {/* Graphic ruler / dimension callout indicator between photo 1 and photo 2 */}
          {positions.length >= 2 && (
            <div
              className="absolute pointer-events-none flex flex-col items-center justify-center text-[9px] font-mono text-indigo-700 bg-indigo-50/95 px-1 py-0.5 rounded shadow-sm border border-indigo-200"
              style={{
                left: `${((positions[0].x + positions[0].width + sheetSettings.spacingMm / 2) / pageWidth) * 100}%`,
                top: `${((positions[0].y + positions[0].height / 2) / pageHeight) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span>{sheetSettings.spacingMm / 10} cm</span>
            </div>
          )}

          {/* Footer watermark note on the sheet */}
          <div className="absolute bottom-1.5 inset-x-0 text-center text-[7px] text-slate-400 pointer-events-none px-2 select-none truncate">
            Foglio {sheetSettings.paperFormat} ({pageWidth}×{pageHeight} mm) • 4 Foto 35×45 mm • Spaziatura {sheetSettings.spacingMm / 10} cm • Stampa 100%
          </div>
        </div>
      </div>

      {/* Success notification toast */}
      {successToast && (
        <div className="mb-3 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={!croppedCanvas || isExporting}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-[0.99]"
        >
          <Download className="w-4 h-4" />
          <span>
            {isExporting
              ? 'Generazione PDF in corso...'
              : `Scarica PDF (Foglio ${sheetSettings.paperFormat} ${isLandscape ? 'Orizzontale' : 'Verticale'})`}
          </span>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!croppedCanvas || isPrinting}
            className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Stampa Diretta</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSingle}
            disabled={!croppedCanvas}
            title="Scarica singola fototessera 35x45 in alta risoluzione PNG"
            className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto Singola (PNG)</span>
          </button>
        </div>

        {/* Essential printing advice */}
        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
          💡 Nella finestra di stampa seleziona <strong className="text-slate-700 dark:text-slate-200">Dimensioni effettive / Scala 100%</strong> per preservare i 35×45 mm esatti su carta {sheetSettings.paperFormat}.
        </p>
      </div>
    </div>
  );
};
