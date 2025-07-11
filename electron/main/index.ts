import { app, BrowserWindow, session, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import Store from 'electron-store'
import { createWindow, getMainWindow, setupWindowHandlers } from './window'
import { setupApiHandlers } from './handlers/api-handlers'
import { setupCookieHandlers } from './handlers/cookie-handlers'
import { setupAutoUpdater } from './updater'
import { AUTH_STORE_TOKEN_KEY, AUTH_STORE_USER_KEY } from './constants'

export interface StoreSchema {
  [AUTH_STORE_TOKEN_KEY]?: string
  [AUTH_STORE_USER_KEY]?: string
  language?: string
  [key: string]: unknown
}

export const store = new Store<StoreSchema>()
export const PERSIST_PARTITION = 'persist:sasuai-store-app'
export let persistentSession: Electron.Session

export const getTypedStore = (): Store<StoreSchema> => {
  return store
}

const setupStoreHandlers = () => {
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
}

const setupLanguageHandlers = () => {
  ipcMain.handle('language:get', () => {
    return store.get('language', 'en')
  })

  ipcMain.handle('language:set', (_event, lang) => {
    store.set('language', lang)
    return true
  })
}

const initializeApp = async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  persistentSession = session.fromPartition(PERSIST_PARTITION)

  await createWindow()

  const mainWindow = getMainWindow()
  if (mainWindow) {
    setupAutoUpdater(mainWindow)
  }

  setupApiHandlers()
  setupCookieHandlers()
  setupWindowHandlers()
  setupStoreHandlers()
  setupLanguageHandlers()
}

app.whenReady().then(initializeApp)

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
