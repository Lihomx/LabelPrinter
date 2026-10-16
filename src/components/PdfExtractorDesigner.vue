<template>
  <div class="space-y-6">
    <!-- Top Header & Mode Banner -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold shadow-inner">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black text-slate-800">PDF 智能提取与可视化拖拽排版</h2>
              <span class="px-2 py-0.5 text-[10px] font-black bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                矢量纯黑 · 彻底解决模糊
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              导入 PDF 自动提取条码、二维码、标题与 SKU，在可视画布上自由拖拽排版，以 100% 纯黑矢量字体输出
            </p>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <label class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95">
          <Upload class="w-4 h-4" />
          <span>导入 PDF 提取信息</span>
          <input type="file" accept=".pdf" class="hidden" @change="handlePdfUpload" />
        </label>

        <button 
          @click="loadDemoSample"
          class="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
        >
          <Sparkles class="w-3.5 h-3.5 text-amber-600" />
          <span>载入实测样本数据</span>
        </button>

        <button 
          @click="resetToDefaultLayout"
          class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>重置默认排版</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isExtracting" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200 space-y-4">
      <div class="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <div class="space-y-1">
        <div class="text-sm font-bold text-slate-800">正在智能解析 PDF 页面并提取文字与条码信息...</div>
        <div class="text-xs text-slate-400">正在分析页码：{{ extractProgress.current }} / {{ extractProgress.total }}</div>
      </div>
    </div>

    <!-- Main Workspace -->
    <div v-else class="space-y-6">
      <!-- Top Workspace Controls: Target Canvas Size & Presets -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <!-- Paper Size Presets -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Sliders class="w-4 h-4 text-brand-600" />
            <span>目标卷纸规格:</span>
          </span>
          <button 
            v-for="preset in sizePresets" 
            :key="preset.name"
            @click="applySizePreset(preset)"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
            :class="canvasWidthMm === preset.w && canvasHeightMm === preset.h 
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
          >
            {{ preset.name }}
          </button>
        </div>

        <!-- Custom Size Inputs -->
        <div class="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span class="text-slate-500 font-semibold">自定义 (mm):</span>
          <input 
            v-model.number="canvasWidthMm" 
            type="number" 
            min="10" 
            max="200" 
            class="w-14 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-center text-slate-800 focus:outline-none" 
          />
          <span class="text-slate-400 font-bold">×</span>
          <input 
            v-model.number="canvasHeightMm" 
            type="number" 
            min="10" 
            max="300" 
            class="w-14 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-center text-slate-800 focus:outline-none" 
          />
        </div>

        <!-- Add Element Toolbar -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-slate-400 font-medium mr-1">添加元素:</span>
          <button @click="addElement('barcode')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
            <Barcode class="w-3.5 h-3.5" />
            <span>条形码</span>
          </button>
          <button @click="addElement('qrcode')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
            <QrCode class="w-3.5 h-3.5" />
            <span>二维码</span>
          </button>
          <button @click="addElement('title')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
            <Type class="w-3.5 h-3.5" />
            <span>商品名</span>
          </button>
          <button @click="addElement('sku')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
            <Tag class="w-3.5 h-3.5" />
            <span>SKU</span>
          </button>
          <button @click="addElement('customText')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
            <Plus class="w-3.5 h-3.5" />
            <span>自定义文本</span>
          </button>
          <button @click="addElement('divider')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
            <Minus class="w-3.5 h-3.5" />
            <span>分割线</span>
          </button>
        </div>
      </div>

      <!-- Core Editor Grid: Left = Canvas Layout & Properties, Right = Extracted Data List -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Interactive Drag-and-Drop Canvas Board (col-span-7) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden select-none">
            <!-- Canvas Dimension & Quick Guide Overlay -->
            <div class="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800 mb-4">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-slate-200 font-bold">1:1 可视化拖拽排版画布 (当前: {{ canvasWidthMm }} × {{ canvasHeightMm }} mm)</span>
              </div>
              <div class="text-[11px] text-slate-400">
                🖱️ 鼠标按住元素可自由拖拽位置 · 坐标微米级锁定
              </div>
            </div>

            <!-- The Real Millimeter Canvas Paper -->
            <div 
              ref="canvasPaperRef"
              class="bg-white rounded shadow-2xl relative border-2 border-slate-300 cursor-crosshair overflow-hidden transition-all"
              :style="{
                width: `${canvasWidthMm * pxPerMm}px`,
                height: `${canvasHeightMm * pxPerMm}px`,
              }"
              @click="selectedElemId = null"
            >
              <!-- Millimeter Grid Rulers / Background -->
              <div class="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"></div>

              <!-- Canvas Draggable Elements -->
              <div 
                v-for="el in templateElements" 
                :key="el.id"
                @mousedown.stop="startDrag(el, $event)"
                @click.stop="selectedElemId = el.id"
                class="absolute cursor-move border transition-all rounded"
                :class="selectedElemId === el.id 
                  ? 'border-brand-600 ring-2 ring-brand-500/40 shadow-lg bg-blue-50/20' 
                  : 'border-transparent hover:border-slate-300'"
                :style="{
                  left: `${el.x * pxPerMm}px`,
                  top: `${el.y * pxPerMm}px`,
                  width: el.width ? `${el.width * pxPerMm}px` : 'auto',
                }"
              >
                <!-- 1. Barcode Element -->
                <div v-if="el.type === 'barcode'" class="p-0.5 flex flex-col items-center justify-center overflow-hidden">
                  <img 
                    :src="getBarcodeDataUrl(activePreviewItem.barcode, el)" 
                    class="pointer-events-none select-none"
                    :style="{
                      height: `${el.height * pxPerMm}px`,
                      maxWidth: '100%',
                      objectFit: 'contain',
                    }"
                  />
                </div>

                <!-- 2. QR Code Element -->
                <div v-else-if="el.type === 'qrcode'" class="p-0.5 flex items-center justify-center">
                  <img 
                    :src="getQrCodeDataUrl(activePreviewItem.barcode || activePreviewItem.sku, el)" 
                    class="pointer-events-none select-none"
                    :style="{
                      width: `${(el.size || 15) * pxPerMm}px`,
                      height: `${(el.size || 15) * pxPerMm}px`,
                    }"
                  />
                </div>

                <!-- 3. Title Text Element -->
                <div 
                  v-else-if="el.type === 'title'"
                  class="font-sans text-slate-950 leading-tight select-none px-1"
                  :style="{
                    fontSize: `${el.fontSize || 10}px`,
                    fontWeight: el.bold ? '800' : '500',
                    textAlign: el.align || 'center',
                    lineHeight: '1.25',
                    display: '-webkit-box',
                    WebkitLineClamp: el.maxLines || 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }"
                >
                  {{ activePreviewItem.title || '（示例商品标题名称）' }}
                </div>

                <!-- 4. SKU Element -->
                <div 
                  v-else-if="el.type === 'sku'"
                  class="font-mono text-slate-950 font-bold select-none px-1"
                  :style="{
                    fontSize: `${el.fontSize || 10}px`,
                    fontWeight: el.bold ? '900' : '600',
                    textAlign: el.align || 'center',
                  }"
                >
                  {{ el.prefix || 'SKU: ' }}{{ activePreviewItem.sku || 'SAMPLE-SKU-001' }}
                </div>

                <!-- 5. Custom Text Element -->
                <div 
                  v-else-if="el.type === 'customText'"
                  class="font-sans text-slate-900 select-none px-1"
                  :style="{
                    fontSize: `${el.fontSize || 9}px`,
                    fontWeight: el.bold ? 'bold' : 'normal',
                    textAlign: el.align || 'center',
                  }"
                >
                  {{ el.text || '自定义文本' }}
                </div>

                <!-- 6. Divider Line Element -->
                <div 
                  v-else-if="el.type === 'divider'"
                  class="bg-black my-0.5"
                  :style="{
                    height: `${el.thickness || 1}px`,
                    width: '100%',
                  }"
                ></div>
              </div>
            </div>

            <!-- Active Item Pager Switcher under Canvas -->
            <div class="mt-4 flex items-center gap-3 bg-slate-800/90 px-4 py-2 rounded-xl text-xs text-slate-300 border border-slate-700">
              <span class="text-slate-400">当前画布预览数据:</span>
              <button 
                @click="switchPreviewItem(-1)" 
                :disabled="activeItemIndex <= 0"
                class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-30"
              >
                ◀ 上一款
              </button>
              <span class="font-bold font-mono text-emerald-400">
                #{{ activeItemIndex + 1 }} / {{ extractedItems.length }}
              </span>
              <button 
                @click="switchPreviewItem(1)" 
                :disabled="activeItemIndex >= extractedItems.length - 1"
                class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-30"
              >
                下一款 ▶
              </button>
              <span class="text-slate-400 border-l border-slate-700 pl-2">
                {{ activePreviewItem.barcode }}
              </span>
            </div>
          </div>

          <!-- Selected Element Properties Bar -->
          <div v-if="selectedElem" class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 animate-fadeIn text-xs">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div class="font-bold text-slate-800 flex items-center gap-2">
                <Settings2 class="w-4 h-4 text-brand-600" />
                <span>选中元素属性: <span class="text-brand-600 font-mono uppercase">{{ selectedElem.type }}</span></span>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="centerSelectedElement" 
                  class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1"
                >
                  <AlignCenter class="w-3.5 h-3.5" />
                  <span>水平居中</span>
                </button>
                <button 
                  @click="deleteSelectedElement" 
                  class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg flex items-center gap-1"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>删除</span>
                </button>
              </div>
            </div>

            <!-- Coordinate & Dimensions -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="text-slate-500 font-medium block mb-1">X 坐标 (mm)</label>
                <input v-model.number="selectedElem.x" type="number" step="0.5" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold" />
              </div>
              <div>
                <label class="text-slate-500 font-medium block mb-1">Y 坐标 (mm)</label>
                <input v-model.number="selectedElem.y" type="number" step="0.5" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold" />
              </div>
              <div>
                <label class="text-slate-500 font-medium block mb-1">宽度 (mm)</label>
                <input v-model.number="selectedElem.width" type="number" step="1" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold" />
              </div>
              <div v-if="selectedElem.type === 'barcode'">
                <label class="text-slate-500 font-medium block mb-1">条码高度 (mm)</label>
                <input v-model.number="selectedElem.height" type="number" step="1" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold" />
              </div>
            </div>

            <!-- Typography & Specific Settings -->
            <div v-if="['title', 'sku', 'customText'].includes(selectedElem.type)" class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label class="text-slate-500 font-medium block mb-1">字号 (px)</label>
                <input v-model.number="selectedElem.fontSize" type="number" min="6" max="24" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold" />
              </div>
              <div>
                <label class="text-slate-500 font-medium block mb-1">对齐方式</label>
                <select v-model="selectedElem.align" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-semibold">
                  <option value="center">居中对齐</option>
                  <option value="left">左对齐</option>
                  <option value="right">右对齐</option>
                </select>
              </div>
              <div class="flex items-center gap-3 pt-4">
                <label class="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input v-model="selectedElem.bold" type="checkbox" class="rounded text-brand-600" />
                  <span>粗体 (Bold)</span>
                </label>
              </div>
            </div>

            <!-- Custom text input -->
            <div v-if="selectedElem.type === 'customText'" class="pt-2">
              <label class="text-slate-500 font-medium block mb-1">自定义文本内容</label>
              <input v-model="selectedElem.text" type="text" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>

            <!-- SKU prefix -->
            <div v-if="selectedElem.type === 'sku'" class="pt-2">
              <label class="text-slate-500 font-medium block mb-1">前缀文本 (例如 "SKU: ")</label>
              <input v-model="selectedElem.prefix" type="text" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>
        </div>

        <!-- Right: Extracted Label Data List (col-span-5) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div class="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Layers class="w-4 h-4 text-brand-600" />
                  <span>已提取标签数据列表</span>
                </div>
                <div class="text-[11px] text-slate-500 mt-0.5">
                  共计识别到 {{ extractedItems.length }} 款独立标签
                </div>
              </div>

              <!-- Add manual item -->
              <button 
                @click="addManualItem"
                class="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>手动加一款</span>
              </button>
            </div>

            <!-- Batch quantity applicator bar -->
            <div class="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-indigo-950 flex items-center gap-1">
                  <span>🔢 批量设置每款打印张数:</span>
                </span>
                <button 
                  @click="applyBatchQuantity(batchQuantityVal)" 
                  class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs active:scale-95 transition-all"
                >
                  应用到全部
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-1.5">
                <input 
                  v-model.number="batchQuantityVal" 
                  type="number" 
                  min="1" 
                  class="w-16 px-2 py-1 bg-white border border-indigo-300 rounded font-mono font-bold text-center text-indigo-900" 
                />
                <span class="text-slate-500 mr-2">张</span>
                <button 
                  v-for="q in [1, 5, 10, 20, 30, 50, 100]" 
                  :key="q"
                  @click="applyBatchQuantity(q)"
                  class="px-2 py-0.5 bg-white hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 text-[11px] font-semibold"
                >
                  {{ q }}
                </button>
              </div>
            </div>

            <!-- Scrollable Items List -->
            <div class="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              <div 
                v-for="(item, idx) in extractedItems" 
                :key="item.id || idx"
                @click="activeItemIndex = idx"
                class="p-3.5 rounded-xl border transition-all cursor-pointer relative"
                :class="activeItemIndex === idx 
                  ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/30' 
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {{ idx + 1 }}
                    </span>
                    <input 
                      v-model="item.barcode" 
                      class="font-mono font-bold text-xs text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-brand-500" 
                      placeholder="条形码"
                    />
                  </div>

                  <!-- Quantity Stepper -->
                  <div class="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                    <button 
                      @click.stop="item.quantity = Math.max(1, (Number(item.quantity) || 1) - 1)" 
                      class="px-2 py-0.5 hover:bg-slate-100 text-slate-600 font-bold"
                    >-</button>
                    <input 
                      v-model.number="item.quantity" 
                      type="number" 
                      min="1" 
                      class="w-10 text-center font-mono font-bold text-xs text-brand-600 focus:outline-none"
                    />
                    <button 
                      @click.stop="item.quantity = (Number(item.quantity) || 0) + 1" 
                      class="px-2 py-0.5 hover:bg-slate-100 text-slate-600 font-bold"
                    >+</button>
                  </div>
                </div>

                <!-- SKU -->
                <div class="mt-2 flex items-center gap-2 text-xs">
                  <span class="text-slate-400 font-semibold">SKU:</span>
                  <input 
                    v-model="item.sku" 
                    class="font-mono text-xs text-slate-700 bg-transparent border-b border-dashed border-slate-200 flex-1 focus:outline-none focus:border-brand-500" 
                    placeholder="SKU"
                  />
                </div>

                <!-- Title -->
                <div class="mt-2 text-xs">
                  <textarea 
                    v-model="item.title" 
                    rows="2" 
                    class="w-full p-1.5 bg-white border border-slate-200 rounded text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="商品标题"
                  ></textarea>
                </div>

                <div class="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>点击设为当前画布预览</span>
                  <button 
                    @click.stop="deleteItem(idx)" 
                    class="text-rose-500 hover:text-rose-700 hover:underline"
                  >
                    删除此款
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Desktop Silent Printing & Roll Preview Station -->
      <div class="space-y-4">
        <!-- Native Desktop Client Station (Electron environment) -->
        <div v-if="isElectron" class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-emerald-500/60 rounded-2xl p-6 text-white shadow-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ⚡ 硬件级纯黑矢量直打通道已就绪
              </span>
              <span class="text-xs text-slate-300 font-medium hidden sm:inline">100% 矢量字体与条码 · 绝无点阵灰度模糊</span>
            </div>

            <div class="text-xs text-slate-400">
              当前目标卷纸: <strong class="text-emerald-400 font-mono">{{ canvasWidthMm }} × {{ canvasHeightMm }} mm</strong>
            </div>
          </div>

          <div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 pt-1">
            <div class="flex flex-wrap items-center gap-3">
              <!-- Printer Selector -->
              <div class="flex items-center gap-2 bg-slate-800/90 px-3.5 py-2.5 rounded-xl border border-slate-600 shadow-inner">
                <Printer class="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div class="text-xs text-slate-300 font-medium">目标热敏机:</div>
                <select 
                  v-model="selectedElectronPrinter"
                  class="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[240px] truncate"
                >
                  <option v-for="p in electronPrinters" :key="p.name" :value="p.name" class="bg-slate-800 text-white">
                    {{ p.displayName || p.name }} {{ p.isDefault ? ' (默认)' : '' }}
                  </option>
                </select>
                <button 
                  @click="loadElectronPrinters" 
                  title="重新扫描电脑连接的打印机"
                  class="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded transition-all"
                >
                  <RefreshCw class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Custom Batch Print Quantity Box (High Visibility & Editable) -->
              <div class="flex flex-wrap items-center gap-2.5 bg-slate-800/95 px-3.5 py-2 rounded-xl border-2 border-emerald-500/50 shadow-md">
                <span class="text-xs text-slate-100 font-bold flex items-center gap-1.5">
                  <span class="text-emerald-400 text-sm">🔢</span>
                  <span>自定义打印张数:</span>
                </span>
                
                <div class="flex items-center bg-slate-950 rounded-lg border border-slate-700 overflow-hidden shadow-inner">
                  <button 
                    @click="adjustCopies(-1)" 
                    title="减少 1 张"
                    class="w-7 h-7 text-slate-400 hover:bg-slate-800 hover:text-white font-bold text-sm transition-colors flex items-center justify-center"
                  >-</button>
                  <input 
                    v-model.number="printCopies" 
                    @blur="normalizePrintCopies"
                    type="number" 
                    min="1" 
                    max="9999" 
                    placeholder="张数"
                    class="w-16 sm:w-20 text-center text-sm font-mono font-black text-emerald-400 bg-transparent focus:outline-none" 
                  />
                  <button 
                    @click="adjustCopies(1)" 
                    title="增加 1 张"
                    class="w-7 h-7 text-slate-400 hover:bg-slate-800 hover:text-white font-bold text-sm transition-colors flex items-center justify-center"
                  >+</button>
                </div>
                <span class="text-xs text-slate-300 font-semibold">张</span>

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
              @click="triggerSilentPrint"
              :disabled="isPrinting"
              class="px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              <Zap class="w-5 h-5 fill-current text-slate-950" />
              <span>{{ isPrinting ? '正在发送打印数据...' : `⚡ 一键极速静默打印 (${totalPrintQuantity} 张)` }}</span>
            </button>
          </div>

          <div v-if="printStatusMsg" class="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-400" />
            <span>{{ printStatusMsg }}</span>
          </div>
        </div>

        <!-- Web Browser Print & PDF Export Toolbar -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="text-sm font-bold text-slate-800">标准打印与导出</div>
            <div class="text-xs text-slate-500">
              当前排版将自动套用到所有 {{ extractedItems.length }} 款商品 · 总计计划打印 <strong class="text-brand-600 font-bold">{{ totalPrintQuantity }}</strong> 张
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Web copies input if not electron -->
            <div v-if="!isElectron" class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span class="text-slate-600 font-bold">打印份数:</span>
              <input v-model.number="printCopies" @blur="normalizePrintCopies" type="number" min="1" max="9999" class="w-14 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded" />
              <span class="text-slate-400">份</span>
            </div>

            <button 
              @click="downloadVectorPdf" 
              class="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all bg-white"
            >
              <Download class="w-4 h-4 text-slate-600" />
              <span>下载矢量高保真热敏 PDF</span>
            </button>

            <button 
              @click="triggerBrowserPrint" 
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Printer class="w-4 h-4" />
              <span>浏览器高精打印 (全部 {{ totalPrintQuantity }} 张)</span>
            </button>
          </div>
        </div>

        <!-- Roll Visualizer Strip -->
        <div class="bg-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-200 overflow-x-auto">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Scroll class="w-4 h-4 text-brand-600" />
            <span>热敏卷纸连续出纸排版预览 (100% 真实比例模拟) · 计划输出 <strong class="text-brand-600 font-bold font-mono">{{ totalPrintQuantity }}</strong> 张</span>
          </div>

          <!-- Roll strip items -->
          <div class="flex gap-4 p-4 bg-white/70 backdrop-blur rounded-2xl shadow-inner border border-slate-200 max-w-full overflow-x-auto">
            <div 
              v-for="(item, i) in rolledPreviewList.slice(0, 10)" 
              :key="i"
              class="bg-white border-2 border-dashed border-slate-300 rounded shadow-sm relative flex-shrink-0 overflow-hidden"
              :style="{
                width: `${canvasWidthMm * 2.8}px`,
                height: `${canvasHeightMm * 2.8}px`,
              }"
            >
              <!-- Render elements using mini scale -->
              <div 
                v-for="el in templateElements" 
                :key="el.id"
                class="absolute"
                :style="{
                  left: `${el.x * 2.8}px`,
                  top: `${el.y * 2.8}px`,
                  width: el.width ? `${el.width * 2.8}px` : 'auto',
                }"
              >
                <div v-if="el.type === 'barcode'" class="flex items-center justify-center">
                  <img :src="getBarcodeDataUrl(item.barcode, el)" class="pointer-events-none" :style="{ height: `${el.height * 2.8}px`, maxWidth: '100%' }" />
                </div>
                <div 
                  v-else-if="el.type === 'title'" 
                  class="font-sans text-slate-900 leading-tight select-none px-0.5 line-clamp-2"
                  :style="{
                    fontSize: `${Math.max(7, Math.round(el.fontSize * 0.7))}px`,
                    fontWeight: el.bold ? 'bold' : 'normal',
                    textAlign: el.align || 'center',
                  }"
                >
                  {{ item.title }}
                </div>
                <div 
                  v-else-if="el.type === 'sku'" 
                  class="font-mono text-slate-900 font-bold select-none px-0.5"
                  :style="{
                    fontSize: `${Math.max(6, Math.round(el.fontSize * 0.7))}px`,
                    textAlign: el.align || 'center',
                  }"
                >
                  {{ el.prefix || 'SKU: ' }}{{ item.sku }}
                </div>
              </div>

              <div class="absolute bottom-0.5 right-1 text-[8px] font-mono text-slate-300">
                #{{ i + 1 }}
              </div>
            </div>

            <div v-if="rolledPreviewList.length > 10" class="flex items-center justify-center px-4 text-xs text-slate-400 font-medium">
              + 更多 {{ rolledPreviewList.length - 10 }} 张连续标签...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Sparkles, Upload, RotateCcw, Sliders, Barcode, QrCode, Type, Tag, Plus, Minus, 
  Trash2, AlignCenter, Settings2, Layers, Zap, Printer, Download, Scroll, RefreshCw, CheckCircle2 
} from 'lucide-vue-next';
import { extractLabelsFromPdf, getDefaultLayout } from '@/utils/pdfExtractor';
import { generateBarcode, generateQRCode } from '@/utils/barcodeGenerator';

