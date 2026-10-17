<template>
  <div class="space-y-6">
    <!-- Top Header Banner & Sub-mode Switcher -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Layers v-if="activeSubTab === 'merge'" class="w-5 h-5" />
              <Scissors v-else class="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 tracking-tight">
                {{ activeSubTab === 'merge' ? t('tools.mergeTitle') : t('tools.splitTitle') }}
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ activeSubTab === 'merge' ? t('tools.mergeSubtitle') : t('tools.splitSubtitle') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Mode Pills Toggle -->
        <div class="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200/70 self-start md:self-auto">
          <button
            @click="activeSubTab = 'merge'"
            class="px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            :class="activeSubTab === 'merge' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>{{ t('tools.tabMerge') }}</span>
          </button>

          <button
            @click="activeSubTab = 'split'"
            class="px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            :class="activeSubTab === 'split' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Scissors class="w-3.5 h-3.5" />
            <span>{{ t('tools.tabSplit') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 1: MERGE PDF (合并 PDF)                 -->
    <!-- ========================================== -->
    <div v-if="activeSubTab === 'merge'" class="space-y-6">
      <!-- Upload Dropzone (When Empty) -->
      <div
        v-if="mergeFiles.length === 0"
        @dragover.prevent="isDragOverMerge = true"
        @dragleave.prevent="isDragOverMerge = false"
        @drop.prevent="handleMergeDrop"
        class="border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all bg-white cursor-pointer group"
        :class="isDragOverMerge ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'"
        @click="triggerMergeFileInput"
      >
        <input
          ref="mergeFileInput"
          type="file"
          multiple
          accept=".pdf,application/pdf"
          class="hidden"
          @change="handleMergeFileSelect"
        />
        <div class="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform shadow-xs">
          <UploadCloud class="w-8 h-8" />
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-1">
          {{ t('tools.dropMerge') }}
        </h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          {{ t('tools.dropMergeHint') }}
        </p>
      </div>

      <!-- Files List & Operations (When has files) -->
      <div v-else class="space-y-4">
        <!-- Top Action Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
              {{ t('tools.filesSelected', { n: mergeFiles.length }) }}
            </span>
            <span class="text-xs text-slate-500">
              {{ t('tools.totalEstPages') }}: <strong class="text-slate-800">{{ estimatedTotalPages }}</strong>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="triggerMergeFileInput"
              class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>{{ t('tools.addMoreFiles') }}</span>
            </button>
            <input
              ref="mergeFileInput"
              type="file"
              multiple
              accept=".pdf,application/pdf"
              class="hidden"
              @change="handleMergeFileSelect"
            />

            <button
              @click="clearMergeFiles"
              class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border border-rose-200/60"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>{{ t('tools.clearAll') }}</span>
            </button>
          </div>
        </div>

        <!-- Files List Cards -->
        <div class="space-y-3">
          <div
            v-for="(item, index) in mergeFiles"
            :key="item.id"
            class="bg-white rounded-xl border border-slate-200 p-4 transition-all hover:border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center gap-4"
          >
            <!-- Order & Thumbnail -->
            <div class="flex items-center gap-3 shrink-0">
              <span class="w-7 h-7 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-600 flex items-center justify-center border border-slate-200">
                #{{ index + 1 }}
              </span>

              <div class="w-16 h-20 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs relative">
                <img
                  v-if="item.thumbnail"
                  :src="item.thumbnail"
                  class="w-full h-full object-contain"
                  alt="thumbnail"
                />
                <FileText v-else class="w-6 h-6 text-slate-300" />
                <span class="absolute bottom-1 right-1 px-1 py-0.2 bg-slate-900/70 text-white text-[9px] rounded font-mono">
                  {{ item.pageCount }}p
                </span>
              </div>
            </div>

            <!-- File Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-slate-800 truncate" :title="item.name">
                  {{ item.name }}
                </h4>
                <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded font-medium shrink-0">
                  {{ formatFileSize(item.size) }}
                </span>
              </div>

              <div class="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>{{ t('tools.pagesCount', { n: item.pageCount }) }}</span>
                <span v-if="item.firstPageInfo">
                  {{ item.firstPageInfo.widthMm }} × {{ item.firstPageInfo.heightMm }} mm
                </span>
              </div>

              <!-- Page Range Controls -->
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    @click="setFileRangeMode(item, 'all')"
                    class="px-2 py-1 rounded-md transition-all font-medium"
                    :class="item.rangeMode === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'"
                  >
                    {{ t('tools.allPages') }}
                  </button>
                  <button
                    @click="setFileRangeMode(item, 'custom')"
                    class="px-2 py-1 rounded-md transition-all font-medium"
                    :class="item.rangeMode === 'custom' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'"
                  >
                    {{ t('tools.customPages') }}
                  </button>
                </div>

                <div v-if="item.rangeMode === 'custom'" class="flex items-center gap-1.5">
                  <input
                    type="text"
                    v-model="item.pageRangeText"
                    @input="onRangeTextInput(item)"
                    :placeholder="t('tools.pageRangePlaceholder')"
                    class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs w-36 font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                  <span class="text-[11px] text-slate-400">
                    ({{ item.selectedPages.length }}/{{ item.pageCount }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Reorder & Delete Actions -->
            <div class="flex items-center gap-1.5 self-end md:self-center shrink-0 border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
              <button
                @click="moveFile(index, -1)"
                :disabled="index === 0"
                class="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg transition-all"
                :title="t('tools.moveUp')"
              >
                <ArrowUp class="w-4 h-4" />
              </button>
              <button
                @click="moveFile(index, 1)"
                :disabled="index === mergeFiles.length - 1"
                class="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg transition-all"
                :title="t('tools.moveDown')"
              >
                <ArrowDown class="w-4 h-4" />
              </button>
              <button
                @click="removeMergeFile(index)"
                class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all ml-1"
                :title="t('tools.delete')"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Output Configuration & Export Bottom Bar -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-600">{{ t('tools.outputFilename') }}:</span>
              <input
                type="text"
                v-model="mergeOutputName"
                class="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:border-indigo-500 focus:outline-hidden w-64"
              />
            </div>

            <div class="text-xs text-slate-500">
              {{ t('tools.totalFiles') }}: <strong class="text-slate-900">{{ mergeFiles.length }}</strong> · 
              {{ t('tools.totalEstPages') }}: <strong class="text-indigo-600 font-bold">{{ estimatedTotalPages }}</strong>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="isMerging" class="space-y-1.5 pt-2">
            <div class="flex items-center justify-between text-xs text-indigo-700 font-semibold">
              <span class="flex items-center gap-1.5">
                <Loader2 class="w-3.5 h-3.5 animate-spin" />
                {{ mergeStatusText }}
              </span>
              <span>{{ mergeProgress }}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${mergeProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              @click="previewMergedPdf"
              :disabled="isMerging || mergeFiles.length === 0"
              class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-slate-200 disabled:opacity-50"
            >
              <Eye class="w-4 h-4 text-slate-500" />
              <span>{{ t('tools.mergePreviewBtn') }}</span>
            </button>

            <button
              @click="executeMergeAndDownload"
              :disabled="isMerging || mergeFiles.length === 0"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-indigo-600/20 disabled:opacity-50"
            >
              <Download class="w-4 h-4" />
              <span>{{ t('tools.mergeBtn') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 2: SPLIT PDF (拆分 PDF)                 -->
    <!-- ========================================== -->
    <div v-else class="space-y-6">
      <!-- Upload Dropzone (When No File Loaded) -->
      <div
        v-if="!splitDoc"
        @dragover.prevent="isDragOverSplit = true"
        @dragleave.prevent="isDragOverSplit = false"
        @drop.prevent="handleSplitDrop"
        class="border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all bg-white cursor-pointer group"
        :class="isDragOverSplit ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'"
        @click="triggerSplitFileInput"
      >
        <input
          ref="splitFileInput"
          type="file"
          accept=".pdf,application/pdf"
          class="hidden"
          @change="handleSplitFileSelect"
        />
        <div class="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform shadow-xs">
          <Scissors class="w-8 h-8" />
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-1">
          {{ t('tools.dropSplit') }}
        </h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          {{ t('tools.dropSplitHint') }}
        </p>
      </div>

      <!-- Split File Workbench (When File Loaded) -->
      <div v-else class="space-y-6">
        <!-- Current File Information Bar -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <FileText class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-800 truncate max-w-md">
                {{ splitDoc.name }}
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ formatFileSize(splitDoc.size) }} · {{ t('tools.pagesCount', { n: splitDoc.pageCount }) }}
                <span v-if="splitDoc.firstPageInfo">
                  · {{ splitDoc.firstPageInfo.widthMm }} × {{ splitDoc.firstPageInfo.heightMm }} mm
                </span>
              </p>
            </div>
          </div>

          <div>
            <button
              @click="triggerSplitFileInput"
              class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <RotateCw class="w-3.5 h-3.5" />
              <span>{{ t('tools.changeSplitFile') }}</span>
            </button>
            <input
              ref="splitFileInput"
              type="file"
              accept=".pdf,application/pdf"
              class="hidden"
              @change="handleSplitFileSelect"
            />
          </div>
        </div>

        <!-- 4 Split Modes Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Mode 1: Extract Selected Pages -->
          <div
            @click="splitMode = 'extract'"
            class="p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-white"
            :class="splitMode === 'extract' ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
                <CheckSquare class="w-4 h-4" />
              </div>
              <span
                class="w-4 h-4 rounded-full border flex items-center justify-center"
                :class="splitMode === 'extract' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'"
              >
                <Check v-if="splitMode === 'extract'" class="w-2.5 h-2.5" />
              </span>
            </div>
            <h5 class="text-xs font-bold text-slate-800">{{ t('tools.modeExtract') }}</h5>
            <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">{{ t('tools.modeExtractDesc') }}</p>
          </div>

          <!-- Mode 2: Split to Single Pages (ZIP) -->
          <div
            @click="splitMode = 'single'"
            class="p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-white"
            :class="splitMode === 'single' ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                <FolderArchive class="w-4 h-4" />
              </div>
              <span
                class="w-4 h-4 rounded-full border flex items-center justify-center"
                :class="splitMode === 'single' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'"
              >
                <Check v-if="splitMode === 'single'" class="w-2.5 h-2.5" />
              </span>
            </div>
            <h5 class="text-xs font-bold text-slate-800">{{ t('tools.modeSingle') }}</h5>
            <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">{{ t('tools.modeSingleDesc') }}</p>
          </div>

          <!-- Mode 3: Split by Page Interval (ZIP) -->
          <div
            @click="splitMode = 'interval'"
            class="p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-white"
            :class="splitMode === 'interval' ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
                <Layers class="w-4 h-4" />
              </div>
              <span
                class="w-4 h-4 rounded-full border flex items-center justify-center"
                :class="splitMode === 'interval' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'"
              >
                <Check v-if="splitMode === 'interval'" class="w-2.5 h-2.5" />
              </span>
            </div>
            <h5 class="text-xs font-bold text-slate-800">{{ t('tools.modeInterval') }}</h5>
            <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">{{ t('tools.modeIntervalDesc') }}</p>
          </div>

          <!-- Mode 4: Split Odd / Even -->
          <div
            @click="splitMode = 'oddeven'"
            class="p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-white"
            :class="splitMode === 'oddeven' ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-lg bg-purple-100/70 text-purple-700 flex items-center justify-center">
                <Scissors class="w-4 h-4" />
              </div>
              <span
                class="w-4 h-4 rounded-full border flex items-center justify-center"
                :class="splitMode === 'oddeven' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'"
              >
                <Check v-if="splitMode === 'oddeven'" class="w-2.5 h-2.5" />
              </span>
            </div>
            <h5 class="text-xs font-bold text-slate-800">{{ t('tools.modeOddEven') }}</h5>
            <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">{{ t('tools.modeOddEvenDesc') }}</p>
          </div>
        </div>

        <!-- Mode-Specific Configuration Panels -->
        <!-- 1. Interval Settings -->
        <div v-if="splitMode === 'interval'" class="bg-amber-50/50 border border-amber-200/70 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold text-amber-900">{{ t('tools.pagesPerPart') }}:</label>
            <div class="flex items-center gap-1.5">
              <input
                type="number"
                v-model.number="intervalPageSize"
                min="1"
                :max="splitDoc.pageCount"
                class="w-20 px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg font-bold text-center focus:outline-hidden"
              />
              <span class="text-xs text-amber-800">{{ t('tools.pagesUnit') }}</span>
            </div>
          </div>
          <div class="text-xs text-amber-800 font-medium">
            {{ t('tools.estParts', { n: Math.ceil(splitDoc.pageCount / (intervalPageSize || 1)) }) }}
          </div>
        </div>

        <!-- 2. Odd / Even Summary -->
        <div v-else-if="splitMode === 'oddeven'" class="bg-purple-50/50 border border-purple-200/70 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-4 text-xs font-semibold text-purple-900">
            <span>{{ t('tools.oddCount', { n: Math.ceil(splitDoc.pageCount / 2) }) }}</span>
            <span>{{ t('tools.evenCount', { n: Math.floor(splitDoc.pageCount / 2) }) }}</span>
          </div>
          <div class="text-xs text-purple-700">
            {{ t('tools.estParts', { n: 2 }) }} (ZIP)
          </div>
        </div>

        <!-- 3. Extract Quick Filter & Page Range Toolbar -->
        <div v-if="splitMode === 'extract' || splitMode === 'single'" class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <!-- Selection buttons -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="selectAllSplitPages"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              {{ t('tools.selectAll') }}
            </button>
            <button
              @click="deselectAllSplitPages"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              {{ t('tools.deselectAll') }}
            </button>
            <button
              @click="selectOddSplitPages"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              {{ t('tools.selectOdd') }}
            </button>
            <button
              @click="selectEvenSplitPages"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              {{ t('tools.selectEven') }}
            </button>
          </div>

          <!-- Range Input sync -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-500">{{ t('tools.customPages') }}:</span>
            <input
              type="text"
              v-model="splitRangeText"
              @input="onSplitRangeInput"
              :placeholder="t('tools.pageRangePlaceholder')"
              class="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg w-40 font-mono focus:border-indigo-500 focus:outline-hidden"
            />
            <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {{ t('tools.selectedPagesCount', { n: selectedSplitPages.length, total: splitDoc.pageCount }) }}
            </span>
          </div>
        </div>

        <!-- Page Thumbnails Grid -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-500">
            <span>{{ t('tools.fileLoaded', { n: splitDoc.pageCount }) }}</span>
            <span v-if="splitMode === 'extract'">{{ t('tools.clickToTogglePage') }}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto p-1 border border-slate-200/80 rounded-xl bg-slate-50/50">
            <div
              v-for="page in splitDocPages"
              :key="page.pageNumber"
              @click="toggleSplitPage(page.pageIndex)"
              class="bg-white rounded-xl border-2 p-2.5 transition-all cursor-pointer relative group shadow-2xs hover:shadow-xs flex flex-col items-center"
              :class="isPageSelected(page.pageIndex) ? 'border-indigo-600 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'"
            >
              <!-- Top Badge -->
              <div class="w-full flex items-center justify-between mb-1.5">
                <span class="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded">
                  P{{ page.pageNumber }}
                </span>
                <span
                  class="w-4 h-4 rounded flex items-center justify-center transition-all"
                  :class="isPageSelected(page.pageIndex) ? 'bg-indigo-600 text-white' : 'border border-slate-300 group-hover:border-slate-400'"
                >
                  <Check v-if="isPageSelected(page.pageIndex)" class="w-3 h-3 stroke-[3]" />
                </span>
              </div>

              <!-- Thumbnail image -->
              <div class="w-full h-36 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex items-center justify-center relative">
                <img
                  v-if="page.thumbnail"
                  :src="page.thumbnail"
                  class="w-full h-full object-contain"
                  alt="page preview"
                />
                <Loader2 v-else class="w-5 h-5 text-indigo-400 animate-spin" />
              </div>

              <!-- Page dimensions -->
              <div class="text-[10px] text-slate-400 font-mono mt-1.5 truncate">
                {{ page.widthMm }} × {{ page.heightMm }} mm
              </div>
            </div>
          </div>
        </div>

        <!-- Output Action Bar -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <!-- Progress bar -->
          <div v-if="isSplitting" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs text-indigo-700 font-semibold">
              <span class="flex items-center gap-1.5">
                <Loader2 class="w-3.5 h-3.5 animate-spin" />
                {{ splitStatusText }}
              </span>
              <span>{{ splitProgress }}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${splitProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- Bottom Execute Button -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div class="text-xs text-slate-500">
              <span v-if="splitMode === 'extract'">
                {{ t('tools.selectedPagesCount', { n: selectedSplitPages.length, total: splitDoc.pageCount }) }}
              </span>
              <span v-else-if="splitMode === 'single'">
                {{ t('tools.modeSingleDesc') }}
              </span>
              <span v-else-if="splitMode === 'interval'">
                {{ t('tools.estParts', { n: Math.ceil(splitDoc.pageCount / (intervalPageSize || 1)) }) }}
              </span>
              <span v-else-if="splitMode === 'oddeven'">
                {{ t('tools.modeOddEvenDesc') }}
              </span>
            </div>

            <button
              @click="executeSplit"
              :disabled="isSplitting || (splitMode === 'extract' && selectedSplitPages.length === 0)"
              class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-indigo-600/20 disabled:opacity-50"
            >
              <Download class="w-4 h-4" />
              <span>
                {{ splitMode === 'extract' ? t('tools.downloadPdf') : t('tools.splitBtn') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Layers,
  Scissors,
  FileText,
  UploadCloud,
  Download,
  Eye,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Check,
  CheckSquare,
  FolderArchive,
  RotateCw,
  Loader2
} from 'lucide-vue-next';
import { t } from '@/i18n';
import {
  inspectPdfFile,
  mergePdfDocuments,
  splitPdfExtractPages,
  splitPdfToSinglePagesZip,
  splitPdfByIntervalZip,
  splitPdfOddEven,
  parsePageRange,
  formatPageRange,
  renderPageThumbnail,
  downloadFile
} from '@/utils/pdfMergerSplitter';
import { PDFDocument } from 'pdf-lib';

// Active Sub-tab
const activeSubTab = ref('merge'); // 'merge' | 'split'

// ==========================================
// MERGE PDF STATE & LOGIC
// ==========================================
const mergeFiles = ref([]);
const mergeFileInput = ref(null);
const isDragOverMerge = ref(false);
const mergeOutputName = ref('merged_document.pdf');
const isMerging = ref(false);
const mergeProgress = ref(0);
const mergeStatusText = ref('');

const estimatedTotalPages = computed(() => {
  return mergeFiles.value.reduce((acc, curr) => acc + (curr.selectedPages ? curr.selectedPages.length : curr.pageCount), 0);
});

const triggerMergeFileInput = () => {
  if (mergeFileInput.value) {
    mergeFileInput.value.click();
  }
};

const handleMergeFileSelect = async (e) => {
  const files = Array.from(e.target.files || []);
  await processMergeFiles(files);
  e.target.value = '';
};

const handleMergeDrop = async (e) => {
  isDragOverMerge.value = false;
  const files = Array.from(e.dataTransfer.files || []).filter(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');
  await processMergeFiles(files);
};

const processMergeFiles = async (files) => {
  for (const file of files) {
    try {
      const info = await inspectPdfFile(file);
      info.rangeMode = 'all';
      info.pageRangeText = '';
      mergeFiles.value.push(info);
    } catch (err) {
      console.error('Failed to parse PDF file:', file.name, err);
      alert(`${t('tools.error')}${file.name}`);
    }
  }
};

const moveFile = (index, delta) => {
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex >= mergeFiles.value.length) return;
  const item = mergeFiles.value.splice(index, 1)[0];
  mergeFiles.value.splice(newIndex, 0, item);
};

const removeMergeFile = (index) => {
  mergeFiles.value.splice(index, 1);
};

const clearMergeFiles = () => {
  mergeFiles.value = [];
};

const setFileRangeMode = (item, mode) => {
  item.rangeMode = mode;
  if (mode === 'all') {
    item.selectedPages = Array.from({ length: item.pageCount }, (_, i) => i);
    item.pageRangeText = '';
  } else {
    item.selectedPages = parsePageRange(item.pageRangeText, item.pageCount);
  }
};

const onRangeTextInput = (item) => {
  item.selectedPages = parsePageRange(item.pageRangeText, item.pageCount);
};

const executeMergeAndDownload = async () => {
  if (mergeFiles.value.length === 0) {
    alert(t('tools.noFilesAlert'));
    return;
  }

  try {
    isMerging.value = true;
    mergeProgress.value = 5;
    mergeStatusText.value = t('tools.processing');

    const mergedBytes = await mergePdfDocuments(mergeFiles.value, (pct, status) => {
      mergeProgress.value = pct;
      mergeStatusText.value = status;
    });

    const filename = mergeOutputName.value.trim().endsWith('.pdf')
      ? mergeOutputName.value.trim()
      : `${mergeOutputName.value.trim()}.pdf`;

    downloadFile(mergedBytes, filename);
  } catch (err) {
    console.error('Merge error:', err);
    alert(`${t('tools.error')}${err.message}`);
  } finally {
    isMerging.value = false;
  }
};

const previewMergedPdf = async () => {
  if (mergeFiles.value.length === 0) {
    alert(t('tools.noFilesAlert'));
    return;
  }

  try {
    isMerging.value = true;
    mergeProgress.value = 10;
    mergeStatusText.value = t('tools.processing');

    const mergedBytes = await mergePdfDocuments(mergeFiles.value, (pct, status) => {
      mergeProgress.value = pct;
      mergeStatusText.value = status;
    });

    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    console.error('Preview error:', err);
    alert(`${t('tools.error')}${err.message}`);
  } finally {
    isMerging.value = false;
  }
};

// ==========================================
// SPLIT PDF STATE & LOGIC
// ==========================================
const splitDoc = ref(null);
const splitDocPages = ref([]);
const splitFileInput = ref(null);
const isDragOverSplit = ref(false);
const splitMode = ref('extract'); // 'extract' | 'single' | 'interval' | 'oddeven'
const intervalPageSize = ref(2);
const selectedSplitPages = ref([]);
const splitRangeText = ref('');
const isSplitting = ref(false);
const splitProgress = ref(0);
const splitStatusText = ref('');

const triggerSplitFileInput = () => {
  if (splitFileInput.value) {
    splitFileInput.value.click();
  }
};

const handleSplitFileSelect = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) await loadSplitFile(file);
  e.target.value = '';
};

const handleSplitDrop = async (e) => {
  isDragOverSplit.value = false;
  const file = Array.from(e.dataTransfer.files || []).find(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');
  if (file) await loadSplitFile(file);
};

const loadSplitFile = async (file) => {
  try {
    const info = await inspectPdfFile(file);
    splitDoc.value = info;

    // Initialize all pages array
    selectedSplitPages.value = Array.from({ length: info.pageCount }, (_, i) => i);
    splitRangeText.value = formatPageRange(selectedSplitPages.value);

    // Prepare pages preview list
    splitDocPages.value = Array.from({ length: info.pageCount }, (_, i) => ({
      pageIndex: i,
      pageNumber: i + 1,
      thumbnail: null,
      widthMm: info.firstPageInfo ? info.firstPageInfo.widthMm : 0,
      heightMm: info.firstPageInfo ? info.firstPageInfo.heightMm : 0
    }));

    // Lazy render thumbnails in background
    renderSplitPageThumbnails(info.file, info.pageCount);
  } catch (err) {
    console.error('Load split file error:', err);
    alert(`${t('tools.error')}${err.message}`);
  }
};

const renderSplitPageThumbnails = async (file, pageCount) => {
  try {
    const rawBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(rawBuffer.slice(0), { ignoreEncryption: true });
    for (let i = 0; i < pageCount; i++) {
      if (!splitDoc.value) break; // if file changed
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const wMm = Math.round(width * 25.4 / 72);
      const hMm = Math.round(height * 25.4 / 72);

      splitDocPages.value[i].widthMm = wMm;
      splitDocPages.value[i].heightMm = hMm;

      // Render thumbnail with cloned buffer
      const thumb = await renderPageThumbnail(rawBuffer.slice(0), i + 1, 200);
      if (thumb && splitDocPages.value[i]) {
        splitDocPages.value[i].thumbnail = thumb.thumbnail;
      }
    }
  } catch (err) {
    console.warn('Page thumbnails rendering interrupted:', err);
  }
};

const isPageSelected = (pageIndex) => {
  return selectedSplitPages.value.includes(pageIndex);
};

const toggleSplitPage = (pageIndex) => {
  if (isPageSelected(pageIndex)) {
    selectedSplitPages.value = selectedSplitPages.value.filter(p => p !== pageIndex);
  } else {
    selectedSplitPages.value = [...selectedSplitPages.value, pageIndex].sort((a, b) => a - b);
  }
  splitRangeText.value = formatPageRange(selectedSplitPages.value);
};

const selectAllSplitPages = () => {
  if (!splitDoc.value) return;
  selectedSplitPages.value = Array.from({ length: splitDoc.value.pageCount }, (_, i) => i);
  splitRangeText.value = formatPageRange(selectedSplitPages.value);
};

const deselectAllSplitPages = () => {
  selectedSplitPages.value = [];
  splitRangeText.value = '';
};

const selectOddSplitPages = () => {
  if (!splitDoc.value) return;
  selectedSplitPages.value = Array.from({ length: splitDoc.value.pageCount }, (_, i) => i).filter(i => (i + 1) % 2 === 1);
  splitRangeText.value = formatPageRange(selectedSplitPages.value);
};

const selectEvenSplitPages = () => {
  if (!splitDoc.value) return;
  selectedSplitPages.value = Array.from({ length: splitDoc.value.pageCount }, (_, i) => i).filter(i => (i + 1) % 2 === 0);
  splitRangeText.value = formatPageRange(selectedSplitPages.value);
};

const onSplitRangeInput = () => {
  if (!splitDoc.value) return;
  selectedSplitPages.value = parsePageRange(splitRangeText.value, splitDoc.value.pageCount);
};

const executeSplit = async () => {
  if (!splitDoc.value) return;

  try {
    isSplitting.value = true;
    splitProgress.value = 5;
    splitStatusText.value = t('tools.processing');

    const cleanBaseName = splitDoc.value.name.replace(/\.pdf$/i, '');
    const srcBuffer = splitDoc.value.file && typeof splitDoc.value.file.arrayBuffer === 'function'
      ? await splitDoc.value.file.arrayBuffer()
      : splitDoc.value.arrayBuffer.slice(0);

    if (splitMode.value === 'extract') {
      if (selectedSplitPages.value.length === 0) {
        alert(t('tools.noPagesAlert'));
        isSplitting.value = false;
        return;
      }
      const outBytes = await splitPdfExtractPages(srcBuffer, selectedSplitPages.value);
      downloadFile(outBytes, `${cleanBaseName}_extracted.pdf`);
    } else if (splitMode.value === 'single') {
      const pagesToExport = selectedSplitPages.value.length > 0
        ? selectedSplitPages.value
        : Array.from({ length: splitDoc.value.pageCount }, (_, i) => i);

      const zipBlob = await splitPdfToSinglePagesZip(
        srcBuffer,
        pagesToExport,
        cleanBaseName,
        (pct, status) => {
          splitProgress.value = pct;
          splitStatusText.value = status;
        }
      );
      downloadFile(zipBlob, `${cleanBaseName}_single_pages.zip`, 'application/zip');
    } else if (splitMode.value === 'interval') {
      const interval = Math.max(1, parseInt(intervalPageSize.value, 10) || 1);
      const { zipBlob } = await splitPdfByIntervalZip(
        srcBuffer,
        interval,
        cleanBaseName,
        (pct, status) => {
          splitProgress.value = pct;
          splitStatusText.value = status;
        }
      );
      downloadFile(zipBlob, `${cleanBaseName}_interval_${interval}pages.zip`, 'application/zip');
    } else if (splitMode.value === 'oddeven') {
      const { zipBlob } = await splitPdfOddEven(srcBuffer, cleanBaseName);
      downloadFile(zipBlob, `${cleanBaseName}_odd_even.zip`, 'application/zip');
    }

    splitProgress.value = 100;
  } catch (err) {
    console.error('Split error:', err);
    alert(`${t('tools.error')}${err.message}`);
  } finally {
    isSplitting.value = false;
  }
};

// ==========================================
// UTILITY
// ==========================================
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
</script>
