import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  fetchApi: (url: string, options?: any) => ipcRenderer.invoke('fetch-api', url, options)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      secureStore: {
        set: (key: string, value: string) => ipcRenderer.invoke('secure-store-set', key, value),
        get: (key: string) => ipcRenderer.invoke('secure-store-get', key),
        delete: (key: string) => ipcRenderer.invoke('secure-store-delete', key)
      }
    })

    contextBridge.exposeInMainWorld('electronAPI', {
      // Existing APIs
      minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
      maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
      closeWindow: () => ipcRenderer.invoke('window:close'),
      isWindowMaximized: () => ipcRenderer.invoke('window:isMaximized'),
      snapWindow: (position: string) => ipcRenderer.invoke('window:snap', position),

      // Event subscription for window state changes
      onWindowStateChange: (callback: (isMaximized: boolean) => void) => {
        const subscription = (_event, isMaximized: boolean) => callback(isMaximized)
        ipcRenderer.on('window:state-changed', subscription)

        // Return a function to remove the event listener
        return () => {
          ipcRenderer.removeListener('window:state-changed', subscription)
        }
      }
    })

    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
