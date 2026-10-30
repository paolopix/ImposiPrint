/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_LAYOUT_CONFIG,
  FACTORY_PRESETS,
  INITIAL_SAMPLE_IMAGES,
} from './constants';
import { FitMode, LayoutConfig, PrintPreset, UploadedImage } from './types';
import { computeLayout } from './utils/layoutCalculator';
import { exportLayoutToPdf } from './utils/pdfGenerator';
import { triggerDirectPrint } from './utils/printHelper';
import { Header } from './components/Header';
import { SidebarControls } from './components/SidebarControls';
import { SheetPreview } from './components/SheetPreview';
import { ImageManager } from './components/ImageManager';
import { PresetModal } from './components/PresetModal';
import { PrintDocument } from './components/PrintDocument';

const STORAGE_PRESETS_KEY = 'imposiprint_saved_presets_v1';

export default function App() {
  const [config, setConfig] = useState<LayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  const [images, setImages] = useState<UploadedImage[]>(INITIAL_SAMPLE_IMAGES);
  const [repeatMode, setRepeatMode] = useState<boolean>(false);

  // View state
  const [activeView, setActiveView] = useState<'editor' | 'images'>('editor');

  // Preview overlay visual toggles
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);
  const [showDimensionsBadge, setShowDimensionsBadge] = useState<boolean>(false);

  // Preset management
  const [presets, setPresets] = useState<PrintPreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRESETS_KEY);
      if (saved) {
        const parsed: PrintPreset[] = JSON.parse(saved);
        // Combine factory presets with user custom presets
        const userPresets = parsed.filter((p) => !p.isDefault);
        return [...FACTORY_PRESETS, ...userPresets];
      }
    } catch (e) {
      console.warn('Errore nel caricamento dei preset salvati:', e);
    }
    return FACTORY_PRESETS;
  });

  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [presetModalMode, setPresetModalMode] = useState<'list' | 'save'>('list');

  // PDF Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<string>('');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Save custom presets to localStorage whenever updated
  const saveCustomPresets = (updatedPresets: PrintPreset[]) => {
    try {
      const userPresets = updatedPresets.filter((p) => !p.isDefault);
      localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(userPresets));
    } catch (e) {
      console.warn('Errore nel salvataggio in localStorage:', e);
    }
  };

  // Computed layout calculations (columns, rows, positions, pagination)
  const computedLayout = useMemo(() => {
    return computeLayout(config, images, repeatMode);
  }, [config, images, repeatMode]);

  // Handlers
  const handleDirectPrint = () => {
    triggerDirectPrint();
  };

  const handleExportPdf = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      await exportLayoutToPdf(computedLayout, config, {
        fileName: `imposiprint_${config.paperSize.toLowerCase()}_${config.imageWidthCm}x${config.imageHeightCm}cm.pdf`,
        onProgress: (prog, status) => {
          setExportProgress(prog);
          setExportStatus(status);
        },
      });
      showToast('File PDF generato e scaricato con successo!');
    } catch (err) {
      console.error('Errore durante esportazione PDF:', err);
      showToast('Si è verificato un errore durante la creazione del PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveCurrentPreset = (name: string, description: string) => {
    const newPreset: PrintPreset = {
      id: `custom-preset-${Date.now()}`,
      name,
      description: description || `Preset ${config.paperSize} (${config.imageWidthCm}x${config.imageHeightCm} cm)`,
      isDefault: false,
      config: JSON.parse(JSON.stringify(config)),
    };

    const nextList = [...presets, newPreset];
    setPresets(nextList);
    saveCustomPresets(nextList);
    showToast(`Preset "${name}" salvato con successo!`);
  };

  const handleApplyPreset = (preset: PrintPreset) => {
    setConfig(JSON.parse(JSON.stringify(preset.config)));
    showToast(`Preset "${preset.name}" applicato!`);
  };

  const handleDeletePreset = (id: string) => {
    const nextList = presets.filter((p) => p.id !== id);
    setPresets(nextList);
    saveCustomPresets(nextList);
    showToast('Preset eliminato.');
  };

  const handleUpdateImageFitMode = (imageId: string, fitMode: FitMode) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, fitMode } : img))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Top Application Bar */}
      <Header
        onDirectPrint={handleDirectPrint}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        exportProgress={exportProgress}
        exportStatus={exportStatus}
        onOpenPresets={() => {
          setPresetModalMode('list');
          setIsPresetModalOpen(true);
        }}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeView === 'editor' ? (
          <>
            {/* Left Parameters & Settings Panel */}
            <SidebarControls
              config={config}
              onChangeConfig={setConfig}
              layout={computedLayout}
              onOpenSavePresetModal={() => {
                setPresetModalMode('save');
                setIsPresetModalOpen(true);
              }}
              showRulers={showRulers}
              setShowRulers={setShowRulers}
              showMarginGuides={showMarginGuides}
              setShowMarginGuides={setShowMarginGuides}
              showDimensionsBadge={showDimensionsBadge}
              setShowDimensionsBadge={setShowDimensionsBadge}
            />

            {/* Interactive Real-Time Sheet Preview Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <SheetPreview
                layout={computedLayout}
                config={config}
                showRulers={showRulers}
                showMarginGuides={showMarginGuides}
                showDimensionsBadge={showDimensionsBadge}
                images={images}
                onUpdateImageFitMode={handleUpdateImageFitMode}
              />
            </main>
          </>
        ) : (
          /* Images & Copies Management View */
          <main className="flex-1 overflow-y-auto bg-neutral-950">
            <ImageManager
              images={images}
              setImages={setImages}
              slotsPerPage={computedLayout.slotsPerPage}
              repeatMode={repeatMode}
              setRepeatMode={setRepeatMode}
              globalFitMode={config.fitMode}
              onUpdateImageFitMode={handleUpdateImageFitMode}
            />
          </main>
        )}
      </div>

      {/* Preset Modal */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        currentConfig={config}
        presets={presets}
        onApplyPreset={handleApplyPreset}
        onSavePreset={handleSaveCurrentPreset}
        onDeletePreset={handleDeletePreset}
        defaultMode={presetModalMode}
      />

      {/* Dedicated Print Only Element for native direct browser print */}
      <PrintDocument layout={computedLayout} config={config} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
