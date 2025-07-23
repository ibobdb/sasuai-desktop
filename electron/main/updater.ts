import { BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

const REPO_OWNER = 'ibobdb'
const REPO_NAME = 'sasuai-dekstop'

let updateCheckInProgress = false
let updateCheckTimeout: NodeJS.Timeout | null = null

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: REPO_OWNER,
    repo: REPO_NAME
  })

  autoUpdater.forceDevUpdateConfig = true
  autoUpdater.autoDownload = false

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

  ipcMain.handle('update:check', async () => {
    try {
      if (updateCheckInProgress) {
        return null
      }

      updateCheckInProgress = true

      if (updateCheckTimeout) {
        clearTimeout(updateCheckTimeout)
      }

      const result = await autoUpdater.checkForUpdates()

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
    autoUpdater.quitAndInstall(false, true)
    return true
  })

  setTimeout(() => {
    if (!updateCheckInProgress) {
      updateCheckInProgress = true
      autoUpdater
        .checkForUpdates()
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            updateCheckInProgress = false
          }, 1000)
        })
    }
  }, 6000)
}
