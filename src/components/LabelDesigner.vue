<template>
  <div class="space-y-6">
    <!-- Designer Header & Toolbar -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 class="text-base font-bold text-slate-800">{{ t('designer.title') }}</h2>
        <div class="h-4 w-px bg-slate-200" />
        
        <!-- Canvas Size Inputs (mm) -->
        <div class="flex items-center gap-2 text-xs">
          <span class="text-slate-500 font-semibold">{{ t('designer.canvasSize') }}:</span>
          <input v-model.number="canvasWidthMm" type="number" class="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-center" />
          <span class="text-slate-400">×</span>
          <input v-model.number="canvasHeightMm" type="number" class="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-center" />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button @click="addElement('barcode')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
          <Barcode class="w-3.5 h-3.5" />
          <span>{{ t('designer.addBarcode') }}</span>
        </button>
        <button @click="addElement('qrcode')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
          <QrCode class="w-3.5 h-3.5" />
          <span>{{ t('designer.addQrcode') }}</span>
        </button>
        <button @click="addElement('text')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
          <Type class="w-3.5 h-3.5" />
          <span>{{ t('designer.addText') }}</span>
        </button>
        <button @click="exportJsonTemplate" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
          <Save class="w-3.5 h-3.5" />
          <span>{{ t('designer.exportJson') }}</span>
        </button>
        <button 
          @click="printDesignerLabel" 
          :disabled="isPrinting"
          class="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Printer class="w-3.5 h-3.5" />
          <span>{{ isPrinting ? t('designer.printing') : t('designer.printLabel') }}</span>
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="printSuccessMsg" class="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
      <CheckCircle2 class="w-4 h-4 text-emerald-600" />
      <span>{{ printSuccessMsg }}</span>
    </div>

    <!-- Designer Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Canvas Editor Board -->
      <div class="lg:col-span-8 bg-slate-100 rounded-2xl p-8 border border-slate-200 flex items-center justify-center min-h-[500px] overflow-auto relative">
        <div 
          ref="canvasWrapperRef"
          class="bg-white shadow-xl rounded border border-slate-300 relative select-none"
          :style="{
            width: `${canvasWidthMm * 4}px`,
            height: `${canvasHeightMm * 4}px`,
          }"
          @click="selectedElemIndex = null"
        >
          <!-- Grid Ruler Background -->
          <div class="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <!-- Draggable Elements -->
          <div 
            v-for="(el, idx) in elements" 
            :key="el.id"
            @mousedown.stop="startDrag(el, $event)"
            @click.stop="selectedElemIndex = idx"
            class="absolute cursor-move border transition-shadow"
            :class="selectedElemIndex === idx ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md' : 'border-transparent hover:border-slate-300'"
            :style="{
              left: `${el.x * 4}px`,
              top: `${el.y * 4}px`,
            }"
          >
            <!-- Barcode element -->
            <div v-if="el.type === 'barcode'" class="p-1 bg-white">
              <img :src="getBarcodeUrl(el.value)" class="pointer-events-none" />
            </div>

            <!-- QR Code element -->
            <div v-else-if="el.type === 'qrcode'" class="p-1 bg-white">
              <img :src="getQrUrl(el.value)" class="pointer-events-none w-20 h-20" />
            </div>

            <!-- Text element -->
            <div 
              v-else-if="el.type === 'text'"
              class="p-1 font-sans"
              :style="{
                fontSize: `${el.fontSize || 14}px`,
                fontWeight: el.bold ? 'bold' : 'normal',
                maxWidth: `${el.width ? el.width * 4 : 200}px`,
              }"
            >
              {{ el.value }}
            </div>
          </div>
        </div>
      </div>

      <!-- Properties Panel on Right -->
      <div class="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h3 class="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>{{ t('designer.elementProps') }}</span>
          <button 
            v-if="selectedElem" 
            @click="deleteSelectedElement" 
            class="text-xs text-rose-500 hover:underline flex items-center gap-1"
          >
            <Trash2 class="w-3.5 h-3.5" />
            {{ t('designer.deleteElement') }}
          </button>
        </h3>

        <div v-if="selectedElem" class="space-y-3 text-xs">
          <div>
            <label class="text-slate-500 font-semibold block mb-1">{{ t('designer.elemType') }}: <span class="text-brand-600 uppercase">{{ selectedElem.type }}</span></label>
          </div>

          <div>
            <label class="text-slate-500 font-semibold block mb-1">{{ t('designer.contentValue') }}</label>
            <textarea v-model="selectedElem.value" rows="2" class="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-slate-500 font-semibold block mb-1">X 坐标 (mm)</label>
              <input v-model.number="selectedElem.x" type="number" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded" />
            </div>
            <div>
              <label class="text-slate-500 font-semibold block mb-1">Y 坐标 (mm)</label>
              <input v-model.number="selectedElem.y" type="number" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded" />
            </div>
          </div>

          <div v-if="selectedElem.type === 'text'" class="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label class="text-slate-500 font-semibold block mb-1">字号大小 (px)</label>
              <input v-model.number="selectedElem.fontSize" type="number" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded" />
            </div>
            <div class="flex items-center gap-2">
              <input v-model="selectedElem.bold" type="checkbox" id="boldCheck" class="rounded text-brand-600" />
              <label for="boldCheck" class="text-slate-700 font-semibold">加粗字体 (Bold)</label>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-slate-400 text-xs">
          {{ t('designer.selectHint') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Barcode, QrCode, Type, Save, Printer, Trash2, CheckCircle2 } from 'lucide-vue-next';
import { t } from '@/i18n';
import { generateBarcode, generateQRCode } from '@/utils/barcodeGenerator';

const canvasWidthMm = ref(70);
const canvasHeightMm = ref(30);
const selectedElemIndex = ref(0);
const isPrinting = ref(false);
const printSuccessMsg = ref('');

const elements = ref([
  { id: 1, type: 'barcode', value: 'UITQ48802', x: 10, y: 3 },
  { id: 2, type: 'text', value: 'Juego De Rotuladores 36 Colores', fontSize: 13, bold: true, width: 60, x: 5, y: 18 },
  { id: 3, type: 'text', value: 'SKU: MC-0001', fontSize: 12, bold: true, width: 40, x: 5, y: 24 },
]);

const selectedElem = computed(() => {
  if (selectedElemIndex.value === null || selectedElemIndex.value >= elements.value.length) return null;
  return elements.value[selectedElemIndex.value];
});

const getBarcodeUrl = (val) => generateBarcode(val || '123456', { width: 1.8, height: 45, fontSize: 13 });

// 100% Offline Local QR Code Generator Cache
const qrCache = ref(new Map());
const getQrUrl = (val) => {
  const text = val || 'QR';
  if (qrCache.value.has(text)) return qrCache.value.get(text);
  generateQRCode(text, { size: 160 }).then(url => {
    qrCache.value.set(text, url);
  });
  return qrCache.value.get(text) || '';
};

const addElement = (type) => {
  const newEl = {
    id: Date.now(),
    type,
    value: type === 'barcode' ? 'NEW_SKU_01' : type === 'qrcode' ? 'https://example.com' : '双击编辑文字',
    x: 5,
    y: 5,
    fontSize: 14,
    bold: false,
    width: 40,
  };
  elements.value.push(newEl);
  selectedElemIndex.value = elements.value.length - 1;
};

const deleteSelectedElement = () => {
  if (selectedElemIndex.value !== null) {
    elements.value.splice(selectedElemIndex.value, 1);
    selectedElemIndex.value = null;
  }
};

// Dragging logic
let draggingEl = null;
let startX = 0;
let startY = 0;
let initialElX = 0;
let initialElY = 0;

const startDrag = (el, e) => {
  draggingEl = el;
  startX = e.clientX;
  startY = e.clientY;
  initialElX = el.x;
  initialElY = el.y;

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!draggingEl) return;
  const dx = (e.clientX - startX) / 4;
  const dy = (e.clientY - startY) / 4;
  draggingEl.x = Math.max(0, Math.round(initialElX + dx));
  draggingEl.y = Math.max(0, Math.round(initialElY + dy));
};

