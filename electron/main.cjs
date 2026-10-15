const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: 'LabelMaster Pro - 智能热敏标签工作站 (桌面客户端版)',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // 允许本地与内联图片/Blob 加载
    }
  });

  // 隐藏顶部默认菜单栏，保持专业现代化界面
  Menu.setApplicationMenu(null);

  // 加载页面
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 注册 IPC 通信
ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return { success: false, printers: [] };
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return { success: true, printers };
  } catch (err) {
    return { success: false, error: err.message, printers: [] };
  }
});

ipcMain.handle('print-silent', async (event, params) => {
  const { printerName, widthMm, heightMm, htmlContent, copies = 1 } = params;

  return new Promise((resolve) => {
    try {
      const printWin = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Silent Print</title>
  <style>
    @page {
      size: ${widthMm}mm ${heightMm}mm;
      margin: 0 !important;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      background: white;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .label-page {
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      max-height: ${heightMm}mm;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .label-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

      // 使用系统临时目录保存 HTML 文件，彻底避免 data: URL 长度上限限制
      const tempFile = path.join(app.getPath('temp'), `label_print_${Date.now()}_${Math.random().toString(36).slice(2)}.html`);
      fs.writeFileSync(tempFile, fullHtml, 'utf8');

      const cleanup = () => {
        try {
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        } catch (e) {}
        try {
          if (!printWin.isDestroyed()) printWin.close();
        } catch (e) {}
      };

      printWin.loadFile(tempFile);

      printWin.webContents.on('did-finish-load', () => {
        // 渲染延迟等待图片/Canvas充分加载
        setTimeout(() => {
          const printOptions = {
            silent: true,
            printBackground: true,
            preferCSSPageSize: true,
            margins: { marginType: 'none' },
            pageSize: {
              width: Math.round(widthMm * 1000), // 微米 microns (1mm = 1000 microns)
              height: Math.round(heightMm * 1000)
            },
            copies: parseInt(copies, 10) || 1
          };

          if (printerName && printerName.trim() !== '') {
            printOptions.deviceName = printerName.trim();
          }

          printWin.webContents.print(printOptions, (success, failureReason) => {
            cleanup();
            if (!success) {
              resolve({ success: false, error: failureReason });
            } else {
              resolve({ success: true });
            }
          });
        }, 350);
      });

      printWin.webContents.on('did-fail-load', (e, code, desc) => {
        cleanup();
        resolve({ success: false, error: desc });
      });
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