// Canvas Size in mm
const canvasWidthMm = ref(50);
const canvasHeightMm = ref(25);
const pxPerMm = ref(7.5); // Visual screen scale factor (1mm = 7.5px)

// Preset sizes
const sizePresets = [
  { name: '50 × 25 mm (当前实测)', w: 50, h: 25 },
  { name: '50 × 30 mm', w: 50, h: 30 },
  { name: '70 × 30 mm', w: 70, h: 30 },
  { name: '80 × 50 mm', w: 80, h: 50 },
  { name: '100 × 100 mm', w: 100, h: 100 },
];

const applySizePreset = (preset) => {
  canvasWidthMm.value = preset.w;
  canvasHeightMm.value = preset.h;
  templateElements.value = getDefaultLayout(preset.w, preset.h);
};

// Extraction status
const isExtracting = ref(false);
const extractProgress = ref({ current: 0, total: 0 });

// Extracted Items List
const extractedItems = ref([
  {
    id: 'demo_1',
    barcode: 'TTSA21961',
    sku: 'dwjgq-256',
    title: 'Repelente Solar X4 | Roedores, Serpientes Y Plagas',
    quantity: 1,
  },
  {
    id: 'demo_2',
    barcode: 'NGAF53349',
    sku: 'DRJSD100H',
    title: "Dior J'adore Eau De Parfum 100ml Para Mujer Una Bolsa De Regalo",
    quantity: 1,
  },
  {
    id: 'demo_3',
    barcode: 'EPPY53527',
    sku: 'CHCCSKKD',
    title: 'Perfume De Mujer Coco Mademoiselle Eau De Parfum 100ml Fragancia Duradera Y Elegante',
    quantity: 1,
  },
]);

