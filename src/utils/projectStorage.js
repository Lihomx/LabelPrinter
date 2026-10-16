/**
 * IndexedDB storage engine for LabelMaster Pro projects
 * Allows saving, naming, loading, and managing historical label projects
 */

const DB_NAME = 'LabelMasterProDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('浏览器不支持 IndexedDB 本地存储'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('打开数据库失败'));
  });
}

/**
 * Fetch all saved projects metadata sorted by updatedAt descending
 */
export async function getAllProjects() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const list = request.result || [];
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('getAllProjects error:', err);
    return [];
  }
}

/**
 * Get a single full project by ID
 */
export async function getProject(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save or update project
 * Strips raw non-serializable DOM canvas elements and Vue 3 reactive proxies before storing
 */
export async function saveProject(projectData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Deeply sanitize rawLabels to extract only serializable primitives and dataUrl
      const cleanLabels = (projectData.rawLabels || []).map((label, index) => {
        let dataUrl = '';
        if (typeof label.dataUrl === 'string' && label.dataUrl.length > 0) {
          dataUrl = label.dataUrl;
        } else if (label.canvas && typeof label.canvas.toDataURL === 'function') {
          try {
            dataUrl = label.canvas.toDataURL('image/png');
          } catch {
            dataUrl = '';
          }
        }

        return {
          id: String(label.id || `lbl_${index}_${Date.now()}`),
          page: Number(label.page) || 1,
          col: Number(label.col) || 1,
          row: Number(label.row) || 1,
          dataUrl: dataUrl,
          barcode: String(label.barcode ?? ''),
          title: String(label.title ?? ''),
          sku: String(label.sku ?? ''),
          quantity: Math.max(1, parseInt(label.quantity, 10) || 1),
          selected: label.selected !== false,
          width: Number(label.width) || 0,
          height: Number(label.height) || 0,
        };
      });

      // Plain unproxied freeCropBox
      let cleanFreeCropBox = null;
      if (projectData.freeCropBox) {
        cleanFreeCropBox = {
          xRatio: Number(projectData.freeCropBox.xRatio) || 0,
          yRatio: Number(projectData.freeCropBox.yRatio) || 0,
          wRatio: Number(projectData.freeCropBox.wRatio) || 0,
          hRatio: Number(projectData.freeCropBox.hRatio) || 0,
        };
      }

      const cleanProject = {
        id: String(projectData.id || `proj_${Date.now()}`),
        name: String(projectData.name || `标签项目_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`),
        createdAt: Number(projectData.createdAt) || Date.now(),
        updatedAt: Date.now(),
        sourceFileName: String(projectData.sourceFileName || '未命名文件'),
        layoutMode: String(projectData.layoutMode || 'presetFreeform'),
        freeCropBox: cleanFreeCropBox,
        selectedPaperId: String(projectData.selectedPaperId || '70x30'),
        targetWidthMm: Number(projectData.targetWidthMm) || 70,
        targetHeightMm: Number(projectData.targetHeightMm) || 30,
        autoRotate: projectData.autoRotate !== false,
        fitMode: String(projectData.fitMode || 'proportional'),
        viewMode: String(projectData.viewMode || 'grouped'),
        rawLabels: cleanLabels,
        totalQuantity: cleanLabels.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0),
        labelCount: cleanLabels.length,
        thumbnail: cleanLabels[0]?.dataUrl || null,
      };

      // Guarantee 100% plain object with zero Proxies, zero DOM nodes, zero exotic prototypes
      const serializablePayload = JSON.parse(JSON.stringify(cleanProject));

      const getFormattedError = (err) => {
        if (!err) return new Error('保存项目失败');
        if (err.name === 'QuotaExceededError' || (err.message && err.message.toLowerCase().includes('quota'))) {
          return new Error('本地存储配额已满 (QuotaExceededError)。请先清理或删除部分历史标签项目后重试。');
        }
        return err;
      };

      const request = store.put(serializablePayload);
      request.onsuccess = () => resolve(serializablePayload);
      request.onerror = (e) => reject(getFormattedError(e.target?.error || request.error));
      tx.onabort = (e) => reject(getFormattedError(e.target?.error || tx.error));
    } catch (err) {
      if (err.name === 'QuotaExceededError' || (err.message && err.message.toLowerCase().includes('quota'))) {
        reject(new Error('本地存储配额已满 (QuotaExceededError)。请先清理或删除部分历史标签项目后重试。'));
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Delete a project by ID
 */
export async function deleteProject(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Export project as downloadable JSON backup file
 */
export function exportProjectJson(project) {
  const clean = JSON.parse(JSON.stringify(project));
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(clean, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${clean.name || 'label_project'}.labelmaster.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import project from JSON file
 */
export function importProjectJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.rawLabels || !Array.isArray(parsed.rawLabels)) {
          throw new Error('无效的标签项目文件格式');
        }
        parsed.id = `proj_${Date.now()}`;
        parsed.updatedAt = Date.now();
        const saved = await saveProject(parsed);
        resolve(saved);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}
