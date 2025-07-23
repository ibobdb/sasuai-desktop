/*
 * MANUAL TIMER CLEANUP REQUIRED for src/context/updater-provider.tsx
 *
 * 1. Add useRef import: import { useRef } from 'react'
 * 2. Add timer ref: const timerRef = useRef<NodeJS.Timeout | null>(null)
 * 3. Add cleanup useEffect:
 *    useEffect(() => {
 *      return () => {
 *        if (timerRef.current) {
 *          clearTimeout(timerRef.current)
 *        }
 *      }
 *    }, [])
 * 4. Replace setTimeout calls:
 *    timerRef.current = setTimeout(() => { ... }, delay)
 */
import { createContext, useContext, useEffect, useState, useCallback, memo } from 'react'

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

interface UpdaterContextType {
  available: boolean
  updateInfo: UpdateInfo | null
  downloadProgress: UpdateProgress | null
  downloaded: boolean
  error: Error | null
  checking: boolean
  appInfo: { version: string; name: string } | null
  checkForUpdates: () => Promise<void>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
}

const UpdaterContext = createContext<UpdaterContextType | undefined>(undefined)

export function UpdaterProvider({ children }: { children: React.ReactNode }) {
  const [available, setAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<UpdateProgress | null>(null)
  const [downloaded, setDownloaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [checking, setChecking] = useState(false)
  const [appInfo, setAppInfo] = useState<{ version: string; name: string } | null>(null)

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
        if (import.meta.env.DEV)
          if (import.meta.env.DEV) console.error('Failed to fetch app info:', err)
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
    try {
      setChecking(true)
      setError(null)
      await window.api.updater.checkForUpdates()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check for updates'))
    } finally {
      setTimeout(() => setChecking(false), 500) // Minimum checking duration for UX
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

  const value: UpdaterContextType = {
    available,
    updateInfo,
    downloadProgress,
    downloaded,
    error,
    checking,
    appInfo,
    checkForUpdates,
    downloadUpdate,
    installUpdate
  }

  return <UpdaterContext.Provider value={value}>{children}</UpdaterContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUpdater = () => {
  const context = useContext(UpdaterContext)
  if (context === undefined) {
    throw new Error('useUpdater must be used within an UpdaterProvider')
  }
  return context
}
