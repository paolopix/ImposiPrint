import React from 'react';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  lengthMm: number;
  scale: number; // pixels per mm
}

export const Ruler: React.FC<RulerProps> = ({ orientation, lengthMm, scale }) => {
  const isHorizontal = orientation === 'horizontal';
  const majorTickInterval = 10; // 1 cm = 10 mm
  const midTickInterval = 5; // 5 mm

  const ticks: React.ReactNode[] = [];
  const totalTicks = Math.ceil(lengthMm);

  for (let mm = 0; mm <= totalTicks; mm++) {
    const isMajor = mm % majorTickInterval === 0;
    const isMid = !isMajor && mm % midTickInterval === 0;

    const pos = mm * scale;
    const cmValue = mm / 10;

    if (isHorizontal) {
      ticks.push(
        <div
          key={mm}
          className="absolute bottom-0 select-none pointer-events-none"
          style={{ left: `${pos}px` }}
        >
          <div
            className={`w-[1px] bg-neutral-600 ${
              isMajor ? 'h-3 bg-neutral-400' : isMid ? 'h-2' : 'h-1'
            }`}
          />
          {isMajor && (
            <span
              className="absolute -top-3.5 -left-1.5 text-[9px] font-mono text-neutral-400 tabular-nums select-none"
              style={{ transform: 'translateX(-50%)' }}
            >
              {cmValue}
            </span>
          )}
        </div>
      );
    } else {
      ticks.push(
        <div
          key={mm}
          className="absolute right-0 select-none pointer-events-none"
          style={{ top: `${pos}px` }}
        >
          <div
            className={`h-[1px] bg-neutral-600 ${
              isMajor ? 'w-3 bg-neutral-400' : isMid ? 'w-2' : 'w-1'
            }`}
          />
          {isMajor && (
            <span
              className="absolute -left-4 -top-1.5 text-[9px] font-mono text-neutral-400 tabular-nums select-none"
              style={{ transform: 'translateY(-50%)' }}
            >
              {cmValue}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div
      className={`relative select-none pointer-events-none ${
        isHorizontal ? 'h-5 border-b border-neutral-800' : 'w-6 border-r border-neutral-800'
      }`}
      style={
        isHorizontal
          ? { width: `${lengthMm * scale}px` }
          : { height: `${lengthMm * scale}px` }
      }
    >
      {ticks}
    </div>
  );
};
