import { BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PERSIST_PARTITION, persistentSession } from './index'
import { getDeviceInfo } from './device-info'

let mainWindow: BrowserWindow | null = null

export async function createWindow(): Promise<BrowserWindow> {
  const deviceInfo = await getDeviceInfo()

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 960,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      partition: PERSIST_PARTITION
    }
  })

  mainWindow.webContents.setUserAgent(deviceInfo.userAgent)

  mainWindow.webContents.on('did-start-navigation', () => {
    persistentSession.cookies.flushStore().catch(() => {})
  })

  mainWindow.webContents.on('did-navigate', () => {
    persistentSession.cookies.flushStore().catch(() => {})
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

  return mainWindow
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function setupWindowHandlers() {
  ipcMain.handle('window:minimize', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) mainWindow.minimize()
    return null
  })

  ipcMain.handle('window:maximize', () => {
    const mainWindow = getMainWindow()
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
    const mainWindow = getMainWindow()
    if (mainWindow) mainWindow.close()
    return null
  })

  ipcMain.handle('window:isMaximized', () => {
    const mainWindow = getMainWindow()
    return mainWindow ? mainWindow.isMaximized() : false
  })
}
