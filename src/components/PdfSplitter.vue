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
            @change="onLayoutModeChange"
            class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="presetFreeform">{{ t('pdf.presetFreeform') }}</option>
            <option value="presetA4_30">{{ t('pdf.presetA4_30') }}</option>
            <option value="presetML_2">{{ t('pdf.presetML_2') }}</option>
            <option value="presetVertical_2">{{ t('pdf.presetVertical_2') }}</option>
            <option value="presetSingleTL">{{ t('pdf.presetSingleTL') }}</option>
          </select>

          <!-- Freeform Edit Button -->
          <button 
            v-if="selectedLayoutMode === 'presetFreeform'"
            @click="openFreeCropModal"
            class="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Crop class="w-3.5 h-3.5" />
            <span>重新拉框裁切</span>
          </button>
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

      <div v-else-if="selectedLayoutMode === 'presetFreeform'" class="text-center py-16 bg-white rounded-xl border-2 border-dashed border-brand-200 p-8 flex flex-col items-center justify-center space-y-3">
        <div class="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center">
          <Crop class="w-8 h-8" />
        </div>
        <h4 class="text-base font-bold text-slate-800">当前已启用：自由鼠标框选裁切模式</h4>
        <p class="text-xs text-slate-500 max-w-md leading-relaxed">
          点击下方按钮打开框选画布，按住鼠标拖拽即可框选任意标签区域，支持拖动平移及8个手柄微调，确认后将自动应用至全部页面。
        </p>
        <button 
          @click="openFreeCropModal"
          class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Crop class="w-4 h-4" />
          <span>🖱️ 立即打开鼠标框选画布</span>
        </button>
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

    <!-- Freeform Visual Crop Modal (Teleported to document.body) -->
    <Teleport to="body">
      <div v-if="showFreeCropModal" class="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Modal Header -->
          <div class="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Crop class="w-4 h-4 text-brand-600" />
                {{ t('pdf.freeCropTitle') }}
              </h3>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ t('pdf.freeCropDesc') }}</p>
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="resetSelection" 
                class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>{{ t('pdf.freeCropReset') }}</span>
              </button>
              <button 
                @click="showFreeCropModal = false" 
                class="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg"
              >
                {{ t('pdf.freeCropCancel') }}
              </button>
              <button 
                @click="applyFreeCrop" 
                :disabled="!hasValidSelection"
                class="px-5 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Check class="w-4 h-4" />
                <span>{{ t('pdf.freeCropApply') }}</span>
              </button>
            </div>
          </div>

          <!-- Modal Interactive Canvas Body -->
          <div 
            class="flex-1 bg-slate-900 p-6 overflow-auto flex items-center justify-center relative select-none"
          >
            <div 
              class="relative shadow-2xl border border-slate-700 cursor-crosshair inline-block leading-none select-none bg-white" 
              ref="cropImgWrapperRef"
              @mousedown="onCanvasMouseDown"
            >
              <!-- High-res Page 1 Canvas -->
              <canvas ref="cropCanvasRef" class="max-h-[68vh] object-contain block pointer-events-none select-none"></canvas>

              <!-- Marquee Crop Box Overlay -->
              <div 
                v-if="selectionBox.w > 0 && selectionBox.h > 0"
                class="absolute border-2 border-brand-500 bg-brand-500/20 shadow-lg cursor-move select-none"
                :style="{
                  left: `${selectionBox.x}px`,
                  top: `${selectionBox.y}px`,
                  width: `${selectionBox.w}px`,
                  height: `${selectionBox.h}px`,
                }"
                @mousedown.stop="onBoxMouseDown"
              >
                <!-- 4 Corner Handles -->
                <div 
                  class="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-brand-600 rounded-sm cursor-nwse-resize shadow hover:scale-125 transition-transform"
                  @mousedown.stop="(e) => onHandleMouseDown(e, 'nw')"
                ></div>
                <div 
                  class="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-brand-600 rounded-sm cursor-nesw-resize shadow hover:scale-125 transition-transform"
                  @mousedown.stop="(e) => onHandleMouseDown(e, 'ne')"
                ></div>
                <div 
                  class="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-brand-600 rounded-sm cursor-nesw-resize shadow hover:scale-125 transition-transform"
                  @mousedown.stop="(e) => onHandleMouseDown(e, 'sw')"
                ></div>
                <div 
                  class="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-brand-600 rounded-sm cursor-nwse-resize shadow hover:scale-125 transition-transform"
                  @mousedown.stop="(e) => onHandleMouseDown(e, 'se')"
                ></div>

                <!-- 4 Edge Midpoint Handles -->
                <div 
                  class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-white border-2 border-brand-600 rounded-sm cursor-ns-resize shadow hover:scale-125 transition-transform"
                  @mousedown.stop="(e) => onHandleMouseDown(e, 'n')"
                ></div>
                <div 
                  class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-white border-2 border-brand-600 rounded-sm cursor-ns-resize shadow hover:scale-125 transition-transform"
                  @mousedown.stop="(e) => onHandleMouseDown(e, 's')"
                ></div>
                <div 
                  class="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-5 bg-white border-2 border-brand-600 rounded-sm cursor-ew-resize shadow hover:scale-125 transition-transform"
                  @mousedown.stop="(e) => onHandleMouseDown(e, 'w')"
                ></div>
                <div 
                  class="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-5 bg-white border-2 border-brand-600 rounded-sm cursor-ew-resize shadow hover:scale-125 transition-transform"
                  @mousedown.stop="(e) => onHandleMouseDown(e, 'e')"
                ></div>

                <!-- Dimension Badge -->
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-brand-600 text-white text-[11px] font-bold rounded shadow-md whitespace-nowrap pointer-events-none flex items-center gap-1">
                  <span>{{ selectionMmWidth }} × {{ selectionMmHeight }} mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw, computed, nextTick } from 'vue';
