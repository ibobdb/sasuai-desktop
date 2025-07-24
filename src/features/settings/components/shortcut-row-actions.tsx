import { useTranslation } from 'react-i18next'
import { RotateCcw, Edit3, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KeyboardShortcut } from '@/types/settings'
import { memo, useMemo } from 'react'

interface ShortcutRowActionsProps {
  shortcut: KeyboardShortcut
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onReset: () => void
  canSave: boolean
}

export const ShortcutRowActions = memo(function ShortcutRowActions({
  shortcut,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onReset,
  canSave
}: ShortcutRowActionsProps) {
  const { t } = useTranslation('settings')

  const isResetDisabled = useMemo(
    () => JSON.stringify(shortcut.keys) === JSON.stringify(shortcut.defaultKeys),
    [shortcut.keys, shortcut.defaultKeys]
  )

  if (isEditing) {
    return (
      <div className="flex gap-1 justify-end">
        <Button variant="ghost" size="sm" onClick={onSave} disabled={!canSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-1 justify-end">
      <Button variant="ghost" size="sm" onClick={onEdit} title={t('keyboard.edit')}>
        <Edit3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        disabled={isResetDisabled}
        title={t('keyboard.reset')}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
})
