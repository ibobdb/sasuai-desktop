import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

    contextBridge.exposeInMainWorld('api', {
      request: async (url: string, options = {}) => {
        const response = await ipcRenderer.invoke('api:request', url, options)

        if (response.success === false && response.error) {
          // Convert the error object back to a proper Error that can be caught
          const error = new Error(response.error.message)
          // Add any additional properties from the error object
          Object.assign(error, response.error)
          throw error
        }

        return response.success ? response.data : response
      },

      store: {
        get: (key) => ipcRenderer.invoke('store:get', key),
        set: (key, value) => ipcRenderer.invoke('store:set', key, value),
        delete: (key) => ipcRenderer.invoke('store:delete', key)
      },

      cookies: {
        // Get a cookie by name or with filter object
        get: (filter) => ipcRenderer.invoke('cookies:get', filter),

        // Set a cookie
        set: (nameOrDetails, value) => {
          if (typeof nameOrDetails === 'string' && value !== undefined) {
            // Simple form: (name, value)
            return ipcRenderer.invoke('cookies:set', {
              name: nameOrDetails,
              value: String(value)
            })
          } else {
            // Full form: (cookieDetails)
            return ipcRenderer.invoke('cookies:set', nameOrDetails)
          }
        },

        // Remove a cookie
        remove: (urlOrName, name) => ipcRenderer.invoke('cookies:remove', urlOrName, name),

        clearAuth: () => ipcRenderer.invoke('cookies:clearAuth')
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
