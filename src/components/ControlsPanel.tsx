import React, { useState } from 'react';
import {
  CropTransform,
  ImageAdjustments,
  BiometricGuideSettings,
  SheetSettings,
} from '../types';
import {
  ZoomIn,
  RotateCw,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Sliders,
  Sun,
  Eye,
  FileText,
  FlipHorizontal,
  Undo2,
  Check,
} from 'lucide-react';

interface Props {
  transform: CropTransform;
  onTransformChange: (t: CropTransform) => void;
  adjustments: ImageAdjustments;
  onAdjustmentsChange: (a: ImageAdjustments) => void;
  guides: BiometricGuideSettings;
  onGuidesChange: (g: BiometricGuideSettings) => void;
  sheetSettings: SheetSettings;
  onSheetSettingsChange: (s: SheetSettings) => void;
  onCenter: () => void;
  onFit: () => void;
  onReset: () => void;
}

export const ControlsPanel: React.FC<Props> = ({
  transform,
  onTransformChange,
  adjustments,
  onAdjustmentsChange,
  guides,
  onGuidesChange,
  sheetSettings,
  onSheetSettingsChange,
  onCenter,
  onFit,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'transform' | 'image' | 'guides' | 'sheet'>('transform');

  // Nudge position with arrow buttons
  const nudge = (dx: number, dy: number) => {
    onTransformChange({
      ...transform,
      x: transform.x + dx,
      y: transform.y + dy,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('transform')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'transform'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Posizione</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'image'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Regola Foto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guides')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'guides'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Guide Biometriche</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheet')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'sheet'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Foglio A5</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
        {/* TAB 1: TRASFORMAZIONE E POSIZIONE (SCALA, RUOTA, CENTRA 35x45 mm) */}
        {activeTab === 'transform' && (
          <div className="space-y-5">
            {/* Zoom / Scala */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-semibold">
                  <ZoomIn className="w-3.5 h-3.5 text-indigo-500" />
                  Scala / Zoom
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded text-[11px]">
                  {Math.round(transform.scale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.01"
                  value={transform.scale}
                  onChange={(e) =>
                    onTransformChange({ ...transform, scale: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={onFit}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Adatta al riquadro
                </button>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onTransformChange({
                        ...transform,
                        scale: Math.max(0.1, parseFloat((transform.scale - 0.1).toFixed(2))),
                      })
                    }
                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    -10%
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onTransformChange({
                        ...transform,
                        scale: Math.min(4.0, parseFloat((transform.scale + 0.1).toFixed(2))),
                      })
                    }
                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    +10%
                  </button>
                </div>
              </div>
            </div>

            {/* Rotazione Fine */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-semibold">
                  <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                  Rotazione fine
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded text-[11px]">
                    {transform.rotation.toFixed(1)}°
                  </span>
                  {transform.rotation !== 0 && (
                    <button
                      type="button"
                      onClick={() => onTransformChange({ ...transform, rotation: 0 })}
                      className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Azzera
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="0.2"
                value={transform.rotation}
                onChange={(e) =>
                  onTransformChange({ ...transform, rotation: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>-45°</span>
                <span>0° (Dritto)</span>
                <span>+45°</span>
              </div>
            </div>

            {/* Rotazione Rapida e Riflessione */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  let r = (transform.rotation - 90) % 360;
                  if (r < -180) r += 360;
                  onTransformChange({ ...transform, rotation: r });
                }}
                className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-90°</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  let r = (transform.rotation + 90) % 360;
                  if (r > 180) r -= 360;
                  onTransformChange({ ...transform, rotation: r });
                }}
                className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onTransformChange({
                    ...transform,
                    flipHorizontal: !transform.flipHorizontal,
                  })
                }
                className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                  transform.flipHorizontal
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
                title="Rifletti orizzontalmente (Specchio)"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Specchia</span>
              </button>
            </div>

            {/* D-Pad e Centratura */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Regolazione Fine Posizione
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  X: {transform.x}px • Y: {transform.y}px
                </span>
              </div>

              <div className="flex items-center justify-center gap-4">
                {/* D-Pad 4-way arrows */}
                <div className="grid grid-cols-3 gap-1 w-28">
                  <div />
                  <button
                    type="button"
                    onClick={() => nudge(0, -3)}
                    title="Sposta in alto"
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <div />

                  <button
                    type="button"
                    onClick={() => nudge(-3, 0)}
                    title="Sposta a sinistra"
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onCenter}
                    title="Centra perfettamente nel riquadro 35x45"
                    className="p-2 bg-emerald-100 dark:bg-emerald-950/50 hover:bg-emerald-200 text-emerald-700 dark:text-emerald-300 rounded flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => nudge(3, 0)}
                    title="Sposta a destra"
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div />
                  <button
                    type="button"
                    onClick={() => nudge(0, 3)}
                    title="Sposta in basso"
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <div />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onCenter}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Centra nel riquadro</span>
                  </button>
                  <button
                    type="button"
                    onClick={onReset}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Reimposta tutto</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGOLAZIONE FOTO (LUMINOSITÀ, CONTRASTO, SATURAZIONE) */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Luminosità e Correzione Colore
            </span>

            {/* Luminosità */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Luminosità</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="140"
                value={adjustments.brightness}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, brightness: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Contrasto */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Contrasto</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="140"
                value={adjustments.contrast}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, contrast: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Saturazione */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Saturazione colori</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{adjustments.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={adjustments.saturation}
                onChange={(e) =>
                  onAdjustmentsChange({ ...adjustments, saturation: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Bianco e nero */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <span>Converti in Bianco e Nero</span>
                <input
                  type="checkbox"
                  checked={adjustments.grayscale}
                  onChange={(e) =>
                    onAdjustmentsChange({ ...adjustments, grayscale: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Reset filtri */}
            <button
              type="button"
              onClick={() =>
                onAdjustmentsChange({
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  grayscale: false,
                })
              }
              className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Reimposta filtri colore a 100%
            </button>
          </div>
        )}

        {/* TAB 3: GUIDE BIOMETRICHE FOTOTESSERA */}
        {activeTab === 'guides' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/80 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Linee Guida ICAO / CIE Passaporto
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Il volto deve occupare il 70-80% dell'altezza (32-36 mm da mento alla sommità del capo)
                e gli occhi devono essere centrati sulla linea orizzontale.
              </p>
            </div>

            {/* Master toggle */}
            <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Mostra tutte le guide biometriche
              </span>
              <input
                type="checkbox"
                checked={guides.showGuides}
                onChange={(e) => onGuidesChange({ ...guides, showGuides: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            {guides.showGuides && (
              <div className="space-y-2.5 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span>Sagoma ovale viso (70-80% altezza)</span>
                  <input
                    type="checkbox"
                    checked={guides.showFaceOval}
                    onChange={(e) =>
                      onGuidesChange({ ...guides, showFaceOval: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span>Linea livello occhi (centratura)</span>
                  <input
                    type="checkbox"
                    checked={guides.showEyeLine}
                    onChange={(e) =>
                      onGuidesChange({ ...guides, showEyeLine: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span>Asse di simmetria verticale</span>
                  <input
                    type="checkbox"
                    checked={guides.showCenterLine}
                    onChange={(e) =>
                      onGuidesChange({ ...guides, showCenterLine: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span>Griglia regola dei terzi</span>
                  <input
                    type="checkbox"
                    checked={guides.showThirdsGrid}
                    onChange={(e) =>
                      onGuidesChange({ ...guides, showThirdsGrid: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IMPOSTAZIONI FOGLIO A5 / A6 & RIQUADRO */}
        {activeTab === 'sheet' && (
          <div className="space-y-4">
            {/* Scelta Formato Carta (A5 vs A6) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Formato Carta
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onSheetSettingsChange({
                      ...sheetSettings,
                      paperFormat: 'A5',
                      paperWidthMm: 148,
                      paperHeightMm: 210,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    sheetSettings.paperFormat === 'A5'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Formato A5</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-200">
                      Standard
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    148 × 210 mm
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSheetSettingsChange({
                      ...sheetSettings,
                      paperFormat: 'A6',
                      paperWidthMm: 105,
                      paperHeightMm: 148,
                      layout: '2x2', // 2x2 fits nicely within A6
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    sheetSettings.paperFormat === 'A6'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Formato A6</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900/60 rounded text-indigo-700 dark:text-indigo-300">
                      Compatto
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    105 × 148 mm
                  </p>
                </button>
              </div>
            </div>

            {/* Scelta Orientamento (Verticale vs Orizzontale) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Orientamento Foglio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onSheetSettingsChange({
                      ...sheetSettings,
                      orientation: 'portrait',
                    })
                  }
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    sheetSettings.orientation === 'portrait'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-3.5 h-4.5 border-2 border-current rounded-xs inline-block" />
                  <span className="text-xs">Verticale</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSheetSettingsChange({
                      ...sheetSettings,
                      orientation: 'landscape',
                    })
                  }
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    sheetSettings.orientation === 'landscape'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-4.5 h-3.5 border-2 border-current rounded-xs inline-block" />
                  <span className="text-xs">Orizzontale</span>
                </button>
              </div>
            </div>

            {/* Riepilogo foglio */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Formato e Misure:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {sheetSettings.paperFormat} (
                  {sheetSettings.orientation === 'landscape'
                    ? `${sheetSettings.paperHeightMm} × ${sheetSettings.paperWidthMm}`
                    : `${sheetSettings.paperWidthMm} × ${sheetSettings.paperHeightMm}`}{' '}
                  mm)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Orientamento:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                  {sheetSettings.orientation === 'landscape' ? 'Orizzontale' : 'Verticale'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dimensioni Foto:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">35 × 45 mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Numero di Copie:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">4 Foto</span>
              </div>
            </div>

            {/* Distanza tra le foto (richiesto esplicitamente 1 cm) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Distanziamento tra foto</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {sheetSettings.spacingMm / 10} cm ({sheetSettings.spacingMm} mm)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={sheetSettings.spacingMm}
                onChange={(e) =>
                  onSheetSettingsChange({
                    ...sheetSettings,
                    spacingMm: parseInt(e.target.value, 10),
                  })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0.5 cm</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">1 cm (Predefinito)</span>
                <span>2.5 cm</span>
              </div>
            </div>

            {/* Leggero riquadro tutto attorno (richiesto esplicitamente) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <span>Leggero riquadro attorno a ogni foto</span>
                <input
                  type="checkbox"
                  checked={sheetSettings.showBorder}
                  onChange={(e) =>
                    onSheetSettingsChange({
                      ...sheetSettings,
                      showBorder: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {sheetSettings.showBorder && (
                <div className="space-y-3 pl-2">
                  {/* Spessore bordo */}
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Spessore riquadro</span>
                    <div className="flex gap-2">
                      {[
                        { label: 'Sottilissimo (0.25 pt)', val: 0.25 },
                        { label: 'Leggero (0.5 pt)', val: 0.5 },
                        { label: 'Marcato (1.0 pt)', val: 1.0 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() =>
                            onSheetSettingsChange({
                              ...sheetSettings,
                              borderWidthPt: item.val,
                            })
                          }
                          className={`flex-1 py-1.5 px-2 text-[11px] rounded-lg border transition-all cursor-pointer ${
                            sheetSettings.borderWidthPt === item.val
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colore bordo */}
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Colore del riquadro</span>
                    <div className="flex items-center gap-2">
                      {[
                        { label: 'Grigio chiaro', color: '#9ca3af' },
                        { label: 'Grigio medio', color: '#64748b' },
                        { label: 'Nero', color: '#1e293b' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() =>
                            onSheetSettingsChange({
                              ...sheetSettings,
                              borderColor: c.color,
                            })
                          }
                          className={`flex-1 py-1 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            sheetSettings.borderColor === c.color
                              ? 'border-indigo-600 font-medium'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-slate-300"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="text-[11px] text-slate-700 dark:text-slate-300">
                            {c.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Crocini di taglio */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <span>Segni di ritaglio per forbici (crocini)</span>
                <input
                  type="checkbox"
                  checked={sheetSettings.showCropMarks}
                  onChange={(e) =>
                    onSheetSettingsChange({
                      ...sheetSettings,
                      showCropMarks: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Aggiunge piccoli tratti guida agli angoli per facilitare il ritaglio dritto.
              </p>
            </div>

            {/* Disposizione */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
                Disposizione 4 copie
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: '2x2', label: 'Griglia 2×2 (Consigliata)', disabled: false },
                  {
                    id: 'row',
                    label: 'In linea orizzontale',
                    disabled: sheetSettings.paperFormat === 'A6',
                  },
                  {
                    id: 'column',
                    label: 'In colonna verticale',
                    disabled: sheetSettings.paperFormat === 'A6',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.disabled}
                    onClick={() =>
                      onSheetSettingsChange({
                        ...sheetSettings,
                        layout: item.id as '2x2' | 'row' | 'column',
                      })
                    }
                    className={`p-2 rounded-lg text-[11px] text-center border transition-all ${
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                        : sheetSettings.layout === item.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold cursor-pointer'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer'
                    }`}
                  >
                    {item.label}
                    {item.disabled && (
                      <span className="block text-[9px] text-slate-400">Non entra in A6</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