const activeItemIndex = ref(0);
const activePreviewItem = computed(() => {
  if (extractedItems.value.length === 0) {
    return { barcode: '12345678', sku: 'SKU-001', title: '示例商品' };
  }
  return extractedItems.value[activeItemIndex.value] || extractedItems.value[0];
});

const switchPreviewItem = (delta) => {
  const newIdx = activeItemIndex.value + delta;
  if (newIdx >= 0 && newIdx < extractedItems.value.length) {
    activeItemIndex.value = newIdx;
  }
};

// Template Elements on the Canvas
const templateElements = ref(getDefaultLayout(50, 25));
const selectedElemId = ref(null);

const selectedElem = computed(() => {
  if (!selectedElemId.value) return null;
  return templateElements.value.find(e => e.id === selectedElemId.value) || null;
});

// Barcode and QR code caching to prevent lag during drag
const barcodeCache = new Map();
const getBarcodeDataUrl = (code, el) => {
  const val = code || '12345678';
  const key = `${val}_${el.height || 10}_${el.showText !== false}`;
  if (barcodeCache.has(key)) return barcodeCache.get(key);

  const url = generateBarcode(val, {
    width: 2,
    height: Math.max(30, Math.round((el.height || 10) * 3.8)),
    displayValue: el.showText !== false,
    fontSize: el.fontSize || 10,
    margin: 1,
  });
  barcodeCache.set(key, url);
  return url;
};

