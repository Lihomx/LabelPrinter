const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1000,
    minHeight: 700,
    title: 'LabelMaster Pro - 智能标签工作站',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // IPC: Query available local printers
  ipcMain.handle('get-printers', async () => {
    if (!mainWindow) return [];
    return await mainWindow.webContents.getPrintersAsync();
  });

  // IPC: Direct Silent Thermal Print
  ipcMain.handle('print-thermal', async (event, { labels, copies = 1, widthMm = 70, heightMm = 30, printerName }) => {
    if (!labels || labels.length === 0) return { success: false, message: 'No labels' };

    // Create a hidden printing window
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Build print HTML document with locked 0 margins
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page {
              size: ${widthMm}mm ${heightMm}mm;
              margin: 0 !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white;
            }
            .label-page {
              width: ${widthMm}mm;
              height: ${heightMm}mm;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              overflow: hidden;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          ${labels.map(dataUrl => `
            <div class="label-page">
              <img src="${dataUrl}" />
            </div>
          `).join('')}
        </body>
      </html>
    `;

    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    return new Promise((resolve) => {
      printWin.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: printerName || '',
        copies: copies,
        margins: {
          marginType: 'none',
        },
        pageSize: {
          width: widthMm * 1000, // microns
          height: heightMm * 1000,
        },
      }, (success, failureReason) => {
        printWin.close();
        resolve({ success, failureReason });
      });
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
