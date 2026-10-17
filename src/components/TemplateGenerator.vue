<template>
  <div class="space-y-6">
    <!-- Header & Mode Switcher -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">{{ t('template.title') }}</h2>
        <p class="text-xs text-slate-500 mt-1">{{ t('template.subtitle') }}</p>
      </div>

      <!-- Template Select Tabs -->
      <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
        <button 
          v-for="tpl in templateList" 
          :key="tpl.id"
          @click="selectTemplate(tpl)"
          class="px-4 py-2 text-xs font-bold rounded-lg transition-all"
          :class="activeTemplateId === tpl.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          {{ tpl.name }}
        </button>
      </div>
    </div>

    <!-- Main Workspace: Form inputs on left, 1:1 Canvas preview on right -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Form Fields & Excel Batch -->
      <div class="lg:col-span-6 space-y-6">
        <!-- Input Method Tabs (Single Fill vs Excel Batch) -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="font-bold text-sm text-slate-800 flex items-center gap-2">
              <FileEdit class="w-4 h-4 text-brand-600" />
              {{ t('template.formInputs') }}
            </h3>

            <!-- Excel Import Trigger -->
            <label class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg cursor-pointer border border-emerald-200 transition-colors">
              <FileSpreadsheet class="w-3.5 h-3.5" />
              <span>{{ t('template.excelImport') }}</span>
              <input type="file" accept=".xlsx, .xls, .csv" class="hidden" @change="handleExcelUpload" />
            </label>
          </div>

          <!-- Template 1 Form: Spanish Compliance Table (Fabricante) -->
          <div v-if="activeTemplateId === 'compliance'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.fabricante') }}</label>
              <input v-model="formData.fabricante" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.dirFabricante') }}</label>
              <textarea v-model="formData.dirFabricante" rows="2" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500"></textarea>
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.distribuidor') }}</label>
              <input v-model="formData.distribuidor" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.dirDistribuidor') }}</label>
              <textarea v-model="formData.dirDistribuidor" rows="2" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500"></textarea>
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.nombreProducto') }}</label>
              <input v-model="formData.nombreProducto" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.contenidoNeto') }}</label>
              <input v-model="formData.contenidoNeto" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.lote') }}</label>
              <input v-model="formData.lote" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.fechaFab') }}</label>
              <input v-model="formData.fechaFab" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <!-- Template 2 Form: Carton Box Label (Etiqueta de Bulto) -->
          <div v-if="activeTemplateId === 'boxLabel'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.envioCode') }}</label>
              <input v-model="formData.envioCode" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.sellerAccount') }}</label>
              <input v-model="formData.sellerAccount" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.shipmentId') }}</label>
              <input v-model="formData.bultoId" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.destinationCode') }}</label>
              <input v-model="formData.destinationCode" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <!-- Template 3 Form: Standard SKU Barcode Label -->
          <div v-if="activeTemplateId === 'skuBarcode'" class="space-y-4">
            <div>
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.barcodeValue') }}</label>
              <input v-model="formData.barcodeValue" type="text" class="w-full px-3 py-1.5 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.productTitle') }}</label>
              <textarea v-model="formData.productTitle" rows="3" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.variant') }}</label>
                <input v-model="formData.variant" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label class="text-xs text-slate-500 font-semibold block mb-1">{{ t('template.skuCode') }}</label>
                <input v-model="formData.skuCode" type="text" class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>

          <!-- Print Quantity and Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 font-semibold">{{ t('template.copies') }}</span>
              <input v-model.number="printCopies" type="number" min="1" class="w-16 px-2 py-1 text-center font-bold text-sm border border-slate-200 rounded-lg bg-slate-50" />
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="downloadTemplatePdf"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download class="w-3.5 h-3.5" />
                <span>{{ t('template.exportPdf') }}</span>
              </button>
              <button 
                @click="printTemplateDirect"
                class="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Printer class="w-3.5 h-3.5" />
                <span>{{ t('template.silentPrint') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Excel Batch Queue Table (If uploaded) -->
        <div v-if="batchList.length > 0" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-800">{{ t('template.batchQueue', { count: batchList.length }) }}</span>
            <button @click="batchList = []" class="text-xs text-rose-500 hover:underline">{{ t('template.clearQueue') }}</button>
          </div>
          <div class="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
            <div v-for="(row, idx) in batchList" :key="idx" class="py-2 flex items-center justify-between">
              <span class="font-mono text-slate-700 font-bold truncate max-w-[200px]">{{ row.barcodeValue || row.skuCode }}</span>
              <span class="text-slate-500 truncate max-w-[200px]">{{ row.productTitle || row.nombreProducto }}</span>
              <span class="text-brand-600 font-bold">1 {{ t('pdf.piecesUnit') }}</span>
            </div>
          </div>
          <button 
            @click="printAllBatch" 
            class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2"
          >
            <Printer class="w-4 h-4" />
            <span>{{ t('template.printAllBatch', { count: batchList.length }) }}</span>
          </button>
        </div>
      </div>

      <!-- Right Column: High-DPI Real-time Canvas WYSIWYG Preview -->
      <div class="lg:col-span-6 bg-slate-100 rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center min-h-[520px]">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Eye class="w-4 h-4 text-brand-600" />
          {{ t('template.wysiwygDesc') }}
        </div>

        <!-- The Physical Paper Shell -->
        <div 
          class="bg-white shadow-xl rounded border border-slate-300 relative overflow-hidden transition-all duration-200 flex items-center justify-center p-2"
          :style="{
            width: `${currentWidthMm * 3.5}px`,
            height: `${currentHeightMm * 3.5}px`,
          }"
        >
          <!-- Canvas Renderer for pixel-perfect label -->
          <canvas ref="previewCanvasRef" class="w-full h-full object-contain"></canvas>
        </div>

        <div class="text-center mt-3 text-xs text-slate-400 font-mono">
          {{ t('template.paperInfo', { w: currentWidthMm, h: currentHeightMm }) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed } from 'vue';
import { FileEdit, FileSpreadsheet, Download, Printer, Eye } from 'lucide-vue-next';
import * as XLSX from 'xlsx';
import { t } from '@/i18n';
import { generateBarcode, generateQRCode } from '@/utils/barcodeGenerator';
import { PDFDocument } from 'pdf-lib';

const activeTemplateId = ref('compliance');
const previewCanvasRef = ref(null);
const printCopies = ref(1);
const batchList = ref([]);

const templateList = computed(() => [
  { id: 'compliance', name: t('template.tplCompliance'), width: 100, height: 100 },
  { id: 'boxLabel', name: t('template.tplBoxLabel'), width: 100, height: 100 },
  { id: 'skuBarcode', name: t('template.tplSkuBarcode'), width: 70, height: 30 },
]);

const currentWidthMm = ref(100);
const currentHeightMm = ref(100);

const formData = reactive({
  // Compliance Table
  fabricante: 'Yiwu Jingzhan Electronic Commerce Company',
  dirFabricante: '18 Shengdabei Street, Chengxi Street, Yiwu City, Jinhua City, China (Zhejiang) Free Trade Pilot Zone',
  distribuidor: 'Shenzhen Beiduoli Technology Co., Ltd.',
  dirDistribuidor: 'Séptimo piso de la planta del edificio C, No. 4 Shangxue Science Industry City, Shenzhen',
  nombreGenerico: 'Láminas de limpieza de lavadoras',
  nombreProducto: '48 tabletas de limpieza de lavadoras',
  contenidoNeto: '718G',
  paisOrigen: 'China',
  instrucciones: 'Limpieza profunda y sencilla de tu lavadora: Limpia a fondo el tambor, las válvulas y los filtros.',
  lote: '20260820',
  fechaFab: '20 de agosto de 2026',

  // Box Label
  envioCode: '79396637/1',
  sellerAccount: 'USBELSADIAMONDLLCMXF',
  bultoId: '3755760733',
  destinationCode: 'MXRC03',

  // SKU Barcode
  barcodeValue: 'UITQ48802',
  productTitle: 'Juego De Rotuladores Permanentes Doble Punta 36 Colores',
  variant: '36 Colores',
  skuCode: 'MC-0001',
});

const selectTemplate = (tpl) => {
  activeTemplateId.value = tpl.id;
  currentWidthMm.value = tpl.width;
  currentHeightMm.value = tpl.height;
  renderLabel();
};

// Render on canvas based on 203 DPI (8 dots per mm)
const renderLabel = async () => {
  await nextTick();
  const canvas = previewCanvasRef.value;
  if (!canvas) return;

  const dpm = 8; // 8 dots/mm = 203 DPI standard
  const w = currentWidthMm.value * dpm;
  const h = currentHeightMm.value * dpm;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';

  if (activeTemplateId.value === 'compliance') {
    renderComplianceTable(ctx, w, h);
  } else if (activeTemplateId.value === 'boxLabel') {
    await renderBoxLabel(ctx, w, h);
  } else if (activeTemplateId.value === 'skuBarcode') {
    await renderSkuBarcode(ctx, w, h);
  }
};

// 1. Draw Spanish Compliance Table (matching Word structure)
function renderComplianceTable(ctx, w, h) {
  const pad = 20;
  const tableW = w - pad * 2;
  const tableH = h - pad * 2;
  const col1W = tableW * 0.32;
  const col2W = tableW * 0.68;

  ctx.lineWidth = 3;
  ctx.strokeRect(pad, pad, tableW, tableH);

  const rows = [
    { label: 'Fabricante', val: formData.fabricante, h: 45 },
    { label: 'Dirección de Fabricante', val: formData.dirFabricante, h: 100 },
    { label: 'Distribuidor/Importador', val: formData.distribuidor, h: 45 },
    { label: 'Dirección de Distribuidor/Importador', val: formData.dirDistribuidor, h: 120 },
    { label: 'Nombre genérico', val: formData.nombreGenerico, h: 45 },
    { label: 'Nombre del producto', val: formData.nombreProducto, h: 45 },
    { label: 'Contenido neto', val: formData.contenidoNeto, h: 40 },
    { label: 'País de origen', val: formData.paisOrigen, h: 40 },
    { label: 'Instrucciones de uso', val: formData.instrucciones, h: 140 },
    { label: 'Lote', val: formData.lote, h: 40 },
    { label: 'Fecha de fabricación', val: formData.fechaFab, h: 40 },
  ];

  let currentY = pad;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // horizontal line
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(pad, currentY);
      ctx.lineTo(pad + tableW, currentY);
      ctx.stroke();
    }

    // Col 1: Label
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, row.label, pad + col1W / 2, currentY + 22, col1W - 16, 18);

    // Col 2: Value
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'left';
    wrapText(ctx, row.val, pad + col1W + 12, currentY + 22, col2W - 20, 18);

    currentY += row.h;
  }

  // Vertical divider
  ctx.beginPath();
  ctx.moveTo(pad + col1W, pad);
  ctx.lineTo(pad + col1W, pad + tableH);
  ctx.stroke();
}

