import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PERSIST_PARTITION, persistentSession } from './index'

let mainWindow: BrowserWindow | null = null

export function createWindow(): BrowserWindow {
  // Create the browser window.
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

  // Add navigation event handlers to flush cookies
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

  return mainWindow
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}
