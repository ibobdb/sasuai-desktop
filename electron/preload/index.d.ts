import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fetchApi: (url: string, options?: any) => Promise<any>
      fetchWithAuth: (url: string, options?: any) => Promise<any>
      store: {
        get: (key: string) => Promise<any>
        set: (key: string, value: any) => Promise<boolean>
        delete: (key: string) => Promise<boolean>
      }
    }
  }
}
