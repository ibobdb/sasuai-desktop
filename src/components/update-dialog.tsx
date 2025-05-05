import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUpdater } from '@/context/updater-provider'
import { AlertCircle, CheckCircle, Download, RefreshCw } from 'lucide-react'

interface UpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'auto' | 'manual'
}

export function UpdateDialog({ open, onOpenChange, mode = 'auto' }: UpdateDialogProps) {
  const { updateInfo, downloadProgress, downloaded, error, downloadUpdate, installUpdate } =
    useUpdater()
  const [showLater, setShowLater] = useState(true)

  // Store update preference if user chooses "Later"
  const handleLater = () => {
    if (mode === 'auto') {
      // Store the update to be shown next time
      window.api.store.set('update.pending', {
        version: updateInfo?.version,
        releaseNotes: updateInfo?.releaseNotes,
        date: new Date().toISOString()
      })
    }
    onOpenChange(false)
  }

  // On download complete, ask to restart
  useEffect(() => {
    if (downloaded) {
      setShowLater(false)
    }
  }, [downloaded])

  const handleUpdate = async () => {
    if (downloaded) {
      await installUpdate()
    } else {
      await downloadUpdate()
      setShowLater(false)
    }
  }

  // Render content based on state
  const renderContent = () => {
    if (error) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
              Update Error
            </DialogTitle>
            <DialogDescription>
              An error occurred while checking for updates: {error.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </>
      )
    }

    if (downloaded) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-primary" />
              Update Ready to Install
            </DialogTitle>
            <DialogDescription>
              Update to version {updateInfo?.version} has been downloaded and is ready to install.
              The application will restart to apply the update.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={handleUpdate} variant="default">
              Restart and Install
            </Button>
          </DialogFooter>
        </>
      )
    }

    if (downloadProgress) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2 animate-bounce text-primary" />
              Downloading Update
            </DialogTitle>
            <DialogDescription>
              Downloading version {updateInfo?.version}... {Math.round(downloadProgress.percent)}%
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Progress value={downloadProgress.percent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {(downloadProgress.transferred / 1048576).toFixed(2)} MB of{' '}
              {(downloadProgress.total / 1048576).toFixed(2)} MB
              {' • '}
              {(downloadProgress.bytesPerSecond / 1048576).toFixed(2)} MB/s
            </p>
          </div>
        </>
      )
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-primary" />
            Update Available
          </DialogTitle>
          <DialogDescription>
            Version {updateInfo?.version} is now available. You are currently using version{' '}
            {window.api.app.getVersion()}.
          </DialogDescription>
        </DialogHeader>

        {updateInfo?.releaseNotes && (
          <div className="my-4 max-h-60 overflow-y-auto border rounded p-3 bg-muted/30">
            <h4 className="font-medium mb-2">Release Notes:</h4>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes }}
            />
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          {showLater && (
            <Button variant="outline" onClick={handleLater}>
              Later
            </Button>
          )}
          <Button onClick={handleUpdate}>{downloaded ? 'Restart and Update' : 'Update Now'}</Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">{renderContent()}</DialogContent>
    </Dialog>
  )
}
