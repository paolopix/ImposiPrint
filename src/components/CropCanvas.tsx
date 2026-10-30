import React, { useRef, useState, useEffect } from 'react';
import { CropTransform, ImageAdjustments, BiometricGuideSettings } from '../types';
import { BiometricGuidelinesOverlay } from './BiometricGuidelinesOverlay';
import { RotateCw, RotateCcw, Crosshair, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { BASE_CROP_WIDTH, BASE_CROP_HEIGHT } from '../utils/imageUtils';

interface Props {
  image: HTMLImageElement | null;
  transform: CropTransform;
  onTransformChange: (t: CropTransform) => void;
  adjustments: ImageAdjustments;
  guides: BiometricGuideSettings;
  onReset: () => void;
  onFit: () => void;
  onCenter: () => void;
}

export const CropCanvas: React.FC<Props> = ({
  image,
  transform,
  onTransformChange,
  adjustments,
  guides,
  onReset,
  onFit,
  onCenter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialTransform, setInitialTransform] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialTransform({ x: transform.x, y: transform.y });
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialTransform({ x: transform.x, y: transform.y });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      onTransformChange({
        ...transform,
        x: Math.round(initialTransform.x + dx),
        y: Math.round(initialTransform.y + dy),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      onTransformChange({
        ...transform,
        x: Math.round(initialTransform.x + dx),
        y: Math.round(initialTransform.y + dy),
      });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart, initialTransform, transform, onTransformChange]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.1), 5.0);
    onTransformChange({
      ...transform,
      scale: parseFloat(newScale.toFixed(3)),
    });
  };

  const handleStepZoom = (delta: number) => {
    const newScale = Math.min(Math.max(transform.scale + delta, 0.1), 5.0);
    onTransformChange({
      ...transform,
      scale: parseFloat(newScale.toFixed(2)),
    });
  };

  const handleQuickRotate = (degrees: number) => {
    let nextRotation = (transform.rotation + degrees) % 360;
    if (nextRotation > 180) nextRotation -= 360;
    if (nextRotation < -180) nextRotation += 360;
    onTransformChange({
      ...transform,
      rotation: nextRotation,
    });
  };

  const filterStyle = [
    adjustments.brightness !== 100 ? `brightness(${adjustments.brightness}%)` : '',
    adjustments.contrast !== 100 ? `contrast(${adjustments.contrast}%)` : '',
    adjustments.saturation !== 100 ? `saturate(${adjustments.saturation}%)` : '',
    adjustments.grayscale ? 'grayscale(100%)' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full">
      {/* Canvas workspace area */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="relative flex items-center justify-center p-6 bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 w-full max-w-[500px] h-[540px]"
      >
        {/* Subtle grid background pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* 35x45 mm Main Crop Window Frame */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`relative rounded-md overflow-hidden shadow-2xl transition-shadow ${
            isDragging ? 'cursor-grabbing ring-2 ring-indigo-400' : 'cursor-grab ring-1 ring-slate-600'
          }`}
          style={{
            width: `${BASE_CROP_WIDTH}px`,
            height: `${BASE_CROP_HEIGHT}px`,
            backgroundColor: '#ffffff',
          }}
        >
          {/* Rendered Image with transformation */}
          {image && (
            <img
              src={image.src}
              alt="Anteprima ritaglio"
              draggable={false}
              className="absolute pointer-events-none origin-center"
              style={{
                left: '50%',
                top: '50%',
                maxWidth: 'none',
                maxHeight: 'none',
                filter: filterStyle || undefined,
                transform: `
                  translate(-50%, -50%)
                  translate(${transform.x}px, ${transform.y}px)
                  rotate(${transform.rotation}deg)
                  scale(${transform.scale * (transform.flipHorizontal ? -1 : 1)}, ${transform.scale})
                `,
              }}
            />
          )}

          {/* Biometric overlay guidelines */}
          <BiometricGuidelinesOverlay
            width={BASE_CROP_WIDTH}
            height={BASE_CROP_HEIGHT}
            settings={guides}
          />

          {/* Dimension badges around frame */}
          <div className="absolute top-2 left-2 bg-slate-950/70 backdrop-blur-md text-emerald-400 text-[11px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 shadow-sm">
            <span>35 x 45 mm</span>
          </div>

          <div className="absolute bottom-2 right-2 bg-slate-950/70 backdrop-blur-md text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700/50">
            {Math.round(transform.scale * 100)}% • {transform.rotation.toFixed(1)}°
          </div>

          {/* Subtle perimeter border outline (matches final print border preview) */}
          <div className="absolute inset-0 border border-slate-400/30 pointer-events-none rounded-md" />
        </div>

        {/* Floating Quick Action Overlay Toolbar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-lg text-slate-200">
          <button
            type="button"
            onClick={() => handleStepZoom(-0.1)}
            title="Riduci zoom"
            className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium min-w-[42px] text-center text-slate-300">
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleStepZoom(0.1)}
            title="Aumenta zoom"
            className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => handleQuickRotate(-90)}
            title="Ruota -90°"
            className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleQuickRotate(90)}
            title="Ruota +90°"
            className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={onCenter}
            title="Centra immagine"
            className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Centra</span>
          </button>

          <button
            type="button"
            onClick={onFit}
            title="Adatta al riquadro"
            className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Ripristina posizione"
            className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-rose-400 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helpful usage hint under canvas */}
      <div className="mt-2 text-xs text-slate-500 flex items-center justify-center gap-3">
        <span>✋ Trascina per spostare</span>
        <span>•</span>
        <span>🔍 Rotellina mouse per zoom</span>
      </div>
    </div>
  );
};
