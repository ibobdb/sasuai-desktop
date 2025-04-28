import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'
import Store from 'electron-store'

// Cookie configuration constants
const COOKIE_DOMAIN = 'localhost' // Change to your domain in production
const AUTH_COOKIE_NAME = 'better-auth.session_token'
const USER_DATA_COOKIE_NAME = 'better-auth.session_data'

// Define a persistent partition name
const PERSIST_PARTITION = 'persist:sasuai-store-app'
// Reference to the persistent session
let persistentSession: Electron.Session

// Store keys for authentication backup
const AUTH_STORE_TOKEN_KEY = 'auth.token'
const AUTH_STORE_USER_KEY = 'auth.user'

let mainWindow: BrowserWindow | null = null
const store = new Store()

// Create a typed schema for better TypeScript support
interface StoreSchema {
  [AUTH_STORE_TOKEN_KEY]?: string
  [AUTH_STORE_USER_KEY]?: string
  [key: string]: unknown
}

// Use the typed store
const typedStore = store as Store<StoreSchema>

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
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

  // Get the persistent session
  persistentSession = session.fromPartition(PERSIST_PARTITION)

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
}

// Create axios instance with default config
const createApiClient = () => {
  const instance = axios.create({
    timeout: 60000,
    withCredentials: true
  })

  // Request interceptor to add auth token
  instance.interceptors.request.use(async (config) => {
    try {
      // Use the persistent session to get cookies
      const cookies = await persistentSession.cookies.get({
        name: AUTH_COOKIE_NAME
      })

      // Try to get auth token (first from cookies, then from store)
      let authToken: string | null = null
      if (cookies.length > 0) {
        authToken = cookies[0].value
      } else {
        // Fallback to electron-store
        authToken = typedStore.get(AUTH_STORE_TOKEN_KEY) || null
        if (authToken) {
          // Restore the cookie from the store value
          await persistentSession.cookies
            .set({
              url: `http://${COOKIE_DOMAIN}`,
              name: AUTH_COOKIE_NAME,
              value: authToken,
              domain: COOKIE_DOMAIN
            })
            .catch(() => {})
        }
      }

      if (authToken) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${authToken}`
      }

      return config
    } catch (error) {
      console.error('Error during API request:', error)
      return config
    }
  })

  return instance
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Create API client instance
  const apiClient = createApiClient()

  // API request handler
  ipcMain.handle('api:request', async (_event, url: string, options = {}) => {
    try {
      const response = await apiClient({
        url,
        ...options
      })

      return response.data
    } catch (error: any) {
      if (error.response) {
        // For auth errors, clear cookies
        if (error.response.status === 401 || error.response.status === 403) {
          await clearAuthCookies()
        }

        throw {
          status: error.response.status,
          message: error.response.data?.message || 'Server error',
          data: error.response.data
        }
      } else if (error.request) {
        throw {
          status: 0,
          message: 'No response from server'
        }
      } else {
        throw {
          status: 0,
          message: error.message
        }
      }
    }
  })

  // Helper function to clear auth cookies
  async function clearAuthCookies() {
    try {
      await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, AUTH_COOKIE_NAME)
      await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, USER_DATA_COOKIE_NAME)
      await persistentSession.cookies.flushStore()
      typedStore.delete(AUTH_STORE_TOKEN_KEY)
      typedStore.delete(AUTH_STORE_USER_KEY)
    } catch (err) {
      console.log('Error clearing auth cookies:', err)
    }
  }

  // Cookie management handlers
  ipcMain.handle('cookies:get', async (_event, filter) => {
    try {
      const cookieFilter = typeof filter === 'string' ? { name: filter } : filter
      const cookies = await persistentSession.cookies.get(cookieFilter)

      // If cookie exists, return its value
      if (cookies.length > 0) {
        return cookies[0].value
      }

      // Fallback to electron-store for auth cookies
      if (typeof filter === 'string') {
        if (filter === AUTH_COOKIE_NAME) {
          return typedStore.get(AUTH_STORE_TOKEN_KEY) || null
        } else if (filter === USER_DATA_COOKIE_NAME) {
          return typedStore.get(AUTH_STORE_USER_KEY) || null
        }
      }

      return null
    } catch (error) {
      console.error('Error getting cookie:', error)
      return null
    }
  })

  ipcMain.handle('cookies:set', async (_event, details) => {
    try {
      let cookieDetails

      if (typeof details === 'object') {
        if (details.name && details.value !== undefined) {
          cookieDetails = {
            url: `http://${COOKIE_DOMAIN}`,
            name: details.name,
            value: details.value,
            domain: COOKIE_DOMAIN
          }

          if (details.expirationDate) {
            cookieDetails.expirationDate = details.expirationDate
          }

          // Add security settings
          if (!is.dev) {
            cookieDetails.secure = true
            cookieDetails.httpOnly = true
          }
          cookieDetails.sameSite = 'lax'
        } else if (details.url && details.name) {
          cookieDetails = details
        } else {
          throw new Error('Invalid cookie details')
        }
      } else {
        throw new Error('Invalid cookie details')
      }

      // Use persistent session
      await persistentSession.cookies.set(cookieDetails)

      // Store auth data in electron-store as backup
      if (cookieDetails.name === AUTH_COOKIE_NAME) {
        typedStore.set(AUTH_STORE_TOKEN_KEY, cookieDetails.value)
      } else if (cookieDetails.name === USER_DATA_COOKIE_NAME) {
        typedStore.set(AUTH_STORE_USER_KEY, cookieDetails.value)
      }

      // Force write cookies to disk for auth cookies
      if (cookieDetails.name === AUTH_COOKIE_NAME || cookieDetails.name === USER_DATA_COOKIE_NAME) {
        await persistentSession.cookies.flushStore()
      }
      return true
    } catch (error) {
      console.error('Error setting cookie:', error)
      return false
    }
  })

  ipcMain.handle('cookies:remove', async (_event, url, name) => {
    try {
      const cookieUrl = typeof url === 'string' && name ? url : `http://${COOKIE_DOMAIN}`
      const cookieName = name || url // If only one arg, it's the name
      await persistentSession.cookies.remove(cookieUrl, cookieName)
      await persistentSession.cookies.flushStore()
      return true
    } catch (error) {
      console.error('Error removing cookie:', error)
      return false
    }
  })

  // Handles removal of all auth-related cookies
  ipcMain.handle('cookies:clearAuth', async () => {
    try {
      await clearAuthCookies()
      return true
    } catch (error) {
      console.error('Error clearing auth cookies:', error)
      return false
    }
  })

  // Custom titlebar window control handlers
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) mainWindow.minimize()
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
    if (mainWindow) mainWindow.close()
    return null
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false
  })

  // Handlers for electron-store
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
