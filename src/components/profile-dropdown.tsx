import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'
import { useUpdater } from '@/context/updater-provider'
import { toast } from 'sonner'
import { LogOut, RefreshCw, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { UpdateDialog } from './update-dialog'
import { useTranslation } from 'react-i18next'

export function ProfileDropdown() {
  const { user, signOut } = useAuth()
  const { available, updateInfo, checkForUpdates, checking, error } = useUpdater()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [isManualCheck, setIsManualCheck] = useState(false)
  const { t } = useTranslation(['common', 'updater'])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('You have been logged out')
      navigate({ to: '/sign-in' })
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  const handleCheckUpdates = async () => {
    setIsManualCheck(true)
    try {
      await checkForUpdates()

      // Small delay to show the checking state
      setTimeout(() => {
        if (available && updateInfo) {
          setShowUpdateDialog(true)
        } else {
          toast.success(t('updater:messages.upToDate'))
        }
        setIsManualCheck(false)
      }, 1000)
    } catch (error) {
      console.error('Update check failed:', error)
      toast.error(t('updater:messages.checkFailed'))
      setIsManualCheck(false)
    }
  }

  const getUpdateStatus = () => {
    if (checking || isManualCheck) {
      return {
        icon: RefreshCw,
        text: t('updater:status.checking'),
        iconClassName: 'animate-spin',
        textClassName: 'text-muted-foreground'
      }
    }

    if (error) {
      return {
        icon: AlertCircle,
        text: t('updater:status.checkForUpdates'),
        iconClassName: 'text-destructive',
        textClassName: ''
      }
    }

    if (available) {
      return {
        icon: Download,
        text: t('updater:status.updateAvailable'),
        iconClassName: 'text-primary animate-pulse',
        textClassName: 'text-primary font-medium'
      }
    }

    return {
      icon: CheckCircle,
      text: t('updater:status.checkForUpdates'),
      iconClassName: 'text-muted-foreground',
      textClassName: ''
    }
  }

  const updateStatus = getUpdateStatus()
  const StatusIcon = updateStatus.icon

  if (!user) return null

  return (
    <>
      <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full hover:bg-accent/80 hover:scale-105 transition-transform duration-200 group"
          >
            <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="hover:bg-accent">{user.name}</AvatarFallback>
            </Avatar>
            {available && !isOpen && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background animate-pulse" />
            )}
            {!isOpen && (
              <span
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 
                  pointer-events-none select-none
                  opacity-0 invisible shadow-none 
                  group-hover:opacity-100 group-hover:visible group-hover:shadow-sm
                  transition-all duration-150 delay-75 group-hover:delay-300 
                  whitespace-nowrap z-50"
              >
                {user.name}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal p-3 hover:bg-accent/50 rounded-t-lg transition-colors">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-sm leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />

          <DropdownMenuItem
            className={`cursor-pointer focus:bg-accent/80 hover:bg-accent/50 transition-colors duration-200 px-3 py-2 ${
              checking || isManualCheck ? 'opacity-75' : ''
            }`}
            onClick={handleCheckUpdates}
            disabled={checking || isManualCheck}
          >
            <StatusIcon className={`mr-2 h-4 w-4 ${updateStatus.iconClassName}`} />
            <span className={`flex-1 ${updateStatus.textClassName}`}>{updateStatus.text}</span>
            {available && !checking && !isManualCheck && (
              <DropdownMenuShortcut>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem
            className="cursor-pointer focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/5 hover:text-destructive rounded-b-lg transition-colors duration-200 px-3 py-2"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('common:actions.logout')}</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog} mode="manual" />
    </>
  )
}
