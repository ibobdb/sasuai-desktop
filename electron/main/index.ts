import { app, BrowserWindow, session, ipcMain } from 'electron'
import { electronApp as electronAppUtils, optimizer } from '@electron-toolkit/utils'
import Store from 'electron-store'
import { createWindow, getMainWindow } from './window'
import { setupAutoUpdater } from './updater'
import { CookieService } from './services/cookie-service'
import { setupPrinterService } from './services/printer-service'
import { createApiClient } from './api-client'
import { StoreSchema } from './types/store'

export const store = new Store<StoreSchema>()
export const PERSIST_PARTITION = 'persist:sasuai-store-app'
export let persistentSession: Electron.Session

export const getTypedStore = (): Store<StoreSchema> => {
  return store
}

class ElectronApp {
  private cookieService: CookieService | null = null
  private apiClient: any = null
  private requestCache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 30000

  async initialize() {
    electronAppUtils.setAppUserModelId('com.electron')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    persistentSession = session.fromPartition(PERSIST_PARTITION)

    await createWindow()

    const mainWindow = getMainWindow()
    if (mainWindow) {
      setupAutoUpdater(mainWindow)
    }

    this.setupServices()
    this.setupHandlers()
  }

  private setupServices() {
    this.cookieService = new CookieService(persistentSession)
    this.apiClient = createApiClient()
  }

  private setupHandlers() {
    this.setupStoreHandlers()
    this.setupLanguageHandlers()
    this.setupAppHandlers()
    this.setupWindowHandlers()
    this.setupCookieHandlers()
    setupPrinterService()
    this.setupApiHandlers()
  }

  private setupAppHandlers() {
    ipcMain.handle('app:getVersion', () => app.getVersion())
    ipcMain.handle('app:getName', () => app.getName())
  }

  private setupApiHandlers() {
    ipcMain.handle('api:request', async (_event, url, options = {}) => {
      const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.params || {})}`
      const cached = this.requestCache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return { success: true, data: cached.data }
      }

      try {
        const response = await this.apiClient({
          url,
          ...options
        })

        // Extract set-cookie headers for manual token handling when needed
        let sessionCookies = null
        if (response.headers && response.headers['set-cookie']) {
          sessionCookies = response.headers['set-cookie']
        }

        const result = {
          success: true,
          data: response.data,
          cookies: sessionCookies
        }
        this.requestCache.set(cacheKey, { data: response.data, timestamp: Date.now() })

        return result
      } catch (error: any) {
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            await this.clearAuthCookies()
          }
          return {
            success: false,
            error: {
              status: error.response.status,
              message: error.response.data?.message || 'Server error',
              data: error.response.data
            }
          }
        }
        if (error.request) {
          return {
            success: false,
            error: {
              status: 0,
              message: 'Network error: No response from server'
            }
          }
        }
        return {
          success: false,
          error: {
            status: 0,
            message: error.message || 'Unknown error occurred'
          }
        }
      }
    })

    ipcMain.handle('api:clear-cache', () => {
      this.requestCache.clear()
      return { success: true }
    })
  }

  private setupStoreHandlers() {
    const storeCache = new Map<string, any>()

    ipcMain.handle('store:get', (_event, key) => {
      // Always get fresh data for settings to avoid stale cache
      if (key.startsWith('settings.')) {
        const value = store.get(key)
        storeCache.set(key, value)
        return value
      }

      // Use cache for other data
      if (!storeCache.has(key)) {
        storeCache.set(key, store.get(key))
      }
      return storeCache.get(key)
    })

    ipcMain.handle('store:set', (_event, key, value) => {
      store.set(key, value)
      storeCache.set(key, value)

      // Invalidate settings cache when settings are updated
      if (key.startsWith('settings.')) {
        storeCache.delete(key)
      }

      return true
    })

    ipcMain.handle('store:delete', (_event, key) => {
      store.delete(key)
      storeCache.delete(key)
      return true
    })
  }

  private setupLanguageHandlers() {
    let cachedLanguage: string | null = null

    ipcMain.handle('language:get', () => {
      if (!cachedLanguage) {
        cachedLanguage = store.get('language', 'en')
      }
      return cachedLanguage
    })

    ipcMain.handle('language:set', (_event, lang) => {
      store.set('language', lang)
      cachedLanguage = lang
      return true
    })
  }

  private setupWindowHandlers() {
    let cachedMaximizedState: boolean | null = null

    ipcMain.handle('window:minimize', () => {
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.minimize()
        return true
      }
      return false
    })

    ipcMain.handle('window:maximize', () => {
      const mainWindow = getMainWindow()
      if (!mainWindow) return false

      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
        cachedMaximizedState = false
        return false
      } else {
        mainWindow.maximize()
        cachedMaximizedState = true
        return true
      }
    })

    ipcMain.handle('window:close', () => {
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.close()
        return true
      }
      return false
    })

    ipcMain.handle('window:isMaximized', () => {
      const mainWindow = getMainWindow()
      if (!mainWindow) return false

      if (cachedMaximizedState === null) {
        cachedMaximizedState = mainWindow.isMaximized()
      }
      return cachedMaximizedState
    })

    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.on('maximize', () => {
        cachedMaximizedState = true
      })
      mainWindow.on('unmaximize', () => {
        cachedMaximizedState = false
      })
    }
  }

  private setupCookieHandlers() {
    if (!this.cookieService) return

    ipcMain.handle('cookies:get', async (_event, filter) => {
      if (typeof filter === 'string') {
        return await this.cookieService!.getCookie(filter)
      }
      if (filter?.name) {
        return await this.cookieService!.getCookie(filter.name)
      }
      return null
    })

    ipcMain.handle('cookies:set', async (_event, details) => {
      if (typeof details === 'object' && details.name && details.value !== undefined) {
        return await this.cookieService!.setCookie(details)
      }
      return false
    })

    ipcMain.handle('cookies:remove', async (_event, url, name) => {
      const cookieName = name || url
      return await this.cookieService!.removeCookie(cookieName)
    })

    ipcMain.handle('cookies:clearAuth', async () => {
      const result = await this.cookieService!.clearAuthCookies()
      return result
    })
  }

  async clearAuthCookies() {
    if (this.cookieService) {
      return await this.cookieService.clearAuthCookies()
    }
    return false
  }

  cleanup() {
    this.requestCache.clear()
  }

  getCacheStats() {
    return {
      requestCache: this.requestCache.size
    }
  }
}

const electronApp = new ElectronApp()

app.whenReady().then(() => electronApp.initialize())

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow()
  }
})

app.on('window-all-closed', () => {
  electronApp.cleanup()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  electronApp.cleanup()
})

export async function clearAuthCookies() {
  return await electronApp.clearAuthCookies()
}

export function getAppCacheStats() {
  return electronApp.getCacheStats()
}
