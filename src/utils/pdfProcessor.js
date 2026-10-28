import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';
import { PDFDocument } from 'pdf-lib';

// Use local legacy worker without ES2022 private fields to prevent Proxy collisions
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Checks if a canvas context region is mostly blank/white
 */
function isRegionBlank(ctx, x, y, width, height, threshold = 0.985) {
  try {
    const imgData = ctx.getImageData(x, y, width, height);
    const data = imgData.data;
    let whitePixels = 0;
    const totalPixels = width * height;
    
    // Sample pixels for speed (step by 4)
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // If near white (light background)
      if (r > 240 && g > 240 && b > 240) {
        whitePixels += 4;
      }
    }
    return (whitePixels / totalPixels) >= threshold;
  } catch (e) {
    return false;
  }
}

/**
 * Find bounding box of content inside a canvas region (trim white borders)
 */
export function trimWhiteBorder(canvas) {
  if (!canvas || !canvas.width || !canvas.height) return canvas;
  const w = canvas.width;
  const h = canvas.height;
  if (w < 10 || h < 10) return canvas;

  let ctx;
  try {
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  } catch (e) {
    return canvas;
  }
  if (!ctx) return canvas;

  let imgData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch (e) {
    return canvas;
  }
  const data = imgData.data;

  let top = 0, bottom = h - 1, left = 0, right = w - 1;
  let hasContent = false;

  // Find top
  topLoop: for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx] < 235 || data[idx+1] < 235 || data[idx+2] < 235) {
        top = Math.max(0, y - 4);
        hasContent = true;
        break topLoop;
      }
    }
  }

  // If page is completely blank white, return original safely
  if (!hasContent) return canvas;

  // Find bottom
  bottomLoop: for (let y = h - 1; y >= top; y--) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx] < 235 || data[idx+1] < 235 || data[idx+2] < 235) {
        bottom = Math.min(h - 1, y + 4);
        break bottomLoop;
      }
    }
  }

  // Find left
  leftLoop: for (let x = 0; x < w; x++) {
    for (let y = top; y <= bottom; y++) {
      const idx = (y * w + x) * 4;
      if (data[idx] < 235 || data[idx+1] < 235 || data[idx+2] < 235) {
        left = Math.max(0, x - 4);
        break leftLoop;
      }
    }
  }

  // Find right
  rightLoop: for (let x = w - 1; x >= left; x--) {
    for (let y = top; y <= bottom; y++) {
      const idx = (y * w + x) * 4;
      if (data[idx] < 235 || data[idx+1] < 235 || data[idx+2] < 235) {
        right = Math.min(w - 1, x + 4);
        break rightLoop;
      }
    }
  }

  const cropW = Math.max(10, (right - left) + 1);
  const cropH = Math.max(10, (bottom - top) + 1);

  try {
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);
    return croppedCanvas;
  } catch (err) {
    return canvas;
  }
}

/**
 * Detect vertical rows that contain a 1D barcode or 2D matrix/QR code.
 * In a barcode or QR code, horizontal transitions (edges) are dense (typically >= 20)
 * and vertically consistent over multiple consecutive lines.
 */
function findBarcodeRegions(data, width, height) {
  const minTransitions = Math.max(20, Math.floor(width * 0.04));
  const rowTrans = new Int32Array(height);
  const rowMinX = new Int32Array(height).fill(width);
  const rowMaxX = new Int32Array(height).fill(0);

  for (let y = 0; y < height; y++) {
    let trans = 0;
    let prevDark = false;
    let firstX = -1;
    let lastX = -1;
    const rowOffset = y * width * 4;

    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const isDark = lum < 185;
      if (x > 0 && isDark !== prevDark) {
        trans++;
        if (firstX === -1) firstX = x;
        lastX = x;
      }
      prevDark = isDark;
    }
    rowTrans[y] = trans;
    if (trans >= minTransitions) {
      rowMinX[y] = firstX;
      rowMaxX[y] = lastX;
    }
  }

  // Find contiguous blocks >= 12 rows (barcodes/QR are tall, text lines are short)
  const isBarcode = new Uint8Array(height);
  let bStart = -1;
  for (let y = 0; y < height; y++) {
    if (rowTrans[y] >= minTransitions) {
      if (bStart === -1) bStart = y;
    } else {
      if (bStart !== -1) {
        if (y - bStart >= 12) {
          for (let k = Math.max(0, bStart - 2); k < Math.min(height, y + 2); k++) {
            isBarcode[k] = 1;
          }
        }
        bStart = -1;
      }
    }
  }
  if (bStart !== -1 && (height - bStart) >= 12) {
    for (let k = Math.max(0, bStart - 2); k < height; k++) {
      isBarcode[k] = 1;
    }
  }

  return { isBarcode, rowMinX, rowMaxX };
}

