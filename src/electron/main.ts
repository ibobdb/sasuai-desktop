import { app, BrowserWindow, dialog, net } from 'electron';
import { ipcMainHandle, isDev } from './util.js';
import { getPreloadPath, getUIPath } from './pathResolver.js';
import { getStaticData, pollResources } from './systemMonitor.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { DEV_SERVER, WINDOW_DEFAULT } from './constants.js';

// Prevent Electron's security warnings in development mode
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = isDev() ? '1' : '0';

// Disable Autofill to prevent security issues
app.commandLine.appendSwitch('disable-features', 'Autofill');

/**
 * Create main application window
 */
function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev(), // Only enable devTools in development
    },
    width: WINDOW_DEFAULT.WIDTH,
    height: WINDOW_DEFAULT.HEIGHT,
    show: false,
    backgroundColor: '#ffffff', // Prevents white flash on load
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

app.whenReady().then(() => {
  const mainWindow = createMainWindow();

  if (isDev()) {
    loadDevOrFallback(mainWindow);
  } else {
    mainWindow.loadFile(getUIPath());
  }

  pollResources(mainWindow);

  ipcMainHandle('getStaticData', () => {
    return getStaticData();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});

/**
 * Attempt to load development server or fallback to production build
 */
function loadDevOrFallback(mainWindow: BrowserWindow): void {
  const request = net.request(DEV_SERVER.URL);

  request.on('response', () => {
    mainWindow.loadURL(DEV_SERVER.URL);
    if (isDev()) {
      mainWindow.webContents.openDevTools();
    }
  });

  request.on('error', async () => {
    try {
      const distPath = path.join(app.getAppPath(), 'dist-react', 'index.html');
      const hasDistBuild = fs.existsSync(distPath);

      const options = ['Start Dev Server', 'Exit'];
      if (hasDistBuild) options.splice(1, 0, 'Use Production Build');

      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Development Server Not Available',
        message: `Could not connect to development server at ${DEV_SERVER.URL}`,
        detail:
          'The Vite development server is not running. Please choose an option:',
        buttons: options,
        defaultId: 0,
        cancelId: options.length - 1,
      });

      switch (response) {
        case 0: // Start Dev Server
          startDevServer(mainWindow);
          break;
        case 1: // Load Production Build (if available)
          if (hasDistBuild) {
            mainWindow.loadFile(distPath);
          } else {
            app.quit();
          }
          break;
        default: // Exit
          app.quit();
          break;
      }
    } catch (error) {
      console.error('Error handling development server:', error);
      app.quit();
    }
  });

  request.end();
}

/**
 * Start the development server
 */
function startDevServer(mainWindow: BrowserWindow): void {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Starting Development Server',
    message: 'Attempting to start the development server...',
    detail:
      'This may take a few moments. The application will reload when the server is ready.',
    buttons: ['OK'],
    defaultId: 0,
  });

  try {
    const devServer = spawn(npmCmd, ['run', 'dev:react'], {
      cwd: app.getAppPath(),
      stdio: 'ignore',
      detached: true,
      windowsHide: true,
    });

    // Don't wait for the child process
    devServer.unref();

    // Wait a bit and check if server started
    setTimeout(() => {
      checkServerAndLoad(mainWindow);
    }, DEV_SERVER.START_TIMEOUT);
  } catch (error) {
    console.error('Failed to start dev server:', error);
    dialog
      .showMessageBox(mainWindow, {
        type: 'error',
        title: 'Server Start Failed',
        message: 'Failed to start development server',
        detail:
          'An error occurred when trying to start the development server.',
        buttons: ['Exit'],
      })
      .then(() => app.quit());
  }
}

/**
 * Check if the development server started and load it
 */
function checkServerAndLoad(mainWindow: BrowserWindow): void {
  const request = net.request(DEV_SERVER.URL);

  request.on('response', () => {
    mainWindow.loadURL(DEV_SERVER.URL);
    mainWindow.webContents.openDevTools();
  });

  request.on('error', () => {
    dialog
      .showMessageBox(mainWindow, {
        type: 'error',
        title: 'Server Start Failed',
        message: 'Failed to start development server',
        detail:
          'Please start the development server manually with "npm run dev:react" in another terminal and restart the application.',
        buttons: ['Exit'],
        defaultId: 0,
      })
      .then(() => {
        app.quit();
      });
  });

  request.end();
}
