import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';
import { generateBarcode, generateQRCode } from './barcodeGenerator';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Clean and combine text fragments
 */
function cleanText(str) {
  return (str || '').replace(/\s+/g, ' ').trim();
}

/**
 * Smartly parse text items on a page or in a cell box
 */
function parseTextCluster(items) {
  const texts = items.map(i => cleanText(i.str)).filter(Boolean);
  let barcode = '';
  let sku = '';
  const titleParts = [];

  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    if (t.toUpperCase().startsWith('SKU:')) {
      sku = cleanText(t.replace(/SKU:/i, ''));
    } else if (t.toUpperCase().startsWith('ENVÍO:') || t.toUpperCase().startsWith('ENVIO:')) {
      barcode = cleanText(t.replace(/ENV[ÍI]O:/i, ''));
    } else if (/^[A-Z0-9_-]{6,16}$/.test(t) && !barcode) {
      barcode = t;
    } else {
      titleParts.push(t);
    }
  }

  // Combine title fragments
  let title = titleParts.join(' ').trim();
  // Filter out header boilerplate if any
  title = title.replace(/^(ENTREGAR A FULL|NO VÁLIDA PARA COLECTA|BULTOS)\s*/i, '').trim();

  return {
    barcode,
    sku,
    title,
    rawTexts: texts,
  };
}

/**
 * Extract labels from a PDF Document
 */
