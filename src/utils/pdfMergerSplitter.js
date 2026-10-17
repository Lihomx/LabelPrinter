import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Parse page range string like "1-3, 5, 8-10" or "all" into 0-indexed array
 * @param {string} rangeStr 
 * @param {number} totalPages 
 * @returns {number[]} 0-indexed page indices
 */
export function parsePageRange(rangeStr, totalPages) {
  if (!rangeStr || typeof rangeStr !== 'string' || rangeStr.trim().toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set();
  const parts = rangeStr.split(/[,，\s]+/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          indices.add(p - 1);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        indices.add(p - 1);
      }
    }
  }

  const result = Array.from(indices).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: totalPages }, (_, i) => i);
}

/**
 * Format 0-indexed page indices into human-readable string like "1-3, 5, 8-10"
 * @param {number[]} indices 
 * @returns {string}
 */
export function formatPageRange(indices) {
  if (!indices || indices.length === 0) return '';
  const sorted = [...indices].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = start;

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    if (curr === prev + 1) {
      prev = curr;
    } else {
      ranges.push(start === prev ? `${start + 1}` : `${start + 1}-${prev + 1}`);
      start = curr;
      prev = curr;
    }
  }
  ranges.push(start === prev ? `${start + 1}` : `${start + 1}-${prev + 1}`);
  return ranges.join(', ');
}

/**
 * Render a single page thumbnail as dataUrl
 * @param {ArrayBuffer|Uint8Array} pdfBytes 
 * @param {number} pageNumber 1-based page number
 * @param {number} targetWidth pixel width of thumbnail
 */
export async function renderPageThumbnail(pdfBytes, pageNumber = 1, targetWidth = 260) {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBytes),
      cMapPacked: true
    });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNumber);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;

    return {
      thumbnail: canvas.toDataURL('image/jpeg', 0.85),
      widthPt: unscaledViewport.width,
      heightPt: unscaledViewport.height,
      widthMm: Math.round(unscaledViewport.width * 25.4 / 72),
      heightMm: Math.round(unscaledViewport.height * 25.4 / 72)
    };
  } catch (err) {
    console.warn(`Thumbnail rendering error for page ${pageNumber}:`, err);
    return null;
  }
}

/**
 * Inspect a PDF file and extract page count, dimensions and page 1 thumbnail
 * @param {File} file 
 */
