<template>
  <div class="space-y-6">
    <!-- Stepper Navigation (Infotrekx 4-Step Style) -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div class="flex items-center justify-between max-w-4xl mx-auto">
        <button 
          v-for="(step, idx) in steps" 
          :key="idx"
          @click="currentStep = idx + 1"
          :disabled="!canGoToStep(idx + 1)"
          class="flex items-center gap-2 group transition-all"
          :class="[
            currentStep === idx + 1 ? 'text-brand-600 font-bold' : 
            currentStep > idx + 1 ? 'text-slate-800' : 'text-slate-400 cursor-not-allowed'
          ]"
        >
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
            :class="[
              currentStep === idx + 1 ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' :
              currentStep > idx + 1 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
            ]"
          >
            {{ idx + 1 }}
          </div>
          <span class="text-sm hidden sm:inline">{{ step.title }}</span>
          <div v-if="idx < steps.length - 1" class="w-8 sm:w-16 h-0.5 bg-slate-200 ml-2" />
        </button>
      </div>
    </div>

    <!-- Step 1: Upload PDF -->
    <div v-if="currentStep === 1" class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div 
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
        class="border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative"
        :class="isDragging ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/50'"
        @click="triggerFileInput"
      >
        <input 
          ref="fileInputRef" 
          type="file" 
          accept=".pdf, image/*, .png, .jpg, .jpeg, .webp" 
          class="hidden" 
          @change="handleFileSelect" 
        />
        
        <div class="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UploadCloud class="w-8 h-8" />
        </div>
        
        <h3 class="text-lg font-bold text-slate-800 mb-1">
          {{ t('pdf.dropzoneTitle') }}
        </h3>
        <p class="text-sm text-slate-500 max-w-md mx-auto mb-6">
          {{ t('pdf.dropzoneDesc') }}
        </p>

        <div class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all">
          <FileUp class="w-4 h-4" />
          {{ t('pdf.browse') }}
        </div>
      </div>

      <!-- Quick Load Real Test Samples from Workspace -->
      <div class="mt-8 border-t border-slate-100 pt-6">
        <div class="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <FlaskConical class="w-4 h-4 text-brand-500" />
          快速载入工作区真实客户实测文件：
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            @click="loadLocalSample('samples/labels_152.pdf', 'presetA4_30')"
            class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
          >
            <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">① 152件 A4 30拼标</span>
            <span class="text-[11px] text-slate-500 mt-0.5">3列×10行 · 手机屏幕配件</span>
          </button>

          <button 
            @click="loadLocalSample('samples/mercadolibre_2up.pdf', 'presetML_2')"
            class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
          >
            <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">② 美客多 FULL 左右拼</span>
            <span class="text-[11px] text-slate-500 mt-0.5">1行×2列 · 墨西哥仓箱唛</span>
          </button>

          <button 
            @click="loadLocalSample('samples/carton_vertical_3.pdf', 'presetVertical_2')"
            class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
          >
            <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">③ 上下双拼箱唛 (末页单标)</span>
            <span class="text-[11px] text-slate-500 mt-0.5">2行×1列 · 自动过滤白边</span>
          </button>

          <button 
            @click="loadLocalSample('samples/perfume_single.pdf', 'presetSingleTL')"
            class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
          >
            <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">④ 左上角单标 (香水标)</span>
            <span class="text-[11px] text-slate-500 mt-0.5">整页A4自动抓取左上角</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Confirm Labels & Quantities (Paso 2 Infotrekx Style) -->
    <div v-if="currentStep === 2" class="space-y-4">
      <!-- Toolbar: Layout presets & View Mode Switcher -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold text-slate-500 uppercase">{{ t('pdf.layoutMode') }}:</span>
          <select 
            v-model="selectedLayoutMode" 
            @change="reprocessPdf"
            class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="presetA4_30">{{ t('pdf.presetA4_30') }}</option>
            <option value="presetML_2">{{ t('pdf.presetML_2') }}</option>
            <option value="presetVertical_2">{{ t('pdf.presetVertical_2') }}</option>
            <option value="presetSingleTL">{{ t('pdf.presetSingleTL') }}</option>
          </select>
        </div>

        <!-- View Mode Switch: Grouped vs Flat -->
        <div class="flex items-center bg-slate-100 p-1 rounded-lg">
          <button 
            @click="viewMode = 'grouped'"
            class="px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5"
            :class="viewMode === 'grouped' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Layers class="w-3.5 h-3.5" />
            {{ t('pdf.viewGrouped') }}
          </button>
          <button 
            @click="viewMode = 'flat'"
            class="px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5"
            :class="viewMode === 'flat' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
            {{ t('pdf.viewFlat') }}
          </button>
        </div>

        <!-- Stats & Next Step Button -->
        <div class="flex items-center gap-4">
          <div class="text-right">
            <span class="text-xs text-slate-400 block">{{ t('pdf.totalPrintCount') }}</span>
            <span class="text-lg font-bold text-brand-600 leading-none">{{ totalPrintQuantity }} 张</span>
          </div>
          <button 
            @click="currentStep = 3"
            class="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>下一步: 设置纸张</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Search / Filter bar -->
      <div class="relative">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="t('pdf.searchPlaceholder')" 
          class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <!-- Labels Grid Display -->
      <div v-if="filteredLabels.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div 
          v-for="item in filteredLabels" 
          :key="item.id"
          class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-brand-400 hover:shadow-md transition-all flex flex-col group relative"
        >
          <!-- Card Image Thumbnail with border preview -->
          <div class="p-3 bg-slate-50 flex items-center justify-center min-h-[140px] border-b border-slate-100 relative">
            <img :src="item.dataUrl" alt="Label" class="max-h-28 object-contain rounded shadow-xs" />
            
            <!-- Quantity badge for Grouped View -->
            <div 
              v-if="viewMode === 'grouped'" 
              class="absolute top-2 right-2 px-2 py-0.5 bg-brand-600 text-white text-xs font-bold rounded-full shadow-sm"
            >
              ×{{ item.quantity }}
            </div>
          </div>

          <!-- Card Content & Quantity Modifier -->
          <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
            <div>
              <div class="font-bold text-xs text-slate-800 truncate" :title="item.barcode">
                {{ item.barcode }}
              </div>
              <div v-if="item.sku" class="text-[11px] text-brand-600 font-mono truncate" :title="item.sku">
                SKU: {{ item.sku }}
              </div>
              <div v-if="item.title" class="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug" :title="item.title">
                {{ item.title }}
              </div>
            </div>

            <!-- Quantity stepper -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <span class="text-[11px] text-slate-400">{{ t('pdf.quantity') }}</span>
              <div class="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                <button 
                  @click="item.quantity = Math.max(0, item.quantity - 1)" 
                  class="px-2 py-0.5 text-slate-600 hover:bg-slate-200 transition-colors"
                >-</button>
                <input 
                  v-model.number="item.quantity" 
                  type="number" 
                  min="0"
                  class="w-10 text-center text-xs font-bold bg-transparent focus:outline-none"
                />
                <button 
                  @click="item.quantity += 1" 
                  class="px-2 py-0.5 text-slate-600 hover:bg-slate-200 transition-colors"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-400">
        没有匹配的标签项目
      </div>
    </div>

    <!-- Step 3: Target Paper & Sizing (Ajuste de Papel) -->
    <div v-if="currentStep === 3" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div class="max-w-2xl mx-auto space-y-6">
        <h3 class="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
          {{ t('pdf.targetPaper') }}
        </h3>

        <!-- Paper Presets -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button 
            v-for="paper in paperPresets" 
            :key="paper.id"
            @click="selectPaperPreset(paper)"
            class="p-4 rounded-xl border text-left transition-all relative overflow-hidden"
            :class="selectedPaperId === paper.id ? 'border-brand-600 bg-brand-50/40 text-brand-900 shadow-sm' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="font-bold text-sm">{{ paper.name }}</div>
            <div class="text-xs text-slate-500 mt-1 font-mono">{{ paper.width }} × {{ paper.height }} mm</div>
            <div v-if="selectedPaperId === paper.id" class="absolute top-2 right-2 text-brand-600">
              <CheckCircle2 class="w-4 h-4" />
            </div>
          </button>
        </div>

        <!-- Custom Dimensions if chosen -->
        <div v-if="selectedPaperId === 'custom'" class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div class="flex-1">
            <label class="text-xs text-slate-500 font-medium block mb-1">纸张宽度 (mm)</label>
            <input v-model.number="targetWidthMm" type="number" class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
          </div>
          <div class="flex-1">
            <label class="text-xs text-slate-500 font-medium block mb-1">纸张高度 (mm)</label>
            <input v-model.number="targetHeightMm" type="number" class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>

        <!-- Scaling & Rotation Options -->
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-semibold text-slate-800">{{ t('pdf.autoRotate') }}</div>
              <div class="text-xs text-slate-500">{{ t('pdf.autoRotateDesc') }}</div>
            </div>
            <input v-model="autoRotate" type="checkbox" class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-semibold text-slate-800">{{ t('pdf.fitMode') }}</div>
              <div class="text-xs text-slate-500">{{ t('pdf.fitProportional') }}</div>
            </div>
            <select v-model="fitMode" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium">
              <option value="proportional">智能等比例居中 (保证条码)</option>
              <option value="stretch">强制拉伸填满</option>
            </select>
          </div>
        </div>

        <!-- Action Button to Step 4 -->
        <div class="flex justify-end pt-4">
          <button 
            @click="currentStep = 4"
            class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2"
          >
            <span>进入实时卷纸预览与打印</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Step 4: Preview & Print Output -->
    <div v-if="currentStep === 4" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-800">{{ t('pdf.previewTitle') }}</h3>
          <p class="text-xs text-slate-500 mt-0.5">目标热敏卷纸尺寸: {{ targetWidthMm }} × {{ targetHeightMm }} mm · 计划输出 {{ totalPrintQuantity }} 张</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="downloadThermalPdf" 
            :disabled="isGeneratingPdf"
            class="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold rounded-lg shadow-xs flex items-center gap-2 transition-all bg-white"
          >
            <Download class="w-4 h-4 text-slate-600" />
            <span>{{ isGeneratingPdf ? t('pdf.generatingPdf') : t('pdf.downloadPdf') }}</span>
          </button>

          <button 
            @click="triggerThermalPrint" 
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            <Printer class="w-4 h-4" />
            <span>{{ t('pdf.printAll') }}</span>
          </button>
        </div>
      </div>

      <!-- Thermal Roll Realistic Visualizer -->
      <div class="bg-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] border border-slate-200 overflow-x-auto">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Scroll class="w-4 h-4" />
          热敏卷纸仿真连续出纸预览 (按真实比例展示)
        </div>

        <!-- Rendered Roll Strip -->
        <div class="flex gap-4 p-4 bg-white/70 backdrop-blur rounded-2xl shadow-inner border border-slate-200 max-w-full overflow-x-auto">
          <div 
            v-for="(item, i) in previewList.slice(0, 10)" 
            :key="i"
            class="bg-white border-2 border-dashed border-slate-300 rounded-lg shadow-sm flex items-center justify-center p-2 relative flex-shrink-0 transition-all hover:border-brand-500"
            :style="{
              width: `${targetWidthMm * 2.8}px`,
              height: `${targetHeightMm * 2.8}px`,
            }"
          >
            <img 
              :src="item.dataUrl" 
              class="max-w-full max-h-full object-contain" 
              :class="autoRotate && item.width < item.height && targetWidthMm > targetHeightMm ? 'rotate-90' : ''"
            />
            <div class="absolute bottom-1 right-1.5 text-[9px] font-mono text-slate-300">
              #{{ i + 1 }}
            </div>
          </div>
          <div v-if="previewList.length > 10" class="flex items-center justify-center px-4 text-xs text-slate-400 font-medium">
            + 更多 {{ previewList.length - 10 }} 张连续标签...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw, computed } from 'vue';
