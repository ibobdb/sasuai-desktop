import { ipcMain } from 'electron'
import { store } from '../index'

export function setupStoreHandlers() {
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
}
