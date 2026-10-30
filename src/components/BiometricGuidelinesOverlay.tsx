import React from 'react';
import { BiometricGuideSettings } from '../types';

interface Props {
  width: number;
  height: number;
  settings: BiometricGuideSettings;
}

export const BiometricGuidelinesOverlay: React.FC<Props> = ({ width, height, settings }) => {
  if (!settings.showGuides) return null;

  // For 35mm x 45mm frame:
  // Standard ICAO / Italian CIE:
  // - Head height (chin to top of hair): 32 to 36mm (approx 70-80% of 45mm) -> 71% to 80%
  // - Eye level: approx 28-32mm from bottom (so 13-17mm from top, ~30-38% from top)
  // - Top margin (hair to top edge): ~3-5mm (7-11%)
  // - Chin line: ~78-85% from top

  const crownY = height * 0.10; // Top of hair
  const eyeLineY = height * 0.40; // Eye level line
  const noseY = height * 0.53; // Nose tip level
  const mouthY = height * 0.65; // Mouth line
  const chinY = height * 0.78; // Chin line
  const centerX = width / 2;

  // Face oval bounds
  const ovalRx = width * 0.30;
  const ovalRy = (chinY - crownY) / 2;
  const ovalCy = crownY + ovalRy;

  return (
    <svg
      className="absolute inset-0 pointer-events-none w-full h-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* Rule of thirds grid */}
      {settings.showThirdsGrid && (
        <g stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="3 3" strokeWidth="1">
          <line x1={width / 3} y1={0} x2={width / 3} y2={height} />
          <line x1={(width * 2) / 3} y1={0} x2={(width * 2) / 3} y2={height} />
          <line x1={0} y1={height / 3} x2={width} y2={height / 3} />
          <line x1={0} y1={(height * 2) / 3} x2={width} y2={(height * 2) / 3} />
        </g>
      )}

      {/* Vertical center symmetry line */}
      {settings.showCenterLine && (
        <g>
          <line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={height}
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          {/* Subtle center marker cross */}
          <line
            x1={centerX - 10}
            y1={eyeLineY}
            x2={centerX + 10}
            y2={eyeLineY}
            stroke="#38bdf8"
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* Eye line & Level band */}
      {settings.showEyeLine && (
        <g>
          {/* Recommended eye band (soft translucent area) */}
          <rect
            x={0}
            y={height * 0.36}
            width={width}
            height={height * 0.08}
            fill="rgba(56, 189, 248, 0.12)"
          />
          <line
            x1={0}
            y1={eyeLineY}
            x2={width}
            y2={eyeLineY}
            stroke="#38bdf8"
            strokeWidth="1.5"
          />
          {/* Eye indicators */}
          <circle cx={centerX - width * 0.16} cy={eyeLineY} r={3} fill="#38bdf8" />
          <circle cx={centerX + width * 0.16} cy={eyeLineY} r={3} fill="#38bdf8" />
          <text
            x={width - 6}
            y={eyeLineY - 4}
            fill="#38bdf8"
            fontSize="10"
            fontFamily="sans-serif"
            textAnchor="end"
            fontWeight="bold"
          >
            LIVELLO OCCHI
          </text>
        </g>
      )}

      {/* Face oval guideline (Testa 70-80%) */}
      {settings.showFaceOval && (
        <g>
          {/* Crown guide */}
          <line
            x1={centerX - ovalRx}
            y1={crownY}
            x2={centerX + ovalRx}
            y2={crownY}
            stroke="#fbbf24"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <text
            x={centerX}
            y={crownY - 4}
            fill="#fbbf24"
            fontSize="9"
            fontFamily="sans-serif"
            textAnchor="middle"
            fontWeight="bold"
          >
            SOMMITÀ CAPELLI (70-80%)
          </text>

          {/* Face oval */}
          <ellipse
            cx={centerX}
            cy={ovalCy}
            rx={ovalRx}
            ry={ovalRy}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />

          {/* Chin guide */}
          <line
            x1={centerX - ovalRx * 0.7}
            y1={chinY}
            x2={centerX + ovalRx * 0.7}
            y2={chinY}
            stroke="#fbbf24"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <text
            x={centerX}
            y={chinY + 12}
            fill="#fbbf24"
            fontSize="9"
            fontFamily="sans-serif"
            textAnchor="middle"
            fontWeight="bold"
          >
            MENTO
          </text>

          {/* Shoulders suggestion curve */}
          <path
            d={`M ${centerX - width * 0.45} ${height * 0.98} Q ${centerX} ${height * 0.85} ${centerX + width * 0.45} ${height * 0.98}`}
            fill="none"
            stroke="rgba(251, 191, 36, 0.4)"
            strokeWidth="1.2"
            strokeDasharray="2 3"
          />
        </g>
      )}
    </svg>
  );
};
