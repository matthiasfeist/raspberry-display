'use strict';

const electron = require('electron');

// Config
let config = process.env.config ? JSON.parse(process.env.config) : {};
// Module to control application life.
const app = electron.app;

/*
 * Per default electron is started with --disable-gpu flag, if you want the gpu enabled,
 * you must set the env var ELECTRON_ENABLE_GPU=1 on startup.
 * See https://www.electronjs.org/docs/latest/tutorial/offscreen-rendering for more info.
 */
if (process.env.ELECTRON_ENABLE_GPU !== '1') {
  app.disableHardwareAcceleration();
}

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
  let electronSize = electron.screen.getPrimaryDisplay().workAreaSize;

  let electronSwitchesDefaults = [
    'autoplay-policy',
    'no-user-gesture-required',
  ];
  app.commandLine.appendSwitch(
    ...new Set(electronSwitchesDefaults, config.electronSwitches),
  );
  let electronOptionsDefaults = {
    width: electronSize.width,
    height: electronSize.height,
    x: 0,
    y: 0,
    darkTheme: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      zoomFactor: config.zoom,
    },
    backgroundColor: '#000000',
  };

  /*
   * DEPRECATED: "kioskmode" backwards compatibility, to be removed
   * settings these options directly instead provides cleaner interface
   */
  if (config.kioskmode) {
    electronOptionsDefaults.kiosk = true;
  } else {
    electronOptionsDefaults.show = false;
    electronOptionsDefaults.frame = false;
    electronOptionsDefaults.transparent = true;
    electronOptionsDefaults.hasShadow = false;
    electronOptionsDefaults.fullscreen = true;
  }

  const electronOptions = Object.assign(
    {},
    electronOptionsDefaults,
    config.electronOptions,
  );

  // Create the browser window.
  mainWindow = new BrowserWindow(electronOptions);

  /*
   * and load the index.html of the app.
   * If config.address is not defined or is an empty string (listening on all interfaces), connect to localhost
   */

  mainWindow.loadURL(`http://localhost:8080/`);

  // Open the DevTools if run with "node --run start:dev"
  if (process.argv.includes('dev')) {
    if (process.env.JEST_WORKER_ID !== undefined) {
      // if we are running with jest
      const devtools = new BrowserWindow(electronOptions);
      mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    }
    mainWindow.webContents.openDevTools();
  }

  // simulate mouse move to hide black cursor on start
  mainWindow.webContents.on('dom-ready', (event) => {
    mainWindow.webContents.sendInputEvent({ type: 'mouseMove', x: 0, y: 0 });
  });

  // Set responders for window events.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  if (config.kioskmode) {
    mainWindow.on('blur', function () {
      mainWindow.focus();
    });

    mainWindow.on('leave-full-screen', function () {
      mainWindow.setFullScreen(true);
    });

    mainWindow.on('resize', function () {
      setTimeout(function () {
        mainWindow.reload();
      }, 1000);
    });
  }

  //remove response headers that prevent sites of being embedded into iframes if configured
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      let curHeaders = details.responseHeaders;
      if (config.ignoreXOriginHeader || false) {
        curHeaders = Object.fromEntries(
          Object.entries(curHeaders).filter(
            (header) => !/x-frame-options/i.test(header[0]),
          ),
        );
      }

      if (config.ignoreContentSecurityPolicy || false) {
        curHeaders = Object.fromEntries(
          Object.entries(curHeaders).filter(
            (header) => !/content-security-policy/i.test(header[0]),
          ),
        );
      }

      callback({ responseHeaders: curHeaders });
    },
  );

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.on('activate', function () {
  /*
   * On OS X it's common to re-create a window in the app when the
   * dock icon is clicked and there are no other windows open.
   */
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Handle errors from self-signed certificates
 */
app.on(
  'certificate-error',
  (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  },
);

app.whenReady().then(() => {
  createWindow();
});
