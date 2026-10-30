import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CropTransform,
  ImageAdjustments,
  BiometricGuideSettings,
  SheetSettings,
} from './types';
import {
  calculateFitScale,
  renderCroppedPhotoCanvas,
  loadImageFromUrl,
} from './utils/imageUtils';
import { createSamplePortraitDataUrl } from './utils/sampleImage';
import { CropCanvas } from './components/CropCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { A5Preview } from './components/A5Preview';
import { ImageUploader } from './components/ImageUploader';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { PassportRequirementsModal } from './components/PassportRequirementsModal';
import {
  Printer,
  Sparkles,
  HelpCircle,
  FileCheck2,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('foto-esempio-passaporto.jpg');

  // Transformation states (x, y, scale, rotation, flip)
  const [transform, setTransform] = useState<CropTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipHorizontal: false,
  });

  // Photo color adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: false,
  });

  // Biometric guidelines
  const [guides, setGuides] = useState<BiometricGuideSettings>({
    showGuides: true,
    showFaceOval: true,
    showEyeLine: true,
    showCenterLine: true,
    showThirdsGrid: false,
  });

  // Sheet configuration: 35x45mm, 4 copies, 1cm spacing on A5 or A6, portrait/landscape, light border
  const [sheetSettings, setSheetSettings] = useState<SheetSettings>({
    paperFormat: 'A5',
    paperWidthMm: 148,
    paperHeightMm: 210,
    photoWidthMm: 35,
    photoHeightMm: 45,
    spacingMm: 10, // 1 cm as explicitly requested
    count: 4,
    layout: '2x2',
    borderWidthPt: 0.5,
    borderColor: '#9ca3af',
    showBorder: true,
    showCropMarks: true,
    cropMarkLengthMm: 2.5,
    orientation: 'portrait',
  });

  // Modals state
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'editor' | 'sheet'>('editor');

  // High resolution cropped canvas
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);

  // Initialize with sample portrait
  useEffect(() => {
    const sampleDataUrl = createSamplePortraitDataUrl();
    if (sampleDataUrl) {
      loadImageFromUrl(sampleDataUrl)
        .then((img) => {
          setImage(img);
          const baseScale = calculateFitScale(img.naturalWidth, img.naturalHeight);
          setTransform({
            x: 0,
            y: 0,
            scale: parseFloat(baseScale.toFixed(2)),
            rotation: 0,
            flipHorizontal: false,
          });
        })
        .catch(console.error);
    }
  }, []);

  // Update high-res canvas whenever image, transform, or adjustments change
  useEffect(() => {
    if (!image) {
      setCroppedCanvas(null);
      return;
    }
    const canvas = renderCroppedPhotoCanvas(image, transform, adjustments);
    setCroppedCanvas(canvas);
  }, [image, transform, adjustments]);

  // Center image action
  const handleCenter = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      x: 0,
      y: 0,
    }));
  }, []);

  // Fit image to frame action
  const handleFit = useCallback(() => {
    if (!image) return;
    const baseScale = calculateFitScale(image.naturalWidth, image.naturalHeight);
    setTransform((prev) => ({
      ...prev,
      x: 0,
      y: 0,
      scale: parseFloat(baseScale.toFixed(2)),
    }));
  }, [image]);

  // Reset all transformations action
  const handleReset = useCallback(() => {
    if (!image) return;
    const baseScale = calculateFitScale(image.naturalWidth, image.naturalHeight);
    setTransform({
      x: 0,
      y: 0,
      scale: parseFloat(baseScale.toFixed(2)),
      rotation: 0,
      flipHorizontal: false,
    });
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: false,
    });
  }, [image]);

  // Handle uploaded image
  const handleImageLoaded = (img: HTMLImageElement, filename: string) => {
    setImage(img);
    setCurrentFilename(filename);
    const baseScale = calculateFitScale(img.naturalWidth, img.naturalHeight);
    setTransform({
      x: 0,
      y: 0,
      scale: parseFloat(baseScale.toFixed(2)),
      rotation: 0,
      flipHorizontal: false,
    });
  };

  // Re-use sample image
  const handleUseSampleImage = () => {
    const sampleDataUrl = createSamplePortraitDataUrl();
    loadImageFromUrl(sampleDataUrl).then((img) => {
      handleImageLoaded(img, 'foto-esempio-passaporto.jpg');
    });
  };

  const imageDimensions = useMemo(() => {
    if (!image) return undefined;
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, [image]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>FotoTessera Studio</span>
                <span className="text-[11px] font-mono font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  35 × 45 mm
                </span>
                <span className="text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 hidden sm:inline-block">
                  {sheetSettings.paperFormat} ({sheetSettings.orientation === 'landscape' ? 'Orizzontale' : 'Verticale'})
                </span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Scala, ruota, centra e stampa 4 copie su foglio A5 o A6 (verticale/orizzontale) con 1 cm di distanziamento
              </p>
            </div>
          </div>

          {/* Quick links & Requirements button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRequirementsOpen(true)}
              className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden md:inline">Requisiti Passaporto / CIE</span>
              <span className="md:hidden">Regole</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Step 1: Image Uploader / Dropzone */}
        <section>
          <ImageUploader
            onImageLoaded={handleImageLoaded}
            onUseSampleImage={handleUseSampleImage}
            onOpenWebcam={() => setIsWebcamOpen(true)}
            currentFilename={currentFilename}
            imageDimensions={imageDimensions}
          />
        </section>

        {/* Mobile View Switcher (Editor vs Sheet) */}
        <div className="flex lg:hidden bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMobileView('editor')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileView === 'editor'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Editor 35×45 mm</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileView('sheet')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMobileView === 'sheet'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Anteprima Foglio {sheetSettings.paperFormat}</span>
          </button>
        </div>

        {/* Studio Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Interactive Canvas & Controls */}
          <div
            className={`lg:col-span-7 flex flex-col gap-5 ${
              activeMobileView === 'sheet' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Interactive 35x45 Crop Canvas with floating toolbar */}
            <CropCanvas
              image={image}
              transform={transform}
              onTransformChange={setTransform}
              adjustments={adjustments}
              guides={guides}
              onReset={handleReset}
              onFit={handleFit}
              onCenter={handleCenter}
            />

            {/* Controls Panel (Position & Transform, Photo Adjustments, Biometric Guides, Sheet Settings) */}
            <ControlsPanel
              transform={transform}
              onTransformChange={setTransform}
              adjustments={adjustments}
              onAdjustmentsChange={setAdjustments}
              guides={guides}
              onGuidesChange={setGuides}
              sheetSettings={sheetSettings}
              onSheetSettingsChange={setSheetSettings}
              onCenter={handleCenter}
              onFit={handleFit}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Realistic Sheet Preview with 4 Copies */}
          <div
            className={`lg:col-span-5 flex flex-col ${
              activeMobileView === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <A5Preview
              croppedCanvas={croppedCanvas}
              sheetSettings={sheetSettings}
              onSheetSettingsChange={setSheetSettings}
            />
          </div>
        </div>

        {/* Feature & Technical Details Footer Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex-shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                Formato Conforme 35×45 mm
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Rapporto 7:9 proporzionato per i documenti italiani ed europei (Passaporto, Carta d'Identità, Patente).
              </p>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex-shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                Stampa {sheetSettings.paperFormat} con 4 Copie e Spaziatura 1 cm
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Disposizione geometrica calibrata su foglio {sheetSettings.paperFormat} ({sheetSettings.orientation === 'landscape' ? 'orizzontale' : 'verticale'}) con esattamente 10 mm di intervallo e sottile bordo per il taglio.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                Guide Biometriche ICAO & Centratura
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sagoma ovale viso (70-80% altezza), asse di simmetria, controlli di centratura rapida e regolazione colore.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
        FotoTessera Studio • Standard 35×45 mm • Foglio {sheetSettings.paperFormat} ({sheetSettings.orientation === 'landscape' ? 'Orizzontale' : 'Verticale'}) • 4 Copie distanziate 1 cm
      </footer>

      {/* Modals */}
      <CameraCaptureModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={(img) => handleImageLoaded(img, 'foto-scatto-webcam.jpg')}
      />

      <PassportRequirementsModal
        isOpen={isRequirementsOpen}
        onClose={() => setIsRequirementsOpen(false)}
      />
    </div>
  );
}