import { 
  UploadCloud, FileUp, Layers, LayoutGrid, Search, ArrowRight, 
  CheckCircle2, Download, Printer, Scroll, FlaskConical 
} from 'lucide-vue-next';
import { t } from '@/i18n';
import { 
  loadPdfDocument, detectSuggestedLayout, slicePdfLabels, 
  groupLabelsByBarcode, exportThermalPdf, trimWhiteBorder
} from '@/utils/pdfProcessor';

const currentStep = ref(1);
const isDragging = ref(false);
const fileInputRef = ref(null);
const currentPdfDoc = shallowRef(null);
const selectedLayoutMode = ref('presetA4_30');
const viewMode = ref('grouped');
const rawLabels = ref([]);
const searchQuery = ref('');
const isGeneratingPdf = ref(false);

// Paper settings
const selectedPaperId = ref('70x30');
const targetWidthMm = ref(70);
const targetHeightMm = ref(30);
const autoRotate = ref(true);
const fitMode = ref('proportional');

const steps = [
  { title: t('pdf.step1') },
  { title: t('pdf.step2') },
  { title: t('pdf.step3') },
  { title: t('pdf.step4') },
];

const paperPresets = [
  { id: '50x30', name: '50 × 30 mm (小号单品标)', width: 50, height: 30 },
  { id: '70x30', name: '70 × 30 mm (标准商品条码)', width: 70, height: 30 },
  { id: '75x50', name: '75 × 50 mm (中号商品贴)', width: 75, height: 50 },
  { id: '100x100', name: '100 × 100 mm (合规/箱唛)', width: 100, height: 100 },
  { id: '100x150', name: '100 × 150 mm (4×6寸美客多大箱唛)', width: 100, height: 150 },
  { id: 'custom', name: '自定义尺寸...', width: targetWidthMm.value, height: targetHeightMm.value },
];

