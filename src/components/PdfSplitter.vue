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

    <!-- Step 1: Upload PDF or Open Saved Project -->
    <div v-if="currentStep === 1" class="space-y-6">
      <!-- Mode Tabs: New Project vs Saved Projects -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button 
            @click="step1Tab = 'new'"
            class="px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            :class="step1Tab === 'new' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
          >
            <Plus class="w-4 h-4" />
            <span>{{ t('pdf.newProject') }} (上传本地文件)</span>
          </button>
          <button 
            @click="step1Tab = 'saved'"
            class="px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            :class="step1Tab === 'saved' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
          >
            <FolderOpen class="w-4 h-4" />
            <span>{{ t('pdf.savedProjects') }} ({{ savedProjectsList.length }})</span>
          </button>
        </div>

        <div v-if="step1Tab === 'saved'" class="flex items-center gap-2">
          <label class="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all">
            <FileUp class="w-3.5 h-3.5 text-brand-600" />
            <span>{{ t('pdf.importProject') }} (.json)</span>
            <input type="file" accept=".json" class="hidden" @change="onImportJsonFile" />
          </label>
        </div>
      </div>

      <!-- Tab A: Upload New File -->
      <div v-if="step1Tab === 'new'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
        <!-- Dropzone -->
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
        <div class="border-t border-slate-100 pt-6">
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

        <!-- Quick Access to Recent Saved Projects -->
        <div v-if="savedProjectsList.length > 0" class="border-t border-slate-100 pt-6">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Clock class="w-4 h-4 text-brand-500" />
              <span>最近保存的项目：</span>
            </div>
            <button 
              @click="step1Tab = 'saved'"
              class="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>查看全部 ({{ savedProjectsList.length }})</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div 
              v-for="p in savedProjectsList.slice(0, 3)" 
              :key="p.id"
              class="p-3 bg-slate-50 hover:bg-white border border-slate-200 hover:border-brand-400 rounded-xl transition-all shadow-xs flex items-center justify-between gap-3 group"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img v-if="p.thumbnail" :src="p.thumbnail" class="w-full h-full object-contain" />
                  <FileText v-else class="w-5 h-5 text-slate-300" />
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-slate-800 truncate group-hover:text-brand-600">{{ p.name }}</div>
                  <div class="text-[10px] text-slate-400">{{ p.labelCount }} 款 · 计划 {{ p.totalQuantity }} 张</div>
                </div>
              </div>
              <button 
                @click="handleOpenProject(p)"
                class="px-2.5 py-1.5 bg-white hover:bg-brand-50 text-brand-600 border border-slate-200 hover:border-brand-300 text-xs font-bold rounded-lg transition-all flex-shrink-0"
              >
                打开
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab B: Browse All Saved Projects -->
      <div v-else-if="step1Tab === 'saved'" class="space-y-4">
        <div v-if="savedProjectsList.length === 0" class="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-4">
          <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FolderOpen class="w-8 h-8" />
          </div>
          <h4 class="text-base font-bold text-slate-800">{{ t('pdf.emptySaved') }}</h4>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            在第2步中可随时自定义项目名称并点击【保存项目】，保存后即可在此一键重新打开或导出备份。
          </p>
          <button 
            @click="step1Tab = 'new'"
            class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            <span>立即新建上传项目</span>
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="p in savedProjectsList" 
            :key="p.id"
            class="bg-white rounded-xl border border-slate-200 hover:border-brand-400 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
          >
            <!-- Card Header & Thumbnail -->
            <div class="p-4 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-bold text-slate-800 truncate group-hover:text-brand-600" :title="p.name">
                    {{ p.name }}
                  </h4>
                  <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Clock class="w-3 h-3" />
                    <span>{{ formatTime(p.updatedAt) }}</span>
                    <span>·</span>
                    <span class="truncate max-w-[120px]">{{ p.sourceFileName }}</span>
                  </div>
                </div>

                <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {{ p.targetWidthMm }}×{{ p.targetHeightMm }}mm
                </span>
              </div>

              <!-- Thumbnail Preview Box -->
              <div class="w-full h-32 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-2 relative">
                <img v-if="p.thumbnail" :src="p.thumbnail" class="max-w-full max-h-full object-contain" />
                <div v-else class="text-slate-300 text-xs flex flex-col items-center gap-1">
                  <FileText class="w-6 h-6" />
                  <span>无缩略图</span>
                </div>

                <!-- Floating Count Tag -->
                <div class="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-mono rounded">
                  {{ p.labelCount }} 款 · 共 {{ p.totalQuantity }} 张
                </div>
              </div>
            </div>

            <!-- Card Actions Footer -->
            <div class="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <button 
                @click="handleOpenProject(p)"
                class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
              >
                <FolderOpen class="w-3.5 h-3.5" />
                <span>打开项目</span>
              </button>

              <div class="flex items-center gap-1">
                <button 
                  @click="handleExportProject(p)"
                  title="导出为 JSON 备份文件"
                  class="p-1.5 hover:bg-white text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200 rounded-md transition-all text-xs"
                >
                  <Download class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="handleDeleteProject(p.id, p.name)"
                  title="删除此项目"
                  class="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all text-xs"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Confirm Labels & Quantities (Paso 2 Infotrekx Style) -->
    <div v-if="currentStep === 2" class="space-y-4">
      <!-- Project Metadata & Custom Naming Bar -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 flex-1 min-w-[260px]">
          <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Bookmark class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <span>{{ t('pdf.projectName') }} (可自定义命名)</span>
              <span v-if="currentProjectId" class="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">已保存到本地</span>
            </div>
            <input 
              v-model="currentProjectName"
              type="text"
              placeholder="输入项目自定义名称 (例如：美客多大号外箱标_批次A)..."
              class="w-full text-sm font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-brand-500 focus:border-brand-500 focus:outline-none transition-colors py-0.5"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Save Project Button -->
          <button 
            @click="handleSaveCurrentProject"
            class="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Save class="w-3.5 h-3.5" />
            <span>{{ t('pdf.saveProject') }}</span>
          </button>

          <!-- Open History Projects Modal -->
          <button 
            @click="showSavedProjectsModal = true"
            class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
          >
            <FolderOpen class="w-3.5 h-3.5 text-slate-500" />
            <span>历史项目 ({{ savedProjectsList.length }})</span>
          </button>

          <!-- Create New Project -->
          <button 
            @click="handleCreateNewProject"
            class="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>{{ t('pdf.newProject') }}</span>
          </button>
        </div>
      </div>

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

      <!-- Thermal Printing Pitfall & Troubleshooting Guide -->
      <div class="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-amber-950 space-y-3">
        <div class="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <AlertTriangle class="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>热敏打印机防踩坑指南（避免连吐多张、条码拉伸变形、跨缝打断）</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <!-- Item 1 -->
          <div class="p-3 bg-white/80 rounded-xl border border-amber-200/60 shadow-xs space-y-1.5">
            <div class="font-bold text-amber-900 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">1</span>
              <span>纸张尺寸必须匹配实际卷纸</span>
            </div>
            <p class="text-amber-800 leading-relaxed text-[11px]">
              弹出打印窗口时，<strong>纸张尺寸必须选择与打印机里实际装入的卷纸一致（如当前的 {{ targetWidthMm }} × {{ targetHeightMm }} mm）</strong>！
              <span class="text-rose-600 font-bold block mt-0.5">⚠️ 绝不能使用系统默认的「E邮宝长 100×150mm」！</span>
              若选 100×150mm，打印机会以为是一张 15 厘米的大面单，从而连吐 4~5 张标签纸，并且条码会被旋转切断。
            </p>
          </div>

          <!-- Item 2 -->
          <div class="p-3 bg-white/80 rounded-xl border border-amber-200/60 shadow-xs space-y-1.5">
            <div class="font-bold text-amber-900 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">2</span>
              <span>缩放选 100% · 边距选无</span>
            </div>
            <p class="text-amber-800 leading-relaxed text-[11px]">
              打印设置中，<strong>缩放请勾选「实际大小 / 100%」</strong>（不要选“适合可打印区域”避免变形）；<strong>边距选择「无」</strong>，保证标签 1:1 满幅贴合。
            </p>
          </div>

          <!-- Item 3 -->
          <div class="p-3 bg-white/80 rounded-xl border border-amber-200/60 shadow-xs space-y-1.5">
            <div class="font-bold text-amber-900 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">3</span>
              <span>汉印 (HPRT) 打印机缝隙自动校准</span>
            </div>
            <p class="text-amber-800 leading-relaxed text-[11px]">
              装好新卷纸后，开机状态下<strong>长按打印机顶部的 FEED 走纸键约 2 秒</strong>，听到“哔”一声松手，打印机会自动走纸学习标签缝隙定位，校准后每次打印均能精准停在每张标签的切线处！
            </p>
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

    <!-- History Saved Projects Modal (Teleported to document.body) -->
    <Teleport to="body">
      <div v-if="showSavedProjectsModal" class="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                <FolderOpen class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800">已保存的历史标签项目 ({{ savedProjectsList.length }})</h3>
                <p class="text-[11px] text-slate-500 mt-0.5">点击可直接打开项目；所有数据保存在您的浏览器本地，安全离线可用</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <label class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all">
                <FileUp class="w-3.5 h-3.5 text-brand-600" />
                <span>导入备份 (.json)</span>
                <input type="file" accept=".json" class="hidden" @change="onImportJsonFile" />
              </label>
              <button 
                @click="showSavedProjectsModal = false"
                class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Modal Body Grid -->
          <div class="p-6 overflow-y-auto max-h-[65vh]">
            <div v-if="savedProjectsList.length === 0" class="text-center py-12 text-slate-400 space-y-3">
              <FolderOpen class="w-12 h-12 text-slate-300 mx-auto" />
              <p class="text-sm font-medium">暂无已保存项目</p>
              <p class="text-xs text-slate-400">在工作区给项目命名并点击【保存项目】，即可保存在此。</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="p in savedProjectsList" 
                :key="p.id"
                class="bg-white rounded-xl border border-slate-200 hover:border-brand-500 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div class="p-4 space-y-2.5">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-xs font-bold text-slate-800 truncate group-hover:text-brand-600" :title="p.name">
                      {{ p.name }}
                    </h4>
                    <span class="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded flex-shrink-0">
                      {{ p.targetWidthMm }}×{{ p.targetHeightMm }}mm
                    </span>
                  </div>

                  <div class="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    <span>{{ formatTime(p.updatedAt) }}</span>
                    <span>·</span>
                    <span>{{ p.labelCount }} 款 ({{ p.totalQuantity }}张)</span>
                  </div>

                  <!-- Thumbnail Box -->
                  <div class="w-full h-24 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-1.5">
                    <img v-if="p.thumbnail" :src="p.thumbnail" class="max-w-full max-h-full object-contain" />
                    <FileText v-else class="w-6 h-6 text-slate-300" />
                  </div>
                </div>

                <div class="px-3 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <button 
                    @click="handleOpenProject(p)"
                    class="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-1"
                  >
                    <span>打开此项目</span>
                  </button>

                  <div class="flex items-center gap-1">
                    <button 
                      @click="handleExportProject(p)"
                      title="导出备份 JSON"
                      class="p-1 hover:bg-white text-slate-500 rounded text-xs"
                    >
                      <Download class="w-3.5 h-3.5" />
                    </button>
                    <button 
                      @click="handleDeleteProject(p.id, p.name)"
                      title="删除项目"
                      class="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded text-xs"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Save Notification Toast -->
    <Teleport to="body">
      <div 
        v-if="saveToastMessage" 
        class="fixed bottom-6 right-6 z-[10000] px-4 py-2.5 bg-slate-900/90 text-white rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 backdrop-blur"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span class="text-xs font-bold">{{ saveToastMessage }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw, computed, nextTick, onMounted } from 'vue';