// 2. Draw Carton Box Label
async function renderBoxLabel(ctx, w, h) {
  // Title
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ETIQUETA DE BULTO', w / 2, 70);

  // Generate QR Code
  const qrUrl = await generateQRCode(formData.envioCode, { size: 380 });
  if (qrUrl) {
    const img = new Image();
    img.src = qrUrl;
    await img.decode();
    ctx.drawImage(img, (w - 380) / 2, 110, 380, 380);
  }

  // Shipping code & Seller
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Inter, sans-serif';
  ctx.fillText(`ENVÍO: ${formData.envioCode}`, w / 2, 540);

  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText(formData.sellerAccount, w / 2, 590);

  ctx.font = '22px Inter, sans-serif';
  ctx.fillText(`ID: ${formData.bultoId}`, w / 2, 630);

  // Destination code
  if (formData.destinationCode) {
    ctx.font = 'bold 50px Inter, sans-serif';
    ctx.fillText(formData.destinationCode, w / 2, 720);
  }
}

// 3. Draw Standard SKU Barcode Label (with smart wrapping)
async function renderSkuBarcode(ctx, w, h) {
  // Generate 1D barcode
  const barcodeUrl = generateBarcode(formData.barcodeValue, {
    width: 2.2,
    height: 75,
    fontSize: 22,
  });

  if (barcodeUrl) {
    const img = new Image();
    img.src = barcodeUrl;
    await img.decode();
    ctx.drawImage(img, (w - img.width) / 2, 10);
  }

  // Product title (Smart word wrapping)
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.textAlign = 'left';
  const startY = 135;
  wrapText(ctx, formData.productTitle, 20, startY, w - 40, 24);

  // Variant & SKU
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText(formData.variant, 20, startY + 54);

  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillText(`SKU: ${formData.skuCode}`, 20, startY + 82);
}

