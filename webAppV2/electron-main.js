const { app, BrowserWindow } = require("electron");
const path = require("path");
app.disableHardwareAcceleration()

let win;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadFile("C:/Users/elliot.janvier.SOLID/Documents/WORK/Telecommande-MoCap/webAppV2/dist/index.html");
  return win;
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      win = createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});