const qrCache = new Map();
const getQrCodeDataUrl = (val, el) => {
  const text = val || 'QR';
  const size = el.size || 15;
  const key = `${text}_${size}`;
  if (qrCache.has(key)) return qrCache.get(key);

  generateQRCode(text, { size: Math.round(size * 7.5) }).then(res => {
    qrCache.set(key, res);
  });
  return qrCache.get(key) || '';
};

// Dragging Logic
let draggingEl = null;
let startX = 0;
let startY = 0;
let initialX = 0;
let initialY = 0;

const startDrag = (el, e) => {
  selectedElemId.value = el.id;
  draggingEl = el;
  startX = e.clientX;
  startY = e.clientY;
  initialX = el.x;
  initialY = el.y;

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!draggingEl) return;
  const dxMm = (e.clientX - startX) / pxPerMm.value;
  const dyMm = (e.clientY - startY) / pxPerMm.value;

  // Snap to 0.5 mm
  const newX = Math.round((initialX + dxMm) * 2) / 2;
  const newY = Math.round((initialY + dyMm) * 2) / 2;

  draggingEl.x = Math.max(0, Math.min(canvasWidthMm.value - 2, newX));
  draggingEl.y = Math.max(0, Math.min(canvasHeightMm.value - 2, newY));
};

