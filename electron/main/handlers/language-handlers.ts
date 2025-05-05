import { ipcMain } from 'electron'
import { store } from '../index'

export function setupLanguageHandlers() {
  // Set up IPC handlers for language preferences
  ipcMain.handle('language:get', () => {
    return store.get('language', 'en') // Default to English
  })

  ipcMain.handle('language:set', (_event, lang) => {
    store.set('language', lang)
    return true
  })
}
