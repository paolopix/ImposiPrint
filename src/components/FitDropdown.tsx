import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Check, Crop, Maximize, StretchHorizontal } from 'lucide-react';
import { FitMode } from '../types';

interface FitDropdownProps {
  currentFit: FitMode;
  onSelectFit: (mode: FitMode) => void;
  size?: 'sm' | 'md';
}

const FIT_OPTIONS: { id: FitMode; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  {
    id: 'cover',
    label: 'Cover',
    desc: 'Ritaglia per riempire',
    icon: Crop,
  },
  {
    id: 'contain',
    label: 'Contain',
    desc: 'Intera in proporzione',
    icon: Maximize,
  },
  {
    id: 'fill',
    label: 'Stretch',
    desc: 'Riempi e stira',
    icon: StretchHorizontal,
  },
];

export const FitDropdown: React.FC<FitDropdownProps> = ({
  currentFit,
  onSelectFit,
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 195;
    const menuHeight = 155;

    // Horizontal: align with left of button, but shift left if overflowing viewport
    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, rect.right - menuWidth);
    }
    if (left < 12) left = 12;

    // Vertical: place below button by default, flip above if near bottom
    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - menuHeight - 6);
    }

    setMenuCoords({ top, left });
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click, window resize, or scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && buttonRef.current.contains(target) ||
        menuRef.current && menuRef.current.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, { capture: true });

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [isOpen]);

  const handleSelect = (mode: FitMode, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectFit(mode);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block select-none" onClick={(e) => e.stopPropagation()}>
      {/* 3-dots Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className={`flex items-center justify-center rounded-md bg-black/80 hover:bg-black text-white/90 hover:text-white backdrop-blur-md border border-white/25 shadow-md transition-all ${
          isOpen ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : ''
        } ${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}`}
        title={`Adattamento: ${currentFit.toUpperCase()} (Clicca per scegliere)`}
        aria-label="Menu opzioni adattamento"
      >
        <MoreVertical className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>

      {/* Dropdown Menu rendered via Portal into body to escape overflow-hidden */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: `${menuCoords.top}px`,
              left: `${menuCoords.left}px`,
              zIndex: 99999,
            }}
            className="fixed min-w-[195px] bg-neutral-900/98 backdrop-blur-md border border-neutral-700 rounded-xl shadow-2xl p-1.5 text-neutral-100 select-none animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 mb-1 flex items-center justify-between">
              <span>Adattamento</span>
              <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold">
                {currentFit}
              </span>
            </div>

            <div className="space-y-0.5">
              {FIT_OPTIONS.map((option) => {
                const isSelected = currentFit === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={(e) => handleSelect(option.id, e)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                      <div className="flex flex-col">
                        <span className="leading-tight">{option.label}</span>
                        <span
                          className={`text-[10px] leading-tight ${
                            isSelected ? 'text-indigo-200' : 'text-neutral-400'
                          }`}
                        >
                          {option.desc}
                        </span>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