const stopDrag = () => {
  draggingEl = null;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
};

const exportJsonTemplate = () => {
  const data = JSON.stringify({
    widthMm: canvasWidthMm.value,
    heightMm: canvasHeightMm.value,
    elements: elements.value,
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `template_${canvasWidthMm.value}x${canvasHeightMm.value}mm.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const generatePrintHtml = async () => {
  const w = canvasWidthMm.value;
  const h = canvasHeightMm.value;

  const itemHtmlPromises = elements.value.map(async (el) => {
    if (el.type === 'barcode') {
      const bUrl = getBarcodeUrl(el.value);
      return `<div style="position: absolute; left: ${el.x}mm; top: ${el.y}mm; background: white;">
        <img src="${bUrl}" style="display: block; max-height: 14mm;" />
      </div>`;
    } else if (el.type === 'qrcode') {
      const qUrl = await generateQRCode(el.value || 'QR', { size: 160 });
      return `<div style="position: absolute; left: ${el.x}mm; top: ${el.y}mm; background: white;">
        <img src="${qUrl}" style="display: block; width: 16mm; height: 16mm;" />
      </div>`;
    } else if (el.type === 'text') {
      return `<div style="position: absolute; left: ${el.x}mm; top: ${el.y}mm; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: ${el.fontSize || 13}px; font-weight: ${el.bold ? 'bold' : 'normal'}; max-width: ${el.width ? el.width : 50}mm; line-height: 1.2; color: #000000; word-break: break-all;">
        ${el.value}
      </div>`;
    }
    return '';
  });

  const renderedItems = (await Promise.all(itemHtmlPromises)).join('');

  return `<div class="label-page" style="width: ${w}mm; height: ${h}mm; position: relative; overflow: hidden; background: #ffffff;">
    ${renderedItems}
  </div>`;
};

const printDesignerLabel = async () => {
  if (elements.value.length === 0) {
    alert('画布中暂无元素，请先添加元素。');
    return;
  }
  isPrinting.value = true;
  try {
    const htmlContent = await generatePrintHtml();

    if (typeof window !== 'undefined' && window.electronAPI?.printSilent) {
      const res = await window.electronAPI.printSilent({
        widthMm: canvasWidthMm.value,
        heightMm: canvasHeightMm.value,
        htmlContent: htmlContent,
        copies: 1
      });
      if (res?.success) {
        printSuccessMsg.value = '✓ 设计器标签已成功发送至打印机！';
        setTimeout(() => printSuccessMsg.value = '', 4000);
      } else {
        alert('打印失败: ' + (res?.error || '请确认打印机连接正常'));
      }
    } else {
      // Browser print fallback
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const iframeDoc = printIframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
  <style>
    @page { size: ${canvasWidthMm.value}mm ${canvasHeightMm.value}mm; margin: 0 !important; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: ${canvasWidthMm.value}mm; height: ${canvasHeightMm.value}mm; margin: 0; padding: 0; background: #fff; overflow: hidden; }
    .label-page { width: ${canvasWidthMm.value}mm; height: ${canvasHeightMm.value}mm; position: relative; overflow: hidden; }
  </style>
</head>
<body>${htmlContent}</body>
</html>`);
      iframeDoc.close();

      setTimeout(() => {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 30000);
      }, 350);
    }
  } catch (err) {
    alert('打印调用异常: ' + err.message);
  } finally {
    isPrinting.value = false;
  }
};
</script>
