import { jsPDF } from 'jspdf';
import { SheetSettings } from '../types';

export interface PhotoPosition {
  x: number; // in mm
  y: number; // in mm
  width: number; // in mm
  height: number; // in mm
  index: number;
}

/**
 * Calculates the exact positions (in mm) for the 4 photos on the sheet.
 */
export function calculatePhotoGrid(settings: SheetSettings): {
  positions: PhotoPosition[];
  gridBounds: { x: number; y: number; width: number; height: number };
} {
  const isLandscape = settings.orientation === 'landscape';
  const pageWidth = isLandscape ? settings.paperHeightMm : settings.paperWidthMm;
  const pageHeight = isLandscape ? settings.paperWidthMm : settings.paperHeightMm;

  const w = settings.photoWidthMm; // 35mm
  const h = settings.photoHeightMm; // 45mm
  const gap = settings.spacingMm; // 10mm (1 cm)

  const positions: PhotoPosition[] = [];

  let totalGridW = 0;
  let totalGridH = 0;
  let startX = 0;
  let startY = 0;

  if (settings.layout === 'row') {
    // 4 in a horizontal line
    totalGridW = 4 * w + 3 * gap;
    totalGridH = h;
    startX = (pageWidth - totalGridW) / 2;
    startY = (pageHeight - totalGridH) / 2;

    for (let i = 0; i < 4; i++) {
      positions.push({
        x: startX + i * (w + gap),
        y: startY,
        width: w,
        height: h,
        index: i,
      });
    }
  } else if (settings.layout === 'column') {
    // 4 in a vertical column
    totalGridW = w;
    totalGridH = 4 * h + 3 * gap;
    startX = (pageWidth - totalGridW) / 2;
    startY = (pageHeight - totalGridH) / 2;

    for (let i = 0; i < 4; i++) {
      positions.push({
        x: startX,
        y: startY + i * (h + gap),
        width: w,
        height: h,
        index: i,
      });
    }
  } else {
    // Default 2x2 grid (standard)
    totalGridW = 2 * w + gap; // 35 * 2 + 10 = 80mm
    totalGridH = 2 * h + gap; // 45 * 2 + 10 = 100mm
    startX = (pageWidth - totalGridW) / 2;
    startY = (pageHeight - totalGridH) / 2;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const i = row * 2 + col;
        positions.push({
          x: startX + col * (w + gap),
          y: startY + row * (h + gap),
          width: w,
          height: h,
          index: i,
        });
      }
    }
  }

  return {
    positions,
    gridBounds: {
      x: startX,
      y: startY,
      width: totalGridW,
      height: totalGridH,
    },
  };
}

/**
 * Creates a jsPDF document formatted in A5 or A6 (portrait or landscape)
 * with 4 copies spaced by 10mm and subtle borders.
 */
