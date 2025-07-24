import { useEffect, useState, useRef, useCallback } from 'react'
import { useUpdater } from '@/context/updater-provider'
import { UpdateDialog } from './update-dialog'

export function AutoUpdateCheck() {
  const { available, updateInfo, checkForUpdates } = useUpdater()

  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [checkedPending, setCheckedPending] = useState(false)
  const [autoNotificationsEnabled, setAutoNotificationsEnabled] = useState(true)

  const initialCheckRef = useRef(false)
  const updateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const performUpdateCheck = useCallback(async () => {
    if (updateCheckTimeoutRef.current) {
      clearTimeout(updateCheckTimeoutRef.current)
      updateCheckTimeoutRef.current = null
    }

    try {
      await checkForUpdates()
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Update check failed:', error)
      }
    }
  }, [checkForUpdates])

  useEffect(() => {
    const checkPreferences = async () => {
      try {
        const autoUpdates = await window.api.store.get('preferences.autoUpdateNotifications')
        const dismissedVersion = await window.api.store.get('update.dismissedVersion')

        if (dismissedVersion === updateInfo?.version) {
          setAutoNotificationsEnabled(false)
        } else {
          setAutoNotificationsEnabled(autoUpdates !== false)
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error checking update preferences:', error)
        }
      }
    }

    checkPreferences()
  }, [updateInfo?.version])

  useEffect(() => {
    const checkPendingUpdates = async () => {
      if (checkedPending) return

      try {
        const pendingUpdate = await window.api.store.get('update.pending')
        if (pendingUpdate && autoNotificationsEnabled) {
          performUpdateCheck()
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error checking pending updates:', error)
        }
      } finally {
        setCheckedPending(true)
      }
    }

    checkPendingUpdates()
  }, [checkedPending, autoNotificationsEnabled, performUpdateCheck])

  useEffect(() => {
    if (!initialCheckRef.current && autoNotificationsEnabled) {
      initialCheckRef.current = true

      updateCheckTimeoutRef.current = setTimeout(() => {
        performUpdateCheck()
      }, 10000)
    }

    return () => {
      if (updateCheckTimeoutRef.current) {
        clearTimeout(updateCheckTimeoutRef.current)
        updateCheckTimeoutRef.current = null
      }
    }
  }, [autoNotificationsEnabled, performUpdateCheck])

  useEffect(() => {
    if (available && updateInfo && autoNotificationsEnabled) {
      setShowUpdateDialog(true)
    }
  }, [available, updateInfo, autoNotificationsEnabled])

  const handleDialogClose = async (open: boolean) => {
    if (!open && available && updateInfo) {
      await window.api.store.set('update.dismissedVersion', updateInfo.version)
      setAutoNotificationsEnabled(false)
    }
    setShowUpdateDialog(open)
  }

  return <UpdateDialog open={showUpdateDialog} onOpenChange={handleDialogClose} mode="auto" />
}