import { 
  UploadCloud, FileUp, Layers, LayoutGrid, Search, ArrowRight, 
  CheckCircle2, Download, Printer, Scroll, FlaskConical, Crop, Check, RotateCcw, X 
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
const selectedLayoutMode = ref('presetFreeform');
const viewMode = ref('grouped');
const rawLabels = ref([]);
const searchQuery = ref('');
const isGeneratingPdf = ref(false);

// Freeform visual crop state
const showFreeCropModal = ref(false);
const cropCanvasRef = ref(null);
const cropImgWrapperRef = ref(null);
const selectionBox = ref({ x: 0, y: 0, w: 0, h: 0 });
const savedBox = ref({ x: 0, y: 0, w: 0, h: 0 });
const dragMode = ref(null); // 'draw' | 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'w' | 'e'
const dragStartX = ref(0);
const dragStartY = ref(0);
const freeCropBox = ref(null);
const cropPageWidth = ref(1);
const cropPageHeight = ref(1);
const pdfOriginalWidthMm = ref(210);
const pdfOriginalHeightMm = ref(297);
const originalImageCanvas = shallowRef(null);

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
  if (step === 2) return rawLabels.value.length > 0 || currentPdfDoc.value !== null;
  if (step === 3 || step === 4) return rawLabels.value.length > 0;
  return false;
};