/**
 * Smart Pure Black Binarization & Sharpening for Thermal Printing with Barcode Protection
 * Converts anti-aliased gray pixels along letter and barcode edges into 100% solid pure black (#000000)
 * or pure white background (#FFFFFF). Completely eliminates halftone dithering (网点抖动), making printed
 * thermal letters, numbers, and barcodes solid, bold, and razor-sharp.
 * 
 * In 'heavy' mode, barcode/QR regions are automatically detected and protected with the standard optimal
 * barcode threshold (175) to prevent bar widening and space bleeding, ensuring 100% instant scannability,
 * while fine text and product titles receive the deep black threshold (215) for maximum boldness.
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {string|number} mode - 'standard' (190), 'heavy' (215), 'light' (165), 'none'
 * @returns {HTMLCanvasElement}
 */
export function binarizeCanvas(canvas, mode = 'standard') {
  if (!canvas || !canvas.width || !canvas.height) return canvas;
  if (mode === 'none') return canvas;

  let textThreshold = 190;
  if (mode === 'heavy') {
    textThreshold = 215; // Thickens fine text, captures thin strokes
  } else if (mode === 'light') {
    textThreshold = 165; // Thinner strokes, prevents bleeding
  } else if (typeof mode === 'number') {
    textThreshold = Math.max(50, Math.min(245, mode));
  }

  // Optical barcode safe threshold: keeps 1X/2X/3X/4X bar-to-space ratios intact, eliminates bar bleeding
  const barcodeSafeThreshold = 175;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = canvas.width;
  outCanvas.height = canvas.height;
  const ctx = outCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(canvas, 0, 0);

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Detect barcode/QR regions when textThreshold > barcodeSafeThreshold
    const barcodeRegion = (textThreshold > 180) 
      ? findBarcodeRegions(data, canvas.width, canvas.height) 
      : null;

    for (let y = 0; y < canvas.height; y++) {
      const rowOffset = y * canvas.width * 4;
      const isBarcodeRow = barcodeRegion && barcodeRegion.isBarcode[y];
      const minX = isBarcodeRow ? barcodeRegion.rowMinX[y] - 4 : 0;
      const maxX = isBarcodeRow ? barcodeRegion.rowMaxX[y] + 4 : 0;

      for (let x = 0; x < canvas.width; x++) {
        const idx = rowOffset + x * 4;
        const a = data[idx + 3];
        if (a < 50) {
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
          continue;
        }

        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const inBarcode = isBarcodeRow && (x >= minX && x <= maxX);
        const activeThreshold = inBarcode ? barcodeSafeThreshold : textThreshold;

        const val = lum < activeThreshold ? 0 : 255;

        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return outCanvas;
  } catch (err) {
    console.warn('binarizeCanvas error:', err);
    return canvas;
  }
}

/**
 * Load PDF file and parse page-by-page using strict Uint8Array
 */
export async function loadPdfDocument(fileOrUrl) {
  let uint8Array;
  if (typeof fileOrUrl === 'string') {
    const res = await fetch(fileOrUrl);
    if (!res.ok) {
      throw new Error(`无法获取文件 (HTTP ${res.status})`);
    }
    const ab = await res.arrayBuffer();
    uint8Array = new Uint8Array(ab);
  } else {
    const ab = await fileOrUrl.arrayBuffer();
    uint8Array = new Uint8Array(ab);
  }

  // Verify PDF header magic bytes "%PDF-"
  if (uint8Array.length < 5 || 
      uint8Array[0] !== 0x25 || 
      uint8Array[1] !== 0x50 || 
      uint8Array[2] !== 0x44 || 
      uint8Array[3] !== 0x46) {
    throw new Error('文件不是有效的 PDF 格式（可能传入了图片或损坏的文件）');
  }

  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  return await loadingTask.promise;
}

/**
 * Automatically analyze layout from PDF dimensions and text
 */
export async function detectSuggestedLayout(pdfDoc) {
  const firstPage = await pdfDoc.getPage(1);
  const viewport = firstPage.getViewport({ scale: 1.0 });
  const textContent = await firstPage.getTextContent();
  const textItems = textContent.items.map(i => i.str).join(' ');

  // 1. Check for Mercado Libre 2-in-1
  if (textItems.includes('FULL') || textItems.includes('ENTREGAR A FULL') || textItems.includes('BULTOS')) {
    if (viewport.width > viewport.height || textItems.includes('Envío:')) {
      return 'presetML_2';
    }
  }

  // 2. Check for A4 Grid (30-up vs 40-up)
  if (textItems.includes('SKU:') || textItems.includes('Pantalla') || textContent.items.length > 50) {
    const col4Counts = [0, 0, 0, 0];
    for (const item of textContent.items) {
      const c = Math.min(3, Math.max(0, Math.floor((item.transform[4] / viewport.width) * 4)));
      col4Counts[c]++;
    }
    if (col4Counts[3] >= 8) {
      return 'presetA4_40';
    }
    return 'presetA4_30';
  }

  // 3. Check for vertical 2-in-1
  if (textItems.includes('ETIQUETA DE BULTO')) {
    return 'presetVertical_2';
  }

  // 4. Check for single top-left label
  if (textContent.items.length <= 15) {
    return 'presetSingleTL';
  }

  return 'presetAuto';
}

/**
 * Detect vector bounding boxes of labels on standard sticker sheets (e.g. A4 4x10, A4 3x10).
 * By extracting the actual stroke/fill bounding boxes from the PDF's internal graphics operators,
 * we get the exact pixel-perfect label dimensions, avoiding any borders being clipped.
 */
export async function extractLabelVectorBoxes(page) {
  try {
    const vp = page.getViewport({ scale: 1.0 });
    const ops = await page.getOperatorList();
    const rawBoxes = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.constructPath) {
        const coords = ops.argsArray[i][1];
        for (let j = 0; j < coords.length; j += 4) {
          const x = coords[j], y = coords[j+1], w = coords[j+2], h = coords[j+3];
          if (w >= 60 && h >= 30 && w <= vp.width * 0.85 && h <= vp.height * 0.6) {
            rawBoxes.push({
              x: Math.round(x * 10) / 10,
              y: Math.round(y * 10) / 10,
              w: Math.round(w * 10) / 10,
              h: Math.round(h * 10) / 10,
            });
          }
        }
      }
    }

    if (rawBoxes.length < 8) return null;

    // Deduplicate nested / double border strokes, keeping the outermost box
    const unique = [];
    for (const b of rawBoxes) {
      const existingIdx = unique.findIndex(u => 
        Math.abs(u.x - b.x) < 4 && Math.abs(u.y - b.y) < 4
      );
      if (existingIdx === -1) {
        unique.push(b);
      } else {
        if (b.w * b.h > unique[existingIdx].w * unique[existingIdx].h) {
          unique[existingIdx] = b;
        }
      }
    }

    if (unique.length < 4) return null;

    // Sort top-to-bottom (higher Y first in PDF coords), then left-to-right
    unique.sort((a, b) => {
      if (Math.abs(b.y - a.y) > 8) return b.y - a.y;
      return a.x - b.x;
    });

    return unique;
  } catch (e) {
    return null;
  }
}

