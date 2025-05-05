import { ipcMain } from 'electron'
import { getMainWindow } from '../window'

export function setupWindowHandlers() {
  // Custom titlebar window control handlers
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
