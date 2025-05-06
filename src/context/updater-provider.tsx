import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

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

interface AppInfo {
  name: string
  version: string
}

interface UpdaterContextType {
  checking: boolean
  available: boolean
  updateInfo: UpdateInfo | null
  downloadProgress: UpdateProgress | null
  downloaded: boolean
  error: Error | null
  appInfo: AppInfo
  checkForUpdates: () => Promise<void>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
}

const UpdaterContext = createContext<UpdaterContextType | undefined>(undefined)

export function UpdaterProvider({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<UpdateProgress | null>(null)
  const [downloaded, setDownloaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo>({ name: '', version: '' })

  // Use a ref to track if an update check is in progress
  const checkInProgressRef = useRef(false)

  // Fetch app info on mount
  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const [name, version] = await Promise.all([
          window.api.app.getName(),
          window.api.app.getVersion()
        ])
        setAppInfo({ name, version })
      } catch (err) {
        console.error('Failed to fetch app info:', err)
      }
    }

    fetchAppInfo()
  }, [])

  // Set up event listeners
  useEffect(() => {
    // Clean up function for removing event listeners
    const cleanupFns: Array<() => void> = []

    cleanupFns.push(
      window.api.updater.onUpdateChecking(() => {
        setChecking(true)
        setError(null)
      })
    )

    cleanupFns.push(
      window.api.updater.onUpdateAvailable((info) => {
        setChecking(false)
        setAvailable(true)
        setUpdateInfo(info)
        setError(null)
      })
    )

    cleanupFns.push(
      window.api.updater.onUpdateNotAvailable((info) => {
        setChecking(false)
        setAvailable(false)
        setUpdateInfo(info)
        setError(null)
      })
    )

    cleanupFns.push(
      window.api.updater.onUpdateError((err) => {
        setChecking(false)
        setError(err)
      })
    )

    cleanupFns.push(
      window.api.updater.onUpdateProgress((progress) => {
        setDownloadProgress(progress)
      })
    )

    cleanupFns.push(
      window.api.updater.onUpdateDownloaded((info) => {
        setDownloaded(true)
        setDownloadProgress(null)
        setUpdateInfo(info)
      })
    )

    // Clean up event listeners on unmount
    return () => {
      cleanupFns.forEach((fn) => fn())
    }
  }, [])

  // Check for updates with debounce
  const checkForUpdates = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (checkInProgressRef.current) {
      return
    }

    try {
      checkInProgressRef.current = true
      setChecking(true)
      setError(null)
      await window.api.updater.checkForUpdates()
    } catch (err) {
      setError(err as Error)
    } finally {
      setChecking(false)
      // Allow next check after a short delay
      setTimeout(() => {
        checkInProgressRef.current = false
      }, 2000)
    }
  }, [])

  // Download update
  const downloadUpdate = async () => {
    try {
      setError(null)
      await window.api.updater.downloadUpdate()
    } catch (err) {
      setError(err as Error)
    }
  }

  // Install update
  const installUpdate = async () => {
    try {
      await window.api.updater.installUpdate()
    } catch (err) {
      setError(err as Error)
    }
  }

  return (
    <UpdaterContext.Provider
      value={{
        checking,
        available,
        updateInfo,
        downloadProgress,
        downloaded,
        error,
        appInfo,
        checkForUpdates,
        downloadUpdate,
        installUpdate
      }}
    >
      {children}
    </UpdaterContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUpdater = () => {
  const context = useContext(UpdaterContext)
  if (context === undefined) {
    throw new Error('useUpdater must be used within an UpdaterProvider')
  }
  return context
}
