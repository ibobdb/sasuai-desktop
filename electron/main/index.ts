import { app, BrowserWindow, session } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import Store from 'electron-store'
import { createWindow, getMainWindow } from './window'
import { setupApiHandlers } from './handlers/api-handlers'
import { setupCookieHandlers } from './handlers/cookie-handlers'
import { setupWindowHandlers } from './handlers/window-handlers'
import { setupStoreHandlers } from './handlers/store-handlers'
import { setupLanguageHandlers } from './handlers/language-handlers'
import { setupAutoUpdater } from './updater'

// Create store instance
export const store = new Store()

// Define a persistent partition name
export const PERSIST_PARTITION = 'persist:sasuai-store-app'
// Reference to the persistent session
export let persistentSession: Electron.Session

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Watch window shortcuts
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize persistent session
  persistentSession = session.fromPartition(PERSIST_PARTITION)

  // Create the main window
  createWindow()

  // Setup the auto updater (only if the window exists)
  const mainWindow = getMainWindow()
  if (mainWindow) {
    setupAutoUpdater(mainWindow)
  }

  // Set up all IPC handlers
  setupApiHandlers()
  setupCookieHandlers()
  setupWindowHandlers()
  setupStoreHandlers()
  setupLanguageHandlers()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