export function buildPdfDocument(
  croppedCanvas: HTMLCanvasElement,
  settings: SheetSettings
): jsPDF {
  const isLandscape = settings.orientation === 'landscape';
  const orientation = isLandscape ? 'landscape' : 'portrait';
  const format = settings.paperFormat === 'A6' ? 'a6' : 'a5';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format,
    compress: true,
  });

  const imgData = croppedCanvas.toDataURL('image/jpeg', 0.96);
  const { positions, gridBounds } = calculatePhotoGrid(settings);

  // Parse border color hex to rgb
  const hex = settings.borderColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 160;
  const g = parseInt(hex.substring(2, 4), 16) || 160;
  const b = parseInt(hex.substring(4, 6), 16) || 160;

  // Border thickness in mm (1 pt ≈ 0.3527 mm)
  const borderLineWidthMm = settings.borderWidthPt * 0.3527;

  // Draw each of the 4 photos
  positions.forEach((pos) => {
    // 1. Draw high quality image at exact mm coordinates
    doc.addImage(
      imgData,
      'JPEG',
      pos.x,
      pos.y,
      pos.width,
      pos.height,
      undefined,
      'FAST'
    );

    // 2. Draw subtle border around photo ("leggero riquadro tutto attorno")
    if (settings.showBorder) {
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(borderLineWidthMm);
      doc.rect(pos.x, pos.y, pos.width, pos.height, 'S');
    }

    // 3. Optional corner cutting marks (crocini di taglio)
    if (settings.showCropMarks) {
      const markLen = settings.cropMarkLengthMm;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.1);

      // Top-left
      doc.line(pos.x - markLen, pos.y, pos.x - 1, pos.y);
      doc.line(pos.x, pos.y - markLen, pos.x, pos.y - 1);

      // Top-right
      doc.line(pos.x + pos.width + 1, pos.y, pos.x + pos.width + markLen, pos.y);
      doc.line(pos.x + pos.width, pos.y - markLen, pos.x + pos.width, pos.y - 1);

      // Bottom-left
      doc.line(pos.x - markLen, pos.y + pos.height, pos.x - 1, pos.y + pos.height);
      doc.line(pos.x, pos.y + pos.height + 1, pos.x, pos.y + pos.height + markLen);

      // Bottom-right
      doc.line(pos.x + pos.width + 1, pos.y + pos.height, pos.x + pos.width + markLen, pos.y + pos.height);
      doc.line(pos.x + pos.width, pos.y + pos.height + 1, pos.x + pos.width, pos.y + pos.height + markLen);
    }
  });

  // Printing & dimension legend
  const pageWidth = isLandscape ? settings.paperHeightMm : settings.paperWidthMm;
  const pageHeight = isLandscape ? settings.paperWidthMm : settings.paperHeightMm;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 145, 155);

  const formatLabel = `${settings.paperFormat} (${pageWidth}×${pageHeight} mm) - ${isLandscape ? 'Orizzontale' : 'Verticale'}`;
  const footerText = `Formato: 35×45 mm • Distanza: ${settings.spacingMm / 10} cm • Foglio ${formatLabel}`;
  const printNotice = `Stampa: selezionare "Dimensioni effettive" o "Scala 100%" (NON "Adatta alla pagina")`;

  const marginBelowGrid = pageHeight - (gridBounds.y + gridBounds.height);

  if (marginBelowGrid >= 14) {
    // Plenty of space below the grid (e.g. A5 portrait, A5 landscape, A6 portrait)
    doc.setFontSize(8);
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(printNotice, pageWidth / 2, pageHeight - 6, { align: 'center' });
  } else if (marginBelowGrid >= 8) {
    doc.setFontSize(7);
    doc.text(`${footerText} • ${printNotice}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
  } else if (gridBounds.x >= 16) {
    // On A6 landscape, bottom margin is ~2.5mm but horizontal margins on left/right are 34mm!
    doc.setFontSize(6.5);
    // Print neatly in the left side margin
    doc.text(`Foglio ${settings.paperFormat} ${isLandscape ? 'Orizz.' : 'Vert.'}`, 5, pageHeight / 2 - 4);
    doc.text(`4 copie 35×45mm (1 cm gap)`, 5, pageHeight / 2);
    doc.text(`Stampa: Scala 100%`, 5, pageHeight / 2 + 4);
  }

  return doc;
}

// Backwards compatibility alias
export const buildA5PdfDocument = buildPdfDocument;

/**
 * Downloads the generated PDF directly to user's computer.
 */
export function downloadPdf(
  croppedCanvas: HTMLCanvasElement,
  settings: SheetSettings,
  customFilename?: string
): void {
  const filename =
    customFilename ||
    `fototessere_35x45_${settings.paperFormat.toLowerCase()}_${settings.orientation}.pdf`;
  const doc = buildPdfDocument(croppedCanvas, settings);
  doc.save(filename);
}

// Backwards compatibility alias
export const downloadA5Pdf = downloadPdf;

/**
 * Opens PDF in an invisible iframe for direct native browser printing
 */
export function printPdf(
  croppedCanvas: HTMLCanvasElement,
  settings: SheetSettings
): void {
  const doc = buildPdfDocument(croppedCanvas, settings);
  const blobUrl = doc.output('bloburl');
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = blobUrl as unknown as string;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.print();
  };
}

// Backwards compatibility alias
export const printA5Pdf = printPdf;