// Process PDF file
const processPdfFile = async (fileOrUrl, forcePreset = null) => {
  try {
    const doc = await loadPdfDocument(fileOrUrl);
    currentPdfDoc.value = markRaw(doc);

    if (forcePreset) {
      selectedLayoutMode.value = forcePreset;
      currentStep.value = 2;
      await reprocessPdf();
    } else {
      // Default to freeform crop for user-uploaded custom files
      selectedLayoutMode.value = 'presetFreeform';
      currentStep.value = 2;
      await openFreeCropModal();
    }
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

      originalImageCanvas.value = canvas;
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

const onLayoutModeChange = () => {
  if (selectedLayoutMode.value === 'presetFreeform') {
    openFreeCropModal();
  } else {
    reprocessPdf();
  }
};

const openFreeCropModal = async () => {
  showFreeCropModal.value = true;
  await nextTick();
  await renderCropCanvas();
};

const renderCropCanvas = async () => {
  if (!currentPdfDoc.value && !originalImageCanvas.value && rawLabels.value.length === 0) return;
  const canvas = cropCanvasRef.value;
  if (!canvas) return;

  if (currentPdfDoc.value) {
    const page = await currentPdfDoc.value.getPage(1);
    const vp = page.getViewport({ scale: 2.0 });
    const pageVp = page.getViewport({ scale: 1.0 });
    pdfOriginalWidthMm.value = Math.round(pageVp.width * (25.4 / 72));
    pdfOriginalHeightMm.value = Math.round(pageVp.height * (25.4 / 72));

    canvas.width = vp.width;
    canvas.height = vp.height;
    cropPageWidth.value = vp.width;
    cropPageHeight.value = vp.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
  } else if (originalImageCanvas.value || rawLabels.value[0]?.canvas) {
    const srcCanvas = originalImageCanvas.value || rawLabels.value[0].canvas;
    canvas.width = srcCanvas.width;
    canvas.height = srcCanvas.height;
    cropPageWidth.value = srcCanvas.width;
    cropPageHeight.value = srcCanvas.height;
    pdfOriginalWidthMm.value = Math.round(srcCanvas.width * 0.264583);
    pdfOriginalHeightMm.value = Math.round(srcCanvas.height * 0.264583);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(srcCanvas, 0, 0);
  }

  await nextTick();
  if (cropImgWrapperRef.value) {
    const rect = cropImgWrapperRef.value.getBoundingClientRect();
    if (freeCropBox.value) {
      selectionBox.value = {
        x: freeCropBox.value.xRatio * rect.width,
        y: freeCropBox.value.yRatio * rect.height,
        w: freeCropBox.value.wRatio * rect.width,
        h: freeCropBox.value.hRatio * rect.height,
      };
    } else {
      selectionBox.value = {
        x: rect.width * 0.1,
        y: rect.height * 0.1,
        w: rect.width * 0.8,
        h: rect.height * 0.4,
      };
    }
  }
};

// 1. Mouse down on canvas background -> Draw new crop box
const onCanvasMouseDown = (e) => {
  if (!cropImgWrapperRef.value) return;
  e.preventDefault();
  const rect = cropImgWrapperRef.value.getBoundingClientRect();
  const startX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  const startY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

  dragMode.value = 'draw';
  dragStartX.value = startX;
  dragStartY.value = startY;
  savedBox.value = { ...selectionBox.value };
  selectionBox.value = { x: startX, y: startY, w: 0, h: 0 };

  window.addEventListener('mousemove', onGlobalCropMouseMove);
  window.addEventListener('mouseup', onGlobalCropMouseUp);
};

// 2. Mouse down on marquee box body -> Move box
const onBoxMouseDown = (e) => {
  e.preventDefault();
  dragMode.value = 'move';
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  savedBox.value = { ...selectionBox.value };

  window.addEventListener('mousemove', onGlobalCropMouseMove);
  window.addEventListener('mouseup', onGlobalCropMouseUp);
};

// 3. Mouse down on any handle -> Resize box
const onHandleMouseDown = (e, handle) => {
  e.preventDefault();
  dragMode.value = handle;
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  savedBox.value = { ...selectionBox.value };

  window.addEventListener('mousemove', onGlobalCropMouseMove);
  window.addEventListener('mouseup', onGlobalCropMouseUp);
};

// 4. Global mouse move handler for drag/move/resize
const onGlobalCropMouseMove = (e) => {
  if (!dragMode.value || !cropImgWrapperRef.value) return;
  const rect = cropImgWrapperRef.value.getBoundingClientRect();
  const mode = dragMode.value;

  if (mode === 'draw') {
    const currentX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const currentY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    selectionBox.value = {
      x: Math.min(dragStartX.value, currentX),
      y: Math.min(dragStartY.value, currentY),
      w: Math.abs(currentX - dragStartX.value),
      h: Math.abs(currentY - dragStartY.value),
    };
  } else if (mode === 'move') {
    const dx = e.clientX - dragStartX.value;
    const dy = e.clientY - dragStartY.value;
    const maxX = Math.max(0, rect.width - savedBox.value.w);
    const maxY = Math.max(0, rect.height - savedBox.value.h);
    selectionBox.value = {
      x: Math.max(0, Math.min(maxX, savedBox.value.x + dx)),
      y: Math.max(0, Math.min(maxY, savedBox.value.y + dy)),
      w: savedBox.value.w,
      h: savedBox.value.h,
    };
  } else if (mode === 'se') {
    const dx = e.clientX - dragStartX.value;
    const dy = e.clientY - dragStartY.value;
    const newW = Math.max(15, Math.min(rect.width - savedBox.value.x, savedBox.value.w + dx));
    const newH = Math.max(15, Math.min(rect.height - savedBox.value.y, savedBox.value.h + dy));
    selectionBox.value = { ...savedBox.value, w: newW, h: newH };
  } else if (mode === 'e') {
    const dx = e.clientX - dragStartX.value;
    const newW = Math.max(15, Math.min(rect.width - savedBox.value.x, savedBox.value.w + dx));
    selectionBox.value = { ...savedBox.value, w: newW };
  } else if (mode === 's') {
    const dy = e.clientY - dragStartY.value;
    const newH = Math.max(15, Math.min(rect.height - savedBox.value.y, savedBox.value.h + dy));
    selectionBox.value = { ...savedBox.value, h: newH };
  } else if (mode === 'nw') {
    const right = savedBox.value.x + savedBox.value.w;
    const bottom = savedBox.value.y + savedBox.value.h;
    const curX = Math.max(0, Math.min(right - 15, e.clientX - rect.left));
    const curY = Math.max(0, Math.min(bottom - 15, e.clientY - rect.top));
    selectionBox.value = { x: curX, y: curY, w: right - curX, h: bottom - curY };
  } else if (mode === 'w') {
    const right = savedBox.value.x + savedBox.value.w;
    const curX = Math.max(0, Math.min(right - 15, e.clientX - rect.left));
    selectionBox.value = { ...savedBox.value, x: curX, w: right - curX };
  } else if (mode === 'n') {
    const bottom = savedBox.value.y + savedBox.value.h;
    const curY = Math.max(0, Math.min(bottom - 15, e.clientY - rect.top));
    selectionBox.value = { ...savedBox.value, y: curY, h: bottom - curY };
  } else if (mode === 'ne') {
    const bottom = savedBox.value.y + savedBox.value.h;
    const curY = Math.max(0, Math.min(bottom - 15, e.clientY - rect.top));
    const dx = e.clientX - dragStartX.value;
    const newW = Math.max(15, Math.min(rect.width - savedBox.value.x, savedBox.value.w + dx));
    selectionBox.value = { x: savedBox.value.x, y: curY, w: newW, h: bottom - curY };
  } else if (mode === 'sw') {
    const right = savedBox.value.x + savedBox.value.w;
    const curX = Math.max(0, Math.min(right - 15, e.clientX - rect.left));
    const dy = e.clientY - dragStartY.value;
    const newH = Math.max(15, Math.min(rect.height - savedBox.value.y, savedBox.value.h + dy));
    selectionBox.value = { x: curX, y: savedBox.value.y, w: right - curX, h: newH };
  }
};

// 5. Global mouse up handler
const onGlobalCropMouseUp = () => {
  if (dragMode.value === 'draw' && (selectionBox.value.w < 15 || selectionBox.value.h < 15)) {
    if (savedBox.value && savedBox.value.w >= 15 && savedBox.value.h >= 15) {
      selectionBox.value = { ...savedBox.value };
    }
  }
  dragMode.value = null;
  window.removeEventListener('mousemove', onGlobalCropMouseMove);
  window.removeEventListener('mouseup', onGlobalCropMouseUp);
};

const resetSelection = () => {
  if (!cropImgWrapperRef.value) return;
  const rect = cropImgWrapperRef.value.getBoundingClientRect();
  selectionBox.value = {
    x: rect.width * 0.1,
    y: rect.height * 0.1,
    w: rect.width * 0.8,
    h: rect.height * 0.4,
  };
};

const applyFreeCrop = async () => {
  if (!cropImgWrapperRef.value || selectionBox.value.w < 10 || selectionBox.value.h < 10) return;
  const rect = cropImgWrapperRef.value.getBoundingClientRect();
  freeCropBox.value = {
    xRatio: selectionBox.value.x / rect.width,
    yRatio: selectionBox.value.y / rect.height,
    wRatio: selectionBox.value.w / rect.width,
    hRatio: selectionBox.value.h / rect.height,
  };

  // Auto select best target paper size based on ratio
  const mmW = selectionMmWidth.value;
  const mmH = selectionMmHeight.value;
  if (mmW >= 90 && mmH >= 120) {
    selectPaperPreset(paperPresets.find(p => p.id === '100x150'));
  } else if (mmW >= 85 && mmH >= 85) {
    selectPaperPreset(paperPresets.find(p => p.id === '100x100'));
  } else if (mmW >= 60) {
    selectPaperPreset(paperPresets.find(p => p.id === '70x30'));
  } else {
    selectPaperPreset(paperPresets.find(p => p.id === '50x30'));
  }

  showFreeCropModal.value = false;
  await reprocessPdf();
};

const reprocessPdf = async () => {
  if (currentPdfDoc.value) {
    rawLabels.value = await slicePdfLabels(
      currentPdfDoc.value, 
      selectedLayoutMode.value, 
      null, 
      freeCropBox.value
    );
  } else if (originalImageCanvas.value && freeCropBox.value) {
    const orig = originalImageCanvas.value;
    const box = {
      x: Math.max(0, freeCropBox.value.xRatio * orig.width),
      y: Math.max(0, freeCropBox.value.yRatio * orig.height),
      w: Math.min(orig.width, freeCropBox.value.wRatio * orig.width),
      h: Math.min(orig.height, freeCropBox.value.hRatio * orig.height),
    };
    const cellCanvas = document.createElement('canvas');
    cellCanvas.width = box.w;
    cellCanvas.height = box.h;
    const cellCtx = cellCanvas.getContext('2d');
    cellCtx.drawImage(orig, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);

    rawLabels.value = [{
      id: `img_${Date.now()}`,
      page: 1,
      col: 1,
      row: 1,
      canvas: cellCanvas,
      dataUrl: cellCanvas.toDataURL('image/png'),
      barcode: 'IMAGE-LABEL',
      title: '图片自定义裁切标',
      sku: '',
      quantity: 1,
      selected: true,
      width: cellCanvas.width,
      height: cellCanvas.height,
    }];
  }
};

const selectionMmWidth = computed(() => {
  if (!cropImgWrapperRef.value) return 0;
  const rect = cropImgWrapperRef.value.getBoundingClientRect();
  if (!rect.width) return 0;
  return Math.round((selectionBox.value.w / rect.width) * (pdfOriginalWidthMm.value || 210));
});

const selectionMmHeight = computed(() => {
  if (!cropImgWrapperRef.value) return 0;
  const rect = cropImgWrapperRef.value.getBoundingClientRect();
  if (!rect.height) return 0;
  return Math.round((selectionBox.value.h / rect.height) * (pdfOriginalHeightMm.value || 297));
});

const hasValidSelection = computed(() => {
  return selectionBox.value.w > 10 && selectionBox.value.h > 10;
});

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
    await processPdfFile(blob, presetMode);
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
