import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { loadImageFromFile } from '../utils/imageUtils';

interface Props {
  onImageLoaded: (img: HTMLImageElement, filename: string) => void;
  onUseSampleImage: () => void;
  onOpenWebcam: () => void;
  currentFilename?: string;
  imageDimensions?: { width: number; height: number };
}

export const ImageUploader: React.FC<Props> = ({
  onImageLoaded,
  onUseSampleImage,
  onOpenWebcam,
  currentFilename,
  imageDimensions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Per favore seleziona un file immagine valido (JPG, PNG, WEBP).');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    try {
      setErrorMsg(null);
      const img = await loadImageFromFile(file);
      onImageLoaded(img, file.name);
    } catch {
      setErrorMsg('Impossibile caricare l\'immagine. Prova con un altro file.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Support clipboard paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="w-full space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Dropzone & Upload Bar */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-900/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Carica la tua foto</span>
              {currentFilename && (
                <span className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400 truncate max-w-[150px] sm:max-w-[220px]">
                  ({currentFilename})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Trascina qui la foto, clicca per sfogliare, oppure incolla con <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Ctrl+V</kbd>
            </p>
          </div>
        </div>

        {/* Quick actions alongside dropzone */}
        <div
          className="flex items-center gap-2 w-full sm:w-auto justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onOpenWebcam}
            title="Scatta foto tramite webcam"
            className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-500" />
            <span>Webcam</span>
          </button>

          <button
            type="button"
            onClick={onUseSampleImage}
            title="Carica foto fototessera di esempio"
            className="py-1.5 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Foto di Esempio</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="py-2 px-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Image resolution & format badge if loaded */}
      {imageDimensions && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            Risoluzione originale: {imageDimensions.width} × {imageDimensions.height} px
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Formato ritaglio: 35×45 mm (Rapporto 7:9)
          </span>
        </div>
      )}
    </div>
  );
};