/**
 * Slice PDF into individual label objects based on grid/mode
 */
export async function slicePdfLabels(pdfDoc, mode = 'presetA4_30', onProgress = null, customBox = null, sharpenMode = 'standard') {
  const labels = [];
  const numPages = pdfDoc.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) onProgress(pageNum, numPages);

    const page = await pdfDoc.getPage(pageNum);
    const unscaledVp = page.getViewport({ scale: 1.0 });
    const maxDim = Math.max(unscaledVp.width, unscaledVp.height);
    // Dynamic HD thermal sampling: ensure small cropped labels achieve 250-350 DPI clarity
    const minPixels = 2400;
    const renderScale = Math.min(5.0, Math.max(3.0, minPixels / maxDim));

    const viewport = page.getViewport({ scale: renderScale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const textContent = await page.getTextContent();

    // 1. Freeform crop (strictly as framed by user mouse, or auto-trim if requested)
    if (mode === 'presetFreeform' && customBox) {
      const box = {
        x: Math.max(0, customBox.xRatio * canvas.width),
        y: Math.max(0, customBox.yRatio * canvas.height),
        w: Math.min(canvas.width, customBox.wRatio * canvas.width),
        h: Math.min(canvas.height, customBox.hRatio * canvas.height),
      };

      if (box.w > 10 && box.h > 10) {
        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = box.w;
        cellCanvas.height = box.h;
        const cellCtx = cellCanvas.getContext('2d');
        cellCtx.drawImage(canvas, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);

        const finalCanvas = customBox.autoTrim ? trimWhiteBorder(cellCanvas) : cellCanvas;
        const activeCanvas = sharpenMode !== 'none' ? binarizeCanvas(finalCanvas, sharpenMode) : finalCanvas;
        const cellText = extractCellText(textContent.items, box, viewport, renderScale);

        labels.push({
          id: `p${pageNum}_free_${labels.length}`,
          page: pageNum,
          rawCanvas: finalCanvas,
          canvas: activeCanvas,
          dataUrl: activeCanvas.toDataURL('image/png'),
          barcode: cellText.barcode || `ITEM-${labels.length + 1}`,
          title: cellText.title || '',
          sku: cellText.sku || '',
          quantity: 1,
          selected: true,
          width: activeCanvas.width,
          height: activeCanvas.height,
        });
      }
      continue;
    }

    // 2. Vector-drawn label box detection (guarantees 100% border preservation for A4 40-up / 30-up)
    const detectedBoxes = (mode === 'presetA4_40' || mode === 'presetA4_30') ? await extractLabelVectorBoxes(page) : null;
    if (detectedBoxes && detectedBoxes.length >= 8) {
      const pageHeightPt = unscaledVp.height;
      const padPt = 4; // 4pt margin ensures outer black borders are never cut off

      for (let idx = 0; idx < detectedBoxes.length; idx++) {
        const box = detectedBoxes[idx];
        const cropX = Math.max(0, (box.x - padPt) * renderScale);
        const cropY = Math.max(0, (pageHeightPt - (box.y + box.h) - padPt) * renderScale);
        const cropW = Math.min(canvas.width - cropX, (box.w + 2 * padPt) * renderScale);
        const cropH = Math.min(canvas.height - cropY, (box.h + 2 * padPt) * renderScale);

        if (isRegionBlank(ctx, cropX + 5, cropY + 5, cropW - 10, cropH - 10)) {
          continue;
        }

        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = cropW;
        cellCanvas.height = cropH;
        const cellCtx = cellCanvas.getContext('2d');
        cellCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        const trimmed = trimWhiteBorder(cellCanvas);
        const activeCanvas = sharpenMode !== 'none' ? binarizeCanvas(trimmed, sharpenMode) : trimmed;
        const cellBox = { x: cropX, y: cropY, w: cropW, h: cropH };
        const cellText = extractCellText(textContent.items, cellBox, viewport, renderScale);

        labels.push({
          id: `p${pageNum}_vec_${idx}`,
          page: pageNum,
          index: idx + 1,
          rawCanvas: trimmed,
          canvas: activeCanvas,
          dataUrl: activeCanvas.toDataURL('image/png'),
          barcode: cellText.barcode || `ITEM-${labels.length + 1}`,
          title: cellText.title || '',
          sku: cellText.sku || '',
          quantity: 1,
          selected: true,
          width: activeCanvas.width,
          height: activeCanvas.height,
        });
      }
      continue;
    }

    let gridCols = 1;
    let gridRows = 1;
    let customSlicing = null;
    let colBounds = null;
    let rowBounds = null;

    if (mode === 'presetA4_40') {
      gridCols = 4;
      gridRows = 10;
      // Precise column cutlines between column gaps (midpoints):
      const colCutsPt = [0, 156.4, 285.0, 413.6, unscaledVp.width];
      colBounds = [];
      for (let c = 0; c < 4; c++) {
        colBounds.push({
          x: colCutsPt[c] * renderScale,
          w: (colCutsPt[c+1] - colCutsPt[c]) * renderScale,
        });
      }
      const rowCutsPt = [0, 88.0, 171.3, 254.6, 337.8, 421.1, 504.3, 587.6, 670.9, 754.1, unscaledVp.height];
      rowBounds = [];
      for (let r = 0; r < 10; r++) {
        rowBounds.push({
          y: rowCutsPt[r] * renderScale,
          h: (rowCutsPt[r+1] - rowCutsPt[r]) * renderScale,
        });
      }
    } else if (mode === 'presetA4_30') {
      gridCols = 3;
      gridRows = 10;
    } else if (mode === 'presetML_2') {
      gridCols = 2;
      gridRows = 1;
    } else if (mode === 'presetVertical_2') {
      gridCols = 1;
      gridRows = 2;
    } else if (mode === 'presetSingleTL') {
      customSlicing = [{
        col: 0,
        row: 0,
        x: 0,
        y: 0,
        w: canvas.width * 0.38,
        h: canvas.height * 0.15,
      }];
    }

    if (customSlicing) {
      for (const box of customSlicing) {
        if (isRegionBlank(ctx, box.x, box.y, box.w, box.h)) continue;
        
        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = box.w;
        cellCanvas.height = box.h;
        const cellCtx = cellCanvas.getContext('2d');
        cellCtx.drawImage(canvas, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
        
        const trimmed = trimWhiteBorder(cellCanvas);
        const activeCanvas = sharpenMode !== 'none' ? binarizeCanvas(trimmed, sharpenMode) : trimmed;
        const cellText = extractCellText(textContent.items, box, viewport, renderScale);
        
        labels.push({
          id: `p${pageNum}_custom_${labels.length}`,
          page: pageNum,
          rawCanvas: trimmed,
          canvas: activeCanvas,
          dataUrl: activeCanvas.toDataURL('image/png'),
          barcode: cellText.barcode || `ITEM-${labels.length + 1}`,
          title: cellText.title || '',
          sku: cellText.sku || '',
          quantity: 1,
          selected: true,
          width: activeCanvas.width,
          height: activeCanvas.height,
        });
      }
      continue;
    }

    const cellW = canvas.width / gridCols;
    const cellH = canvas.height / gridRows;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const x = colBounds ? colBounds[c].x : c * cellW;
        const y = rowBounds ? rowBounds[r].y : r * cellH;
        const w = colBounds ? colBounds[c].w : cellW;
        const h = rowBounds ? rowBounds[r].h : cellH;

        if (isRegionBlank(ctx, x + 5, y + 5, w - 10, h - 10)) {
          continue;
        }

        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = w;
        cellCanvas.height = h;
        const cellCtx = cellCanvas.getContext('2d');
        cellCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

        const trimmed = trimWhiteBorder(cellCanvas);
        const activeCanvas = sharpenMode !== 'none' ? binarizeCanvas(trimmed, sharpenMode) : trimmed;
        const cellBox = { x, y, w, h };
        const cellText = extractCellText(textContent.items, cellBox, viewport, renderScale);

        labels.push({
          id: `p${pageNum}_r${r}_c${c}`,
          page: pageNum,
          col: c + 1,
          row: r + 1,
          rawCanvas: trimmed,
          canvas: activeCanvas,
          dataUrl: activeCanvas.toDataURL('image/png'),
          barcode: cellText.barcode || `ITEM-${labels.length + 1}`,
          title: cellText.title || '',
          sku: cellText.sku || '',
          quantity: 1,
          selected: true,
          width: activeCanvas.width,
          height: activeCanvas.height,
        });
      }
    }
  }

  return labels;
}

