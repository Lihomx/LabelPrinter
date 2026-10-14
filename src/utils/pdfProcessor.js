import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Configure pdfjs worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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
function trimWhiteBorder(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let top = 0, bottom = h - 1, left = 0, right = w - 1;

  // Find top
  topLoop: for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx] < 235 || data[idx+1] < 235 || data[idx+2] < 235) {
        top = Math.max(0, y - 4);
        break topLoop;
      }
    }
  }

  // Find bottom
  bottomLoop: for (let y = h - 1; y >= 0; y--) {
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
  rightLoop: for (let x = w - 1; x >= 0; x--) {
    for (let y = top; y <= bottom; y++) {
      const idx = (y * w + x) * 4;
      if (data[idx] < 235 || data[idx+1] < 235 || data[idx+2] < 235) {
        right = Math.min(w - 1, x + 4);
        break rightLoop;
      }
    }
  }

  const cropW = Math.max(10, right - left);
  const cropH = Math.max(10, bottom - top);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropW;
  croppedCanvas.height = cropH;
  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);

  return croppedCanvas;
}

/**
 * Load PDF file and parse page-by-page
 */
export async function loadPdfDocument(fileOrUrl) {
  let loadingTask;
  if (typeof fileOrUrl === 'string') {
    loadingTask = pdfjsLib.getDocument(fileOrUrl);
  } else {
    const arrayBuffer = await fileOrUrl.arrayBuffer();
    loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  }
  return await loadingTask.promise;
}

/**
 * Automatically analyze layout from PDF dimensions and text
 */
export async function detectSuggestedLayout(pdfDoc) {
  const numPages = pdfDoc.numPages;
  const firstPage = await pdfDoc.getPage(1);
  const viewport = firstPage.getViewport({ scale: 1.0 });
  const textContent = await firstPage.getTextContent();
  const textItems = textContent.items.map(i => i.str).join(' ');

  // 1. Check for Mercado Libre 2-in-1
  if (textItems.includes('FULL') || textItems.includes('ENTREGAR A FULL') || textItems.includes('BULTOS')) {
    // If aspect ratio is approx A4 landscape or portrait with 2 labels
    if (viewport.width > viewport.height || textItems.includes('Envío:')) {
      return 'presetML_2';
    }
  }

  // 2. Check for A4 30-up
  if (textItems.includes('SKU:') || textItems.includes('Pantalla') || textContent.items.length > 50) {
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
 * Slice PDF into individual label objects based on grid/mode
 */
export async function slicePdfLabels(pdfDoc, mode = 'presetA4_30', onProgress = null) {
  const labels = [];
  const numPages = pdfDoc.numPages;
  const renderScale = 2.5; // High resolution rendering for sharp barcodes

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) onProgress(pageNum, numPages);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: renderScale });
    
    // Render PDF page to memory canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    // Get text content to extract SKU/Barcode
    const textContent = await page.getTextContent();

    let gridCols = 1;
    let gridRows = 1;
    let customSlicing = null;

    if (mode === 'presetA4_30') {
      gridCols = 3;
      gridRows = 10;
    } else if (mode === 'presetML_2') {
      gridCols = 2;
      gridRows = 1;
    } else if (mode === 'presetVertical_2') {
      gridCols = 1;
      gridRows = 2;
    } else if (mode === 'presetSingleTL') {
      // Crop top-left region: approx 35% width, 15% height of A4
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
        const cellText = extractCellText(textContent.items, box, viewport, renderScale);
        
        labels.push({
          id: `p${pageNum}_custom_${labels.length}`,
          page: pageNum,
          canvas: trimmed,
          dataUrl: trimmed.toDataURL('image/png'),
          barcode: cellText.barcode || `ITEM-${labels.length + 1}`,
          title: cellText.title || '',
          sku: cellText.sku || '',
          quantity: 1,
          selected: true,
          width: trimmed.width,
          height: trimmed.height,
        });
      }
      continue;
    }

    const cellW = canvas.width / gridCols;
    const cellH = canvas.height / gridRows;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const x = c * cellW;
        const y = r * cellH;

        // Skip blank cells (vital for page 6 of 30-up PDF or page 2 of vertical 2-up)
        if (isRegionBlank(ctx, x + 5, y + 5, cellW - 10, cellH - 10)) {
          continue;
        }

        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = cellW;
        cellCanvas.height = cellH;
        const cellCtx = cellCanvas.getContext('2d');
        cellCtx.drawImage(canvas, x, y, cellW, cellH, 0, 0, cellW, cellH);

        const trimmed = trimWhiteBorder(cellCanvas);
        const cellBox = { x, y, w: cellW, h: cellH };
        const cellText = extractCellText(textContent.items, cellBox, viewport, renderScale);

        labels.push({
          id: `p${pageNum}_r${r}_c${c}`,
          page: pageNum,
          col: c + 1,
          row: r + 1,
          canvas: trimmed,
          dataUrl: trimmed.toDataURL('image/png'),
          barcode: cellText.barcode || `ITEM-${labels.length + 1}`,
          title: cellText.title || '',
          sku: cellText.sku || '',
          quantity: 1,
          selected: true,
          width: trimmed.width,
          height: trimmed.height,
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
  // Convert PDF coordinates (origin at bottom-left) to Canvas coordinates (origin top-left)
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
      // Typical SKU/Barcode identifier like IASF90617, MXRC03, ZTXX53163
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
      });
    }
    const group = map.get(key);
    group.count += 1;
    group.subIds.push(label.id);
  }

  return Array.from(map.values()).map(g => ({
    ...g,
    quantity: g.count, // Default quantity = total occurrences in PDF
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

  // Convert mm to PDF points (1 inch = 25.4 mm = 72 points)
  const ptPerMm = 72 / 25.4;
  let targetW = targetWidthMm * ptPerMm;
  let targetH = targetHeightMm * ptPerMm;

  for (const label of labels) {
    const qty = Math.max(1, parseInt(label.quantity) || 1);
    
    // Embed image into PDF
    const imgBytes = await fetch(label.dataUrl).then(res => res.arrayBuffer());
    const embeddedImg = await pdfDoc.embedPng(imgBytes);

    for (let i = 0; i < qty; i++) {
      let pageW = targetW;
      let pageH = targetH;
      let imgW = embeddedImg.width;
      let imgH = embeddedImg.height;

      // Auto rotation check
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
        // Swap dimensions for fitting
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