export async function extractLabelsFromPdf(fileOrBuffer, onProgress = null) {
  let uint8Array;
  if (fileOrBuffer instanceof Uint8Array) {
    uint8Array = fileOrBuffer;
  } else if (typeof fileOrBuffer === 'string') {
    const res = await fetch(fileOrBuffer);
    const ab = await res.arrayBuffer();
    uint8Array = new Uint8Array(ab);
  } else {
    const ab = await fileOrBuffer.arrayBuffer();
    uint8Array = new Uint8Array(ab);
  }

  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const extractedList = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) onProgress(pageNum, numPages);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const items = textContent.items || [];

    if (items.length === 0) continue;

    // Check if this is a single label page or a multi-label grid page
    // If fewer than 25 text items, it's typically 1 label per page
    if (items.length <= 25) {
      const parsed = parseTextCluster(items);
      if (parsed.barcode || parsed.sku || parsed.title) {
        extractedList.push({
          id: `label_p${pageNum}_1`,
          page: pageNum,
          barcode: parsed.barcode || `ITEM-${extractedList.length + 1}`,
          sku: parsed.sku || '',
          title: parsed.title || '',
          quantity: 1,
          selected: true,
          rawTexts: parsed.rawTexts,
        });
      }
    } else {
      // Multi-item page (e.g. A4 30-up or A4 40-up grid)
      // Group items by spatial proximity
      // Detect if 4 columns (col4Counts[3] >= 8) or standard 3 columns
      const col4Counts = [0, 0, 0, 0];
      for (const item of items) {
        const c = Math.min(3, Math.max(0, Math.floor((item.transform[4] / viewport.width) * 4)));
        col4Counts[c]++;
      }
      const cols = col4Counts[3] >= 8 ? 4 : 3;
      const rows = 10;
      const colWidth = viewport.width / cols;
      const rowHeight = viewport.height / rows;

      // Group items into grid cells
      const grid = {};
      for (const item of items) {
        const x = item.transform[4];
        const y = viewport.height - item.transform[5];
        const col = Math.min(cols - 1, Math.max(0, Math.floor(x / colWidth)));
        const row = Math.min(rows - 1, Math.max(0, Math.floor(y / rowHeight)));
        const key = `${row}_${col}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(item);
      }

      for (const key in grid) {
        const cellItems = grid[key];
        const parsed = parseTextCluster(cellItems);
        if (parsed.barcode || parsed.sku || parsed.title) {
          extractedList.push({
            id: `label_p${pageNum}_${key}`,
            page: pageNum,
            barcode: parsed.barcode || `ITEM-${extractedList.length + 1}`,
            sku: parsed.sku || '',
            title: parsed.title || '',
            quantity: 1,
            selected: true,
            rawTexts: parsed.rawTexts,
          });
        }
      }
    }
  }

  // Aggregate identical labels by barcode & SKU
  const aggregatedMap = new Map();
  for (const item of extractedList) {
    const key = `${item.barcode}_${item.sku}_${item.title.slice(0, 20)}`;
    if (!aggregatedMap.has(key)) {
      aggregatedMap.set(key, {
        ...item,
        quantity: 0,
        instances: [],
      });
    }
    const entry = aggregatedMap.get(key);
    entry.quantity += 1;
    entry.instances.push(item.id);
  }

  const aggregatedList = Array.from(aggregatedMap.values());

  return {
    items: aggregatedList.length > 0 ? aggregatedList : extractedList,
    rawList: extractedList,
    totalPages: numPages,
  };
}

/**
 * Standard default layout templates for different thermal paper dimensions
 */
export function getDefaultLayout(widthMm = 50, heightMm = 25) {
  if (widthMm === 50 && heightMm === 25) {
    return [
      {
        id: 'elem_barcode',
        type: 'barcode',
        x: 2.5,
        y: 1.5,
        width: 45,
        height: 10,
        showText: true,
        fontSize: 9,
      },
      {
        id: 'elem_title',
        type: 'title',
        x: 2,
        y: 14.5,
        width: 46,
        fontSize: 9,
        bold: true,
        align: 'center',
        maxLines: 2,
      },
      {
        id: 'elem_sku',
        type: 'sku',
        x: 2,
        y: 20.5,
        width: 46,
        fontSize: 9,
        bold: true,
        prefix: 'SKU: ',
        align: 'center',
      },
    ];
  } else if (widthMm === 50 && heightMm === 30) {
    return [
      {
        id: 'elem_barcode',
        type: 'barcode',
        x: 2.5,
        y: 2,
        width: 45,
        height: 12,
        showText: true,
        fontSize: 10,
      },
      {
        id: 'elem_title',
        type: 'title',
        x: 2,
        y: 17,
        width: 46,
        fontSize: 10,
        bold: true,
        align: 'center',
        maxLines: 2,
      },
      {
        id: 'elem_sku',
        type: 'sku',
        x: 2,
        y: 24,
        width: 46,
        fontSize: 10,
        bold: true,
        prefix: 'SKU: ',
        align: 'center',
      },
    ];
  } else if (widthMm === 70 && heightMm === 30) {
    return [
      {
        id: 'elem_barcode',
        type: 'barcode',
        x: 10,
        y: 2,
        width: 50,
        height: 13,
        showText: true,
        fontSize: 11,
      },
      {
        id: 'elem_title',
        type: 'title',
        x: 4,
        y: 18,
        width: 62,
        fontSize: 11,
        bold: true,
        align: 'center',
        maxLines: 2,
      },
      {
        id: 'elem_sku',
        type: 'sku',
        x: 4,
        y: 24,
        width: 62,
        fontSize: 11,
        bold: true,
        prefix: 'SKU: ',
        align: 'center',
      },
    ];
  }

  // Generic fallback layout
  return [
    {
      id: 'elem_barcode',
      type: 'barcode',
      x: 3,
      y: 2,
      width: Math.max(20, widthMm - 6),
      height: Math.max(8, Math.round(heightMm * 0.4)),
      showText: true,
      fontSize: 10,
    },
    {
      id: 'elem_title',
      type: 'title',
      x: 2,
      y: Math.round(heightMm * 0.48),
      width: Math.max(20, widthMm - 4),
      fontSize: 10,
      bold: true,
      align: 'center',
      maxLines: 2,
    },
    {
      id: 'elem_sku',
      type: 'sku',
      x: 2,
      y: Math.round(heightMm * 0.78),
      width: Math.max(20, widthMm - 4),
      fontSize: 10,
      bold: true,
      prefix: 'SKU: ',
      align: 'center',
    },
  ];
}