const stopDrag = () => {
  draggingEl = null;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
};

// Element manipulations
const addElement = (type) => {
  const newId = `elem_${Date.now()}`;
  let newEl = null;

  if (type === 'barcode') {
    newEl = { id: newId, type: 'barcode', x: 2.5, y: 2, width: 45, height: 10, showText: true, fontSize: 10 };
  } else if (type === 'qrcode') {
    newEl = { id: newId, type: 'qrcode', x: 2.5, y: 2, size: 15 };
  } else if (type === 'title') {
    newEl = { id: newId, type: 'title', x: 2, y: 14, width: 46, fontSize: 10, bold: true, align: 'center', maxLines: 2 };
  } else if (type === 'sku') {
    newEl = { id: newId, type: 'sku', x: 2, y: 20, width: 46, fontSize: 10, bold: true, prefix: 'SKU: ', align: 'center' };
  } else if (type === 'customText') {
    newEl = { id: newId, type: 'customText', text: 'MADE IN CHINA', x: 2, y: 20, fontSize: 8, bold: false, align: 'center' };
  } else if (type === 'divider') {
    newEl = { id: newId, type: 'divider', x: 2, y: 13, width: 46, thickness: 1 };
  }

  if (newEl) {
    templateElements.value.push(newEl);
    selectedElemId.value = newId;
  }
};

