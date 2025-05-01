import { ElectronAPI } from '@electron-toolkit/preload'

// Cookie interfaces to match Electron's API
interface CookieDetails {
  url?: string
  name: string
  value?: string
  domain?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  expirationDate?: number
  sameSite?: 'unspecified' | 'no_restriction' | 'lax' | 'strict'
}

interface CookieFilter {
  url?: string
  name?: string
  domain?: string
  path?: string
  secure?: boolean
  session?: boolean
  httpOnly?: boolean
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      request: (url: string, options?: any) => Promise<any>
      cookies: {
        get: (filter: string | CookieFilter) => Promise<any>
        set: (nameOrDetails: string | CookieDetails, value?: string) => Promise<boolean>
        remove: (urlOrName: string, name?: string) => Promise<boolean>
        clearAuth: () => Promise<boolean>
      }
      store: {
        get: (key: string) => Promise<any>
        set: (key: string, value: any) => Promise<boolean>
        delete: (key: string) => Promise<boolean>
      }
      language: {
        get: () => Promise<string>
        set: (lang: string) => Promise<boolean>
      }
    }
  }
}
