import { useEffect, useState, useRef } from 'react'
import { useUpdater } from '@/context/updater-provider'
import { UpdateDialog } from './update-dialog'

export function AutoUpdateCheck() {
  const { available, updateInfo, checkForUpdates } = useUpdater()
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [checkedPending, setCheckedPending] = useState(false)
  const initialCheckRef = useRef(false)
  const updateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check for any pending updates from previous sessions only once
  useEffect(() => {
    const checkPendingUpdates = async () => {
      if (checkedPending) return

      try {
        const pendingUpdate = await window.api.store.get('update.pending')
        if (pendingUpdate) {
          performUpdateCheck()
        }
      } catch (error) {
        console.error('Error checking pending updates:', error)
      } finally {
        setCheckedPending(true)
      }
    }

    checkPendingUpdates()
  }, [checkedPending])

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

  // Perform an initial update check just once
  useEffect(() => {
    if (!initialCheckRef.current) {
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
  }, [checkForUpdates])

  // Show update dialog when an update is available
  useEffect(() => {
    if (available && updateInfo) {
      setShowUpdateDialog(true)
    }
  }, [available, updateInfo])

  return <UpdateDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog} mode="auto" />
}