const selectPaperPreset = (preset) => {
  selectedPaperId.value = preset.id;
  if (preset.id !== 'custom') {
    targetWidthMm.value = preset.width;
    targetHeightMm.value = preset.height;
  }
};

const canGoToStep = (step) => {
  if (step === 1) return true;
  if (step === 2) return rawLabels.value.length > 0;
  if (step === 3 || step === 4) return rawLabels.value.length > 0;
  return false;
};

// Process PDF file
const processPdfFile = async (fileOrUrl) => {
  try {
    const doc = await loadPdfDocument(fileOrUrl);
    currentPdfDoc.value = markRaw(doc);
    // Auto-detect layout preset
    const detected = await detectSuggestedLayout(currentPdfDoc.value);
    selectedLayoutMode.value = detected;
    
    // Auto-select initial paper size matching format
    if (detected === 'presetML_2') {
      selectPaperPreset(paperPresets.find(p => p.id === '100x150'));
    } else if (detected === 'presetVertical_2') {
      selectPaperPreset(paperPresets.find(p => p.id === '100x100'));
    } else {
      selectPaperPreset(paperPresets.find(p => p.id === '70x30'));
    }

    await reprocessPdf();
    currentStep.value = 2;
  } catch (err) {
    console.error('Error loading PDF:', err);
    alert(`无法解析文件: ${err.message || '请确认是否为有效的 PDF 文件'}`);
  }
};