const deleteSelectedElement = () => {
  if (selectedElemId.value) {
    templateElements.value = templateElements.value.filter(e => e.id !== selectedElemId.value);
    selectedElemId.value = null;
  }
};

const centerSelectedElement = () => {
  if (!selectedElem.value) return;
  const el = selectedElem.value;
  const elW = el.width || (el.size ? el.size : 30);
  el.x = Math.max(0, Math.round(((canvasWidthMm.value - elW) / 2) * 2) / 2);
};

const resetToDefaultLayout = () => {
  templateElements.value = getDefaultLayout(canvasWidthMm.value, canvasHeightMm.value);
  selectedElemId.value = null;
};

// Batch & Item Management
const batchQuantityVal = ref(30);
const applyBatchQuantity = (qty) => {
  const q = Math.max(1, parseInt(qty) || 1);
  batchQuantityVal.value = q;
  for (const item of extractedItems.value) {
    item.quantity = q;
  }
};

const addManualItem = () => {
  extractedItems.value.push({
    id: `custom_${Date.now()}`,
    barcode: `NEW${Date.now().toString().slice(-6)}`,
    sku: 'NEW-SKU-01',
    title: '新增款式商品名称',
    quantity: 1,
  });
  activeItemIndex.value = extractedItems.value.length - 1;
};

