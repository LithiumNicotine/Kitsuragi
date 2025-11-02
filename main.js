const { app, BrowserWindow, dialog, ipcMain } = require("electron/main");
const fs = require("node:fs");
const path = require("node:path");
let filePath;

function createWindow() {
  const win = new BrowserWindow({
    //fix default screen size
    width: 2046,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.maximize();
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

//load dialog ipc
ipcMain.handle("load-project-window", async (event) => {
  result = await dialog.showOpenDialog({
    filters: [{ name: "JSON file (*.json)", extensions: ["json"] }],
  });
  filePath = result.filePaths[0];
  return filePath;
});

//save dialog ipc
ipcMain.handle("save-project-window", async (event) => {
  result = await dialog.showSaveDialog({
    filters: [{ name: "JSON file (*.json)", extensions: ["json"] }],
  });
  filePath = result.filePath;
  return filePath;
});

//write ipc
ipcMain.handle("write-to-save", (event, content) => {
  fs.writeFileSync(filePath, content);
});

//append ipc
ipcMain.handle("append-to-save", (event, content) => {
  fs.appendFileSync(filePath, content);
});

//read ipc
ipcMain.handle("read-from-save", () => {
  let data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
});

//export dialog ipc
ipcMain.handle("export-project-window", async (event) => {
  result = await dialog.showSaveDialog({
    filters: [{ name: "HTML file (*.html)", extensions: ["html"] }],
  });
  filePath = result.filePath;
  return filePath;
});

//export ipc
ipcMain.handle("export-to-html", (event, content) => {
  fs.writeFileSync(filePath, content);
});
