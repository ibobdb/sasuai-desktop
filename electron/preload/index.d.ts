import { ElectronAPI } from '@electron-toolkit/preload'

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

interface UpdateInfo {
  version: string
  files: Array<{ url: string; sha512: string; size: number }>
  path: string
  sha512: string
  releaseDate: string
  releaseName?: string
  releaseNotes?: string
}

interface UpdateProgress {
  bytesPerSecond: number
  percent: number
  transferred: number
  total: number
}

interface PrinterSettings {
  printerName: string
  paperSize: '58mm' | '80mm' | '78mm' | '76mm' | '57mm' | '44mm'
  margin: string
  copies: number
  timeOutPerLine: number
  fontSize: number
  fontFamily: string
  lineHeight: number
  enableBold: boolean
  autocut: boolean
  cashdrawer: boolean
  encoding: string
}

// Remove PrintReceipt interface since we only use HTML now

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
      updater: {
        checkForUpdates: () => Promise<any>
        downloadUpdate: () => Promise<boolean>
        installUpdate: () => Promise<boolean>
        onUpdateChecking: (callback: () => void) => () => void
        onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void
        onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => () => void
        onUpdateError: (callback: (error: Error) => void) => () => void
        onUpdateProgress: (callback: (progress: UpdateProgress) => void) => () => void
        onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void
      }
      app: {
        getVersion: () => Promise<string>
        getName: () => Promise<string>
      }
      printer: {
        getPrinters: () => Promise<{
          success: boolean
          data?: string[]
          error?: { message: string }
        }>
        getSettings: () => Promise<{
          success: boolean
          data?: PrinterSettings
          error?: { message: string }
        }>
        saveSettings: (
          settings: Partial<PrinterSettings>
        ) => Promise<{ success: boolean; error?: { message: string } }>
        testPrint: () => Promise<{ success: boolean; error?: { message: string } }>
        printHTML: (
          htmlContent: string
        ) => Promise<{ success: boolean; error?: { message: string } }>
      }
    }
  }
}
