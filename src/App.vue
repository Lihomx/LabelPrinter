<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Top Navigation Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Printer class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-base tracking-tight text-slate-900">{{ t('app.title') }}</span>
              <span class="px-2 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-700 rounded-full">v1.0 Pro</span>
            </div>
            <div class="text-[11px] text-slate-400 font-medium hidden sm:block">{{ t('app.tagline') }}</div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex items-center bg-slate-100 p-1 rounded-xl">
          <button 
            @click="currentTab = 'splitter'"
            class="px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            :class="currentTab === 'splitter' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Scissors class="w-3.5 h-3.5" />
            <span>{{ t('nav.pdfSplitter') }}</span>
          </button>

          <button 
            @click="currentTab = 'template'"
            class="px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            :class="currentTab === 'template' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <FileSpreadsheet class="w-3.5 h-3.5" />
            <span>{{ t('nav.templates') }}</span>
          </button>

          <button 
            @click="currentTab = 'designer'"
            class="px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            :class="currentTab === 'designer' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            <Palette class="w-3.5 h-3.5" />
            <span>{{ t('nav.designer') }}</span>
          </button>
        </nav>

        <!-- Right Side: Printer Status & Language Toggle -->
        <div class="flex items-center gap-3">
          <!-- Printer Status Pill -->
          <div class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>热敏驱动: 203 DPI · 零边距锁死</span>
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
        <PdfSplitter v-if="currentTab === 'splitter'" />
        <TemplateGenerator v-else-if="currentTab === 'template'" />
        <LabelDesigner v-else-if="currentTab === 'designer'" />
      </transition>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
      LabelMaster Pro · 专为跨境电商/海外仓打造的高保真热敏打印与智能拆分工作站
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Printer, Scissors, FileSpreadsheet, Palette, Languages } from 'lucide-vue-next';
import { t, toggleLang } from '@/i18n';
import PdfSplitter from '@/components/PdfSplitter.vue';
import TemplateGenerator from '@/components/TemplateGenerator.vue';
import LabelDesigner from '@/components/LabelDesigner.vue';

const currentTab = ref('splitter');
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
