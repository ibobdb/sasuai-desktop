import { ReactNode, memo } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface DetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  loadingTitle?: string
  loadingDescription?: string
  title: string
  description?: string
  children: ReactNode
  footerContent?: ReactNode
  maxWidth?: string
  className?: string
  contentClassName?: string
  icon?: ReactNode
}

export function DetailDialog({
  open,
  onOpenChange,
  loading = false,
  loadingTitle = 'Loading',
  loadingDescription = 'Fetching data...',
  title,
  description,
  children,
  footerContent,
  maxWidth = 'sm:max-w-3xl',
  className,
  contentClassName,
  icon
}: DetailDialogProps) {
  const { t } = useTranslation(['common'])

  // Loading state dialog
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconLoader2 className="h-5 w-5 animate-spin" />
              {loadingTitle}
            </DialogTitle>
            <DialogDescription>{loadingDescription}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="mt-2 text-sm text-muted-foreground">{t('app.loading')}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          `max-w-[95vw] ${maxWidth} h-[90vh] flex flex-col p-0 gap-0 overflow-hidden`,
          className
        )}
      >
        <DialogHeader className="px-6 py-4 border-b bg-background z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {icon} {title}
              </DialogTitle>
              {description && <DialogDescription className="mt-1">{description}</DialogDescription>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="ml-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className={cn('h-full w-full', contentClassName)} type="auto">
            <div className="px-6 py-4 space-y-6">{children}</div>
          </ScrollArea>
        </div>

        {footerContent && (
          <div className="p-4 border-t bg-background z-10 shrink-0 flex flex-wrap justify-end gap-2">
            {footerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
