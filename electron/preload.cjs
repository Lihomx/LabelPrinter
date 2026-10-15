const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printSilent: (options) => ipcRenderer.invoke('print-silent', options),
  printToPdf: (options) => ipcRenderer.invoke('print-to-pdf', options),
  openPrinterPreferences: (printerName) => ipcRenderer.invoke('open-printer-preferences', printerName)
});
