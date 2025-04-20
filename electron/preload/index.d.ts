import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fetchApi: (url: string, options?: any) => Promise<any>
    }
  }
}
