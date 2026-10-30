import React, { useRef } from 'react';
import {
  Upload,
  Plus,
  Minus,
  Trash2,
  Image as ImageIcon,
  Copy,
  Sparkles,
  RefreshCw,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { FitMode, UploadedImage } from '../types';
import { INITIAL_SAMPLE_IMAGES } from '../constants';
import { FitDropdown } from './FitDropdown';

interface ImageManagerProps {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  slotsPerPage: number;
  repeatMode: boolean;
  setRepeatMode: (repeat: boolean) => void;
  globalFitMode: FitMode;
  onUpdateImageFitMode: (imageId: string, fitMode: FitMode) => void;
}

export const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  setImages,
  slotsPerPage,
  repeatMode,
  setRepeatMode,
  globalFitMode,
  onUpdateImageFitMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];
    const readPromises: Promise<void>[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const p = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            newImages.push({
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              url,
              name: file.name,
              width: img.naturalWidth,
              height: img.naturalHeight,
              aspectRatio: img.naturalWidth / img.naturalHeight,
              copies: 1,
            });
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        };
        reader.readAsDataURL(file);
      });
      readPromises.push(p);
    });

    Promise.all(readPromises).then(() => {
      setImages((prev) => [...prev, ...newImages]);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const updateCopies = (id: string, delta: number) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          const newCopies = Math.max(1, img.copies + delta);
          return { ...img, copies: newCopies };
        }
        return img;
      })
    );
  };

  const setExactCopies = (id: string, count: number) => {
    const safeCount = Math.max(1, count);
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, copies: safeCount } : img))
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const fillSheetWithImage = (targetId: string) => {
    if (slotsPerPage <= 0) return;
    setImages((prev) =>
      prev.map((img) => (img.id === targetId ? { ...img, copies: slotsPerPage } : { ...img, copies: 0 })).filter(img => img.copies > 0)
    );
  };

  const distributeEquallyToFillSheet = () => {
    if (images.length === 0 || slotsPerPage <= 0) return;
    const basePerImage = Math.floor(slotsPerPage / images.length);
    const remainder = slotsPerPage % images.length;

    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        copies: basePerImage + (idx < remainder ? 1 : 0),
      }))
    );
  };

  const resetToSampleImages = () => {
    setImages(INITIAL_SAMPLE_IMAGES);
  };

  const totalCopies = images.reduce((acc, curr) => acc + curr.copies, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-neutral-700 hover:border-indigo-500 bg-neutral-900/50 hover:bg-neutral-900/80 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-indigo-400">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-200">
            Trascina qui le tue immagini o clicca per caricarle
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Supporta file JPG, PNG, WEBP, SVG con orientamento e risoluzione originali
          </p>
        </div>
      </div>

      {/* Batch Operations Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-900/80 rounded-xl border border-neutral-800">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-neutral-400">
            Immagini caricate: <strong className="text-white font-mono">{images.length}</strong>
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-400">
            Copie totali richieste: <strong className="text-indigo-400 font-mono">{totalCopies}</strong>
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-400">
            Posti per foglio: <strong className="text-emerald-400 font-mono">{slotsPerPage}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={distributeEquallyToFillSheet}
            disabled={images.length === 0 || slotsPerPage <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Riempi foglio equamente ({slotsPerPage} copie)</span>
          </button>

          <button
            type="button"
            onClick={resetToSampleImages}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-neutral-400" />
            <span>Ripristina esempi</span>
          </button>

          {images.length > 0 && (
            <button
              type="button"
              onClick={() => setImages([])}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/50 rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Svuota tutto</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto-fill switch */}
      <div className="p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/60 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-200">
              Ciclo continuo per riempire tutti gli slot vuoti del foglio
            </span>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Se le copie specificate non riempiono interamente l'ultimo foglio, ripete le immagini fino a completare la griglia.
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={repeatMode}
          onChange={(e) => setRepeatMode(e.target.checked)}
          className="w-4 h-4 accent-indigo-500 rounded"
        />
      </div>

      {/* Image Cards Grid */}
      {images.length === 0 ? (
        <div className="p-12 text-center text-neutral-500 border border-neutral-800 rounded-xl bg-neutral-950">
          <ImageIcon className="w-10 h-10 mx-auto text-neutral-700 mb-3" />
          <p className="text-sm font-medium text-neutral-300">Nessuna immagine presente</p>
          <p className="text-xs text-neutral-500 mt-1">
            Trascina una o più foto o clicca su "Ripristina esempi" per iniziare.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => {
            const currentFit = img.fitMode || globalFitMode;
            return (
              <div
                key={img.id}
                className="bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden flex flex-col transition-all group"
              >
                <div className="relative aspect-square bg-neutral-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full ${
                      currentFit === 'contain'
                        ? 'object-contain'
                        : currentFit === 'fill'
                        ? 'object-fill'
                        : 'object-cover'
                    } group-hover:scale-105 transition-transform duration-300`}
                  />

                  {/* 3 Puntini con Menù a Discesa in alto a sinistra per scegliere l'adattamento (Cover, Contain, Stretch) */}
                  <div className="absolute top-2 left-2 z-20">
                    <FitDropdown
                      currentFit={currentFit}
                      onSelectFit={(mode) => onUpdateImageFitMode(img.id, mode)}
                      size="sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Rimuovi immagine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="font-semibold text-xs text-neutral-200 truncate" title={img.name}>
                      {img.name}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-0.5">
                      <span>{img.width} × {img.height} px</span>
                      <span className="uppercase text-indigo-400 font-medium">{currentFit}</span>
                    </div>
                  </div>

                <div className="pt-2 border-t border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 text-[11px]">Numero di copie:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCopies(img.id, -1)}
                        className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={img.copies}
                        onChange={(e) => setExactCopies(img.id, parseInt(e.target.value) || 1)}
                        className="w-10 text-center bg-neutral-950 border border-neutral-700 rounded py-0.5 text-xs font-mono text-white"
                      />
                      <button
                        type="button"
                        onClick={() => updateCopies(img.id, 1)}
                        className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fillSheetWithImage(img.id)}
                    className="w-full py-1.5 px-2 bg-neutral-800 hover:bg-indigo-950 hover:text-indigo-300 text-neutral-300 rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-indigo-400" />
                    <span>Riempi foglio con questa ({slotsPerPage}x)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
