import React, { useState } from 'react';
import {
  FileText,
  Maximize2,
  Scissors,
  Sliders,
  Lock,
  Unlock,
  RotateCw,
  Sparkles,
  HelpCircle,
  Eye,
  Crop,
  Layers,
  ArrowRight,
  BookmarkPlus
} from 'lucide-react';
import {
  CropMarkStyle,
  FitMode,
  LayoutConfig,
  Orientation,
  PaperSize,
} from '../types';
import { PAPER_SIZES, QUICK_IMAGE_SIZES } from '../constants';
import { ComputedLayout } from '../types';

interface SidebarControlsProps {
  config: LayoutConfig;
  onChangeConfig: (newConfig: LayoutConfig) => void;
  layout: ComputedLayout;
  onOpenSavePresetModal: () => void;
  showRulers: boolean;
  setShowRulers: (show: boolean) => void;
  showMarginGuides: boolean;
  setShowMarginGuides: (show: boolean) => void;
  showDimensionsBadge: boolean;
  setShowDimensionsBadge: (show: boolean) => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  config,
  onChangeConfig,
  layout,
  onOpenSavePresetModal,
  showRulers,
  setShowRulers,
  showMarginGuides,
  setShowMarginGuides,
  showDimensionsBadge,
  setShowDimensionsBadge,
}) => {
  const [activeTab, setActiveTab] = useState<'paper' | 'images' | 'margins' | 'cuts'>('paper');

  const updateConfig = (patch: Partial<LayoutConfig>) => {
    onChangeConfig({
      ...config,
      ...patch,
    });
  };

  const handlePaperSizeChange = (size: PaperSize) => {
    updateConfig({ paperSize: size });
  };

  const handleOrientationChange = (orientation: Orientation) => {
    updateConfig({ orientation });
  };

  const handleImageWidthChange = (valCm: number) => {
    const newW = Math.max(0.5, valCm);
    if (config.lockAspectRatio && config.imageWidthCm > 0) {
      const ratio = config.imageHeightCm / config.imageWidthCm;
      updateConfig({
        imageWidthCm: Number(newW.toFixed(2)),
        imageHeightCm: Number((newW * ratio).toFixed(2)),
      });
    } else {
      updateConfig({ imageWidthCm: Number(newW.toFixed(2)) });
    }
  };

  const handleImageHeightChange = (valCm: number) => {
    const newH = Math.max(0.5, valCm);
    if (config.lockAspectRatio && config.imageHeightCm > 0) {
      const ratio = config.imageWidthCm / config.imageHeightCm;
      updateConfig({
        imageHeightCm: Number(newH.toFixed(2)),
        imageWidthCm: Number((newH * ratio).toFixed(2)),
      });
    } else {
      updateConfig({ imageHeightCm: Number(newH.toFixed(2)) });
    }
  };

  const handleMarginChange = (side: 'top' | 'bottom' | 'left' | 'right', valMm: number) => {
    const safeMm = Math.max(0, valMm);
    if (config.linkMargins) {
      updateConfig({
        margins: {
          top: safeMm,
          bottom: safeMm,
          left: safeMm,
          right: safeMm,
        },
      });
    } else {
      updateConfig({
        margins: {
          ...config.margins,
          [side]: safeMm,
        },
      });
    }
  };

  const handleGapChange = (axis: 'gapXMm' | 'gapYMm', valMm: number) => {
    const safeMm = Math.max(0, valMm);
    if (config.linkGaps) {
      updateConfig({
        gapXMm: safeMm,
        gapYMm: safeMm,
      });
    } else {
      updateConfig({
        [axis]: safeMm,
      });
    }
  };

  return (
    <aside className="no-print w-80 lg:w-96 bg-neutral-950 border-r border-neutral-800 flex flex-col h-[calc(100vh-4rem)] select-none shrink-0 overflow-hidden">
      {/* Tab Navigation */}
      <div className="grid grid-cols-4 p-2 bg-neutral-900 border-b border-neutral-800 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('paper')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'paper'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 mb-1 text-indigo-400" />
          <span className="truncate">Foglio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('images')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'images'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Maximize2 className="w-4 h-4 mb-1 text-emerald-400" />
          <span className="truncate">Misure</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('margins')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'margins'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4 mb-1 text-amber-400" />
          <span className="truncate">Margini</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cuts')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'cuts'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Scissors className="w-4 h-4 mb-1 text-rose-400" />
          <span className="truncate">Taglio</span>
        </button>
      </div>

      {/* Capacity & Distribution Summary Badge */}
      <div className="p-3 bg-neutral-900/60 border-b border-neutral-800 text-xs">
        <div className="flex items-center justify-between text-neutral-300 mb-1">
          <span className="font-medium text-neutral-400">Capacità foglio:</span>
          <span className="font-bold text-white font-mono tabular-nums">
            {layout.slotsPerPage} {layout.slotsPerPage === 1 ? 'immagine' : 'immagini'}
          </span>
        </div>
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>
            Griglia: <strong className="text-neutral-200 font-mono">{layout.cols} col × {layout.rows} righe</strong>
          </span>
          <span>
            Resa carta: <strong className="text-emerald-400 font-mono">{layout.efficiencyPercent}%</strong>
          </span>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-neutral-300">
        {/* ================= TAB 1: FOGLIO & ORIENTAMENTO ================= */}
        {activeTab === 'paper' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                Formato Carta
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['A6', 'A5', 'A4', 'A3'] as PaperSize[]).map((size) => {
                  const dims = PAPER_SIZES[size as keyof typeof PAPER_SIZES];
                  const isSelected = config.paperSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handlePaperSizeChange(size)}
                      className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-xs'
                          : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      <span className="font-bold text-sm">{size}</span>
                      <span className="text-[10px] text-neutral-400 font-mono tabular-nums mt-0.5">
                        {dims.widthMm}×{dims.heightMm} mm
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                Orientamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOrientationChange('portrait')}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
                    config.orientation === 'portrait'
                      ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                      : 'border-neutral-800 bg-neutral-900/70 text-neutral-400 hover:bg-neutral-900'
                  }`}
                >
                  Verticale
                </button>
                <button
                  type="button"
                  onClick={() => handleOrientationChange('landscape')}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
                    config.orientation === 'landscape'
                      ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                      : 'border-neutral-800 bg-neutral-900/70 text-neutral-400 hover:bg-neutral-900'
                  }`}
                >
                  Orizzontale
                </button>
                <button
                  type="button"
                  onClick={() => handleOrientationChange('auto')}
                  className={`py-2 px-2 rounded-lg border text-center transition-all relative ${
                    config.orientation === 'auto'
                      ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                      : 'border-neutral-800 bg-neutral-900/70 text-neutral-400 hover:bg-neutral-900'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Auto Ottimale
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                {config.orientation === 'auto'
                  ? `Modalità automatica attiva: selezionato orientamento ${
                      layout.effectiveOrientation === 'portrait' ? 'Verticale' : 'Orizzontale'
                    } per massimizzare il numero di immagini.`
                  : 'L\'orientamento determina la direzione del foglio di stampa.'}
              </p>
            </div>

            {/* Custom dimensions if needed */}
            <div className="pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() =>
                  updateConfig({
                    paperSize: config.paperSize === 'custom' ? 'A4' : 'custom',
                  })
                }
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>
                  {config.paperSize === 'custom'
                    ? '← Torna ai formati standard (A6, A5, A4, A3)'
                    : 'Personalizza dimensioni foglio in mm...'}
                </span>
              </button>

              {config.paperSize === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Larghezza (mm)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={1000}
                      value={config.customPaperWidthMm}
                      onChange={(e) =>
                        updateConfig({ customPaperWidthMm: Number(e.target.value) })
                      }
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Altezza (mm)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={1000}
                      value={config.customPaperHeightMm}
                      onChange={(e) =>
                        updateConfig({ customPaperHeightMm: Number(e.target.value) })
                      }
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action to Save Preset */}
            <div className="pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={onOpenSavePresetModal}
                className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-indigo-500/50 text-neutral-200 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Salva questa configurazione come Preset</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MISURE IMMAGINI & SPAZIO ================= */}
        {activeTab === 'images' && (
          <div className="space-y-5">
            {/* Quick Size Presets */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                Formati Comuni Immagine
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_IMAGE_SIZES.map((qs) => {
                  const isMatch =
                    Math.abs(config.imageWidthCm - qs.widthCm) < 0.05 &&
                    Math.abs(config.imageHeightCm - qs.heightCm) < 0.05;
                  return (
                    <button
                      key={qs.label}
                      type="button"
                      onClick={() =>
                        updateConfig({
                          imageWidthCm: qs.widthCm,
                          imageHeightCm: qs.heightCm,
                        })
                      }
                      className={`text-left p-2 rounded-md border text-[11px] transition-all ${
                        isMatch
                          ? 'border-emerald-500 bg-emerald-950/30 text-white font-semibold'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-850'
                      }`}
                    >
                      <div className="truncate">{qs.label.split('(')[0].trim()}</div>
                      <div className="font-mono text-neutral-400 text-[10px]">
                        {qs.widthCm} × {qs.heightCm} cm
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Size Inputs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Misure Singola Immagine (cm)
                </label>
                <button
                  type="button"
                  onClick={() => updateConfig({ lockAspectRatio: !config.lockAspectRatio })}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  title="Blocca proporzioni"
                >
                  {config.lockAspectRatio ? (
                    <>
                      <Lock className="w-3 h-3 text-indigo-400" />
                      <span className="text-indigo-400">Bloccate</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-neutral-400" />
                      <span>Sbloccate</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Base (cm)</span>
                    <span className="font-mono text-neutral-300">{config.imageWidthCm} cm</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="100"
                    value={config.imageWidthCm}
                    onChange={(e) => handleImageWidthChange(parseFloat(e.target.value) || 1)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-white font-mono text-xs"
                  />
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.1"
                    value={config.imageWidthCm}
                    onChange={(e) => handleImageWidthChange(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Altezza (cm)</span>
                    <span className="font-mono text-neutral-300">{config.imageHeightCm} cm</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="100"
                    value={config.imageHeightCm}
                    onChange={(e) => handleImageHeightChange(parseFloat(e.target.value) || 1)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-white font-mono text-xs"
                  />
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.1"
                    value={config.imageHeightCm}
                    onChange={(e) => handleImageHeightChange(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Spaziatura tra immagini (Gap) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Spazio tra Immagini (mm)
                </label>
                <button
                  type="button"
                  onClick={() => updateConfig({ linkGaps: !config.linkGaps })}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                >
                  {config.linkGaps ? (
                    <>
                      <Lock className="w-3 h-3 text-indigo-400" />
                      <span className="text-indigo-400">Uniforme</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-neutral-400" />
                      <span>X / Y separati</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>{config.linkGaps ? 'Spazio (mm)' : 'Spazio Orizzontale X (mm)'}</span>
                    <span className="font-mono text-white tabular-nums">{config.gapXMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={config.gapXMm}
                    onChange={(e) => handleGapChange('gapXMm', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {!config.linkGaps && (
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Spazio Verticale Y (mm)</span>
                      <span className="font-mono text-white tabular-nums">{config.gapYMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="0.5"
                      value={config.gapYMm}
                      onChange={(e) => handleGapChange('gapYMm', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {[0, 2, 4, 6, 10].map((quickGap) => (
                    <button
                      key={quickGap}
                      type="button"
                      onClick={() => {
                        updateConfig({
                          gapXMm: quickGap,
                          gapYMm: quickGap,
                        });
                      }}
                      className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-mono text-neutral-300"
                    >
                      {quickGap} mm
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modalità di Adattamento Immagine */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                Adattamento Immagine
              </label>
              <div className="space-y-2">
                {[
                  {
                    mode: 'cover' as FitMode,
                    title: 'Ritagliate (Cover)',
                    desc: 'Riempe completamente l\'area indicata, ritagliando le parti in eccedenza per mantenere la proporzione.',
                  },
                  {
                    mode: 'contain' as FitMode,
                    title: 'Mantenute in proporzione (Contain)',
                    desc: 'Visualizza l\'intera immagine senza alcun taglio, aggiungendo sfondo bianco se necessario.',
                  },
                  {
                    mode: 'fill' as FitMode,
                    title: 'Riempire lo spazio (Stretch)',
                    desc: 'Stira e adatta esattamente l\'immagine ai centimetri indicati.',
                  },
                ].map((item) => {
                  const isSelected = config.fitMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => updateConfig({ fitMode: item.mode })}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/30'
                          : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-850'
                      }`}
                    >
                      <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-neutral-600'}`} />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 pl-3.5 leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: MARGINI ================= */}
        {activeTab === 'margins' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Margini del Foglio (mm)
                </label>
                <button
                  type="button"
                  onClick={() => updateConfig({ linkMargins: !config.linkMargins })}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                >
                  {config.linkMargins ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400">Uniformi</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-neutral-400" />
                      <span>Indipendenti</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 space-y-3">
                {config.linkMargins ? (
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Tutti i margini</span>
                      <span className="font-mono text-white tabular-nums">
                        {config.margins.top} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={config.margins.top}
                      onChange={(e) => handleMarginChange('top', parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Superiore</span>
                        <span className="font-mono text-white">{config.margins.top} mm</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.margins.top}
                        onChange={(e) => handleMarginChange('top', parseFloat(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Inferiore</span>
                        <span className="font-mono text-white">{config.margins.bottom} mm</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.margins.bottom}
                        onChange={(e) => handleMarginChange('bottom', parseFloat(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Sinistro</span>
                        <span className="font-mono text-white">{config.margins.left} mm</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.margins.left}
                        onChange={(e) => handleMarginChange('left', parseFloat(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Destro</span>
                        <span className="font-mono text-white">{config.margins.right} mm</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.margins.right}
                        onChange={(e) => handleMarginChange('right', parseFloat(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {[0, 5, 10, 15, 20].map((quickM) => (
                    <button
                      key={quickM}
                      type="button"
                      onClick={() => {
                        updateConfig({
                          margins: { top: quickM, bottom: quickM, left: quickM, right: quickM },
                        });
                      }}
                      className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-mono text-neutral-300"
                    >
                      {quickM} mm
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Auto-Centratura Griglia */}
            <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoCenter}
                  onChange={(e) => updateConfig({ autoCenter: e.target.checked })}
                  className="mt-0.5 accent-indigo-500 rounded"
                />
                <div>
                  <span className="font-semibold text-neutral-200">
                    Centra griglia automaticamente nel foglio
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Distribuisce lo spazio residuo equamente su tutti i lati per garantire simmetria perfetta.
                  </p>
                </div>
              </label>
            </div>

            {/* Visual Guide Toggles */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                Guide a Schermo
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                  <span className="text-neutral-300">Righelli Centimetrici (in alto e a sinistra)</span>
                  <input
                    type="checkbox"
                    checked={showRulers}
                    onChange={(e) => setShowRulers(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                  <span className="text-neutral-300">Guide Margine Stampabile (linea tratteggiata)</span>
                  <input
                    type="checkbox"
                    checked={showMarginGuides}
                    onChange={(e) => setShowMarginGuides(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                  <span className="text-neutral-300">Etichette Dimensioni Immagini</span>
                  <input
                    type="checkbox"
                    checked={showDimensionsBadge}
                    onChange={(e) => setShowDimensionsBadge(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SEGNI DI TAGLIO (CROP MARKS) ================= */}
        {activeTab === 'cuts' && (
          <div className="space-y-5">
            {/* Enable Crop Marks */}
            <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-neutral-200 text-sm">
                    Segni di Taglio Attivi
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Linee e crocette di guida per taglierina o forbici
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.cropMarks.enabled}
                  onChange={(e) =>
                    updateConfig({
                      cropMarks: {
                        ...config.cropMarks,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-rose-500 rounded"
                />
              </label>
            </div>

            {config.cropMarks.enabled && (
              <>
                {/* Crop Mark Styles */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                    Stile Segni di Taglio
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        style: 'corners' as CropMarkStyle,
                        title: 'Angolari Classici (L-Crocette)',
                        desc: 'Trattini esterni ai quattro angoli di ogni immagine con offset di sicurezza.',
                      },
                      {
                        style: 'perimeter' as CropMarkStyle,
                        title: 'Trattini Perimetrali nei Margini',
                        desc: 'Segni sui bordi esterni del foglio, ideali per taglio continuato con taglierina a leva.',
                      },
                      {
                        style: 'crosses' as CropMarkStyle,
                        title: 'Crocette d\'Intersezione',
                        desc: 'Piccole croci di posizionamento alle intersezioni della griglia.',
                      },
                      {
                        style: 'grid' as CropMarkStyle,
                        title: 'Linee Guida Sottili Complete',
                        desc: 'Linee continue sottili lungo tutti gli assi di taglio.',
                      },
                    ].map((item) => {
                      const isSelected = config.cropMarks.style === item.style;
                      return (
                        <button
                          key={item.style}
                          type="button"
                          onClick={() =>
                            updateConfig({
                              cropMarks: {
                                ...config.cropMarks,
                                style: item.style,
                              },
                            })
                          }
                          className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-rose-500 bg-rose-950/30'
                              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-850'
                          }`}
                        >
                          <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-rose-400' : 'bg-neutral-600'
                              }`}
                            />
                            <span>{item.title}</span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1 pl-3.5 leading-snug">
                            {item.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mark Dimensions */}
                <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Lunghezza Trattino (mm)</span>
                      <span className="font-mono text-white tabular-nums">
                        {config.cropMarks.lengthMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      step="0.5"
                      value={config.cropMarks.lengthMm}
                      onChange={(e) =>
                        updateConfig({
                          cropMarks: {
                            ...config.cropMarks,
                            lengthMm: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-rose-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Distanza dall'immagine / Offset (mm)</span>
                      <span className="font-mono text-white tabular-nums">
                        {config.cropMarks.offsetMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={config.cropMarks.offsetMm}
                      onChange={(e) =>
                        updateConfig({
                          cropMarks: {
                            ...config.cropMarks,
                            offsetMm: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-rose-500"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      0 mm = a filo con l'immagine; 1.5 - 2 mm = distanziato per non incidere la stampa.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Spessore Linea (mm)</span>
                      <span className="font-mono text-white tabular-nums">
                        {config.cropMarks.lineWidthMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={config.cropMarks.lineWidthMm}
                      onChange={(e) =>
                        updateConfig({
                          cropMarks: {
                            ...config.cropMarks,
                            lineWidthMm: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-rose-500"
                    />
                  </div>

                  {/* Mark Color */}
                  <div>
                    <span className="block text-[11px] text-neutral-400 mb-1.5">
                      Colore Segni di Taglio
                    </span>
                    <div className="flex items-center gap-2">
                      {[
                        { label: 'Nero', hex: '#000000' },
                        { label: 'Grigio Scuro', hex: '#4b5563' },
                        { label: 'Grigio Chiaro', hex: '#9ca3af' },
                        { label: 'Rosso Guida', hex: '#e11d48' },
                        { label: 'Blu Ciano', hex: '#0284c7' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() =>
                            updateConfig({
                              cropMarks: {
                                ...config.cropMarks,
                                color: c.hex,
                              },
                            })
                          }
                          className={`w-7 h-7 rounded-md border flex items-center justify-center transition-transform ${
                            config.cropMarks.color === c.hex
                              ? 'border-white scale-110 shadow-sm'
                              : 'border-neutral-700 opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
