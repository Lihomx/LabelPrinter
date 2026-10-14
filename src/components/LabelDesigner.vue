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
        <button @click="printDesignerLabel" class="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5">
          <Printer class="w-3.5 h-3.5" />
          <span>打印此设计</span>
        </button>
      </div>
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
          <span>元素属性设置</span>
          <button 
            v-if="selectedElem" 
            @click="deleteSelectedElement" 
            class="text-xs text-rose-500 hover:underline flex items-center gap-1"
          >
            <Trash2 class="w-3.5 h-3.5" />
            删除元素
          </button>
        </h3>

        <div v-if="selectedElem" class="space-y-3 text-xs">
          <div>
            <label class="text-slate-500 font-semibold block mb-1">元素类型: <span class="text-brand-600 uppercase">{{ selectedElem.type }}</span></label>
          </div>

          <div>
            <label class="text-slate-500 font-semibold block mb-1">内容数值 / 文本</label>
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
          点击画布上的元素以编辑属性或拖拽位置
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Barcode, QrCode, Type, Save, Printer, Trash2 } from 'lucide-vue-next';
import { t } from '@/i18n';
import { generateBarcode } from '@/utils/barcodeGenerator';

const canvasWidthMm = ref(70);
const canvasHeightMm = ref(30);
const selectedElemIndex = ref(0);

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
const getQrUrl = (val) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(val || 'QR')}`;

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

const printDesignerLabel = () => {
  alert('设计器标签已准备好输出，支持导出矢量 PDF 或直接静默出纸！');
};
</script>
