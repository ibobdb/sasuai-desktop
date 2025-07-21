import { toast } from 'sonner'
import { useGlobalShortcuts } from '@/hooks/use-global-shortcuts'

export function useShortcutFeedback() {
  const { getShortcutByAction } = useGlobalShortcuts({})

  const showShortcutFeedback = (action: string, message?: string) => {
    const shortcut = getShortcutByAction(action)
    if (shortcut) {
      const keys = shortcut.keys.join(' + ')
      toast.success(message || `${shortcut.name} dijalankan`, {
        description: `Shortcut: ${keys}`,
        duration: 2000
      })
    }
  }

  const showShortcutError = (action: string, error: string) => {
    const shortcut = getShortcutByAction(action)
    if (shortcut) {
      const keys = shortcut.keys.join(' + ')
      toast.error(error, {
        description: `Shortcut: ${keys}`,
        duration: 3000
      })
    }
  }

  return {
    showShortcutFeedback,
    showShortcutError
  }
}
