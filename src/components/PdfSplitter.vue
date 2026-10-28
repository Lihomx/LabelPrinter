<template>
  <div class="space-y-6">
    <!-- Stepper Navigation (Infotrekx 4-Step Style) -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div class="flex items-center justify-between max-w-5xl mx-auto gap-4">
        <div class="flex items-center justify-between flex-1">
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
            <div v-if="idx < steps.length - 1" class="w-6 sm:w-12 h-0.5 bg-slate-200 ml-2" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <!-- Client Badge if in Electron -->
          <span 
            v-if="isElectron" 
            class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <Laptop class="w-3.5 h-3.5 text-emerald-600" />
            <span>{{ t('pdf.electronBadge') }}</span>
          </span>

          <!-- Help Guide Button -->
          <button 
            @click="showPrintHelpModal = true"
            :title="t('pdf.helpModalSubtitle')"
            class="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs flex-shrink-0"
          >
            <HelpCircle class="w-4 h-4 text-blue-600" />
            <span>{{ t('pdf.printHelp') }}</span>
          </button>
        </div>
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
            <span>{{ t('pdf.newProject') }}</span>
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
            <span>{{ t('pdf.importJson') }}</span>
            <input type="file" accept=".json" class="hidden" @change="onImportJsonFile" />
          </label>
        </div>
      </div>

      <!-- Tab A: Upload New File -->
      <div v-if="step1Tab === 'new'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        <!-- New Smart Extractor & Layout Tool Banner -->
        <div class="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-base flex-shrink-0">
              ✨
            </div>
            <div>
              <div class="font-bold text-amber-950 flex items-center gap-2">
                <span class="text-xs sm:text-sm">{{ t('pdf.extractorBannerTitle') }}</span>
                <span class="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-black text-[10px]">{{ t('pdf.vectorBlack') }}</span>
              </div>
              <div class="text-amber-800/80 mt-0.5">
                {{ t('pdf.extractorBannerDesc') }}
              </div>
            </div>
          </div>

          <button 
            @click="$emit('switch-tab', 'extractor')"
            class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0"
          >
            <span>{{ t('pdf.tryExtractor') }}</span>
          </button>
        </div>

        <!-- New PDF Merger & Splitter Tool Banner -->
        <div class="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-700 flex items-center justify-center font-bold text-base flex-shrink-0">
              📑
            </div>
            <div>
              <div class="font-bold text-indigo-950 flex items-center gap-2">
                <span class="text-xs sm:text-sm">{{ t('pdf.toolsBannerTitle') }}</span>
                <span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-black text-[10px]">{{ t('nav.newBadge') }}</span>
              </div>
              <div class="text-indigo-800/80 mt-0.5">
                {{ t('pdf.toolsBannerDesc') }}
              </div>
            </div>
          </div>

          <button 
            @click="$emit('switch-tab', 'tools')"
            class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0"
          >
            <span>{{ t('pdf.tryTools') }}</span>
          </button>
        </div>

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
            {{ t('pdf.sampleTitle') }}
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button 
              @click="loadLocalSample('samples/labels_152.pdf', 'presetA4_30')"
              class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
            >
              <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">{{ t('pdf.sample1Title') }}</span>
              <span class="text-[11px] text-slate-500 mt-0.5">{{ t('pdf.sample1Desc') }}</span>
            </button>

            <button 
              @click="loadLocalSample('samples/mercadolibre_2up.pdf', 'presetML_2')"
              class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
            >
              <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">{{ t('pdf.sample2Title') }}</span>
              <span class="text-[11px] text-slate-500 mt-0.5">{{ t('pdf.sample2Desc') }}</span>
            </button>

            <button 
              @click="loadLocalSample('samples/carton_vertical_3.pdf', 'presetVertical_2')"
              class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
            >
              <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">{{ t('pdf.sample3Title') }}</span>
              <span class="text-[11px] text-slate-500 mt-0.5">{{ t('pdf.sample3Desc') }}</span>
            </button>

            <button 
              @click="loadLocalSample('samples/perfume_single.pdf', 'presetSingleTL')"
              class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
            >
              <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">{{ t('pdf.sample4Title') }}</span>
              <span class="text-[11px] text-slate-500 mt-0.5">{{ t('pdf.sample4Desc') }}</span>
            </button>

            <button 
              @click="loadLocalSample('samples/labels_40_4x10.pdf', 'presetA4_40')"
              class="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all group"
            >
              <span class="text-xs font-bold text-slate-800 group-hover:text-brand-600">{{ t('pdf.sample5Title') }}</span>
              <span class="text-[11px] text-slate-500 mt-0.5">{{ t('pdf.sample5Desc') }}</span>
            </button>
          </div>
        </div>

        <!-- Quick Access to Recent Saved Projects -->
        <div v-if="savedProjectsList.length > 0" class="border-t border-slate-100 pt-6">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Clock class="w-4 h-4 text-brand-500" />
              <span>{{ t('pdf.recentProjects') }}</span>
            </div>
            <button 
              @click="step1Tab = 'saved'"
              class="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>{{ t('pdf.viewAll') }} ({{ savedProjectsList.length }})</span>
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
                  <div class="text-[10px] text-slate-400">{{ p.labelCount }} {{ t('pdf.labelsCount') }} · {{ p.totalQuantity }} {{ t('pdf.piecesUnit') }}</div>
                </div>
              </div>
              <button 
                @click="handleOpenProject(p)"
                class="px-2.5 py-1.5 bg-white hover:bg-brand-50 text-brand-600 border border-slate-200 hover:border-brand-300 text-xs font-bold rounded-lg transition-all flex-shrink-0"
              >
                {{ t('pdf.open') }}
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
            {{ t('pdf.saveProjectTip') }}
          </p>
          <button 
            @click="step1Tab = 'new'"
            class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            <span>{{ t('pdf.createNewUpload') }}</span>
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
                  <span>{{ t('pdf.noThumbnail') }}</span>
                </div>

                <!-- Floating Count Tag -->
                <div class="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-mono rounded">
                  {{ p.labelCount }} {{ t('pdf.labelsCount') }} · {{ p.totalQuantity }} {{ t('pdf.piecesUnit') }}
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
                <span>{{ t('pdf.openProjectBtn') }}</span>
              </button>

              <div class="flex items-center gap-1">
                <button 
                  @click="handleExportProject(p)"
                  :title="t('pdf.exportBackup')"
                  class="p-1.5 hover:bg-white text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200 rounded-md transition-all text-xs"
                >
                  <Download class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="handleDeleteProject(p.id, p.name)"
                  :title="t('pdf.deleteProject')"
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
              <span>{{ t('pdf.projectName') }}</span>
              <span v-if="currentProjectId" class="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">{{ t('pdf.savedLocally') }}</span>
            </div>
            <input 
              v-model="currentProjectName"
              type="text"
              :placeholder="t('pdf.projectNamePlaceholder')"
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
            <span>{{ t('pdf.historyProjects') }} ({{ savedProjectsList.length }})</span>
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
            <option value="presetA4_40">{{ t('pdf.presetA4_40') }}</option>
            <option value="presetML_2">{{ t('pdf.presetML_2') }}</option>
            <option value="presetVertical_2">{{ t('pdf.presetVertical_2') }}</option>
            <option value="presetSingleTL">{{ t('pdf.presetSingleTL') }}</option>
          </select>

          <!-- Freeform Edit Button & AutoTrim toggle -->
          <div v-if="selectedLayoutMode === 'presetFreeform'" class="flex items-center gap-2">
            <button 
              @click="openFreeCropModal"
              type="button"
              class="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Crop class="w-3.5 h-3.5" />
              <span>{{ t('pdf.recrop') }}</span>
            </button>
            <label 
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer select-none transition-all shadow-2xs"
              :title="t('pdf.freeCropAutoTrimDesc')"
            >
              <input 
                type="checkbox" 
                v-model="freeCropAutoTrim" 
                @change="onFreeCropAutoTrimChange"
                class="w-3.5 h-3.5 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <span>{{ t('pdf.freeCropAutoTrim') }}</span>
            </label>
          </div>
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

        <!-- Sharpen Mode Quick Selector in Step 2 -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <span class="text-slate-500 font-bold px-1.5 flex items-center gap-1">
            <span>🖤</span>
            <span>{{ t('sharpen.label') }}</span>
          </span>
          <button 
            @click="setSharpenMode('standard')" 
            :title="t('sharpen.standardDesc')"
            class="px-2 py-0.5 rounded font-bold text-xs transition-all"
            :class="sharpenMode === 'standard' ? 'bg-white text-emerald-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'"
          >
            {{ t('sharpen.standard') }}
          </button>
          <button 
            @click="setSharpenMode('heavy')" 
            :title="t('sharpen.heavyDesc')"
            class="px-2 py-0.5 rounded font-bold text-xs transition-all"
            :class="sharpenMode === 'heavy' ? 'bg-white text-amber-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'"
          >
            {{ t('sharpen.heavy') }}
          </button>
          <button 
            @click="setSharpenMode('none')" 
            :title="t('sharpen.noneDesc')"
            class="px-2 py-0.5 rounded font-bold text-xs transition-all"
            :class="sharpenMode === 'none' ? 'bg-white text-slate-700 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'"
          >
            {{ t('sharpen.none') }}
          </button>
        </div>

        <!-- Stats & Next Step Button -->
        <div class="flex items-center gap-4">
          <div class="text-right">
            <span class="text-xs text-slate-400 block">{{ t('pdf.totalPrintCount') }}</span>
            <span class="text-lg font-bold text-brand-600 leading-none">{{ totalPrintQuantity }} {{ t('pdf.piecesUnit') }}</span>
          </div>
          <button 
            @click="currentStep = 3"
            class="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>{{ t('pdf.nextStepPaper') }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Page Selection Bar in Step 2 -->
      <div class="bg-blue-50/90 border border-blue-200 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div class="flex items-center gap-2 text-blue-950 font-bold">
          <FileText class="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span class="text-xs sm:text-sm">{{ t('pdf.pageSelectTitle') }}</span>
          <span class="text-slate-600 font-normal">
            {{ t('pdf.pageSelectStatus', { max: maxPdfPages, count: selectedPagesCount, qty: totalPrintQuantity }) }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Quick Page Selection Actions -->
          <button 
            @click="selectOnlyFirstPage" 
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            :title="t('pdf.onlyFirstPageTip')"
          >
            <span>{{ t('pdf.onlyFirstPage') }}</span>
          </button>

          <button 
            @click="selectOddPages" 
            class="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-all cursor-pointer shadow-2xs"
            :title="t('pdf.oddPagesTip')"
          >
            {{ t('pdf.oddPages') }}
          </button>

          <button 
            @click="selectEvenPages" 
            class="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-all cursor-pointer shadow-2xs"
            :title="t('pdf.evenPagesTip')"
          >
            {{ t('pdf.evenPages') }}
          </button>

          <button 
            @click="selectAllPages" 
            class="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-all cursor-pointer"
          >
            {{ t('pdf.selectAll') }}
          </button>

          <button 
            @click="invertPageSelection" 
            class="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            {{ t('pdf.invertSelection') }}
          </button>

          <!-- Custom Page Range Input -->
          <div class="flex items-center bg-white rounded-lg border border-blue-300 overflow-hidden shadow-2xs pl-2">
            <span class="text-slate-400 text-[11px] mr-1">{{ t('pdf.specifiedPage') }}</span>
            <input 
              v-model="pageRangeInput" 
              @keyup.enter="applyPageRange"
              :placeholder="t('pdf.pageRangePlaceholder')" 
              class="w-20 sm:w-24 text-center text-xs font-mono font-bold text-blue-900 focus:outline-none py-1.5" 
            />
            <button 
              @click="applyPageRange" 
              class="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs transition-colors border-l border-blue-200 cursor-pointer"
            >
              {{ t('pdf.apply') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Batch Quantity Bar in Step 2 -->
      <div class="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 text-indigo-950 font-bold">
          <Layers class="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span class="text-xs sm:text-sm">{{ t('pdf.batchSetQty') }}</span>
          <span class="text-slate-500 font-normal hidden md:inline">{{ t('pdf.batchSetQtyDesc') }}</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center bg-white rounded-lg border border-indigo-300 overflow-hidden shadow-2xs">
            <button @click="batchQuantity = Math.max(1, (Number(batchQuantity) || 1) - 1)" title="-" class="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm transition-colors">-</button>
            <input 
              v-model.number="batchQuantity" 
              @blur="normalizeBatchQuantity" 
              type="number" 
              min="1" 
              max="9999" 
              :placeholder="t('pdf.quantity')" 
              class="w-16 text-center text-xs sm:text-sm font-bold font-mono text-indigo-900 focus:outline-none" 
            />
            <button @click="batchQuantity = (Number(batchQuantity) || 0) + 1" title="+" class="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm transition-colors">+</button>
          </div>

          <button 
            @click="applyBatchQuantity(batchQuantity)" 
            class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            {{ t('pdf.applyToSelected') }}
          </button>

          <div class="flex items-center gap-1 pl-2 border-l border-indigo-200">
            <button v-for="q in [1, 5, 10, 20, 30, 50, 100]" :key="q" @click="applyBatchQuantity(q)" class="px-2 py-1 bg-white hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 text-[11px] font-semibold transition-all">{{ q }}{{ t('pdf.piecesUnit') }}</button>
          </div>
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
          class="rounded-xl border overflow-hidden shadow-sm transition-all flex flex-col group relative"
          :class="[
            item.selected !== false && item.quantity > 0
              ? 'bg-white border-slate-200 hover:border-brand-400 hover:shadow-md'
              : 'bg-slate-50 border-dashed border-slate-300 opacity-60'
          ]"
        >
          <!-- Card Image Thumbnail with border preview -->
          <div class="p-3 bg-slate-50 flex items-center justify-center min-h-[140px] border-b border-slate-100 relative">
            <img :src="item.dataUrl" alt="Label" class="max-h-28 object-contain rounded shadow-xs" />
            
            <!-- Origin Page Badge & Checkbox toggle (Top-Left) -->
            <button 
              @click.stop="toggleItemSelection(item)"
              class="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              :class="item.selected !== false && item.quantity > 0 
                ? 'bg-brand-600 hover:bg-brand-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-800 text-white'"
              :title="t('pdf.dontPrintPage')"
            >
              <CheckCircle2 v-if="item.selected !== false && item.quantity > 0" class="w-3.5 h-3.5 text-white" />
              <div v-else class="w-3 h-3 rounded border border-white/60"></div>
              <span>{{ t('pdf.pageLabel', { page: item.page }) }}</span>
            </button>

            <!-- Quantity badge for Grouped View (Top-Right) -->
            <div 
              v-if="viewMode === 'grouped' && item.selected !== false && item.quantity > 0" 
              class="absolute top-2 right-2 px-2 py-0.5 bg-brand-600 text-white text-xs font-bold rounded-full shadow-sm"
            >
              ×{{ item.quantity }}
            </div>

            <!-- Excluded Overlay when unselected -->
            <div 
              v-if="item.selected === false || item.quantity <= 0" 
              class="absolute inset-0 bg-slate-900/20 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none"
            >
              <span class="px-2.5 py-1 bg-slate-900/80 text-white text-[11px] font-bold rounded-lg shadow-sm">
                {{ t('pdf.dontPrintPage') }}
              </span>
            </div>
          </div>

          <!-- Card Content & Quantity Modifier -->
          <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
            <div>
              <div class="font-bold text-xs text-slate-800 truncate flex items-center justify-between" :title="item.barcode">
                <span class="truncate">{{ item.barcode }}</span>
                <button 
                  @click.stop="toggleItemSelection(item)"
                  class="text-[11px] font-semibold transition-colors ml-1 flex-shrink-0 cursor-pointer"
                  :class="item.selected !== false && item.quantity > 0 ? 'text-slate-400 hover:text-rose-500' : 'text-emerald-600 hover:text-emerald-700 font-bold'"
                >
                  {{ item.selected !== false && item.quantity > 0 ? t('pdf.exclude') : t('pdf.restore') }}
                </button>
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
                  @click="setItemQuantity(item, (Number(item.quantity) || 0) - 1)" 
                  class="px-2 py-0.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >-</button>
                <input 
                  :value="item.quantity" 
                  @input="setItemQuantity(item, $event.target.value)"
                  type="number" 
                  min="0"
                  class="w-10 text-center text-xs font-bold bg-transparent focus:outline-none"
                />
                <button 
                  @click="setItemQuantity(item, (Number(item.quantity) || 0) + 1)" 
                  class="px-2 py-0.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
        <h4 class="text-base font-bold text-slate-800">{{ t('pdf.freeCropActiveTitle') }}</h4>
        <p class="text-xs text-slate-500 max-w-md leading-relaxed">
          {{ t('pdf.freeCropActiveDesc') }}
        </p>
        <button 
          @click="openFreeCropModal"
          class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Crop class="w-4 h-4" />
          <span>{{ t('pdf.openFreeCropBtn') }}</span>
        </button>
      </div>
      <div v-else class="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-400">
        {{ t('pdf.noMatchingItems') }}
      </div>
    </div>

    <!-- Step 3: Target Paper & Sizing (Ajuste de Papel) -->
    <div v-if="currentStep === 3" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-800">
            {{ t('pdf.targetPaper') }}
          </h3>
          <div class="flex items-center gap-2">
            <button 
              v-if="isCustomizedPapers"
              @click="resetDefaultPapers"
              type="button"
              class="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1 border border-slate-200"
              :title="t('pdf.resetDefaultPapers')"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>{{ t('pdf.resetDefaultPapers') }}</span>
            </button>
            <button 
              @click="openAddPaperModal"
              type="button"
              class="px-3 py-1 text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>{{ t('pdf.addPaperPreset') }}</span>
            </button>
          </div>
        </div>

        <!-- Paper Presets -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div 
            v-for="paper in paperPresets" 
            :key="paper.id"
            @click="selectPaperPreset(paper)"
            role="button"
            tabindex="0"
            class="group p-4 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer select-none"
            :class="selectedPaperId === paper.id ? 'border-brand-600 bg-brand-50/40 text-brand-900 shadow-sm ring-1 ring-brand-500/30' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'"
          >
            <div class="font-bold text-sm pr-6 truncate" :title="paper.name">{{ paper.name }}</div>
            <div class="text-xs text-slate-500 mt-1 font-mono">
              <span v-if="paper.id === 'custom'">{{ targetWidthMm }} × {{ targetHeightMm }} mm</span>
              <span v-else>{{ paper.width }} × {{ paper.height }} mm</span>
            </div>
            <div v-if="selectedPaperId === paper.id" class="absolute top-2 right-2 text-brand-600">
              <CheckCircle2 class="w-4 h-4" />
            </div>

            <!-- Edit & Delete buttons (hover) for custom / editable presets -->
            <div 
              v-if="paper.id !== 'custom'"
              class="absolute bottom-2 right-2 flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/95 rounded-lg border border-slate-200/80 shadow-xs px-1 py-0.5"
              @click.stop
            >
              <button 
                type="button"
                @click.stop="openEditPaperModal(paper)"
                class="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                :title="t('pdf.editPaperPreset')"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                @click.stop="deletePaperPreset(paper)"
                class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                :title="t('pdf.deletePaperPreset')"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Add Paper Button Card in Grid -->
          <button 
            type="button"
            @click="openAddPaperModal"
            class="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/20 text-slate-500 hover:text-brand-600 transition-all flex flex-col items-center justify-center gap-1 min-h-[82px] group"
          >
            <Plus class="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" />
            <span class="text-xs font-bold">{{ t('pdf.addPaperPreset') }}</span>
          </button>
        </div>

        <!-- Custom Dimensions if chosen -->
        <div v-if="selectedPaperId === 'custom'" class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div class="flex-1">
            <label class="text-xs text-slate-500 font-medium block mb-1">{{ t('pdf.paperWidth') }}</label>
            <input v-model.number="targetWidthMm" type="number" class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
          </div>
          <div class="flex-1">
            <label class="text-xs text-slate-500 font-medium block mb-1">{{ t('pdf.paperHeight') }}</label>
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
              <option value="proportional">{{ t('pdf.fitProportional') }}</option>
              <option value="stretch">{{ t('pdf.fitStretch') }}</option>
            </select>
          </div>
        </div>

        <!-- Smart Pure Black Sharpening Section -->
        <div class="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border-2 border-indigo-500/40 text-white shadow-lg space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-bold text-base flex-shrink-0">
                🖤
              </div>
              <div>
                <div class="font-bold text-sm text-white flex items-center gap-2">
                  <span>{{ t('sharpen.title') }}</span>
                  <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black">{{ t('sharpen.badge') }}</span>
                </div>
                <div class="text-xs text-slate-300 mt-0.5">
                  {{ t('sharpen.desc') }}
                </div>
              </div>
            </div>

            <!-- Mode Selector Pills -->
            <div class="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-700">
              <button 
                @click="setSharpenMode('standard')" 
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                :class="sharpenMode === 'standard' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
              >
                <span>🔥 {{ t('sharpen.standard') }}</span>
              </button>
              <button 
                @click="setSharpenMode('heavy')" 
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                :class="sharpenMode === 'heavy' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-slate-300 hover:text-white hover:bg-slate-800'"
              >
                <span>⚡ {{ t('sharpen.heavy') }}</span>
              </button>
              <button 
                @click="setSharpenMode('none')" 
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                :class="sharpenMode === 'none' ? 'bg-slate-700 text-white shadow-md font-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
              >
                <span>📷 {{ t('sharpen.none') }}</span>
              </button>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <span class="text-indigo-400 font-bold flex-shrink-0">{{ t('sharpen.modeLabel') }}</span>
            <span v-if="sharpenMode === 'standard'">{{ t('sharpen.standardDesc') }}</span>
            <span v-else-if="sharpenMode === 'heavy'">{{ t('sharpen.heavyDesc') }}</span>
            <span v-else>{{ t('sharpen.noneDesc') }}</span>
          </div>
        </div>

        <!-- Action Button to Step 4 -->
        <div class="flex justify-end pt-4">
          <button 
            @click="currentStep = 4"
            class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2"
          >
            <span>{{ t('pdf.enterPreviewAndPrint') }}</span>
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
          <p class="text-xs text-slate-500 mt-0.5">{{ t('pdf.targetRollSize') }} {{ targetWidthMm }} × {{ targetHeightMm }} mm · {{ t('pdf.plannedOutput') }} {{ totalPrintQuantity }} {{ t('pdf.piecesUnit') }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Copies multiplier -->
          <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <span class="text-slate-600 font-bold flex items-center gap-1">
              <span>🔢</span>
              <span>{{ t('pdf.customCopies') }}</span>
            </span>
            <div class="flex items-center bg-white rounded border border-slate-300 overflow-hidden shadow-2xs">
              <button @click="adjustCopies(-1)" title="-" class="w-6 h-6 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors">-</button>
              <input 
                v-model.number="printCopies" 
                @blur="normalizePrintCopies" 
                type="number" 
                min="1" 
                max="9999" 
                :placeholder="t('pdf.copiesUnit')" 
                class="w-14 text-center text-xs font-mono font-bold text-brand-600 focus:outline-none" 
              />
              <button @click="adjustCopies(1)" title="+" class="w-6 h-6 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors">+</button>
            </div>
            <span class="text-slate-400">{{ t('pdf.copiesUnit') }}</span>
            <div class="flex items-center gap-1 pl-1 border-l border-slate-200">
              <button 
                v-for="q in [1, 5, 10, 20, 30, 50, 100]" 
                :key="q" 
                @click="printCopies = q" 
                class="px-2 py-0.5 rounded text-[11px] font-semibold border transition-all" 
                :class="printCopies === q ? 'bg-brand-600 text-white border-brand-600 font-bold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'"
              >
                {{ q }}
              </button>
            </div>
          </div>

          <!-- Sharpening Quick Switcher in Step 4 Top Bar -->
          <div class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <span class="text-slate-600 font-bold flex items-center gap-1">
              <span>🖤</span>
              <span>{{ t('sharpen.label') }}</span>
            </span>
            <div class="flex items-center gap-1">
              <button 
                @click="setSharpenMode('standard')" 
                :title="t('sharpen.standardDesc')"
                class="px-2 py-0.5 rounded text-[11px] font-semibold border transition-all" 
                :class="sharpenMode === 'standard' ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'"
              >
                {{ t('sharpen.standard') }}
              </button>
              <button 
                @click="setSharpenMode('heavy')" 
                :title="t('sharpen.heavyDesc')"
                class="px-2 py-0.5 rounded text-[11px] font-semibold border transition-all" 
                :class="sharpenMode === 'heavy' ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'"
              >
                {{ t('sharpen.heavy') }}
              </button>
              <button 
                @click="setSharpenMode('none')" 
                :title="t('sharpen.noneDesc')"
                class="px-2 py-0.5 rounded text-[11px] font-semibold border transition-all" 
                :class="sharpenMode === 'none' ? 'bg-slate-700 text-white border-slate-700 font-bold shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'"
              >
                {{ t('sharpen.none') }}
              </button>
            </div>
          </div>

          <button 
            @click="showPrintHelpModal = true"
            class="px-3.5 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <HelpCircle class="w-4 h-4 text-blue-600" />
            <span>{{ t('pdf.printHelp') }}</span>
          </button>

          <button 
            @click="downloadThermalPdf" 
            :disabled="isGeneratingPdf"
            class="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold rounded-lg shadow-xs flex items-center gap-2 transition-all bg-white"
          >
            <Download class="w-4 h-4 text-slate-600" />
            <span>{{ isGeneratingPdf ? t('pdf.generatingPdf') : t('pdf.downloadPdfCount', { count: totalPrintQuantity }) }}</span>
          </button>

          <button 
            @click="triggerThermalPrint" 
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            <Printer class="w-4 h-4" />
            <span>{{ t('pdf.printAllCount', { count: totalPrintQuantity }) }}</span>
          </button>
        </div>
      </div>

      <!-- Native Desktop Client Station (Direct hardware silent print) -->
      <div v-if="isElectron" class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-emerald-500/60 rounded-2xl p-5 text-white shadow-xl space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {{ t('station.activated') }}
            </span>
            <span class="text-xs text-slate-300 font-medium hidden sm:inline">{{ t('station.sub') }}</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-slate-300 font-medium">{{ t('station.currentPaper') }}</span>
            <button 
              v-for="paper in userPaperList"
              :key="paper.id"
              @click="setQuickSize(paper.width, paper.height)"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border"
              :class="targetWidthMm === paper.width && targetHeightMm === paper.height ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
            >
              {{ paper.width }} × {{ paper.height }} mm
            </button>
            <button 
              @click="currentStep = 3"
              type="button"
              class="p-1 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
              :title="t('pdf.targetPaper')"
            >
              <Settings class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Height check banner -->
        <div class="text-[11px] bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-slate-300">
          <div class="flex items-center gap-1.5">
            <Info class="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{{ t('station.rule') }}</span>
          </div>
          <button 
            @click="showPrintHelpModal = true; activeHelpTab = 'calibration'"
            class="text-amber-400 hover:text-amber-300 underline font-semibold flex-shrink-0"
          >
            {{ t('station.feedTutorial') }}
          </button>
        </div>

        <div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 pt-1">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Printer Selector -->
            <div class="flex items-center gap-2 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-600 shadow-inner">
              <Printer class="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div class="text-xs text-slate-300 font-medium">{{ t('station.targetPrinter') }}</div>
              <select 
                v-model="selectedElectronPrinter"
                class="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[240px] truncate"
              >
                <option v-for="p in electronPrinters" :key="p.name" :value="p.name" class="bg-slate-800 text-white">
                  {{ p.displayName || p.name }} {{ p.isDefault ? t('station.default') : '' }}
                </option>
              </select>
              <button 
                @click="loadElectronPrinters" 
                :title="t('station.rescan')"
                class="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded transition-all"
              >
                <RefreshCw class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Custom Batch Print Quantity Box (High Visibility & Editable) -->
            <div class="flex flex-wrap items-center gap-2 bg-slate-800/95 px-3.5 py-2 rounded-xl border-2 border-emerald-500/50 shadow-md">
              <span class="text-xs text-slate-100 font-bold flex items-center gap-1.5">
                <span class="text-emerald-400 text-sm">🔢</span>
                <span>{{ t('station.customPrintQty') }}</span>
              </span>
              
              <div class="flex items-center bg-slate-950 rounded-lg border border-slate-700 overflow-hidden shadow-inner">
                <button 
                  @click="adjustCopies(-1)" 
                  title="-"
                  class="w-7 h-7 text-slate-400 hover:bg-slate-800 hover:text-white font-bold text-sm transition-colors flex items-center justify-center"
                >-</button>
                <input 
                  v-model.number="printCopies" 
                  @blur="normalizePrintCopies"
                  type="number" 
                  min="1" 
                  max="9999" 
                  :placeholder="t('pdf.piecesUnit')"
                  class="w-16 sm:w-20 text-center text-sm font-mono font-black text-emerald-400 bg-transparent focus:outline-none" 
                />
                <button 
                  @click="adjustCopies(1)" 
                  title="+"
                  class="w-7 h-7 text-slate-400 hover:bg-slate-800 hover:text-white font-bold text-sm transition-colors flex items-center justify-center"
                >+</button>
              </div>
              <span class="text-xs text-slate-300 font-semibold">{{ t('pdf.piecesUnit') }}</span>

              <!-- Quick Increment / Presets -->
              <div class="flex items-center gap-1 pl-1.5 border-l border-slate-700">
                <button 
                  v-for="preset in [1, 5, 10, 20, 30, 50, 100]" 
                  :key="preset"
                  @click="printCopies = preset" 
                  class="px-2 py-0.5 rounded text-xs font-semibold border transition-all" 
                  :class="printCopies === preset ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'"
                >
                  {{ preset }}
                </button>
              </div>
            </div>
          </div>

          <!-- Print Action Button -->
          <button 
            @click="triggerElectronSilentPrint"
            :disabled="isElectronPrinting"
            class="px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
          >
            <Zap class="w-5 h-5 fill-current text-slate-950" />
            <span>{{ isElectronPrinting ? t('station.printing') : t('station.silentPrintBtn', { count: totalPrintQuantity }) }}</span>
          </button>
        </div>

        <!-- Position offset & hardware alignment toolbox -->
        <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-slate-300 font-bold flex items-center gap-1">
              <span>{{ t('station.centering') }}</span>
            </span>

            <div class="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
              <span class="text-slate-400 text-[11px]">{{ t('station.offsetX') }}</span>
              <button @click="printOffsetX = Math.max(-10, Number((printOffsetX - 0.5).toFixed(1)))" class="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold text-xs">-</button>
              <span class="w-12 text-center font-mono font-bold text-emerald-400">{{ printOffsetX > 0 ? '+' + printOffsetX : printOffsetX }} mm</span>
              <button @click="printOffsetX = Math.min(10, Number((printOffsetX + 0.5).toFixed(1)))" class="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <div class="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
              <span class="text-slate-400 text-[11px]">{{ t('station.offsetY') }}</span>
              <button @click="printOffsetY = Math.max(-10, Number((printOffsetY - 0.5).toFixed(1)))" class="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold text-xs">-</button>
              <span class="w-12 text-center font-mono font-bold text-emerald-400">{{ printOffsetY > 0 ? '+' + printOffsetY : printOffsetY }} mm</span>
              <button @click="printOffsetY = Math.min(10, Number((printOffsetY + 0.5).toFixed(1)))" class="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold text-xs">+</button>
            </div>

            <button 
              v-if="printOffsetX !== 0 || printOffsetY !== 0"
              @click="printOffsetX = 0; printOffsetY = 0;"
              class="text-[11px] text-slate-400 hover:text-slate-200 underline"
            >
              {{ t('station.resetZero') }}
            </button>
          </div>

          <!-- Sharpen Mode Quick Switch in Client Station -->
          <div class="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
            <span class="text-slate-300 font-bold text-xs flex items-center gap-1">
              <span>🖤 {{ t('sharpen.label') }}</span>
            </span>
            <button 
              @click="setSharpenMode('standard')" 
              class="px-2 py-0.5 rounded text-[11px] font-semibold border transition-all"
              :class="sharpenMode === 'standard' ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-xs' : 'text-slate-400 border-transparent hover:text-white'"
            >
              {{ t('sharpen.standard') }}
            </button>
            <button 
              @click="setSharpenMode('heavy')" 
              class="px-2 py-0.5 rounded text-[11px] font-semibold border transition-all"
              :class="sharpenMode === 'heavy' ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs' : 'text-slate-400 border-transparent hover:text-white'"
            >
              {{ t('sharpen.heavy') }}
            </button>
            <button 
              @click="setSharpenMode('none')" 
              class="px-2 py-0.5 rounded text-[11px] font-semibold border transition-all"
              :class="sharpenMode === 'none' ? 'bg-slate-700 text-white border-slate-600 font-black shadow-xs' : 'text-slate-400 border-transparent hover:text-white'"
            >
              {{ t('sharpen.none') }}
            </button>
          </div>

          <button 
            @click="handleOpenPreferences"
            :title="t('station.openPrefs')"
            class="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Settings class="w-3.5 h-3.5 text-indigo-300" />
            <span>{{ t('station.openPrefs') }}</span>
          </button>
        </div>

        <div v-if="electronPrintSuccess" class="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 class="w-4 h-4 text-emerald-400" />
          <span>{{ electronPrintStatusMsg }}</span>
        </div>
      </div>

      <!-- Prominent Red Alert Banner (Shown in Web browser or as driver setup reference) -->
      <div v-if="!isElectron" class="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 sm:p-5 text-rose-950 shadow-sm flex items-start gap-3.5 animate-pulse-once">
        <AlertTriangle class="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
        <div class="space-y-2 text-xs flex-1">
          <div class="text-sm sm:text-base font-black text-rose-700 flex items-center gap-2">
            <span>{{ t('pdf.alertSizeTitle') }}</span>
          </div>
          <p class="leading-relaxed text-rose-900 font-medium text-xs sm:text-sm">
            {{ t('pdf.alertSizeDesc') }}
          </p>
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 font-bold text-rose-900">
              <span class="bg-white px-3 py-1.5 rounded-lg border border-rose-300 shadow-2xs flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>{{ t('pdf.alertStep1', { w: targetWidthMm, h: targetHeightMm }) }}</span>
              </span>
              <span class="bg-white px-3 py-1.5 rounded-lg border border-rose-300 shadow-2xs flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>{{ t('pdf.alertStep2') }}</span>
              </span>
              <span class="bg-white px-3 py-1.5 rounded-lg border border-rose-300 shadow-2xs flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>{{ t('pdf.alertStep3') }}</span>
              </span>
            </div>

            <button 
              @click="showPrintHelpModal = true"
              class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 flex-shrink-0"
            >
              <HelpCircle class="w-4 h-4" />
              <span>{{ t('pdf.viewHelpTutorial') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Thermal Roll Realistic Visualizer -->
      <div class="bg-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] border border-slate-200 overflow-x-auto">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Scroll class="w-4 h-4 text-brand-600" />
          <span>{{ t('pdf.thermalRollSim') }} · {{ t('pdf.plannedOutput') }} <strong class="text-brand-600 font-bold font-mono">{{ totalPrintQuantity }}</strong> {{ t('pdf.piecesUnit') }}</span>
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
              style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;"
              :class="autoRotate && item.width < item.height && targetWidthMm > targetHeightMm ? 'rotate-90' : ''"
            />
            <div class="absolute bottom-1 right-1.5 text-[9px] font-mono text-slate-300">
              #{{ i + 1 }}
            </div>
          </div>
          <div v-if="previewList.length > 10" class="flex items-center justify-center px-4 text-xs text-slate-400 font-medium">
            {{ t('pdf.moreLabels', { count: previewList.length - 10 }) }}
          </div>
        </div>
      </div>

      <!-- Solution for missing paper sizes across different printers -->
      <div class="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 text-blue-950 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-bold text-blue-950 text-sm">
            <Info class="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>{{ isZh ? `问：打印机下拉列表中没有 ${targetWidthMm}×${targetHeightMm} mm（或其它打印机尺寸不同）怎么办？` : `Pregunta: ¿Qué hacer si ${targetWidthMm}×${targetHeightMm} mm no aparece en la lista de la impresora?` }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- Solution 1 -->
          <div class="p-3.5 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2 flex flex-col justify-between">
            <div class="space-y-1.5">
              <div class="font-bold text-blue-900 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">{{ isZh ? '方案 1' : 'Opción 1' }}</span>
                <span>{{ isZh ? '在电脑驱动新建尺寸（强烈推荐·30秒一劳永逸）' : 'Crear tamaño en el driver (Recomendado · 30 seg.)' }}</span>
              </div>
              <p class="text-slate-600 text-[11px] leading-relaxed">
                {{ isZh ? '不同品牌打印机出厂预装尺寸各不相同。您可以轻松在电脑驱动里新建一次该规格：' : 'Cada fabricante preinstala tamaños distintos. Puede agregar fácilmente su medida en Windows:' }}
              </p>
              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 font-mono text-slate-700">
                <div>{{ isZh ? '① 按键盘 Win + R 键，输入 control printers 打开设备和打印机；' : '① Pulse Win + R, escriba control printers y pulse Enter;' }}</div>
                <div>{{ isZh ? '② 右键您的打印机（如 HPRT N41BT），点击「打印首选项」；' : '② Clic derecho en su impresora (ej. HPRT N41BT) y elija «Preferencias de impresión»;' }}</div>
                <div>{{ isZh ? '③ 在【页面设置】标签页，点击「新建」按钮；' : '③ En la pestaña «Configurar página», pulse el botón «Nueva...»;' }}</div>
                <div>{{ isZh ? `④ 输入名称如 ${targetWidthMm}x${targetHeightMm}，输入宽度 ${targetWidthMm}mm、高度 ${targetHeightMm}mm，点击确定保存。` : `④ Escriba un nombre ej. ${targetWidthMm}x${targetHeightMm}, ancho ${targetWidthMm}mm, alto ${targetHeightMm}mm y guarde.` }}</div>
              </div>
            </div>
            <div class="text-[10px] text-emerald-600 font-semibold pt-1">
              {{ isZh ? '✓ 保存后，浏览器打印弹窗就会永久出现该精确尺寸！' : '✓ ¡Guardado! El tamaño exacto aparecerá permanentemente al imprimir.' }}
            </div>
          </div>

          <!-- Solution 2 -->
          <div class="p-3.5 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2 flex flex-col justify-between">
            <div class="space-y-1.5">
              <div class="font-bold text-blue-900 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">{{ isZh ? '方案 2' : 'Opción 2' }}</span>
                <span>{{ isZh ? '直接借用驱动自带的“等高”尺寸（免设电脑）' : 'Usar tamaño preinstalado de igual altura (Sin configurar)' }}</span>
              </div>
              <p class="text-slate-600 text-[11px] leading-relaxed">
                {{ isZh ? '热敏条码打印机是由「标签高度」决定马达走纸长度的！' : '¡En impresoras térmicas la «altura» determina el avance del motor!' }}
              </p>
              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 text-slate-700">
                <div>{{ isZh ? '• 若您的实际卷纸是 70 × 30 mm，而汉印驱动下拉菜单里有 80mm * 30mm：' : '• Si su rollo mide 70 × 30 mm y en la lista de HPRT aparece 80mm * 30mm:' }}</div>
                <div>{{ isZh ? '• 您可以直接在下拉菜单选择 80mm * 30mm！' : '• ¡Puede seleccionar directamente 80mm * 30mm en el menú!' }}</div>
                <div>{{ isZh ? '• 因为高度同为 30mm，打印机传感器按 30mm 走纸，依然会精准卡在缝隙切口，每按一次吐一张，绝不会连吐多张！' : '• Al tener la misma altura de 30mm, avanzará exactamente 30mm deteniéndose en la marca de corte sin saltar hojas.' }}</div>
              </div>
            </div>
            <div class="text-[10px] text-amber-700 font-semibold pt-1">
              {{ isZh ? '💡 核心口诀：只要下拉菜单里的「高度 mm」与实际卷纸一致，就能正常单张定位！' : '💡 Regla clave: Mientras la altura coincida con su rollo, el avance será 100% exacto.' }}
            </div>
          </div>

          <!-- Solution 3 -->
          <div class="p-3.5 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2 flex flex-col justify-between">
            <div class="space-y-1.5">
              <div class="font-bold text-blue-900 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">{{ isZh ? '方案 3' : 'Opción 3' }}</span>
                <span>{{ isZh ? '导出标准热敏 PDF 自动识别尺寸' : 'Exportar PDF estándar con autodetección' }}</span>
              </div>
              <p class="text-slate-600 text-[11px] leading-relaxed">
                {{ isZh ? '不想在网页端选尺寸？直接使用 PDF 客户端全自动打印：' : '¿Prefiere evitar ajustes en el navegador? Use un lector de escritorio:' }}
              </p>
              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 text-slate-700">
                <div>{{ isZh ? '① 点击上方「导出标准热敏 PDF」按钮下载文件；' : '① Haga clic en «Descargar PDF Térmico» arriba;' }}</div>
                <div>{{ isZh ? '② 用电脑上的 PDF 阅读器（如 Adobe Acrobat Reader 或极速PDF）打开；' : '② Abra el archivo con Adobe Acrobat Reader o similar;' }}</div>
                <div>{{ isZh ? '③ 打印时勾选「根据 PDF 页面大小选择纸张来源」；' : '③ Active «Elegir origen del papel según tamaño de página PDF»;' }}</div>
                <div>{{ isZh ? '④ 阅读器会自动把 PDF 内嵌的精确毫米尺寸发给打印机，无需手动选择。' : '④ El lector enviará las dimensiones físicas exactas a la impresora automáticamente.' }}</div>
              </div>
            </div>
            <div class="text-[10px] text-indigo-600 font-semibold pt-1">
              {{ isZh ? '✓ 最受跨境大卖家欢迎的稳定批量打印方案！' : '✓ ¡El método de impresión en lote más estable y recomendado!' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Thermal Printing Pitfall & Troubleshooting Guide -->
      <div class="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-amber-950 space-y-3">
        <div class="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <AlertTriangle class="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>{{ isZh ? '热敏打印机缝隙校准与日常排查指南' : 'Guía de Calibración de Sensor y Diagnóstico Térmico' }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div class="p-3 bg-white/80 rounded-xl border border-amber-200/60 shadow-xs space-y-1.5">
            <div class="font-bold text-amber-900 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">!</span>
              <span>{{ isZh ? '汉印 (HPRT N41BT) 打印机缝隙自动校准（必做）' : 'Calibración de sensor de separación (FEED) HPRT' }}</span>
            </div>
            <p class="text-amber-800 leading-relaxed text-[11px]">
              {{ isZh ? '装好新卷纸并合紧机盖后，开机状态下长按打印机顶部的 FEED 走纸键约 2 秒，听到打印机“哔”一声松手，打印机会自动走纸 1~2 张学习标签缝隙定位并自动回吸，校准后每次打印均能精准卡在每张标签的切线处！' : 'Con el nuevo rollo colocado y la tapa asegurada, mantenga presionado el botón FEED durante 2 segundos hasta oír un pitido. La máquina expulsará y recogerá 1-2 etiquetas calibrando el sensor de separación al milímetro.' }}
            </p>
          </div>

          <div class="p-3 bg-white/80 rounded-xl border border-amber-200/60 shadow-xs space-y-1.5">
            <div class="font-bold text-amber-900 flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">!</span>
              <span>{{ isZh ? '打印出现白条/字迹断续排查' : 'Diagnóstico de rayas blancas o impresión tenue' }}</span>
            </div>
            <p class="text-amber-800 leading-relaxed text-[11px]">
              {{ isZh ? '若打印出来的条码颜色浅或发白，可用棉签蘸取少许酒精轻轻擦拭打印头陶瓷发热片；同时可在打印首选项里将“打印浓度 (Darkness)”调高 2~3 档，条码对比度会显著提升。' : 'Si el código sale tenue o con líneas blancas, limpie el cabezal cerámico con un hisopo humedecido en alcohol. También puede subir 2 a 3 niveles la «Densidad de impresión (Darkness)» en el driver.' }}
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
              <label 
                class="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors text-xs font-semibold text-slate-700 select-none shadow-2xs"
                :title="t('pdf.freeCropAutoTrimDesc')"
              >
                <input 
                  type="checkbox" 
                  v-model="freeCropAutoTrim" 
                  class="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span class="flex items-center gap-1">
                  <span>{{ t('pdf.freeCropAutoTrim') }}</span>
                </span>
              </label>

              <button 
                @click="resetSelection" 
                type="button"
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
                <h3 class="text-sm font-bold text-slate-800">{{ t('pdf.savedProjectsTitle') }} ({{ savedProjectsList.length }})</h3>
                <p class="text-[11px] text-slate-500 mt-0.5">{{ t('pdf.savedProjectsSubtitle') }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <label class="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all">
                <FileUp class="w-3.5 h-3.5 text-brand-600" />
                <span>{{ t('pdf.importJson') }}</span>
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
              <p class="text-sm font-medium">{{ t('pdf.emptySaved') }}</p>
              <p class="text-xs text-slate-400">{{ t('pdf.saveProjectTip') }}</p>
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
                    <span>{{ p.labelCount }} {{ t('pdf.labelsCount') }} ({{ p.totalQuantity }}{{ t('pdf.piecesUnit') }})</span>
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
                    <span>{{ t('pdf.openProjectBtn') }}</span>
                  </button>

                  <div class="flex items-center gap-1">
                    <button 
                      @click="handleExportProject(p)"
                      :title="t('pdf.exportBackup')"
                      class="p-1 hover:bg-white text-slate-500 rounded text-xs"
                    >
                      <Download class="w-3.5 h-3.5" />
                    </button>
                    <button 
                      @click="handleDeleteProject(p.id, p.name)"
                      :title="t('pdf.deleteProject')"
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

    <!-- Print Help Guide Modal (Teleported to document.body) -->
    <Teleport to="body">
      <div v-if="showPrintHelpModal" class="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Printer class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>{{ t('pdf.helpModalTitle') }}</span>
                  <span class="text-[11px] font-normal px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full">{{ t('pdf.helpModalBadge') }}</span>
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">{{ t('pdf.helpModalSubtitle') }}</p>
              </div>
            </div>

            <button 
              @click="showPrintHelpModal = false"
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Nav Tabs -->
          <div class="flex border-b border-slate-200 px-6 bg-slate-50/50 gap-2 overflow-x-auto">
            <button 
              @click="activeHelpTab = 'desktopApp'" 
              class="px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap"
              :class="activeHelpTab === 'desktopApp' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
            >
              <Laptop class="w-3.5 h-3.5" />
              <span>{{ t('pdf.helpModalTabClient') }}</span>
            </button>
            <button 
              @click="activeHelpTab = 'customSize'" 
              class="px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap"
              :class="activeHelpTab === 'customSize' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
            >
              <Settings class="w-3.5 h-3.5" />
              <span>{{ t('pdf.helpModalTab1') }}</span>
            </button>
            <button 
              @click="activeHelpTab = 'borrowSize'" 
              class="px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap"
              :class="activeHelpTab === 'borrowSize' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>{{ t('pdf.helpModalTab2') }}</span>
            </button>
            <button 
              @click="activeHelpTab = 'pdfPrint'" 
              class="px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap"
              :class="activeHelpTab === 'pdfPrint' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>{{ t('pdf.helpModalTab3') }}</span>
            </button>
            <button 
              @click="activeHelpTab = 'calibration'" 
              class="px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap"
              :class="activeHelpTab === 'calibration' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
            >
              <AlertTriangle class="w-3.5 h-3.5" />
              <span>{{ t('pdf.helpModalTabCalib') }}</span>
            </button>
          </div>

          <!-- Modal Body Content -->
          <div class="p-6 overflow-y-auto max-h-[68vh] space-y-6 text-sm text-slate-700">
            <!-- TAB: desktopApp -->
            <div v-if="activeHelpTab === 'desktopApp'" class="space-y-4">
              <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div class="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <CheckCircle2 class="w-5 h-5 text-emerald-600" />
                  <span>{{ isZh ? '解答：如果用电脑软件版（桌面客户端），是不是就完全不用自己手动去 Windows 驱动添加尺寸了？' : 'Pregunta: Si uso el Cliente de Escritorio, ¿evito tener que configurar tamaños en Windows?' }}</span>
                </div>
                <div class="text-xs text-emerald-900 leading-relaxed font-semibold">
                  {{ isZh ? '👉 答案是：100% 确定！完全不需要手动设置任何纸张尺寸！' : '👉 ¡100% confirmado! ¡No necesita configurar ningún tamaño manualmente!' }}
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div class="font-bold text-slate-800 flex items-center gap-1.5">
                    <span class="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px]">{{ isZh ? '旧' : 'Web' }}</span>
                    <span>{{ isZh ? '为什么纯网页版（当前浏览器）需要选尺寸？' : '¿Por qué la versión web en navegador requiere seleccionar el tamaño?' }}</span>
                  </div>
                  <p class="text-slate-600 leading-relaxed text-[12px]">
                    {{ isZh ? '浏览器运行在“安全沙箱”中，出于安全限制，网页无法越过系统直接给 USB 打印机硬件发送私有毫米控制指令。网页打印时必须弹出操作系统的通用打印框，而通用打印框里的尺寸完全受限于打印机驱动出厂自带的预设列表。如果驱动没预装 70x30，浏览器就不知道该选什么。' : 'El navegador opera en un entorno restringido ("sandbox") que impide enviar comandos de control milimétrico directo por USB. Debe abrir el diálogo de impresión del sistema operativo, el cual se limita a los tamaños predefinidos de fábrica en el driver.' }}
                  </p>
                </div>

                <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div class="font-bold text-blue-900 flex items-center gap-1.5">
                    <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">{{ isZh ? '新' : 'App' }}</span>
                    <span>{{ isZh ? '电脑软件客户端版本（桌面版）如何彻底解决？' : '¿Cómo lo soluciona definitivamente el Cliente de Escritorio?' }}</span>
                  </div>
                  <p class="text-blue-900 leading-relaxed text-[12px]">
                    {{ isZh ? '桌面客户端拥有本地系统的完全硬件访问权限：' : 'El Cliente de Escritorio tiene acceso completo al hardware del sistema:' }}
                    <br />
                    {{ isZh ? '① 免驱动尺寸限制：软件直接通过底层打印 API 或 USB 端口向打印机发送原生的毫米坐标指令（如 SIZE 70 mm, 30 mm），即使驱动里根本没有 70x30，打印机也能按 30mm 走纸！' : '① Sin restricciones de driver: Envía coordenadas milimétricas nativas por el API o puerto USB (ej. SIZE 70 mm, 30 mm) sin importar los tamaños predefinidos.' }}
                    <br />
                    {{ isZh ? '② 真正零弹窗静默打印：点击打印瞬间出纸，省去每次选打印机、选尺寸的繁琐操作！' : '② Impresión silenciosa inmediata: Salida instantánea sin diálogos molestos.' }}
                  </p>
                </div>
              </div>

              <div class="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 text-xs">
                <div class="font-bold text-white flex items-center gap-1.5">
                  <Laptop class="w-4 h-4 text-brand-400" />
                  <span>{{ isZh ? 'LabelMaster Pro 桌面客户端已原生内置支持' : 'LabelMaster Pro incluye soporte nativo integrado' }}</span>
                </div>
                <p class="text-slate-300 leading-relaxed text-[11px]">
                  {{ isZh ? '本项目底层架构已预留了原生 Electron 静默热敏打印对接接口（window.electronAPI.printThermal）。如果您需要运行免弹窗、免驱动预设尺寸的桌面软件版，可随时直接打包生成 Windows (.exe) 安装包！' : 'El sistema cuenta con la arquitectura de impresión térmica directa de Electron. Puede generar y ejecutar el instalador de Windows (.exe) en cualquier momento.' }}
                </p>
              </div>
            </div>

            <!-- TAB: customSize -->
            <div v-if="activeHelpTab === 'customSize'" class="space-y-4">
              <div class="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div class="font-bold text-sm">{{ isZh ? '💡 方案 1 原理：为什么强烈推荐在电脑驱动新建一次尺寸？' : '💡 Opción 1: ¿Por qué es altamente recomendable crear el tamaño en el driver?' }}</div>
                <p class="leading-relaxed">
                  {{ isZh ? '市面上的标签卷纸有几百种规格，打印机出厂只会预装十几个常用尺寸。只要花 30 秒在电脑打印机首选项里新建一次您的规格（如 70x30 或 50x30），保存后不仅本网页，您电脑上的所有软件都能直接选中该尺寸！' : 'Existen cientos de medidas de etiquetas y los fabricantes solo preinstalan unas pocas. Al dedicar 30 segundos a registrar su tamaño exacto en las preferencias de Windows, estará disponible permanentemente para esta aplicación y cualquier otro programa.' }}
                </p>
              </div>

              <div class="space-y-3">
                <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400">{{ isZh ? 'Windows 10 / 11 详细操作步骤（以汉印 HPRT N41BT 为例）：' : 'Pasos detallados para Windows 10 / 11 (Ejemplo con HPRT N41BT):' }}</h4>
                <div class="space-y-2 text-xs">
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <span class="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <div class="font-bold text-slate-800">{{ isZh ? '打开“设备和打印机”' : 'Abrir Dispositivos e Impresoras' }}</div>
                      <div class="text-slate-500 mt-0.5">{{ isZh ? '按键盘 Win + R 键呼出运行框，输入 control printers 并回车（或在 Windows 设置中搜索“打印机”）。' : 'Pulse Win + R en el teclado, escriba control printers y pulse Enter.' }}</div>
                    </div>
                  </div>

                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <span class="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <div class="font-bold text-slate-800">{{ isZh ? '进入打印机首选项' : 'Abrir Preferencias de Impresión' }}</div>
                      <div class="text-slate-500 mt-0.5">{{ isZh ? '找到您的热敏打印机（如 HPRT N41BT），右键点击选择 【打印首选项 (Printing Preferences)】。' : 'Haga clic derecho sobre su impresora térmica (ej. HPRT N41BT) y elija «Preferencias de impresión».' }}</div>
                    </div>
                  </div>

                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <span class="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <div class="font-bold text-slate-800">{{ isZh ? '点击“新建”纸张尺寸' : 'Crear nuevo tamaño de papel' }}</div>
                      <div class="text-slate-500 mt-0.5">{{ isZh ? '在弹出的首选项窗口中，切换到【页面设置 (Page Setup)】标签页，点击右侧的【新建 (New...)】按钮。' : 'En la ventana de preferencias, vaya a la pestaña «Configurar página» y haga clic en «Nueva...».' }}</div>
                    </div>
                  </div>

                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <span class="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">4</span>
                    <div>
                      <div class="font-bold text-slate-800">{{ isZh ? '输入您的卷纸尺寸并保存' : 'Ingresar dimensiones del rollo y guardar' }}</div>
                      <div class="text-slate-500 mt-0.5">
                        {{ isZh ? '• 纸张名称：输入便于识别的名字，如 70x30（或 50x30）' : '• Nombre: Ingrese un nombre descriptivo, ej. 70x30 (o 50x30)' }}
                        <br />
                        {{ isZh ? '• 宽度：输入实际测量宽度，如 70.0 mm' : '• Ancho: Ingrese el ancho real medido, ej. 70.0 mm' }}
                        <br />
                        {{ isZh ? '• 高度：输入实际测量高度，如 30.0 mm' : '• Alto: Ingrese el alto real medido, ej. 30.0 mm' }}
                        <br />
                        {{ isZh ? '点击“确定”保存，再点击首选项窗口的“应用”和“确定”。' : 'Haga clic en «Aceptar» para guardar, y luego en «Aplicar» y «Aceptar» en la ventana principal.' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{{ isZh ? '完成设置后，刷新网页再次点击打印，系统打印弹窗下拉菜单中就会永久出现刚刚新建的尺寸！' : 'Tras la configuración, recargue y pulse imprimir; el nuevo tamaño aparecerá permanentemente en el menú desplegable.' }}</span>
              </div>
            </div>

            <!-- TAB: borrowSize -->
            <div v-if="activeHelpTab === 'borrowSize'" class="space-y-4">
              <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div class="font-bold text-sm">{{ isZh ? '🎯 方案 2 原理：热敏机走纸只认“高度”！' : '🎯 Opción 2: ¡El avance térmico se rige por la ALTURA!' }}</div>
                <p class="leading-relaxed">
                  {{ isZh ? '热敏打印机是单向连续滚动的，每次吐纸多长是由「页面高度 mm」控制的。只要选中的尺寸高度与您的卷纸完全一致，即使宽度略大，打印机马达也会按同样的高度走纸，缝隙对齐完全正常，绝不会多吐白标！' : 'Las impresoras térmicas avanzan en una sola dirección; la longitud de salida está determinada por la «altura en mm». Mientras la altura coincida exactamente con su rollo, el avance del motor será el correcto, la separación se alineará con precisión y no se desperdiciarán etiquetas en blanco.' }}
                </p>
              </div>

              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">{{ isZh ? '您的实际卷纸尺寸' : 'Tamaño real de su rollo' }}</th>
                      <th class="p-3">{{ isZh ? '打印机下拉菜单没有该规格' : 'Si no aparece en la lista' }}</th>
                      <th class="p-3">{{ isZh ? '可在下拉菜单中直接借用的替代尺寸' : 'Tamaño sustituto con igual altura' }}</th>
                      <th class="p-3">{{ isZh ? '打印效果验证' : 'Resultado de impresión' }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-bold text-slate-800">70 × 30 mm</td>
                      <td class="p-3 text-rose-600">{{ isZh ? '无 70×30' : 'Falta 70×30' }}</td>
                      <td class="p-3 font-bold text-emerald-600">{{ isZh ? '80mm * 30mm（汉印自带）' : '80mm * 30mm (HPRT nativo)' }}</td>
                      <td class="p-3 text-slate-600">{{ isZh ? '高度同为 30mm，单张精准停靠切口，完美出纸' : 'Misma altura de 30mm, corte exacto y salida perfecta' }}</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-bold text-slate-800">50 × 25 mm</td>
                      <td class="p-3 text-rose-600">{{ isZh ? '无 50×25' : 'Falta 50×25' }}</td>
                      <td class="p-3 font-bold text-emerald-600">{{ isZh ? '50*25 或 100mm*25mm' : '50*25 o 100mm*25mm' }}</td>
                      <td class="p-3 text-slate-600">{{ isZh ? '高度同为 25mm，单张精准走纸' : 'Misma altura de 25mm, avance unitario preciso' }}</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-bold text-slate-800">50 × 20 mm</td>
                      <td class="p-3 text-slate-400">-</td>
                      <td class="p-3 font-bold text-emerald-600">{{ isZh ? '50mm * 20mm（汉印自带）' : '50mm * 20mm (HPRT nativo)' }}</td>
                      <td class="p-3 text-slate-600">{{ isZh ? '直接原生支持' : 'Soporte nativo directo' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600">
                <div class="font-bold text-slate-800">{{ isZh ? '💡 避坑特别注意：' : '💡 Precaución importante:' }}</div>
                <div>{{ isZh ? '千万不要借用高度相差很大的尺寸！例如卷纸是 30mm 高，如果借用 150mm 或 60mm 高度，打印机就会按 150mm 持续走纸，导致连吐多张！' : '¡Nunca use tamaños con alturas diferentes! Si su rollo mide 30mm de alto y selecciona 150mm o 60mm, la máquina avanzará esa distancia continua expulsando varias hojas en blanco.' }}</div>
              </div>
            </div>

            <!-- TAB: pdfPrint -->
            <div v-if="activeHelpTab === 'pdfPrint'" class="space-y-4">
              <div class="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
                <div class="font-bold text-sm">{{ isZh ? '📄 方案 3 原理：PDF 矢量流原生携带物理尺寸信息' : '📄 Opción 3: El PDF vectorial incluye sus dimensiones físicas' }}</div>
                <p class="leading-relaxed">
                  {{ isZh ? '本系统导出的 PDF 是标准 1:1 热敏矢量文件，文件内部已严格封装了目标物理尺寸（如 70mm × 30mm）。使用专业的 PDF 阅读器打印，阅读器会直接向打印机驱动发送此尺寸指令，完全绕过浏览器下拉菜单的手动选择。' : 'El PDF generado es un archivo vectorial térmico 1:1 estándar que contiene sus dimensiones físicas exactas (ej. 70×30 mm). Al imprimir desde un lector de PDF profesional, este envía las medidas directamente al driver sin depender del diálogo del navegador.' }}
                </p>
              </div>

              <div class="space-y-2 text-xs">
                <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                  <div>
                    <div class="font-bold text-slate-800">{{ isZh ? '点击页面上的【导出标准热敏 PDF】下载文件' : 'Descargue el archivo con «Descargar PDF Térmico»' }}</div>
                    <div class="text-slate-500 mt-0.5">{{ isZh ? '系统会自动生成已排版完成的高清矢量标签 PDF。' : 'El sistema generará el PDF vectorial listo para impresión.' }}</div>
                  </div>
                </div>

                <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                  <div>
                    <div class="font-bold text-slate-800">{{ isZh ? '用 Adobe Acrobat Reader 或极速 PDF 打开' : 'Abra el PDF con Adobe Acrobat Reader o software similar' }}</div>
                    <div class="text-slate-500 mt-0.5">{{ isZh ? '不要用浏览器打开，请使用电脑已安装的 PDF 客户端软件打开。' : 'No use el navegador web; utilice una aplicación de lectura PDF de escritorio.' }}</div>
                  </div>
                </div>

                <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                  <div>
                    <div class="font-bold text-slate-800">{{ isZh ? '勾选「根据 PDF 页面大小选择纸张来源」' : 'Marque «Elegir origen del papel según tamaño de página PDF»' }}</div>
                    <div class="text-slate-500 mt-0.5">{{ isZh ? '在打印对话框的页面处理中勾选此项，缩放选择“实际大小”，然后点击打印即可！' : 'Active esta opción en el diálogo de Acrobat, elija escala «Tamaño real / 100%» y pulse Imprimir.' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB: calibration -->
            <div v-if="activeHelpTab === 'calibration'" class="space-y-4">
              <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                <div class="font-bold text-sm">{{ isZh ? '⚡ 为什么换新纸后必须做机身缝隙校准？' : '⚡ ¿Por qué es obligatoria la calibración de separación (FEED)?' }}</div>
                <p class="leading-relaxed">
                  {{ isZh ? '热敏打印机内部有一个光学穿透传感器用来检测两张标签之间的透光缝隙。当更换了不同底纸厚度、不同间隙大小的卷纸时，如果不进行校准，传感器可能会误判缝隙，导致走纸停在标签正中间打乱。' : 'La impresora térmica utiliza un sensor óptico para detectar la separación entre etiquetas. Al cambiar de rollo o grosor, si no se calibra, el sensor puede perder la referencia y detener el papel a mitad de la etiqueta.' }}
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div class="font-bold text-slate-800 flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-brand-600 text-white rounded font-mono text-[11px]">{{ isZh ? '操作手法' : 'Instrucciones' }}</span>
                  <span>{{ isZh ? '汉印 (HPRT N41BT / N41 / 汉印全系) 缝隙测纸操作：' : 'Calibración de sensor FEED (HPRT serie N41 y compatibles):' }}</span>
                </div>
                <div class="space-y-1.5 text-slate-700 pl-2 border-l-2 border-brand-500">
                  <div>{{ isZh ? '1. 装好标签卷纸，拉出少许，合紧打印机左右两侧卡扣。' : '1. Coloque el rollo, extienda una punta y cierre firmemente ambos seguros de la tapa.' }}</div>
                  <div>{{ isZh ? '2. 确保打印机处于开机通电状态（机身正面指示灯为蓝灯常亮）。' : '2. Verifique que la impresora esté encendida con luz azul constante.' }}</div>
                  <div>{{ isZh ? '3. 用手指按住机身顶部的进纸键（FEED 键）不松手，持续约 2~3 秒。' : '3. Mantenga presionado el botón FEED en la parte superior durante 2 a 3 segundos.' }}</div>
                  <div>{{ isZh ? '4. 听到打印机“哔”的一声（或指示灯闪烁一下）时，立即松开手指。' : '4. Al escuchar un pitido ("bip") o destello de luz, suelte inmediatamente el dedo.' }}</div>
                  <div>{{ isZh ? '5. 打印机会自动向前吐出 1~2 张标签进行自动测距学习，随后自动向后回退对齐到第一张缝隙切口！' : '5. La impresora expulsará 1 o 2 etiquetas para medir el espacio y retrocederá alineándose exactamente al primer corte.' }}</div>
                </div>
              </div>

              <div class="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{{ isZh ? '校准完成后，每按一下 FEED 键就只会刚好吐出一张标签，位置精准无误！' : '¡Listo! Tras calibrar, cada pulsación de FEED avanzará exactamente una etiqueta alineada.' }}</span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{{ isZh ? '如遇疑难问题，可优先采用【方案 1】新建驱动尺寸或【方案 2】借用等高规格。' : 'Si tiene dudas, cree el tamaño exacto en el driver o use un tamaño de igual altura.' }}</span>
            <button 
              @click="showPrintHelpModal = false"
              class="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-all"
            >
              {{ t('pdf.helpModalUnderstood') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Paper Preset Add / Edit Modal -->
    <Teleport to="body">
      <div 
        v-if="showPaperModal"
        class="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        @click.self="showPaperModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <Layers class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-slate-800 text-base">
                {{ isEditingPaper ? t('pdf.paperModalEditTitle') : t('pdf.paperModalAddTitle') }}
              </h3>
            </div>
            <button 
              @click="showPaperModal = false" 
              type="button"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleSavePaper" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                {{ t('pdf.paperNameLabel') }}
              </label>
              <input 
                v-model="paperForm.name"
                type="text"
                :placeholder="t('pdf.paperNamePlaceholder')"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  {{ t('pdf.paperWidthLabel') }} (mm) *
                </label>
                <input 
                  v-model.number="paperForm.width"
                  type="number"
                  step="1"
                  min="10"
                  max="500"
                  required
                  class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  {{ t('pdf.paperHeightLabel') }} (mm) *
                </label>
                <input 
                  v-model.number="paperForm.height"
                  type="number"
                  step="1"
                  min="10"
                  max="500"
                  required
                  class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <!-- Preview ratio badge -->
            <div class="p-3 bg-brand-50/50 rounded-xl border border-brand-100 flex items-center justify-between text-xs text-brand-900">
              <span class="font-medium">{{ t('pdf.paperRatioLabel') }}</span>
              <span class="font-mono font-bold">{{ paperForm.width || 0 }} × {{ paperForm.height || 0 }} mm ({{ paperForm.width && paperForm.height ? (paperForm.width / paperForm.height).toFixed(2) : '-' }}:1)</span>
            </div>

            <div class="pt-2 flex items-center justify-end gap-2.5">
              <button 
                type="button" 
                @click="showPaperModal = false"
                class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {{ isZh ? '取消' : 'Cancelar' }}
              </button>
              <button 
                type="submit"
                class="px-5 py-2 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-all"
              >
                {{ t('pdf.paperSaveBtn') }}
              </button>
            </div>
          </form>
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
import { ref, shallowRef, markRaw, computed, nextTick, onMounted, watch } from 'vue';
import { 
  UploadCloud, FileUp, Layers, LayoutGrid, Search, ArrowRight, 
  CheckCircle2, Download, Printer, Scroll, FlaskConical, Crop, Check, RotateCcw, X,
  FolderOpen, Save, Plus, Trash2, Edit2, Clock, FileText, Bookmark, Calendar, AlertTriangle, Info,
  HelpCircle, Laptop, Settings, Zap, RefreshCw
} from 'lucide-vue-next';
import { t, isZh, isEs, currentLang } from '@/i18n';
import { 
  loadPdfDocument, detectSuggestedLayout, slicePdfLabels, 
  groupLabelsByBarcode, exportThermalPdf, trimWhiteBorder, binarizeCanvas
} from '@/utils/pdfProcessor';
import { 
  getAllProjects, getProject, saveProject, deleteProject, 
  exportProjectJson, importProjectJson 
} from '@/utils/projectStorage';

const emit = defineEmits(['switch-tab']);

const currentStep = ref(1);
const isDragging = ref(false);
const fileInputRef = ref(null);
const currentPdfDoc = shallowRef(null);
const selectedLayoutMode = ref('presetFreeform');
const viewMode = ref('grouped');
const rawLabels = ref([]);
const searchQuery = ref('');
const isGeneratingPdf = ref(false);

// Sharpening mode state: 'standard' (190) | 'heavy' (215) | 'none'
const sharpenMode = ref('standard');

const setSharpenMode = async (mode) => {
  sharpenMode.value = mode;
  if (!rawLabels.value || rawLabels.value.length === 0) return;

  for (const item of rawLabels.value) {
    if (!item.rawCanvas) {
      if (item.canvas) {
        item.rawCanvas = item.canvas;
      } else if (item.dataUrl) {
        try {
          const img = new Image();
          img.src = item.dataUrl;
          await img.decode();
          const c = document.createElement('canvas');
          c.width = img.naturalWidth || img.width;
          c.height = img.naturalHeight || img.height;
          c.getContext('2d').drawImage(img, 0, 0);
          item.rawCanvas = c;
        } catch (e) {
          console.warn('Reconstructing canvas failed:', e);
        }
      }
    }
    if (item.rawCanvas) {
      const targetCanvas = mode === 'none' ? item.rawCanvas : binarizeCanvas(item.rawCanvas, mode);
      item.canvas = targetCanvas;
      item.dataUrl = targetCanvas.toDataURL('image/png');
    }
  }
  rawLabels.value = [...rawLabels.value];
};

// Project management state
const currentProjectId = ref(null);
const currentProjectName = ref('');
const currentSourceFileName = ref('');
const savedProjectsList = ref([]);
const showSavedProjectsModal = ref(false);
const saveToastMessage = ref('');
const step1Tab = ref('new'); // 'new' | 'saved'

// Print help modal state
const showPrintHelpModal = ref(false);
const activeHelpTab = ref('desktopApp'); // 'desktopApp' | 'customSize' | 'borrowSize' | 'pdfPrint' | 'calibration'

// Electron Desktop Client native integration state
const isElectron = ref(false);
const electronPrinters = ref([]);
const selectedElectronPrinter = ref(
  (typeof window !== 'undefined' && localStorage.getItem('labelmaster_selected_printer')) || ''
);
const isElectronPrinting = ref(false);
const electronPrintSuccess = ref(false);
const electronPrintStatusMsg = ref('');

// Auto remember printer selection across sessions
watch(selectedElectronPrinter, (newVal) => {
  if (newVal && typeof window !== 'undefined') {
    try {
      localStorage.setItem('labelmaster_selected_printer', newVal);
    } catch (e) {
      console.warn('Failed to save printer to localStorage:', e);
    }
  }
});

// Print alignment offset fine-tuning (mm)
const printOffsetX = ref(0);
const printOffsetY = ref(0);

const handleOpenPreferences = async () => {
  if (typeof window !== 'undefined' && window.electronAPI?.openPrinterPreferences) {
    if (!selectedElectronPrinter.value) {
      alert(isZh.value ? '请先在下拉框中选择目标热敏打印机' : 'Seleccione primero una impresora térmica de destino');
      return;
    }
    const res = await window.electronAPI.openPrinterPreferences(selectedElectronPrinter.value);
    if (!res?.success && res?.error) {
      alert((isZh.value ? '无法打开打印首选项窗口: ' : 'No se pudo abrir las preferencias de impresión: ') + res.error);
    }
  }
};

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
const freeCropAutoTrim = ref(localStorage.getItem('labelmaster_freecrop_autotrim') === 'true');
watch(freeCropAutoTrim, (val) => {
  try {
    localStorage.setItem('labelmaster_freecrop_autotrim', val ? 'true' : 'false');
  } catch (e) {}
});

const onFreeCropAutoTrimChange = async () => {
  if (freeCropBox.value) {
    freeCropBox.value.autoTrim = freeCropAutoTrim.value;
  }
  await reprocessPdf();
};
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

const steps = computed(() => [
  { title: t('pdf.step1') },
  { title: t('pdf.step2') },
  { title: t('pdf.step3') },
  { title: t('pdf.step4') },
]);

const defaultPaperPresetsList = [
  { id: '50x25', nameKey: 'pdf.paper_50x25', fallbackName: '50 × 25 mm', width: 50, height: 25 },
  { id: '50x30', nameKey: 'pdf.paper_50x30', fallbackName: '50 × 30 mm', width: 50, height: 30 },
  { id: '70x30', nameKey: 'pdf.paper_70x30', fallbackName: '70 × 30 mm', width: 70, height: 30 },
  { id: '80x30', nameKey: 'pdf.paper_80x30', fallbackName: '80 × 30 mm', width: 80, height: 30 },
  { id: '75x50', nameKey: 'pdf.paper_75x50', fallbackName: '75 × 50 mm', width: 75, height: 50 },
  { id: '100x100', nameKey: 'pdf.paper_100x100', fallbackName: '100 × 100 mm', width: 100, height: 100 },
  { id: '100x150', nameKey: 'pdf.paper_100x150', fallbackName: '100 × 150 mm', width: 100, height: 150 },
];

const loadUserPaperPresets = () => {
  try {
    const saved = localStorage.getItem('labelmaster_paper_presets');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading custom papers:', e);
  }
  return JSON.parse(JSON.stringify(defaultPaperPresetsList));
};

const userPaperList = ref(loadUserPaperPresets());

const saveUserPaperPresets = () => {
  try {
    localStorage.setItem('labelmaster_paper_presets', JSON.stringify(userPaperList.value));
  } catch (e) {
    console.error('Error saving custom papers:', e);
  }
};

const isCustomizedPapers = computed(() => {
  return JSON.stringify(userPaperList.value) !== JSON.stringify(defaultPaperPresetsList);
});

const paperPresets = computed(() => {
  const list = userPaperList.value.map(p => ({
    id: p.id,
    name: p.nameKey ? t(p.nameKey) : (p.name || `${p.width} × ${p.height} mm`),
    rawName: p.name || (p.nameKey ? t(p.nameKey) : `${p.width} × ${p.height} mm`),
    width: Number(p.width),
    height: Number(p.height),
    nameKey: p.nameKey,
  }));
  list.push({
    id: 'custom',
    name: t('pdf.paperCustom'),
    rawName: t('pdf.paperCustom'),
    width: targetWidthMm.value,
    height: targetHeightMm.value
  });
  return list;
});

const triggerToast = (msg) => {
  saveToastMessage.value = msg;
  setTimeout(() => {
    saveToastMessage.value = '';
  }, 2500);
};

const resetDefaultPapers = () => {
  userPaperList.value = JSON.parse(JSON.stringify(defaultPaperPresetsList));
  saveUserPaperPresets();
  const matched = paperPresets.value.find(p => p.id === selectedPaperId.value);
  if (!matched && selectedPaperId.value !== 'custom') {
    selectPaperPreset(paperPresets.value[0]);
  }
  triggerToast(isZh.value ? '已恢复默认预设纸张规格' : 'Valores predeterminados restaurados');
};

// Paper Modal State
const showPaperModal = ref(false);
const isEditingPaper = ref(false);
const editingPaperId = ref(null);
const paperForm = ref({
  name: '',
  width: 60,
  height: 40,
});

const openAddPaperModal = () => {
  isEditingPaper.value = false;
  editingPaperId.value = null;
  paperForm.value = {
    name: '',
    width: 60,
    height: 40,
  };
  showPaperModal.value = true;
};

const openEditPaperModal = (paper) => {
  isEditingPaper.value = true;
  editingPaperId.value = paper.id;
  paperForm.value = {
    name: paper.rawName || paper.name,
    width: paper.width,
    height: paper.height,
  };
  showPaperModal.value = true;
};

const handleSavePaper = () => {
  const w = Math.round(Number(paperForm.value.width));
  const h = Math.round(Number(paperForm.value.height));
  if (!w || !h || w <= 0 || h <= 0) return;

  const displayName = paperForm.value.name?.trim() || `${w} × ${h} mm`;

  if (isEditingPaper.value && editingPaperId.value) {
    const idx = userPaperList.value.findIndex(p => p.id === editingPaperId.value);
    if (idx !== -1) {
      userPaperList.value[idx] = {
        id: editingPaperId.value,
        name: displayName,
        width: w,
        height: h,
      };
      if (selectedPaperId.value === editingPaperId.value) {
        targetWidthMm.value = w;
        targetHeightMm.value = h;
      }
    }
    triggerToast(isZh.value ? '纸张规格已更新' : 'Tamaño actualizado');
  } else {
    const newId = `paper_${Date.now()}`;
    const newPaper = {
      id: newId,
      name: displayName,
      width: w,
      height: h,
    };
    userPaperList.value.push(newPaper);
    selectedPaperId.value = newId;
    targetWidthMm.value = w;
    targetHeightMm.value = h;
    triggerToast(isZh.value ? '已添加新纸张规格' : 'Nuevo tamaño agregado');
  }

  saveUserPaperPresets();
  showPaperModal.value = false;
};

const deletePaperPreset = (paper) => {
  if (userPaperList.value.length <= 1) {
    alert(t('pdf.paperAtLeastOne'));
    return;
  }

  const confirmMsg = t('pdf.paperDeleteConfirm').replace('{name}', paper.name);
  if (!confirm(confirmMsg)) return;

  userPaperList.value = userPaperList.value.filter(p => p.id !== paper.id);
  saveUserPaperPresets();

  if (selectedPaperId.value === paper.id) {
    const fallback = paperPresets.value[0];
    if (fallback) {
      selectPaperPreset(fallback);
    } else {
      selectedPaperId.value = 'custom';
    }
  }

  triggerToast(isZh.value ? '已删除纸张规格' : 'Tamaño eliminado');
};

const setQuickSize = (w, h) => {
  targetWidthMm.value = w;
  targetHeightMm.value = h;
  const match = paperPresets.value.find(p => p.width === w && p.height === h);
  if (match) selectedPaperId.value = match.id;
  else selectedPaperId.value = 'custom';
};

const selectPaperPreset = (preset) => {
  if (!preset) {
    if (paperPresets.value.length > 0) {
      preset = paperPresets.value[0];
    } else {
      return;
    }
  }
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
    const rawName = fileOrUrl?.name || (typeof fileOrUrl === 'string' ? fileOrUrl.split('/').pop() : (isZh.value ? 'PDF标签' : 'Etiqueta PDF'));
    currentSourceFileName.value = rawName;
    if (!currentProjectId.value || !currentProjectName.value) {
      currentProjectName.value = rawName.replace(/\.[^/.]+$/, "") + ' - ' + new Date().toLocaleDateString(isZh.value ? 'zh-CN' : 'es-ES', { month: 'numeric', day: 'numeric' });
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
    alert(isZh.value ? `无法解析文件: ${err.message || '请确认是否为有效的 PDF 文件'}` : `No se pudo analizar el archivo: ${err.message || 'Verifique que sea un archivo PDF válido'}`);
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
      const activeCanvas = sharpenMode.value !== 'none' ? binarizeCanvas(trimmed, sharpenMode.value) : trimmed;
      const dataUrl = activeCanvas.toDataURL('image/png');

      const fileName = file.name ? file.name.replace(/\.[^/.]+$/, "") : 'IMAGE-LABEL';
      currentSourceFileName.value = file.name || (isZh.value ? '图片标签' : 'Etiqueta Imagen');
      if (!currentProjectId.value || !currentProjectName.value) {
        currentProjectName.value = fileName + ' - ' + new Date().toLocaleDateString(isZh.value ? 'zh-CN' : 'es-ES', { month: 'numeric', day: 'numeric' });
      }

      rawLabels.value = [{
        id: `img_${Date.now()}`,
        page: 1,
        col: 1,
        row: 1,
        rawCanvas: trimmed,
        canvas: activeCanvas,
        dataUrl: dataUrl,
        barcode: fileName,
        title: fileName,
        sku: '',
        quantity: 1,
        selected: true,
        width: activeCanvas.width,
        height: activeCanvas.height,
      }];

      if (trimmed.width > trimmed.height * 1.5) {
        selectPaperPreset(paperPresets.value.find(p => p.id === '70x30'));
      } else {
        selectPaperPreset(paperPresets.value.find(p => p.id === '100x100'));
      }

      currentStep.value = 2;
    };
    reader.readAsDataURL(file);
  } catch (err) {
    console.error('Error processing image:', err);
    alert((isZh.value ? '解析图片标签失败: ' : 'Error al procesar la imagen: ') + err.message);
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
  if (freeCropBox.value && freeCropBox.value.autoTrim !== undefined) {
    freeCropAutoTrim.value = Boolean(freeCropBox.value.autoTrim);
  }
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
    autoTrim: freeCropAutoTrim.value,
  };

  // Auto select best target paper size based on ratio
  const mmW = selectionMmWidth.value;
  const mmH = selectionMmHeight.value;
  if (mmW >= 90 && mmH >= 120) {
    selectPaperPreset(paperPresets.value.find(p => p.id === '100x150'));
  } else if (mmW >= 85 && mmH >= 85) {
    selectPaperPreset(paperPresets.value.find(p => p.id === '100x100'));
  } else if (mmW >= 60) {
    selectPaperPreset(paperPresets.value.find(p => p.id === '70x30'));
  } else {
    selectPaperPreset(paperPresets.value.find(p => p.id === '50x30'));
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
      freeCropBox.value,
      sharpenMode.value
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

    const finalCanvas = (freeCropBox.value.autoTrim ?? freeCropAutoTrim.value) ? trimWhiteBorder(cellCanvas) : cellCanvas;
    const activeCanvas = sharpenMode.value !== 'none' ? binarizeCanvas(finalCanvas, sharpenMode.value) : finalCanvas;

    rawLabels.value = [{
      id: `img_${Date.now()}`,
      page: 1,
      col: 1,
      row: 1,
      rawCanvas: cellCanvas,
      canvas: activeCanvas,
      dataUrl: activeCanvas.toDataURL('image/png'),
      barcode: 'IMAGE-LABEL',
      title: isZh.value ? '图片自定义裁切标' : 'Etiqueta recortada de imagen',
      sku: '',
      quantity: 1,
      selected: true,
      width: activeCanvas.width,
      height: activeCanvas.height,
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
    currentProjectName.value = `${isZh.value ? '实测_' : 'Muestra_'}${sampleBaseName} - ${new Date().toLocaleDateString(isZh.value ? 'zh-CN' : 'es-ES', { month: 'numeric', day: 'numeric' })}`;
    currentProjectId.value = null;

    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(isZh.value ? `无法获取样本文件 (${response.status})` : `No se pudo obtener el archivo de muestra (${response.status})`);
    const blob = await response.blob();
    await processPdfFile(blob, presetMode);
  } catch (err) {
    console.error('Could not load sample file directly:', err);
    alert((isZh.value ? '载入样本失败: ' : 'Error al cargar la muestra: ') + err.message);
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

// Page range selection state
const pageRangeInput = ref('');

const maxPdfPages = computed(() => {
  if (currentPdfDoc.value?.numPages) return currentPdfDoc.value.numPages;
  return rawLabels.value.reduce((max, item) => Math.max(max, Number(item.page) || 1), 1);
});

const selectedPagesCount = computed(() => {
  const pagesSet = new Set();
  for (const item of rawLabels.value) {
    if (item.selected !== false && (parseInt(item.quantity, 10) || 0) > 0) {
      pagesSet.add(Number(item.page) || 1);
    }
  }
  return pagesSet.size;
});

const selectOnlyFirstPage = () => {
  pageRangeInput.value = '1';
  for (const item of rawLabels.value) {
    if (Number(item.page) === 1) {
      item.selected = true;
      if (!item.quantity || Number(item.quantity) < 1) item.quantity = 1;
    } else {
      item.selected = false;
      item.quantity = 0;
    }
  }
};

const selectOddPages = () => {
  pageRangeInput.value = isZh.value ? '奇数页' : 'Páginas Impares';
  for (const item of rawLabels.value) {
    const pageNum = Number(item.page) || 1;
    if (pageNum % 2 !== 0) {
      item.selected = true;
      if (!item.quantity || Number(item.quantity) < 1) item.quantity = 1;
    } else {
      item.selected = false;
      item.quantity = 0;
    }
  }
};

const selectEvenPages = () => {
  pageRangeInput.value = isZh.value ? '偶数页' : 'Páginas Pares';
  for (const item of rawLabels.value) {
    const pageNum = Number(item.page) || 1;
    if (pageNum % 2 === 0) {
      item.selected = true;
      if (!item.quantity || Number(item.quantity) < 1) item.quantity = 1;
    } else {
      item.selected = false;
      item.quantity = 0;
    }
  }
};

const selectAllPages = () => {
  pageRangeInput.value = '';
  for (const item of rawLabels.value) {
    item.selected = true;
    if (!item.quantity || Number(item.quantity) < 1) item.quantity = 1;
  }
};

const invertPageSelection = () => {
  for (const item of rawLabels.value) {
    const isCurSelected = item.selected !== false && (parseInt(item.quantity, 10) || 0) > 0;
    item.selected = !isCurSelected;
    item.quantity = !isCurSelected ? 1 : 0;
  }
};

const parsePageRange = (str, max) => {
  const result = new Set();
  if (!str || !str.trim()) return result;
  const rawStr = str.trim().toLowerCase();
  if (rawStr === '奇数' || rawStr === '奇数页' || rawStr === 'odd' || rawStr.includes('impar')) {
    for (let p = 1; p <= max; p += 2) result.add(p);
    return result;
  }
  if (rawStr === '偶数' || rawStr === '偶数页' || rawStr === 'even' || rawStr.includes('par')) {
    for (let p = 2; p <= max; p += 2) result.add(p);
    return result;
  }
  const parts = str.split(/[,，\s]+/);
  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = Math.max(1, parseInt(rangeMatch[1], 10));
      const end = Math.min(max, parseInt(rangeMatch[2], 10));
      for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
        result.add(p);
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= max) {
        result.add(p);
      }
    }
  }
  return result;
};

const applyPageRange = () => {
  if (!pageRangeInput.value.trim()) {
    selectAllPages();
    return;
  }
  const targets = parsePageRange(pageRangeInput.value, maxPdfPages.value);
  if (targets.size === 0) {
    alert(isZh.value ? `请输入有效的页码范围（1 ~ ${maxPdfPages.value}）` : `Ingrese un rango de páginas válido (1 ~ ${maxPdfPages.value})`);
    return;
  }
  for (const item of rawLabels.value) {
    const pageNum = Number(item.page) || 1;
    if (targets.has(pageNum)) {
      item.selected = true;
      if (!item.quantity || Number(item.quantity) < 1) item.quantity = 1;
    } else {
      item.selected = false;
      item.quantity = 0;
    }
  }
};

const toggleItemSelection = (item) => {
  const isCurrentlySelected = item.selected !== false && (parseInt(item.quantity, 10) || 0) > 0;
  const newTarget = !isCurrentlySelected;
  
  if (item.subIds && item.subIds.length > 0) {
    for (const raw of rawLabels.value) {
      if (item.subIds.includes(raw.id)) {
        raw.selected = newTarget;
        raw.quantity = newTarget ? Math.max(1, parseInt(raw.quantity, 10) || 1) : 0;
      }
    }
  } else {
    item.selected = newTarget;
    item.quantity = newTarget ? Math.max(1, parseInt(item.quantity, 10) || 1) : 0;
  }
};

const setItemQuantity = (item, newQty) => {
  const qty = Math.max(0, parseInt(newQty, 10) || 0);
  const isSelected = qty > 0;
  item.quantity = qty;
  item.selected = isSelected;
  if (item.subIds && item.subIds.length > 0) {
    for (const raw of rawLabels.value) {
      if (item.subIds.includes(raw.id)) {
        raw.quantity = qty;
        raw.selected = isSelected;
      }
    }
  }
};

const printCopies = ref(1); // Global batch copies multiplier in Step 4
const batchQuantity = ref(30); // Default value for Step 2 batch quantity applicator

const adjustCopies = (delta) => {
  const current = Number(printCopies.value) || 1;
  printCopies.value = Math.max(1, current + delta);
};

const normalizePrintCopies = () => {
  if (!printCopies.value || printCopies.value < 1) {
    printCopies.value = 1;
  } else {
    printCopies.value = Math.floor(Number(printCopies.value));
  }
};

const normalizeBatchQuantity = () => {
  if (!batchQuantity.value || batchQuantity.value < 1) {
    batchQuantity.value = 1;
  } else {
    batchQuantity.value = Math.floor(Number(batchQuantity.value));
  }
};

const applyBatchQuantity = (val) => {
  const q = Math.max(1, parseInt(val, 10) || 1);
  batchQuantity.value = q;
  for (const item of rawLabels.value) {
    if (item.selected !== false) {
      item.quantity = q;
    }
  }
  for (const item of displayItems.value) {
    if (item.selected !== false) {
      item.quantity = q;
    }
  }
};

const totalPrintQuantity = computed(() => {
  const copies = Math.max(1, parseInt(printCopies.value) || 1);
  const activeItems = displayItems.value.filter(item => item.selected !== false && (parseInt(item.quantity, 10) || 0) > 0);
  const base = activeItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  return base * copies;
});

// Flattened list for roll simulation and output
const previewList = computed(() => {
  const list = [];
  const copies = Math.max(1, parseInt(printCopies.value) || 1);
  for (const item of displayItems.value) {
    if (item.selected === false) continue;
    const itemQty = parseInt(item.quantity, 10) || 0;
    if (itemQty <= 0) continue;
    const totalQty = itemQty * copies;
    for (let i = 0; i < totalQty; i++) {
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
    const blob = await exportThermalPdf(previewList.value.map(item => ({ ...item, quantity: 1 })), {
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
    alert(isZh.value ? '导出 PDF 失败，请检查控制台。' : 'Error al exportar PDF. Consulte la consola.');
  } finally {
    isGeneratingPdf.value = false;
  }
};

// Direct silent thermal print via iframe with strict @page geometry
const triggerThermalPrint = async () => {
  if (previewList.value.length === 0) return;
  
  // If running inside Electron, trigger silent native print
  if (isElectron.value && window.electronAPI?.printSilent) {
    return triggerElectronSilentPrint();
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

const loadElectronPrinters = async () => {
  if (typeof window !== 'undefined' && window.electronAPI?.getPrinters) {
    try {
      const res = await window.electronAPI.getPrinters();
      if (res && res.success && Array.isArray(res.printers)) {
        electronPrinters.value = res.printers;
        const saved = localStorage.getItem('labelmaster_selected_printer');
        const match = saved && res.printers.some(p => p.name === saved);
        if (match) {
          selectedElectronPrinter.value = saved;
        } else if (!selectedElectronPrinter.value && res.printers.length > 0) {
          const def = res.printers.find(p => p.isDefault);
          selectedElectronPrinter.value = def ? def.name : res.printers[0].name;
          localStorage.setItem('labelmaster_selected_printer', selectedElectronPrinter.value);
        }
      }
    } catch (e) {
      console.warn('Failed to load local electron printers:', e);
    }
  }
};

const triggerElectronSilentPrint = async () => {
  if (!isElectron.value || !window.electronAPI?.printSilent) return;
  if (previewList.value.length === 0) {
    alert(isZh.value ? '暂无可打印标签' : 'No hay etiquetas para imprimir');
    return;
  }

  isElectronPrinting.value = true;
  electronPrintSuccess.value = false;
  electronPrintStatusMsg.value = isZh.value ? '正在直接下发微米级硬件打印指令...' : 'Enviando comando de impresión a nivel de hardware...';

  try {
    const isStretch = fitMode.value === 'stretch';
    const offsetX = Number(printOffsetX.value) || 0;
    const offsetY = Number(printOffsetY.value) || 0;

    const pagesHtml = previewList.value.map(item => {
      const shouldRotate = autoRotate.value && item.width < item.height && targetWidthMm.value > targetHeightMm.value;
      const transforms = [];
      if (offsetX !== 0 || offsetY !== 0) {
        transforms.push(`translate(${offsetX}mm, ${offsetY}mm)`);
      }
      if (shouldRotate) {
        transforms.push('rotate(90deg)');
      }
      const transformCss = transforms.length > 0 ? `transform: ${transforms.join(' ')};` : '';

      if (shouldRotate) {
        return `<div class="label-page"><img src="${item.dataUrl}" style="max-width:${targetHeightMm.value}mm;max-height:${targetWidthMm.value}mm;${transformCss}object-fit:${isStretch ? 'fill' : 'contain'};image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges;"/></div>`;
      } else {
        return `<div class="label-page"><img src="${item.dataUrl}" style="max-width:100%;max-height:100%;${transformCss}object-fit:${isStretch ? 'fill' : 'contain'};image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges;"/></div>`;
      }
    }).join('');

    const res = await window.electronAPI.printSilent({
      printerName: selectedElectronPrinter.value,
      widthMm: targetWidthMm.value,
      heightMm: targetHeightMm.value,
      htmlContent: pagesHtml,
      copies: 1
    });

    if (res && res.success) {
      electronPrintSuccess.value = true;
      electronPrintStatusMsg.value = isZh.value ? `✓ 任务已成功直达【${selectedElectronPrinter.value || '默认热敏机'}】，正按精确尺寸输出 ${totalPrintQuantity.value} 张标签！` : `✓ ¡Trabajo enviado a [${selectedElectronPrinter.value || 'Impresora predeterminada'}], imprimiendo ${totalPrintQuantity.value} etiquetas!`;
      setTimeout(() => {
        electronPrintSuccess.value = false;
      }, 6000);
    } else {
      alert((isZh.value ? '静默打印失败: ' : 'Error en impresión silenciosa: ') + (res?.error || (isZh.value ? '请确认打印机已开机并就绪' : 'Verifique que la impresora esté encendida y lista')));
    }
  } catch (err) {
    alert((isZh.value ? '打印调用异常: ' : 'Excepción al llamar a la impresora: ') + err.message);
  } finally {
    isElectronPrinting.value = false;
  }
};

onMounted(() => {
  loadSavedProjectsList();
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    isElectron.value = true;
    loadElectronPrinters();
  }
});

const handleSaveCurrentProject = async () => {
  if (rawLabels.value.length === 0) {
    alert(isZh.value ? '暂无标签可保存，请先上传并裁切标签' : 'No hay etiquetas para guardar. Primero suba y recorte un archivo.');
    return;
  }

  const nameToSave = currentProjectName.value.trim() || `${isZh.value ? '标签项目_' : 'Proyecto_'}${new Date().toLocaleDateString(isZh.value ? 'zh-CN' : 'es-ES').replace(/\//g, '-')}_${new Date().toLocaleTimeString(isZh.value ? 'zh-CN' : 'es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  currentProjectName.value = nameToSave;

  const cleanBox = freeCropBox.value ? {
    xRatio: Number(freeCropBox.value.xRatio) || 0,
    yRatio: Number(freeCropBox.value.yRatio) || 0,
    wRatio: Number(freeCropBox.value.wRatio) || 0,
    hRatio: Number(freeCropBox.value.hRatio) || 0,
    autoTrim: Boolean(freeCropBox.value.autoTrim ?? freeCropAutoTrim.value),
  } : null;

  const projectPayload = {
    id: currentProjectId.value || `proj_${Date.now()}`,
    name: nameToSave,
    sourceFileName: currentSourceFileName.value || (isZh.value ? '自定义标签' : 'Etiqueta personalizada'),
    layoutMode: selectedLayoutMode.value,
    freeCropBox: cleanBox,
    selectedPaperId: selectedPaperId.value,
    targetWidthMm: targetWidthMm.value,
    targetHeightMm: targetHeightMm.value,
    autoRotate: autoRotate.value,
    fitMode: fitMode.value,
    viewMode: viewMode.value,
    sharpenMode: sharpenMode.value,
    rawLabels: rawLabels.value,
  };

  try {
    const saved = await saveProject(projectPayload);
    currentProjectId.value = saved.id;
    await loadSavedProjectsList();
    saveToastMessage.value = isZh.value ? `项目【${saved.name}】已成功保存！` : `¡Proyecto [${saved.name}] guardado con éxito!`;
    setTimeout(() => {
      saveToastMessage.value = '';
    }, 3000);
  } catch (err) {
    console.error('Failed to save project:', err);
    alert((isZh.value ? '保存项目失败: ' : 'Error al guardar proyecto: ') + err.message);
  }
};

const handleOpenProject = async (projectItem) => {
  try {
    const full = await getProject(projectItem.id);
    if (!full) throw new Error(isZh.value ? '未找到该项目的完整数据' : 'No se encontraron los datos completos del proyecto');

    currentProjectId.value = full.id;
    currentProjectName.value = full.name;
    currentSourceFileName.value = full.sourceFileName || '';
    selectedLayoutMode.value = full.layoutMode || 'presetFreeform';
    freeCropBox.value = full.freeCropBox || null;
    if (full.freeCropBox && full.freeCropBox.autoTrim !== undefined) {
      freeCropAutoTrim.value = Boolean(full.freeCropBox.autoTrim);
    }
    selectedPaperId.value = full.selectedPaperId || '70x30';
    targetWidthMm.value = full.targetWidthMm || 70;
    targetHeightMm.value = full.targetHeightMm || 30;
    autoRotate.value = full.autoRotate !== false;
    fitMode.value = full.fitMode || 'proportional';
    viewMode.value = full.viewMode || 'grouped';
    sharpenMode.value = full.sharpenMode || 'standard';
    rawLabels.value = full.rawLabels || [];
    await setSharpenMode(sharpenMode.value);

    currentPdfDoc.value = null; // Stored project is standalone
    originalImageCanvas.value = null;
    showSavedProjectsModal.value = false;
    currentStep.value = 2;

    saveToastMessage.value = isZh.value ? `已打开项目【${full.name}】` : `Proyecto [${full.name}] abierto`;
    setTimeout(() => {
      saveToastMessage.value = '';
    }, 2500);
  } catch (err) {
    console.error('Failed to open project:', err);
    alert((isZh.value ? '打开项目失败: ' : 'Error al abrir proyecto: ') + err.message);
  }
};

const handleDeleteProject = async (id, name) => {
  if (!confirm(isZh.value ? `确定要删除保存项目【${name || '此项目'}】吗？此操作无法撤销。` : `¿Está seguro de eliminar el proyecto guardado [${name || 'este proyecto'}]? Esta acción no se puede deshacer.`)) return;
  try {
    await deleteProject(id);
    if (currentProjectId.value === id) {
      currentProjectId.value = null;
    }
    await loadSavedProjectsList();
  } catch (err) {
    alert((isZh.value ? '删除失败: ' : 'Error al eliminar: ') + err.message);
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
    alert((isZh.value ? '导出项目失败: ' : 'Error al exportar proyecto: ') + err.message);
  }
};

const onImportJsonFile = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const imported = await importProjectJson(file);
    await loadSavedProjectsList();
    alert(isZh.value ? `成功导入项目【${imported.name}】！` : `¡Proyecto [${imported.name}] importado con éxito!`);
    await handleOpenProject(imported);
  } catch (err) {
    alert((isZh.value ? '导入失败: ' : 'Error al importar: ') + err.message);
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
