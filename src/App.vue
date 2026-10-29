<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Top Navigation Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4rem] sm:min-h-[4.25rem] py-2 flex items-center justify-between gap-3">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <div class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Printer class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-base tracking-tight text-slate-900">{{ t('app.title') }}</span>
              <span class="px-2 py-0.5 text-[10px] font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs rounded-full">v2.0 Pro</span>
            </div>
            <div class="text-[11px] text-slate-400 font-medium hidden sm:block whitespace-nowrap truncate max-w-[200px] md:max-w-[260px] lg:max-w-xs xl:max-w-none mt-0.5">{{ t('app.tagline') }}</div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex items-center bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
          <button 
            @click="currentTab = 'splitter'"
            class="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
            :class="currentTab === 'splitter' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Scissors class="w-3.5 h-3.5" />
            <span>{{ t('nav.pdfSplitter') }}</span>
          </button>

          <button 
            @click="currentTab = 'extractor'"
            class="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
            :class="currentTab === 'extractor' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span class="font-bold">{{ t('nav.pdfExtractor') }}</span>
            <span class="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] rounded-full font-black">{{ t('nav.vectorHd') }}</span>
          </button>

          <button 
            @click="currentTab = 'tools'"
            class="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
            :class="currentTab === 'tools' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Layers class="w-3.5 h-3.5" />
            <span class="font-bold">{{ t('nav.pdfTools') }}</span>
            <span class="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[9px] rounded-full font-black">{{ t('nav.newBadge') }}</span>
          </button>

          <button 
            @click="currentTab = 'template'"
            class="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
            :class="currentTab === 'template' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <FileSpreadsheet class="w-3.5 h-3.5" />
            <span>{{ t('nav.templates') }}</span>
          </button>

          <button 
            @click="currentTab = 'designer'"
            class="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
            :class="currentTab === 'designer' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Palette class="w-3.5 h-3.5" />
            <span>{{ t('nav.designer') }}</span>
          </button>
        </nav>

        <!-- Right Side: Printer Status & Language Toggle -->
        <div class="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <!-- Printer Status Pill -->
          <div 
            class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
            :class="isElectron 
              ? (hasPrinters ? (is4Barcode ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs' : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs') : 'bg-amber-50 text-amber-800 border-amber-300') 
              : 'bg-indigo-50 text-indigo-800 border-indigo-200'"
            :title="isElectron ? (activePrinterName ? '当前目标打印机: ' + activePrinterName : '正在连接热敏机') : '浏览器免驱运行'"
          >
            <span 
              v-if="!is4Barcode"
              class="w-2 h-2 rounded-full" 
              :class="isElectron ? (hasPrinters ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500') : 'bg-indigo-500 animate-pulse'"
            ></span>
            <span v-if="isElectron && is4Barcode" class="flex items-center gap-1.5 font-bold">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>🏷️ 4BARCODE 4B-2054L (TSPL 就绪)</span>
            </span>
            <span v-else-if="isElectron && activePrinterName">⚡ {{ activePrinterName }}</span>
            <span v-else-if="isElectron">⚡ 桌面客户端就绪</span>
            <span v-else>🌐 浏览器免驱模式 (高清矢量输出)</span>
          </div>

          <!-- Bilingual Toggle Button -->
          <button 
            @click="toggleLang"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <Languages class="w-3.5 h-3.5 text-brand-600" />
            <span>{{ t('app.switchLang') }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Dynamic Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <transition name="fade" mode="out-in">
        <PdfSplitter v-if="currentTab === 'splitter'" @switch-tab="t => currentTab = t" />
        <PdfExtractorDesigner v-else-if="currentTab === 'extractor'" @switch-tab="t => currentTab = t" />
        <PdfMergeSplit v-else-if="currentTab === 'tools'" />
        <TemplateGenerator v-else-if="currentTab === 'template'" />
        <LabelDesigner v-else-if="currentTab === 'designer'" />
      </transition>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
      {{ t('app.footerText') }}
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Printer, Scissors, Sparkles, Layers, FileSpreadsheet, Palette, Languages } from 'lucide-vue-next';
import { t, toggleLang } from '@/i18n';
import PdfSplitter from '@/components/PdfSplitter.vue';
import PdfExtractorDesigner from '@/components/PdfExtractorDesigner.vue';
import PdfMergeSplit from '@/components/PdfMergeSplit.vue';
import TemplateGenerator from '@/components/TemplateGenerator.vue';
import LabelDesigner from '@/components/LabelDesigner.vue';

const validTabs = ['splitter', 'extractor', 'tools', 'template', 'designer'];
const savedTab = typeof window !== 'undefined' ? localStorage.getItem('labelmaster_current_tab') : null;
const currentTab = ref(validTabs.includes(savedTab) ? savedTab : 'splitter');

watch(currentTab, (val) => {
  try {
    localStorage.setItem('labelmaster_current_tab', val);
  } catch (e) {}
});

const isElectron = ref(typeof window !== 'undefined' && Boolean(window.electronAPI));
const activePrinterName = ref((typeof window !== 'undefined' && localStorage.getItem('labelmaster_selected_printer')) || '');
const hasPrinters = ref(false);

const is4Barcode = computed(() => {
  return /4b-2054|4barcode|tspl/i.test(activePrinterName.value || '');
});

const checkPrinters = async () => {
  if (isElectron.value && window.electronAPI?.getPrinters) {
    try {
      const res = await window.electronAPI.getPrinters();
      if (res?.success && res.printers?.length > 0) {
        hasPrinters.value = true;
        const saved = localStorage.getItem('labelmaster_selected_printer');
        const match = res.printers.find(p => p.name === saved) || res.printers.find(p => p.isDefault) || res.printers[0];
        if (match) {
          activePrinterName.value = match.name;
        }
      }
    } catch (e) {}
  }
};

onMounted(() => {
  checkPrinters();
  // Listen for storage changes from other components
  window.addEventListener('storage', (e) => {
    if (e.key === 'labelmaster_selected_printer') {
      activePrinterName.value = e.newValue || '';
    }
  });
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
