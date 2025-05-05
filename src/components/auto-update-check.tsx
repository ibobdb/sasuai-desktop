import { useEffect, useState } from 'react'
import { useUpdater } from '@/context/updater-provider'
import { UpdateDialog } from './update-dialog'

export function AutoUpdateCheck() {
  const { available, updateInfo, checkForUpdates } = useUpdater()
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [checkedPending, setCheckedPending] = useState(false)

  // Check for any pending updates from previous sessions
  useEffect(() => {
    const checkPendingUpdates = async () => {
      try {
        const pendingUpdate = await window.api.store.get('update.pending')
        if (pendingUpdate) {
          // If there's a pending update, check for updates immediately
          await checkForUpdates()
        }
        setCheckedPending(true)
      } catch (error) {
        console.error('Error checking pending updates:', error)
        setCheckedPending(true)
      }
    }

    checkPendingUpdates()
  }, [checkForUpdates])

  // Show update dialog when an update is available
  useEffect(() => {
    if (available && updateInfo && checkedPending) {
      setShowUpdateDialog(true)
    }
  }, [available, updateInfo, checkedPending])

  return <UpdateDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog} mode="auto" />
}