// Word-wrap utility: wraps by words, never cuts words in half
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  const words = String(text).split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

// Excel upload handler
const handleExcelUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(firstSheet);
    
    batchList.value = json.map(row => ({
      barcodeValue: row['条码'] || row['Barcode'] || row['BARCODE'] || 'ITEM123',
      productTitle: row['品名'] || row['Title'] || row['Nombre'] || '',
      skuCode: row['SKU'] || row['sku'] || '',
      variant: row['规格'] || row['Variant'] || '',
      fabricante: row['制造商'] || formData.fabricante,
      nombreProducto: row['产品名称'] || row['Title'] || '',
      lote: row['批号'] || formData.lote,
      fechaFab: row['生产日期'] || formData.fechaFab,
    }));
  };
  reader.readAsArrayBuffer(file);
};

// Export to standard single/multi page PDF
const downloadTemplatePdf = async () => {
  const canvas = previewCanvasRef.value;
  if (!canvas) return;

  const pdfDoc = await PDFDocument.create();
  const ptPerMm = 72 / 25.4;
  const targetW = currentWidthMm.value * ptPerMm;
  const targetH = currentHeightMm.value * ptPerMm;

  const imgBytes = await fetch(canvas.toDataURL('image/png')).then(r => r.arrayBuffer());
  const embeddedImg = await pdfDoc.embedPng(imgBytes);

  for (let i = 0; i < printCopies.value; i++) {
    const page = pdfDoc.addPage([targetW, targetH]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: targetW,
      height: targetH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Label_${activeTemplateId.value}_${currentWidthMm.value}x${currentHeightMm.value}mm.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

// Direct silent print
const printTemplateDirect = async () => {
  const canvas = previewCanvasRef.value;
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  const copies = parseInt(printCopies.value, 10) || 1;
  const w = currentWidthMm.value;
  const h = currentHeightMm.value;

  if (window.electronAPI?.printSilent) {
    const html = `<div class="label-page"><img src="${dataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" /></div>`;
    const res = await window.electronAPI.printSilent({
      widthMm: w,
      heightMm: h,
      htmlContent: html,
      copies: copies,
    });
    if (res?.success) {
      alert(t('template.printSuccess'));
    } else {
      alert(t('template.printFail') + (res?.error || ''));
    }
    return;
  }

  // Web print fallback
  await downloadTemplatePdf();
};

const printAllBatch = () => {
  alert(t('template.batchStarted', { count: batchList.value.length }));
};

watch(formData, () => renderLabel(), { deep: true });
onMounted(() => renderLabel());
</script>