import { 
  UploadCloud, FileUp, Layers, LayoutGrid, Search, ArrowRight, 
  CheckCircle2, Download, Printer, Scroll, FlaskConical, Crop, Check, RotateCcw, X,
  FolderOpen, Save, Plus, Trash2, Clock, FileText, Bookmark, Calendar, AlertTriangle
} from 'lucide-vue-next';
import { t } from '@/i18n';
import { 
  loadPdfDocument, detectSuggestedLayout, slicePdfLabels, 
  groupLabelsByBarcode, exportThermalPdf, trimWhiteBorder
} from '@/utils/pdfProcessor';
import { 
  getAllProjects, getProject, saveProject, deleteProject, 
  exportProjectJson, importProjectJson 
} from '@/utils/projectStorage';

const currentStep = ref(1);
const isDragging = ref(false);
const fileInputRef = ref(null);
const currentPdfDoc = shallowRef(null);
const selectedLayoutMode = ref('presetFreeform');
const viewMode = ref('grouped');
const rawLabels = ref([]);
const searchQuery = ref('');
const isGeneratingPdf = ref(false);

// Project management state
const currentProjectId = ref(null);
const currentProjectName = ref('');
const currentSourceFileName = ref('');
const savedProjectsList = ref([]);
const showSavedProjectsModal = ref(false);
const saveToastMessage = ref('');
const step1Tab = ref('new'); // 'new' | 'saved'

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

    // Initialize default project name from file
    const rawName = fileOrUrl?.name || (typeof fileOrUrl === 'string' ? fileOrUrl.split('/').pop() : 'PDF标签');
    currentSourceFileName.value = rawName;
    if (!currentProjectId.value || !currentProjectName.value) {
      currentProjectName.value = rawName.replace(/\.[^/.]+$/, "") + ' - ' + new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    }

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
      currentSourceFileName.value = file.name || '图片标签';
      if (!currentProjectId.value || !currentProjectName.value) {
        currentProjectName.value = fileName + ' - ' + new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
      }

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
    const pageVp = page.getViewport({ scale: 1.0 });
    const maxDim = Math.max(pageVp.width, pageVp.height);
    const targetScale = Math.min(8.0, Math.max(3.0, 1800 / maxDim));
    const vp = page.getViewport({ scale: targetScale });
    pdfOriginalWidthMm.value = Math.round(pageVp.width * (25.4 / 72));
    pdfOriginalHeightMm.value = Math.round(pageVp.height * (25.4 / 72));

    canvas.width = vp.width;
    canvas.height = vp.height;
    cropPageWidth.value = vp.width;
    cropPageHeight.value = vp.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
  } else if (originalImageCanvas.value || rawLabels.value[0]?.canvas || rawLabels.value[0]?.dataUrl) {
    let srcCanvas = originalImageCanvas.value || rawLabels.value[0]?.canvas;
    if (!srcCanvas && rawLabels.value[0]?.dataUrl) {
      const img = new Image();
      img.src = rawLabels.value[0].dataUrl;
      await img.decode();
      const tempC = document.createElement('canvas');
      tempC.width = img.naturalWidth || img.width;
      tempC.height = img.naturalHeight || img.height;
      tempC.getContext('2d').drawImage(img, 0, 0);
      srcCanvas = tempC;
    }
    if (srcCanvas) {
      canvas.width = srcCanvas.width;
      canvas.height = srcCanvas.height;
      cropPageWidth.value = srcCanvas.width;
      cropPageHeight.value = srcCanvas.height;
      pdfOriginalWidthMm.value = Math.round(srcCanvas.width * 0.264583);
      pdfOriginalHeightMm.value = Math.round(srcCanvas.height * 0.264583);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(srcCanvas, 0, 0);
    }
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
    
    const sampleBaseName = filePath.split('/').pop().replace(/\.[^/.]+$/, "");
    currentSourceFileName.value = sampleBaseName;
    currentProjectName.value = `实测_${sampleBaseName} - ${new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}`;
    currentProjectId.value = null;

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

// Direct silent thermal print via iframe with strict @page geometry
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

  // Web High-Precision Thermal Direct Print via Iframe with strict @page geometry
  // This instructs Chrome/Edge print engine of the exact physical millimeter dimensions
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';
  document.body.appendChild(printIframe);

  const pagesHtml = previewList.value.map(item => `
    <div class="thermal-page">
      <img src="${item.dataUrl}" class="${autoRotate.value && item.width < item.height && targetWidthMm.value > targetHeightMm.value ? 'rotate-90' : ''}" />
    </div>
  `).join('');

  const iframeDoc = printIframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>LabelMaster_Print_${targetWidthMm.value}x${targetHeightMm.value}mm</title>
        <style>
          @page {
            size: ${targetWidthMm.value}mm ${targetHeightMm.value}mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: ${targetWidthMm.value}mm;
            height: ${targetHeightMm.value}mm;
            margin: 0;
            padding: 0;
            background: #ffffff;
          }
          .thermal-page {
            width: ${targetWidthMm.value}mm;
            height: ${targetHeightMm.value}mm;
            page-break-after: always;
            page-break-inside: avoid;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .thermal-page img {
            max-width: 100%;
            max-height: 100%;
            object-fit: ${fitMode.value === 'stretch' ? 'fill' : 'contain'};
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          .thermal-page img.rotate-90 {
            transform: rotate(90deg);
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `);
  iframeDoc.close();

  setTimeout(() => {
    printIframe.contentWindow.focus();
    printIframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
    }, 60000);
  }, 400);
};

// ==========================================
// Project Management & Persistence Functions
// ==========================================

const loadSavedProjectsList = async () => {
  try {
    savedProjectsList.value = await getAllProjects();
  } catch (err) {
    console.error('Failed to load saved projects:', err);
  }
};

onMounted(() => {
  loadSavedProjectsList();
});

const handleSaveCurrentProject = async () => {
  if (rawLabels.value.length === 0) {
    alert('暂无标签可保存，请先上传并裁切标签');
    return;
  }

  const nameToSave = currentProjectName.value.trim() || `标签项目_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}_${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  currentProjectName.value = nameToSave;

  const cleanBox = freeCropBox.value ? {
    xRatio: Number(freeCropBox.value.xRatio) || 0,
    yRatio: Number(freeCropBox.value.yRatio) || 0,
    wRatio: Number(freeCropBox.value.wRatio) || 0,
    hRatio: Number(freeCropBox.value.hRatio) || 0,
  } : null;

  const projectPayload = {
    id: currentProjectId.value || `proj_${Date.now()}`,
    name: nameToSave,
    sourceFileName: currentSourceFileName.value || '自定义标签',
    layoutMode: selectedLayoutMode.value,
    freeCropBox: cleanBox,
    selectedPaperId: selectedPaperId.value,
    targetWidthMm: targetWidthMm.value,
    targetHeightMm: targetHeightMm.value,
    autoRotate: autoRotate.value,
    fitMode: fitMode.value,
    viewMode: viewMode.value,
    rawLabels: rawLabels.value,
  };

  try {
    const saved = await saveProject(projectPayload);
    currentProjectId.value = saved.id;
    await loadSavedProjectsList();
    saveToastMessage.value = `项目【${saved.name}】已成功保存！`;
    setTimeout(() => {
      saveToastMessage.value = '';
    }, 3000);
  } catch (err) {
    console.error('Failed to save project:', err);
    alert('保存项目失败: ' + err.message);
  }
};

const handleOpenProject = async (projectItem) => {
  try {
    const full = await getProject(projectItem.id);
    if (!full) throw new Error('未找到该项目的完整数据');

    currentProjectId.value = full.id;
    currentProjectName.value = full.name;
    currentSourceFileName.value = full.sourceFileName || '';
    selectedLayoutMode.value = full.layoutMode || 'presetFreeform';
    freeCropBox.value = full.freeCropBox || null;
    selectedPaperId.value = full.selectedPaperId || '70x30';
    targetWidthMm.value = full.targetWidthMm || 70;
    targetHeightMm.value = full.targetHeightMm || 30;
    autoRotate.value = full.autoRotate !== false;
    fitMode.value = full.fitMode || 'proportional';
    viewMode.value = full.viewMode || 'grouped';
    rawLabels.value = full.rawLabels || [];

    currentPdfDoc.value = null; // Stored project is standalone
    originalImageCanvas.value = null;
    showSavedProjectsModal.value = false;
    currentStep.value = 2;

    saveToastMessage.value = `已打开项目【${full.name}】`;
    setTimeout(() => {
      saveToastMessage.value = '';
    }, 2500);
  } catch (err) {
    console.error('Failed to open project:', err);
    alert('打开项目失败: ' + err.message);
  }
};

const handleDeleteProject = async (id, name) => {
  if (!confirm(`确定要删除保存项目【${name || '此项目'}】吗？此操作无法撤销。`)) return;
  try {
    await deleteProject(id);
    if (currentProjectId.value === id) {
      currentProjectId.value = null;
    }
    await loadSavedProjectsList();
  } catch (err) {
    alert('删除失败: ' + err.message);
  }
};

const handleCreateNewProject = () => {
  currentProjectId.value = null;
  currentProjectName.value = '';
  currentSourceFileName.value = '';
  currentPdfDoc.value = null;
  originalImageCanvas.value = null;
  rawLabels.value = [];
  freeCropBox.value = null;
  currentStep.value = 1;
  step1Tab.value = 'new';
};

const handleExportProject = async (projectItem) => {
  try {
    const full = await getProject(projectItem.id);
    if (full) {
      exportProjectJson(full);
    }
  } catch (err) {
    alert('导出项目失败: ' + err.message);
  }
};

const onImportJsonFile = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const imported = await importProjectJson(file);
    await loadSavedProjectsList();
    alert(`成功导入项目【${imported.name}】！`);
    await handleOpenProject(imported);
  } catch (err) {
    alert('导入失败: ' + err.message);
  } finally {
    e.target.value = '';
  }
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
</script>
