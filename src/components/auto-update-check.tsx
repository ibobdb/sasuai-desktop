import { useEffect, useState, useRef } from 'react'
import { useUpdater } from '@/context/updater-provider'
import { UpdateDialog } from './update-dialog'

export function AutoUpdateCheck() {
  const { available, updateInfo, checkForUpdates } = useUpdater()
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [checkedPending, setCheckedPending] = useState(false)
  const [autoNotificationsEnabled, setAutoNotificationsEnabled] = useState(true)
  const initialCheckRef = useRef(false)
  const updateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check user preferences for auto-update notifications
  useEffect(() => {
    const checkPreferences = async () => {
      try {
        const autoUpdates = await window.api.store.get('preferences.autoUpdateNotifications')
        const dismissedVersion = await window.api.store.get('update.dismissedVersion')

        // If user has dismissed current version, don't show auto notifications
        if (dismissedVersion === updateInfo?.version) {
          setAutoNotificationsEnabled(false)
        } else {
          setAutoNotificationsEnabled(autoUpdates !== false) // Default to true
        }
      } catch (error) {
        console.error('Error checking update preferences:', error)
      }
    }

    checkPreferences()
  }, [updateInfo?.version])

  // Check for any pending updates from previous sessions only once
  useEffect(() => {
    const checkPendingUpdates = async () => {
      if (checkedPending) return

      try {
        const pendingUpdate = await window.api.store.get('update.pending')
        if (pendingUpdate && autoNotificationsEnabled) {
          performUpdateCheck()
        }
      } catch (error) {
        console.error('Error checking pending updates:', error)
      } finally {
        setCheckedPending(true)
      }
    }

    checkPendingUpdates()
  }, [checkedPending, autoNotificationsEnabled])

  // Function to perform update check with safeguards
  const performUpdateCheck = async () => {
    if (updateCheckTimeoutRef.current) {
      clearTimeout(updateCheckTimeoutRef.current)
      updateCheckTimeoutRef.current = null
    }

    try {
      await checkForUpdates()
    } catch (error) {
      console.error('Update check failed:', error)
    }
  }

  // Perform an initial update check just once if auto notifications are enabled
  useEffect(() => {
    if (!initialCheckRef.current && autoNotificationsEnabled) {
      initialCheckRef.current = true

      // Delay initial check to avoid conflicts with automatic check from main process
      updateCheckTimeoutRef.current = setTimeout(() => {
        performUpdateCheck()
      }, 10000)
    }

    return () => {
      if (updateCheckTimeoutRef.current) {
        clearTimeout(updateCheckTimeoutRef.current)
      }
    }
  }, [checkForUpdates, autoNotificationsEnabled])

  // Show update dialog when an update is available and auto notifications are enabled
  useEffect(() => {
    if (available && updateInfo && autoNotificationsEnabled) {
      setShowUpdateDialog(true)
    }
  }, [available, updateInfo, autoNotificationsEnabled])

  // Handle dialog close - store user preference if they dismiss
  const handleDialogClose = async (open: boolean) => {
    if (!open && available && updateInfo) {
      // User closed the dialog, store this version as dismissed
      await window.api.store.set('update.dismissedVersion', updateInfo.version)
      setAutoNotificationsEnabled(false)
    }
    setShowUpdateDialog(open)
  }

  return <UpdateDialog open={showUpdateDialog} onOpenChange={handleDialogClose} mode="auto" />
}