export async function inspectPdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  let firstPageInfo = null;
  if (pageCount > 0) {
    const page1 = pdfDoc.getPage(0);
    const { width, height } = page1.getSize();
    firstPageInfo = {
      widthPt: width,
      heightPt: height,
      widthMm: Math.round(width * 25.4 / 72),
      heightMm: Math.round(height * 25.4 / 72)
    };
  }

  // Generate thumbnail
  let thumbnail = null;
  try {
    const thumbRes = await renderPageThumbnail(arrayBuffer, 1, 240);
    if (thumbRes) thumbnail = thumbRes.thumbnail;
  } catch (e) {
    // optional thumbnail fallback
  }

  return {
    id: `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    file,
    name: file.name,
    size: file.size,
    pageCount,
    firstPageInfo,
    thumbnail,
    arrayBuffer,
    pageRange: 'all',
    selectedPages: Array.from({ length: pageCount }, (_, i) => i)
  };
}

/**
 * Merge multiple PDF documents into a single PDF
 * @param {Array<{ arrayBuffer: ArrayBuffer, selectedPages?: number[], pageRange?: string, pageCount: number }>} items 
 * @param {Function} onProgress (percent, statusText) => void
 * @returns {Promise<Uint8Array>}
 */
export async function mergePdfDocuments(items, onProgress = () => {}) {
  if (!items || items.length === 0) {
    throw new Error('No PDF files to merge');
  }

  onProgress(5, 'Initializing merged document...');
  const mergedPdf = await PDFDocument.create();
  const totalItems = items.length;

  for (let i = 0; i < totalItems; i++) {
    const item = items[i];
    const itemProgressStart = 10 + Math.round((i / totalItems) * 80);
    onProgress(itemProgressStart, `Processing file ${i + 1}/${totalItems}: ${item.name || ''}...`);

    const srcDoc = await PDFDocument.load(item.arrayBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    // Determine which pages to copy
    let indices = item.selectedPages;
    if (!indices || indices.length === 0) {
      indices = parsePageRange(item.pageRange, totalPages);
    }

    if (indices.length > 0) {
      const copiedPages = await mergedPdf.copyPages(srcDoc, indices);
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
  }

  onProgress(95, 'Saving merged PDF document...');
  const mergedBytes = await mergedPdf.save();
  onProgress(100, 'Merge completed!');
  return mergedBytes;
}

/**
 * Split PDF: Extract specific pages into a single new PDF
 * @param {ArrayBuffer} srcBuffer 
 * @param {number[]} pageIndices 0-indexed page numbers
 * @returns {Promise<Uint8Array>}
 */
export async function splitPdfExtractPages(srcBuffer, pageIndices) {
  if (!pageIndices || pageIndices.length === 0) {
    throw new Error('No pages selected to extract');
  }
  const srcDoc = await PDFDocument.load(srcBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
  copiedPages.forEach(page => newDoc.addPage(page));
  return await newDoc.save();
}

/**
 * Split PDF: Split each selected page into its own individual single-page PDF and bundle into ZIP
 * @param {ArrayBuffer} srcBuffer 
 * @param {number[]} pageIndices 0-indexed
 * @param {string} baseName 
 * @param {Function} onProgress 
 * @returns {Promise<Blob>}
 */
export async function splitPdfToSinglePagesZip(srcBuffer, pageIndices, baseName = 'document', onProgress = () => {}) {
  const srcDoc = await PDFDocument.load(srcBuffer, { ignoreEncryption: true });
  const zip = new JSZip();
  const cleanBaseName = baseName.replace(/\.pdf$/i, '');
  const total = pageIndices.length;

  for (let idx = 0; idx < total; idx++) {
    const pageIndex = pageIndices[idx];
    const pageNum = pageIndex + 1;
    onProgress(Math.round(((idx + 1) / total) * 90), `Exporting page ${pageNum} (${idx + 1}/${total})...`);

    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(srcDoc, [pageIndex]);
    singleDoc.addPage(copiedPage);
    const pageBytes = await singleDoc.save();

    const paddedNum = String(pageNum).padStart(total >= 100 ? 3 : 2, '0');
    zip.file(`${cleanBaseName}_page_${paddedNum}.pdf`, pageBytes);
  }

  onProgress(95, 'Compressing ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress(95 + Math.round(metadata.percent * 0.05), 'Packaging ZIP...');
  });
  onProgress(100, 'Complete!');
  return zipBlob;
}

/**
 * Split PDF: Split by fixed page intervals (e.g. every 2 pages, every 5 pages) and bundle into ZIP
 * @param {ArrayBuffer} srcBuffer 
 * @param {number} intervalSize number of pages per chunk
 * @param {string} baseName 
 * @param {Function} onProgress 
 * @returns {Promise<{ zipBlob: Blob, partCount: number }>}
 */
export async function splitPdfByIntervalZip(srcBuffer, intervalSize, baseName = 'document', onProgress = () => {}) {
  const srcDoc = await PDFDocument.load(srcBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const cleanBaseName = baseName.replace(/\.pdf$/i, '');
  const zip = new JSZip();

  const partCount = Math.ceil(totalPages / intervalSize);

  for (let part = 0; part < partCount; part++) {
    const startPage = part * intervalSize;
    const endPage = Math.min(startPage + intervalSize, totalPages);
    const chunkIndices = [];
    for (let p = startPage; p < endPage; p++) {
      chunkIndices.push(p);
    }

    onProgress(Math.round(((part + 1) / partCount) * 90), `Exporting part ${part + 1}/${partCount}...`);
    const partDoc = await PDFDocument.create();
    const copiedPages = await partDoc.copyPages(srcDoc, chunkIndices);
    copiedPages.forEach(p => partDoc.addPage(p));
    const partBytes = await partDoc.save();

    const paddedPart = String(part + 1).padStart(2, '0');
    zip.file(`${cleanBaseName}_part_${paddedPart}_p${startPage + 1}-p${endPage}.pdf`, partBytes);
  }

  onProgress(95, 'Compressing ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress(100, 'Complete!');
  return { zipBlob, partCount };
}

/**
 * Split PDF: Separate into Odd and Even pages
 * @param {ArrayBuffer} srcBuffer 
 * @param {string} baseName 
 * @returns {Promise<{ oddBytes: Uint8Array, evenBytes: Uint8Array, oddCount: number, evenCount: number, zipBlob: Blob }>}
 */
export async function splitPdfOddEven(srcBuffer, baseName = 'document') {
  const srcDoc = await PDFDocument.load(srcBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const cleanBaseName = baseName.replace(/\.pdf$/i, '');

  const oddIndices = [];
  const evenIndices = [];

  for (let i = 0; i < totalPages; i++) {
    if ((i + 1) % 2 === 1) {
      oddIndices.push(i);
    } else {
      evenIndices.push(i);
    }
  }

  let oddBytes = null;
  if (oddIndices.length > 0) {
    const oddDoc = await PDFDocument.create();
    const pages = await oddDoc.copyPages(srcDoc, oddIndices);
    pages.forEach(p => oddDoc.addPage(p));
    oddBytes = await oddDoc.save();
  }

  let evenBytes = null;
  if (evenIndices.length > 0) {
    const evenDoc = await PDFDocument.create();
    const pages = await evenDoc.copyPages(srcDoc, evenIndices);
    pages.forEach(p => evenDoc.addPage(p));
    evenBytes = await evenDoc.save();
  }

  const zip = new JSZip();
  if (oddBytes) zip.file(`${cleanBaseName}_odd_pages.pdf`, oddBytes);
  if (evenBytes) zip.file(`${cleanBaseName}_even_pages.pdf`, evenBytes);
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return {
    oddBytes,
    evenBytes,
    oddCount: oddIndices.length,
    evenCount: evenIndices.length,
    zipBlob
  };
}

/**
 * Browser download helper
 * @param {Blob|Uint8Array} data 
 * @param {string} filename 
 * @param {string} mimeType 
 */
export function downloadFile(data, filename, mimeType = 'application/pdf') {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
