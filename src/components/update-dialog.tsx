import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import {
  CheckCircle,
  Download,
  RefreshCw,
  Clock,
  ArrowRight,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface UpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'auto' | 'manual'
}

export function UpdateDialog({ open, onOpenChange, mode = 'auto' }: UpdateDialogProps) {
  const {
    updateInfo,
    downloadProgress,
    downloaded,
    error,
    downloadUpdate,
    installUpdate,
    appInfo
  } = useUpdater()
  const [showLater, setShowLater] = useState(true)
  const [showNotes, setShowNotes] = useState(true)
  const [remainingTime, setRemainingTime] = useState<string | null>(null)
  const { t } = useTranslation(['updater'])

  // Calculate estimated time remaining during download
  useEffect(() => {
    if (downloadProgress && downloadProgress.bytesPerSecond > 0) {
      const remainingSecs =
        (downloadProgress.total - downloadProgress.transferred) / downloadProgress.bytesPerSecond
      if (remainingSecs < 60) {
        setRemainingTime(`${Math.round(remainingSecs)} detik`)
      } else {
        setRemainingTime(`${Math.round(remainingSecs / 60)} menit`)
      }
    } else {
      setRemainingTime(null)
    }
  }, [downloadProgress])

  // Store update preference if user chooses "Later"
  const handleLater = async () => {
    if (mode === 'auto') {
      // Store the update to be shown next time
      await window.api.store.set('update.pending', {
        version: updateInfo?.version,
        releaseNotes: updateInfo?.releaseNotes,
        date: new Date().toISOString()
      })
    }
    onOpenChange(false)
  }

  // Handle "Don't show again for this version"
  const handleDontShowAgain = async () => {
    if (updateInfo?.version) {
      await window.api.store.set('update.dismissedVersion', updateInfo.version)
      await window.api.store.set('preferences.autoUpdateNotifications', false)
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

  // Extract update type (major, minor, patch)
  const getUpdateType = () => {
    if (!updateInfo?.version || !appInfo?.version) return null

    const current = appInfo.version.split('.').map(Number)
    const update = updateInfo.version.split('.').map(Number)

    if (update[0] > current[0]) return 'major'
    if (update[1] > current[1]) return 'minor'
    return 'patch'
  }

  const updateType = getUpdateType()

  // Format version difference
  const getVersionDiff = () => {
    if (!updateInfo?.version || !appInfo?.version) return null

    return (
      <div className="flex items-center justify-center text-sm space-x-2 mt-3 p-2 bg-muted/30 rounded-md">
        <span className="font-mono text-muted-foreground">{appInfo.version}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="font-mono font-semibold text-foreground">{updateInfo.version}</span>
        {updateType && (
          <Badge
            variant={
              updateType === 'major'
                ? 'destructive'
                : updateType === 'minor'
                  ? 'default'
                  : 'outline'
            }
            className="ml-2"
          >
            {t(`dialog.version.types.${updateType}`)}
          </Badge>
        )}
      </div>
    )
  }

  // Render content based on state
  const renderContent = () => {
    if (error) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-destructive" />
              {t('dialog.error.title')}
            </DialogTitle>
            <DialogDescription className="mt-2">
              {t('dialog.error.description', { message: error.message })}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-4">
            <p className="text-sm">{t('dialog.error.suggestion')}</p>
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('dialog.actions.close')}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('dialog.actions.tryAgain')}
            </Button>
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
              {t('dialog.ready.title')}
            </DialogTitle>
            <DialogDescription className="mt-2">
              {t('dialog.ready.description', { version: updateInfo?.version })}
            </DialogDescription>
          </DialogHeader>

          {getVersionDiff()}

          <div className="bg-primary/10 border border-primary/20 rounded-md p-4 mt-4">
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 text-primary" />
              <p className="text-sm font-medium">{t('dialog.ready.saveWorkMessage')}</p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button onClick={handleUpdate} variant="default" className="relative group w-full">
              <span className="flex items-center justify-center">
                <RefreshCw className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
                {t('dialog.actions.restartAndInstall')}
              </span>
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
              <Download className="h-5 w-5 mr-2 text-primary animate-pulse" />
              {t('dialog.downloading.title')}
            </DialogTitle>
            <DialogDescription className="mt-2">
              {t('dialog.downloading.description', { version: updateInfo?.version })}
            </DialogDescription>
          </DialogHeader>

          {getVersionDiff()}

          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>{Math.round(downloadProgress.percent)}% Complete</span>
                {remainingTime && (
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {t('dialog.downloadStats.timeRemaining', { time: remainingTime })}
                  </span>
                )}
              </div>
              <Progress value={downloadProgress.percent} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-muted-foreground mb-1">
                  {t('dialog.downloadStats.downloaded')}
                </div>
                <div className="font-semibold text-sm">
                  {(downloadProgress.transferred / 1048576).toFixed(1)} MB
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-muted-foreground mb-1">{t('dialog.downloadStats.total')}</div>
                <div className="font-semibold text-sm">
                  {(downloadProgress.total / 1048576).toFixed(1)} MB
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-muted-foreground mb-1">{t('dialog.downloadStats.speed')}</div>
                <div className="font-semibold text-sm">
                  {(downloadProgress.bytesPerSecond / 1048576).toFixed(1)} MB/s
                </div>
              </div>
            </div>
          </div>
        </>
      )
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2 text-primary" />
            {t('dialog.available.title')}
          </DialogTitle>
          <DialogDescription className="mt-2">
            {t('dialog.available.description')}
          </DialogDescription>
        </DialogHeader>

        {getVersionDiff()}

        {updateInfo?.releaseNotes && (
          <div className="my-6">
            <div
              className="flex justify-between items-center cursor-pointer mb-3 p-2 rounded-md hover:bg-muted/30 transition-colors"
              onClick={() => setShowNotes(!showNotes)}
            >
              <h4 className="font-medium">{t('dialog.releaseNotes')}</h4>
              {showNotes ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {showNotes && (
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-muted/20">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes }}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-6 gap-2">
          {showLater && mode === 'auto' && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={handleDontShowAgain} size="sm">
                      Don&apos;t show again
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Won&apos;t show auto notifications for this version</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleLater}>
                      <Clock className="h-4 w-4 mr-2" />
                      {t('dialog.actions.later')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{t('dialog.tooltip.later')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          {mode === 'manual' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
          <Button onClick={handleUpdate} className="relative group">
            <span className="flex items-center">
              <Download className="h-4 w-4 mr-2 transition-transform group-hover:translate-y-0.5" />
              {t('dialog.actions.updateNow')}
            </span>
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="sm:max-w-[500px]">{renderContent()}</DialogContent>
    </Dialog>
  )
}
