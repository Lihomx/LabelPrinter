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
 * Strips raw non-serializable DOM canvas elements before storing
 */
export async function saveProject(projectData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Sanitize rawLabels to remove raw HTMLCanvasElement before IndexedDB serialization
    const cleanLabels = (projectData.rawLabels || []).map(label => ({
      id: label.id,
      page: label.page || 1,
      col: label.col || 1,
      row: label.row || 1,
      dataUrl: label.dataUrl,
      barcode: label.barcode || '',
      title: label.title || '',
      sku: label.sku || '',
      quantity: parseInt(label.quantity) || 1,
      selected: label.selected !== false,
      width: label.width || 0,
      height: label.height || 0,
    }));

    const cleanProject = {
      id: projectData.id || `proj_${Date.now()}`,
      name: projectData.name || `标签项目_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}`,
      createdAt: projectData.createdAt || Date.now(),
      updatedAt: Date.now(),
      sourceFileName: projectData.sourceFileName || '未命名文件',
      layoutMode: projectData.layoutMode || 'presetFreeform',
      freeCropBox: projectData.freeCropBox || null,
      selectedPaperId: projectData.selectedPaperId || '70x30',
      targetWidthMm: projectData.targetWidthMm || 70,
      targetHeightMm: projectData.targetHeightMm || 30,
      autoRotate: projectData.autoRotate !== false,
      fitMode: projectData.fitMode || 'proportional',
      viewMode: projectData.viewMode || 'grouped',
      rawLabels: cleanLabels,
      totalQuantity: cleanLabels.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
      labelCount: cleanLabels.length,
      thumbnail: cleanLabels[0]?.dataUrl || null,
    };

    const request = store.put(cleanProject);
    request.onsuccess = () => resolve(cleanProject);
    request.onerror = () => reject(request.error);
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
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.name || 'label_project'}.labelmaster.json`);
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
