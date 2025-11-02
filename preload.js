const { ipcRenderer, contextBridge } = require("electron");

//save dialog ipc
contextBridge.exposeInMainWorld("openSaveWindow", {
  openWindow: () => ipcRenderer.invoke("save-project-window"),
});

//load dialog ipc
contextBridge.exposeInMainWorld("openLoadWindow", {
  openWindow: () => ipcRenderer.invoke("load-project-window"),
});

//fs write ipc
contextBridge.exposeInMainWorld("writeToSave", {
  write: (content) => ipcRenderer.invoke("write-to-save", content),
});

//fs append ipc
contextBridge.exposeInMainWorld("appendToSave", {
  append: (content) => ipcRenderer.invoke("append-to-save", content),
});

//fs read ipc
contextBridge.exposeInMainWorld("readFromSave", {
  read: () => ipcRenderer.invoke("read-from-save"),
});

//export dialog ipc
contextBridge.exposeInMainWorld("openExportWindow", {
  openWindow: () => ipcRenderer.invoke("export-project-window"),
});

//export ipc
contextBridge.exposeInMainWorld("exportToHTML", {
  write: (content) => ipcRenderer.invoke("export-to-html", content),
});
