import React from 'react';
import { Printer, Download, Sparkles, FolderHeart } from 'lucide-react';

interface HeaderProps {
  onDirectPrint: () => void;
  onExportPdf: () => void;
  isExporting: boolean;
  exportProgress: number;
  exportStatus: string;
  onOpenPresets: () => void;
  activeView: 'editor' | 'images';
  setActiveView: (view: 'editor' | 'images') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onDirectPrint,
  onExportPdf,
  isExporting,
  exportProgress,
  exportStatus,
  onOpenPresets,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="no-print h-16 border-b border-neutral-800 bg-neutral-950 px-6 flex items-center justify-between gap-8 z-30 shrink-0">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
          <Printer className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white">
            ImposiPrint
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links / View Switcher */}
      <nav className="hidden md:flex items-center gap-1 bg-neutral-900/90 p-1 rounded-lg border border-neutral-800 shrink-0">
        <button
          type="button"
          onClick={() => setActiveView('editor')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'editor'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Anteprima & Parametri
        </button>
        <button
          type="button"
          onClick={() => setActiveView('images')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'images'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Galleria & Copie
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <FolderHeart className="w-3.5 h-3.5 text-indigo-400" />
          <span>Preset di Stampa</span>
        </button>

        <button
          type="button"
          onClick={onDirectPrint}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-neutral-300" />
          <span>Stampa Diretta</span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/60 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? `PDF (${exportProgress}%)` : 'Esporta PDF'}</span>
        </button>
      </div>

      {/* Modal/Banner for exporting progress if in progress */}
      {isExporting && (
        <div className="fixed top-18 right-6 bg-neutral-900 border border-neutral-700 shadow-xl rounded-lg p-3 text-xs z-50 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-200">{exportStatus}</span>
            <div className="w-40 h-1.5 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
