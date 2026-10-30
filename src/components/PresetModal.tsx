import React, { useState } from 'react';
import {
  X,
  BookmarkPlus,
  Check,
  Trash2,
  FolderHeart,
  FileText,
  Sliders,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { LayoutConfig, PrintPreset } from '../types';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: LayoutConfig;
  presets: PrintPreset[];
  onApplyPreset: (preset: PrintPreset) => void;
  onSavePreset: (name: string, description: string) => void;
  onDeletePreset: (id: string) => void;
  defaultMode?: 'list' | 'save';
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  presets,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  defaultMode = 'list',
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'save'>(defaultMode);
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    onSavePreset(presetName.trim(), presetDesc.trim());
    setPresetName('');
    setPresetDesc('');
    setActiveTab('list');
  };

  const handleApply = (preset: PrintPreset) => {
    onApplyPreset(preset);
    setAppliedId(preset.id);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400">
              <FolderHeart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Preset di Stampa</h2>
              <p className="text-xs text-neutral-400">
                Salva e carica configurazioni complete di foglio, margini e misure
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-6 pt-3 flex gap-4 border-b border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 font-medium transition-colors border-b-2 ${
              activeTab === 'list'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Libreria Preset ({presets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('save')}
            className={`pb-2.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'save'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Salva Configurazione Attuale</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              {presets.map((preset) => {
                const isSelected = appliedId === preset.id;
                const c = preset.config;
                return (
                  <div
                    key={preset.id}
                    className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-200">
                          {preset.name}
                        </span>
                        {preset.isDefault ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 font-mono">
                            Predefinito
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 font-mono">
                            Personalizzato
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{preset.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 font-mono pt-1">
                        <span>Foglio {c.paperSize}</span>
                        <span>·</span>
                        <span>{c.imageWidthCm}×{c.imageHeightCm} cm</span>
                        <span>·</span>
                        <span>Spazio: {c.gapXMm} mm</span>
                        <span>·</span>
                        <span>
                          {c.cropMarks.enabled ? `Taglio: ${c.cropMarks.style}` : 'No taglio'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!preset.isDefault && (
                        <button
                          type="button"
                          onClick={() => onDeletePreset(preset.id)}
                          className="w-8 h-8 rounded-lg hover:bg-rose-950 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                          title="Elimina preset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleApply(preset)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Applicato!</span>
                          </>
                        ) : (
                          <span>Applica Preset</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-2">
                <span className="font-semibold text-neutral-300 uppercase tracking-wider block">
                  Parametri attuali che verranno salvati:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-400 font-mono text-[11px]">
                  <div>Foglio: <strong className="text-white">{currentConfig.paperSize}</strong></div>
                  <div>Immagine: <strong className="text-white">{currentConfig.imageWidthCm}×{currentConfig.imageHeightCm} cm</strong></div>
                  <div>Spazio: <strong className="text-white">{currentConfig.gapXMm} mm</strong></div>
                  <div>Margini: <strong className="text-white">{currentConfig.margins.top} mm</strong></div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Nome del Preset *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Etichette 6x4 su A4 con segni perimetrali"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs placeholder:text-neutral-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Descrizione (opzionale)
                </label>
                <textarea
                  rows={2}
                  placeholder="Note sul tipo di carta, taglierina o utilizzo consigliato..."
                  value={presetDesc}
                  onChange={(e) => setPresetDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs placeholder:text-neutral-600 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Salva nei miei Preset</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