// Process Image file (PNG / JPG / WEBP)
const processImageFile = async (file) => {
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.src = e.target.result;
      await img.decode();

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const trimmed = trimWhiteBorder(canvas);
      const dataUrl = trimmed.toDataURL('image/png');

      const fileName = file.name ? file.name.replace(/\.[^/.]+$/, "") : 'IMAGE-LABEL';

      rawLabels.value = [{
        id: `img_${Date.now()}`,
        page: 1,
        col: 1,
        row: 1,
        canvas: trimmed,
        dataUrl: dataUrl,
        barcode: fileName,
        title: fileName,
        sku: '',
        quantity: 1,
        selected: true,
        width: trimmed.width,
        height: trimmed.height,
      }];

      if (trimmed.width > trimmed.height * 1.5) {
        selectPaperPreset(paperPresets.find(p => p.id === '70x30'));
      } else {
        selectPaperPreset(paperPresets.find(p => p.id === '100x100'));
      }

      currentStep.value = 2;
    };
    reader.readAsDataURL(file);
  } catch (err) {
    console.error('Error processing image:', err);
    alert('解析图片标签失败: ' + err.message);
  }
};

const processFile = async (file) => {
  if (!file) return;
  if (file.type?.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name || '')) {
    await processImageFile(file);
  } else {
    await processPdfFile(file);
  }
};