/**
 * Match text items to cell bounding box coordinates
 */
function extractCellText(items, box, viewport, renderScale) {
  const cellTexts = [];
  for (const item of items) {
    const itemX = item.transform[4] * renderScale;
    const itemY = (viewport.height / renderScale - item.transform[5]) * renderScale;

    if (itemX >= box.x - 20 && itemX <= box.x + box.w + 20 &&
        itemY >= box.y - 20 && itemY <= box.y + box.h + 20) {
      if (item.str.trim()) {
        cellTexts.push(item.str.trim());
      }
    }
  }

  let barcode = '';
  let sku = '';
  let title = '';

  for (let i = 0; i < cellTexts.length; i++) {
    const txt = cellTexts[i];
    if (txt.startsWith('SKU:')) {
      sku = txt.replace('SKU:', '').trim();
    } else if (txt.startsWith('ENVÍO:')) {
      barcode = txt;
    } else if (/^[A-Z0-9]{6,14}$/.test(txt) && !barcode) {
      barcode = txt;
    } else if (txt.length > 10 && !title) {
      title = txt;
    }
  }

  return { barcode, sku, title };
}

/**
 * Group labels by barcode/SKU and sum quantities
 */
export function groupLabelsByBarcode(labels) {
  const map = new Map();

  for (const label of labels) {
    const key = label.barcode || label.sku || label.dataUrl.slice(-100);
    if (!map.has(key)) {
      map.set(key, {
        ...label,
        count: 0,
        subIds: [],
        pages: [],
      });
    }
    const group = map.get(key);
    const isSelected = label.selected !== false;
    const qty = parseInt(label.quantity, 10) >= 0 ? parseInt(label.quantity, 10) : 1;
    group.count += isSelected ? qty : 0;
    group.subIds.push(label.id);
    if (label.page && !group.pages.includes(label.page)) {
      group.pages.push(label.page);
    }
  }

  return Array.from(map.values()).map(g => ({
    ...g,
    quantity: g.count,
    selected: g.count > 0,
    page: g.pages.length === 1 ? g.pages[0] : (g.pages.length > 1 ? g.pages.join(',') : (g.page || 1)),
  }));
}