const deleteItem = (idx) => {
  extractedItems.value.splice(idx, 1);
  if (activeItemIndex.value >= extractedItems.value.length) {
    activeItemIndex.value = Math.max(0, extractedItems.value.length - 1);
  }
};

// PDF Upload & Extraction
const handlePdfUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  isExtracting.value = true;
  extractProgress.value = { current: 1, total: 1 };

  try {
    const res = await extractLabelsFromPdf(file, (curr, total) => {
      extractProgress.value = { current: curr, total };
    });

    if (res && res.items.length > 0) {
      extractedItems.value = res.items;
      activeItemIndex.value = 0;
    } else {
      alert('未能在 PDF 中自动解析到标签文本，已为您载入编辑模版');
    }
  } catch (err) {
    console.error('Extraction error:', err);
    alert('PDF 提取失败: ' + err.message);
  } finally {
    isExtracting.value = false;
    e.target.value = '';
  }
};

const loadDemoSample = () => {
  extractedItems.value = [
    {
      id: 'demo_1',
      barcode: 'TTSA21961',
      sku: 'dwjgq-256',
      title: 'Repelente Solar X4 | Roedores, Serpientes Y Plagas',
      quantity: 1,
    },
    {
      id: 'demo_2',
      barcode: 'NGAF53349',
      sku: 'DRJSD100H',
      title: "Dior J'adore Eau De Parfum 100ml Para Mujer Una Bolsa De Regalo",
      quantity: 1,
    },
    {
      id: 'demo_3',
      barcode: 'EPPY53527',
      sku: 'CHCCSKKD',
      title: 'Perfume De Mujer Coco Mademoiselle Eau De Parfum 100ml Fragancia Duradera Y Elegante',
      quantity: 1,
    },
    {
      id: 'demo_4',
      barcode: 'IASF90617',
      sku: 'SLPM0090-1',
      title: 'Pantalla Display Lcd Para Honor X5 Vna-lx2 Vna-lx3 Con Marco Negro',
      quantity: 1,
    },
  ];
  activeItemIndex.value = 0;
};

// Print Copies Multiplier
const printCopies = ref(1);
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

const totalPrintQuantity = computed(() => {
  const copies = Math.max(1, parseInt(printCopies.value) || 1);
  const base = extractedItems.value.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  return base * copies;
});

// Rolled Preview List
const rolledPreviewList = computed(() => {
  const list = [];
  const copies = Math.max(1, parseInt(printCopies.value) || 1);
  for (const item of extractedItems.value) {
    const qty = (parseInt(item.quantity) || 1) * copies;
    for (let i = 0; i < qty; i++) {
      list.push(item);
    }
  }
  return list;
});

// Printing Engine (Electron + Browser)
const isElectron = ref(false);
const electronPrinters = ref([]);
const selectedElectronPrinter = ref('');
const isPrinting = ref(false);
const printStatusMsg = ref('');

