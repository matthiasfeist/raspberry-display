'use strict';

const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

/*
 * Keep a global reference of the window object, if you don't, the window will
 * be closed automatically when the JavaScript object is garbage collected.
 */
let mainWindow;

/**
 *
 */
function createWindow() {
  /*
   * see https://www.electronjs.org/docs/latest/api/screen
   * Create a window that fills the screen's available work area.
   */
  const electronSize = electron.screen.getPrimaryDisplay().workAreaSize;
  app.commandLine.appendSwitch(['autoplay-policy', 'no-user-gesture-required']);

  const electronOptions = {
    width: electronSize.width,
    height: electronSize.height,
    x: 0,
    y: 0,
    darkTheme: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      zoomFactor: 1,
    },
    backgroundColor: '#000000',
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    fullscreen: true,
  };

  mainWindow = new BrowserWindow(electronOptions);
  mainWindow.loadURL(`http://localhost:8080/`);

  // Open the DevTools if run with "node --run start:dev"
  if (process.argv.includes('dev')) {
    mainWindow.webContents.openDevTools();
  }

  // simulate mouse move to hide cursor on start
  mainWindow.webContents.on('dom-ready', (event) => {
    mainWindow.webContents.sendInputEvent({ type: 'mouseMove', x: 0, y: 0 });
  });

  // Set responders for window events.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
});