const reprocessPdf = async () => {
  if (!currentPdfDoc.value) return;
  rawLabels.value = await slicePdfLabels(currentPdfDoc.value, selectedLayoutMode.value);
};

// Quick load from workspace with proper base path
const loadLocalSample = async (filePath, presetMode) => {
  selectedLayoutMode.value = presetMode;
  try {
    const base = import.meta.env.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullUrl = `${cleanBase}${cleanPath}`;
    
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`无法获取样本文件 (${response.status})`);
    const blob = await response.blob();
    await processPdfFile(blob);
  } catch (err) {
    console.error('Could not load sample file directly:', err);
    alert('载入样本失败: ' + err.message);
  }
};

const triggerFileInput = () => fileInputRef.value?.click();
const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (file) processFile(file);
};
const handleFileDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) processFile(file);
};

// Filtered labels
const groupedLabels = computed(() => groupLabelsByBarcode(rawLabels.value));
const displayItems = computed(() => viewMode.value === 'grouped' ? groupedLabels.value : rawLabels.value);

const filteredLabels = computed(() => {
  if (!searchQuery.value.trim()) return displayItems.value;
  const q = searchQuery.value.toLowerCase();
  return displayItems.value.filter(item => 
    item.barcode?.toLowerCase().includes(q) ||
    item.sku?.toLowerCase().includes(q) ||
    item.title?.toLowerCase().includes(q)
  );
});

const totalPrintQuantity = computed(() => {
  return displayItems.value.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
});

// Flattened list for roll simulation and output
const previewList = computed(() => {
  const list = [];
  for (const item of displayItems.value) {
    const qty = parseInt(item.quantity) || 0;
    for (let i = 0; i < qty; i++) {
      list.push(item);
    }
  }
  return list;
});

// Download standard thermal PDF
const downloadThermalPdf = async () => {
  if (previewList.value.length === 0) return;
  isGeneratingPdf.value = true;
  try {
    const blob = await exportThermalPdf(displayItems.value, {
      targetWidthMm: targetWidthMm.value,
      targetHeightMm: targetHeightMm.value,
      fitMode: fitMode.value,
      autoRotate: autoRotate.value,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThermalLabels_${targetWidthMm.value}x${targetHeightMm.value}mm_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PDF export error:', err);
    alert('导出 PDF 失败，请检查控制台。');
  } finally {
    isGeneratingPdf.value = false;
  }
};

// Direct silent thermal print
const triggerThermalPrint = async () => {
  if (previewList.value.length === 0) return;
  
  // If running inside Electron, trigger silent native print
  if (window.electronAPI && window.electronAPI.printThermal) {
    await window.electronAPI.printThermal({
      labels: previewList.value.map(i => i.dataUrl),
      widthMm: targetWidthMm.value,
      heightMm: targetHeightMm.value,
    });
    alert('已发送至本地热敏打印机，正在静默打印！');
    return;
  }

  // Otherwise in standard Web mode: generate standard thermal PDF blob and open print window
  const blob = await exportThermalPdf(displayItems.value, {
    targetWidthMm: targetWidthMm.value,
    targetHeightMm: targetHeightMm.value,
    fitMode: fitMode.value,
    autoRotate: autoRotate.value,
  });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};
</script>