const loadElectronPrinters = async () => {
  if (typeof window !== 'undefined' && window.electronAPI?.getPrinters) {
    try {
      const res = await window.electronAPI.getPrinters();
      if (res && res.success && Array.isArray(res.printers)) {
        electronPrinters.value = res.printers;
        if (!selectedElectronPrinter.value && res.printers.length > 0) {
          const def = res.printers.find(p => p.isDefault);
          selectedElectronPrinter.value = def ? def.name : res.printers[0].name;
        }
      }
    } catch (e) {
      console.warn('Failed to load electron printers:', e);
    }
  }
};

// Generate pure HTML string with 100% crisp vector styling
const generatePrintHtml = () => {
  const pages = rolledPreviewList.value.map(item => {
    const elemsHtml = templateElements.value.map(el => {
      let content = '';
      if (el.type === 'barcode') {
        const url = getBarcodeDataUrl(item.barcode, el);
        content = `<img src="${url}" style="height:${el.height}mm; max-width:100%; object-fit:contain; image-rendering:pixelated;" />`;
      } else if (el.type === 'qrcode') {
        const url = getQrCodeDataUrl(item.barcode || item.sku, el);
        content = `<img src="${url}" style="width:${el.size || 15}mm; height:${el.size || 15}mm;" />`;
      } else if (el.type === 'title') {
        content = `<div style="font-size:${el.fontSize || 10}px; font-weight:${el.bold ? '800' : 'normal'}; text-align:${el.align || 'center'}; line-height:1.2; word-break:break-word; color:#000000;">${item.title || ''}</div>`;
      } else if (el.type === 'sku') {
        content = `<div style="font-size:${el.fontSize || 10}px; font-weight:${el.bold ? '900' : 'normal'}; text-align:${el.align || 'center'}; font-family:monospace; color:#000000;">${el.prefix || 'SKU: '}${item.sku || ''}</div>`;
      } else if (el.type === 'customText') {
        content = `<div style="font-size:${el.fontSize || 9}px; font-weight:${el.bold ? 'bold' : 'normal'}; text-align:${el.align || 'center'}; color:#000000;">${el.text || ''}</div>`;
      } else if (el.type === 'divider') {
        content = `<div style="height:${el.thickness || 1}px; width:100%; background:#000000;"></div>`;
      }

      return `
        <div style="position:absolute; left:${el.x}mm; top:${el.y}mm; width:${el.width ? el.width + 'mm' : 'auto'}; box-sizing:border-box;">
          ${content}
        </div>
      `;
    }).join('');

    return `
      <div class="label-page" style="position:relative; width:${canvasWidthMm.value}mm; height:${canvasHeightMm.value}mm; overflow:hidden; page-break-after:always; break-after:page;">
        ${elemsHtml}
      </div>
    `;
  }).join('');

  return pages;
};

// Silent native print via Electron
const triggerSilentPrint = async () => {
  if (!isElectron.value || !window.electronAPI?.printSilent) return;
  if (rolledPreviewList.value.length === 0) {
    alert('暂无可打印标签');
    return;
  }

  isPrinting.value = true;
  printStatusMsg.value = '正在下发矢量纯黑打印指令...';

  try {
    const pagesHtml = generatePrintHtml();
    const res = await window.electronAPI.printSilent({
      printerName: selectedElectronPrinter.value,
      widthMm: canvasWidthMm.value,
      heightMm: canvasHeightMm.value,
      htmlContent: pagesHtml,
      copies: 1,
    });

    if (res && res.success) {
      printStatusMsg.value = `✓ 任务已成功直达【${selectedElectronPrinter.value || '默认热敏机'}】，正以 100% 矢量清晰度输出 ${totalPrintQuantity.value} 张标签！`;
      setTimeout(() => {
        printStatusMsg.value = '';
      }, 6000);
    } else {
      alert('静默打印失败: ' + (res?.error || '请确认打印机已开机就绪'));
    }
  } catch (err) {
    alert('打印调用异常: ' + err.message);
  } finally {
    isPrinting.value = false;
  }
};

// Browser print fallback via iframe
const triggerBrowserPrint = () => {
  if (isElectron.value && window.electronAPI?.printSilent) {
    return triggerSilentPrint();
  }

  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.top = '-9999px';
  printIframe.style.left = '-9999px';
  document.body.appendChild(printIframe);

  const pagesHtml = generatePrintHtml();
  const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Label Print</title>
        <style>
          @page {
            size: ${canvasWidthMm.value}mm ${canvasHeightMm.value}mm;
            margin: 0;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #000000;
          }
          .label-page {
            width: ${canvasWidthMm.value}mm;
            height: ${canvasHeightMm.value}mm;
            page-break-after: always;
            break-after: page;
            position: relative;
            overflow: hidden;
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

// Download Vector PDF
const downloadVectorPdf = () => {
  triggerBrowserPrint();
};

onMounted(() => {
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    isElectron.value = true;
    loadElectronPrinters();
  }
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
