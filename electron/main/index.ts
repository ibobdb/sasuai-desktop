import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'
import Store from 'electron-store'

const store = new Store()

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false, // Menggunakan custom titlebar
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Window state event handlers
  mainWindow.on('maximize', () => {
    if (mainWindow?.webContents) {
      mainWindow.webContents.send('window:state-changed', true)
    }
  })

  mainWindow.on('unmaximize', () => {
    if (mainWindow?.webContents) {
      mainWindow.webContents.send('window:state-changed', false)
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('fetch-api', async (_event, url: string, options = {}) => {
    try {
      const response = await axios({
        url,
        ...options,
        timeout: 60000 // Set timeout to 60 seconds
      })
      return response.data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  })

  ipcMain.handle('fetch-api-with-auth', async (_event, url, options = {}) => {
    const token = store.get('SESSION_TOKEN')
    try {
      const response = await axios({
        url,
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`
        },
        timeout: 60000
      })
      return response.data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  })

  // Custom titlebar window control handlers
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
    return null
  })

  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return false

    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
      return false
    } else {
      mainWindow.maximize()
      return true
    }
  })

  ipcMain.handle('window:close', () => {
    if (mainWindow) {
      mainWindow.close()
    }
    return null
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handlers untuk session
ipcMain.handle('store:get', (_event, key) => {
  return store.get(key)
})

ipcMain.handle('store:set', (_event, key, value) => {
  store.set(key, value)
  return true
})

ipcMain.handle('store:delete', (_event, key) => {
  store.delete(key)
  return true
})
