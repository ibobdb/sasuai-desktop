import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

class ApiClient {
  private static instance: ApiClient
  private cache = new Map<string, { data: any; timestamp: number }>()
  private pendingRequests = new Map<string, Promise<any>>()
  private readonly CACHE_DURATION = 30000

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private getCacheKey(url: string, options: any): string {
    const method = options.method || 'GET'
    const params = options.params
      ? Object.keys(options.params)
          .sort()
          .map((k) => `${k}=${options.params[k]}`)
          .join('&')
      : ''
    return `${method}:${url}${params ? '?' + params : ''}`
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  async request(url: string, options = {}) {
    const cacheKey = this.getCacheKey(url, options)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data
    }

    if (this.pendingRequests.has(cacheKey)) {
      return await this.pendingRequests.get(cacheKey)
    }

    const requestPromise = this.executeRequest(url, options, cacheKey)
    this.pendingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.pendingRequests.delete(cacheKey)
    }
  }

  private async executeRequest(url: string, options: any, cacheKey: string) {
    const response = await ipcRenderer.invoke('api:request', url, options)

    if (response.success === false && response.error) {
      const error = new Error(response.error.message)
      Object.assign(error, response.error)
      throw error
    }

    const result = response.success ? response.data : response

    if (response.success) {
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
    }

    return result
  }

  clearCache(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    }
  }
}

const apiClient = ApiClient.getInstance()

const api = {
  request: (url: string, options = {}) => apiClient.request(url, options),
  clearCache: () => apiClient.clearCache(),
  getCacheStats: () => apiClient.getCacheStats(),

  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key)
  },

  cookies: {
    get: (filter) => ipcRenderer.invoke('cookies:get', filter),
    set: (nameOrDetails, value) => {
      if (typeof nameOrDetails === 'string' && value !== undefined) {
        return ipcRenderer.invoke('cookies:set', {
          name: nameOrDetails,
          value: String(value)
        })
      } else {
        return ipcRenderer.invoke('cookies:set', nameOrDetails)
      }
    },
    remove: (urlOrName, name) => ipcRenderer.invoke('cookies:remove', urlOrName, name),
    clearAuth: () => ipcRenderer.invoke('cookies:clearAuth')
  },

  language: {
    get: () => ipcRenderer.invoke('language:get'),
    set: (lang: string) => ipcRenderer.invoke('language:set', lang)
  },

  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName')
  },

  printer: {
    getPrinters: () => ipcRenderer.invoke('printer:get-printers'),
    getSettings: () => ipcRenderer.invoke('printer:get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('printer:save-settings', settings),
    testPrint: () => ipcRenderer.invoke('printer:test-print'),
    printHTML: (htmlContent) => ipcRenderer.invoke('printer:print-html', htmlContent)
  },

  updater: {
    checkForUpdates: () => ipcRenderer.invoke('update:check'),
    downloadUpdate: () => ipcRenderer.invoke('update:download'),
    installUpdate: () => ipcRenderer.invoke('update:install'),

    onUpdateChecking: (callback) => {
      const handler = () => callback()
      ipcRenderer.on('update:checking', handler)
      return () => ipcRenderer.removeListener('update:checking', handler)
    },

    onUpdateAvailable: (callback) => {
      const handler = (_event, info) => callback(info)
      ipcRenderer.on('update:available', handler)
      return () => ipcRenderer.removeListener('update:available', handler)
    },

    onUpdateNotAvailable: (callback) => {
      const handler = (_event, info) => callback(info)
      ipcRenderer.on('update:not-available', handler)
      return () => ipcRenderer.removeListener('update:not-available', handler)
    },

    onUpdateError: (callback) => {
      const handler = (_event, error) => callback(error)
      ipcRenderer.on('update:error', handler)
      return () => ipcRenderer.removeListener('update:error', handler)
    },

    onUpdateProgress: (callback) => {
      const handler = (_event, progress) => callback(progress)
      ipcRenderer.on('update:progress', handler)
      return () => ipcRenderer.removeListener('update:progress', handler)
    },

    onUpdateDownloaded: (callback) => {
      const handler = (_event, info) => callback(info)
      ipcRenderer.on('update:downloaded', handler)
      return () => ipcRenderer.removeListener('update:downloaded', handler)
    },

    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('update:checking')
      ipcRenderer.removeAllListeners('update:available')
      ipcRenderer.removeAllListeners('update:not-available')
      ipcRenderer.removeAllListeners('update:error')
      ipcRenderer.removeAllListeners('update:progress')
      ipcRenderer.removeAllListeners('update:downloaded')
    }
  }
}

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
      minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
      maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
      closeWindow: () => ipcRenderer.invoke('window:close'),
      isWindowMaximized: () => ipcRenderer.invoke('window:isMaximized'),
      snapWindow: (position: string) => ipcRenderer.invoke('window:snap', position),

      onWindowStateChange: (callback: (isMaximized: boolean) => void) => {
        const subscription = (_event, isMaximized: boolean) => callback(isMaximized)
        ipcRenderer.on('window:state-changed', subscription)

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
