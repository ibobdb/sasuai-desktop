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

let mainWindow: BrowserWindow | null = null
const store = new Store()

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false, // Using custom titlebar
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      // Use a persistent partition for session data
      partition: PERSIST_PARTITION
    }
  })

  // Get the persistent session
  persistentSession = session.fromPartition(PERSIST_PARTITION)

  // Add navigation event handlers to flush cookies
  mainWindow.webContents.on('did-start-navigation', () => {
    persistentSession.cookies.flushStore().catch((err) => {
      console.error('Failed to flush cookie store on navigation start:', err)
    })
  })

  mainWindow.webContents.on('did-navigate', () => {
    persistentSession.cookies.flushStore().catch((err) => {
      console.error('Failed to flush cookie store after navigation:', err)
    })
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
    withCredentials: true // Enable sending/receiving cookies with requests
  })

  // Request interceptor to add auth token
  instance.interceptors.request.use(async (config) => {
    try {
      // Use the persistent session to get cookies
      const cookies = await persistentSession.cookies.get({
        name: AUTH_COOKIE_NAME
      })

      if (cookies.length > 0) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${cookies[0].value}`
      }

      return config
    } catch (error) {
      console.error('Error adding auth token:', error)
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
      const requestOptions = { ...options }

      // Make the request
      const response = await apiClient({
        url,
        ...requestOptions
      })

      return response.data
    } catch (error: any) {
      // Proper error handling with status codes
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API request failed with status:', error.response.status)

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
        // The request was made but no response was received
        console.error('API request failed, no response received')
        throw {
          status: 0,
          message: 'No response from server'
        }
      } else {
        // Something happened in setting up the request
        console.error('API request setup error:', error.message)
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
      // Use persistent session
      await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, AUTH_COOKIE_NAME)
      await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, USER_DATA_COOKIE_NAME)
      await persistentSession.cookies.flushStore()
    } catch (err) {
      console.error('Error clearing auth cookies:', err)
    }
  }

  // Cookie management handlers with improved security based on Electron docs
  ipcMain.handle('cookies:get', async (_event, filter) => {
    try {
      // Allow getting cookies by name or with additional filters
      const cookieFilter = typeof filter === 'string' ? { name: filter } : filter

      // Use persistent session
      const cookies = await persistentSession.cookies.get(cookieFilter)
      console.log(`Getting cookie ${JSON.stringify(cookieFilter)}, found: ${cookies.length}`)
      return cookies.length > 0 ? cookies[0].value : null
    } catch (error) {
      console.error('Error getting cookie:', error)
      return null
    }
  })

  ipcMain.handle('cookies:set', async (_event, details) => {
    try {
      // Ensure we always have a valid URL parameter
      let cookieDetails

      if (typeof details === 'object') {
        if (details.name && details.value !== undefined) {
          // It's likely {name, value} pair
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
          cookieDetails.sameSite = 'lax' // Match the observed sameSite value
        } else if (details.url && details.name) {
          // It's a complete cookie object
          cookieDetails = details
        } else {
          throw new Error(
            'Invalid cookie details: must provide name and value or complete cookie object'
          )
        }
      } else {
        throw new Error('Invalid cookie details: must be an object')
      }

      console.log(
        `Setting cookie: ${cookieDetails.name}=${cookieDetails.value.substring(0, 20)}...`
      )

      // Use persistent session
      await persistentSession.cookies.set(cookieDetails)

      // Force write cookies to disk immediately for auth cookies
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
      // Handle both simple name and url+name pairs
      const cookieUrl = typeof url === 'string' && name ? url : `http://${COOKIE_DOMAIN}`
      const cookieName = name || url // If only one arg, it's the name

      // Use persistent session
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
      // Use persistent session
      await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, AUTH_COOKIE_NAME)
      await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, USER_DATA_COOKIE_NAME)
      await persistentSession.cookies.flushStore()
      return true
    } catch (error) {
      console.error('Error clearing auth cookies:', error)
      return false
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