/**
 * Export labels into a standard thermal roll PDF file (Zero margins, exact millimeters)
 */
export async function exportThermalPdf(labels, options = {}) {
  const {
    targetWidthMm = 70,
    targetHeightMm = 30,
    fitMode = 'proportional',
    autoRotate = true,
  } = options;

  const pdfDoc = await PDFDocument.create();

  const ptPerMm = 72 / 25.4;
  let targetW = targetWidthMm * ptPerMm;
  let targetH = targetHeightMm * ptPerMm;

  for (const label of labels) {
    const qty = Math.max(1, parseInt(label.quantity) || 1);
    
    const imgBytes = await fetch(label.dataUrl).then(res => res.arrayBuffer());
    const embeddedImg = await pdfDoc.embedPng(imgBytes);

    for (let i = 0; i < qty; i++) {
      let pageW = targetW;
      let pageH = targetH;
      let imgW = embeddedImg.width;
      let imgH = embeddedImg.height;

      let shouldRotate = false;
      if (autoRotate) {
        const isImgLandscape = imgW > imgH;
        const isPageLandscape = pageW > pageH;
        if (isImgLandscape !== isPageLandscape) {
          shouldRotate = true;
        }
      }

      const page = pdfDoc.addPage([pageW, pageH]);

      if (shouldRotate) {
        const scale = Math.min(pageW / imgH, pageH / imgW);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const x = (pageW - drawH) / 2;
        const y = (pageH + drawW) / 2;

        page.drawImage(embeddedImg, {
          x: x,
          y: y,
          width: drawW,
          height: drawH,
          rotate: { type: 'degrees', angle: -90 },
        });
      } else {
        const scale = fitMode === 'stretch' 
          ? 1 
          : Math.min(pageW / imgW, pageH / imgH);
        
        const drawW = fitMode === 'stretch' ? pageW : imgW * scale;
        const drawH = fitMode === 'stretch' ? pageH : imgH * scale;
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;

        page.drawImage(embeddedImg, {
          x: x,
          y: y,
          width: drawW,
          height: drawH,
        });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
