import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PERSIST_PARTITION, persistentSession } from './index'
import { getDeviceInfo } from './device-info'

let mainWindow: BrowserWindow | null = null
let cookieFlushTimeout: NodeJS.Timeout | null = null

const debouncedCookieFlush = () => {
  if (cookieFlushTimeout) {
    clearTimeout(cookieFlushTimeout)
  }

  cookieFlushTimeout = setTimeout(() => {
    persistentSession.cookies.flushStore().catch(() => {})
    cookieFlushTimeout = null
  }, 1000) // Debounce for 1 second
}

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

  // Use debounced cookie flush to reduce I/O operations
  mainWindow.webContents.on('did-start-navigation', debouncedCookieFlush)
  mainWindow.webContents.on('did-navigate', debouncedCookieFlush)

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
