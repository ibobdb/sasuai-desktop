import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

// GitHub repository information
const REPO_OWNER = 'ibobdb'
const REPO_NAME = 'sasuai-dekstop'

// Track the update check state
let updateCheckInProgress = false
let updateCheckTimeout: NodeJS.Timeout | null = null

/**
 * Configure and initialize the auto-updater
 */
export function setupAutoUpdater(mainWindow: BrowserWindow) {
  // Configure updater to use GitHub repository
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: REPO_OWNER,
    repo: REPO_NAME
  })

  // force updater for dev
  autoUpdater.forceDevUpdateConfig = true

  // Disable auto download - we'll manually control this
  autoUpdater.autoDownload = false

  // Send update events to the renderer
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update:checking')
  })

  autoUpdater.on('update-available', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:available', info)
    }
  })

  autoUpdater.on('update-not-available', (info) => {
    mainWindow.webContents.send('update:not-available', info)
  })

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update:error', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update:progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update:downloaded', info)
  })

  // Handle IPC events from renderer
  ipcMain.handle('update:check', async () => {
    try {
      // Prevent multiple simultaneous checks
      if (updateCheckInProgress) {
        return null
      }

      updateCheckInProgress = true

      // Clear previous timeout if exists
      if (updateCheckTimeout) {
        clearTimeout(updateCheckTimeout)
      }

      const result = await autoUpdater.checkForUpdates()

      // Reset flag after a delay to prevent rapid consecutive checks
      updateCheckTimeout = setTimeout(() => {
        updateCheckInProgress = false
      }, 1000)

      return result
    } catch (error) {
      updateCheckInProgress = false
      throw error
    }
  })

  ipcMain.handle('update:download', async () => {
    await autoUpdater.downloadUpdate()
    return true
  })

  ipcMain.handle('update:install', () => {
    // Quit and install update
    autoUpdater.quitAndInstall(false, true)
    return true
  })

  // Get current app version
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })

  // Get app name
  ipcMain.handle('app:getName', () => {
    return app.getName()
  })

  // Check for updates automatically on app start (after a short delay)
  setTimeout(() => {
    if (!updateCheckInProgress) {
      updateCheckInProgress = true
      autoUpdater
        .checkForUpdates()
        .catch(() => {
          // Silent catch
        })
        .finally(() => {
          setTimeout(() => {
            updateCheckInProgress = false
          }, 1000)
        })
    }
  }, 6000)
}
