import { useState, useCallback, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useSettings } from '../hooks/use-settings'
import { useKeyboardRecording } from '../hooks/use-keyboard-recording'
import { KeyboardShortcut } from '@/types/settings'
import { KeyboardInput } from './keyboard-input'
import { ShortcutRowActions } from './shortcut-row-actions'

export function KeyboardShortcutsTab() {
  const { t } = useTranslation('settings')
  const { settings, updateKeyboardShortcut, resetAllKeyboardShortcuts } = useSettings()
  const [editingId, setEditingId] = useState<string | null>(null)
  const editKeyboardRecording = useKeyboardRecording()

  const keySequenceMap = useMemo(() => {
    const map = new Map<string, KeyboardShortcut>()
    settings.keyboard.forEach((shortcut) => {
      const keyString = shortcut.keys.join(' + ')
      map.set(keyString, shortcut)
    })
    return map
  }, [settings.keyboard])

  const getDuplicateShortcut = useCallback(
    (keySequence: string[], excludeId?: string) => {
      if (keySequence.length === 0) return null
      const keySequenceString = keySequence.join(' + ')
      const shortcut = keySequenceMap.get(keySequenceString)
      return shortcut && shortcut.id !== excludeId ? shortcut : null
    },
    [keySequenceMap]
  )

  const handleEditShortcut = useCallback(
    (shortcut: KeyboardShortcut) => {
      setEditingId(shortcut.id)
      editKeyboardRecording.setKeySequence([...shortcut.keys])
    },
    [editKeyboardRecording]
  )

  const handleSaveEdit = useCallback(
    (shortcutId: string) => {
      if (editKeyboardRecording.keySequence.length > 0) {
        const shortcut = settings.keyboard.find((s) => s.id === shortcutId)
        if (shortcut) {
          const keySequenceString = editKeyboardRecording.keySequence.join(' + ')
          const duplicateShortcut = keySequenceMap.get(keySequenceString)

          if (duplicateShortcut && duplicateShortcut.id !== shortcutId) {
            alert(
              `Shortcut "${keySequenceString}" sudah digunakan untuk "${duplicateShortcut.name}"`
            )
            return
          }

          updateKeyboardShortcut({ ...shortcut, keys: editKeyboardRecording.keySequence })
        }
      }
      setEditingId(null)
      editKeyboardRecording.clearKeySequence()
    },
    [editKeyboardRecording, settings.keyboard, keySequenceMap, updateKeyboardShortcut]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    editKeyboardRecording.clearKeySequence()
  }, [editKeyboardRecording])

  const handleResetShortcut = useCallback(
    (shortcut: KeyboardShortcut) => {
      const newKeys = [...shortcut.defaultKeys]
      updateKeyboardShortcut({ ...shortcut, keys: newKeys })
    },
    [updateKeyboardShortcut]
  )

  const shortcutsTableData = useMemo(
    () =>
      settings.keyboard.map((shortcut) => ({
        shortcut,
        isEditing: editingId === shortcut.id,
        canSave:
          editKeyboardRecording.keySequence.length > 0 &&
          !getDuplicateShortcut(editKeyboardRecording.keySequence, shortcut.id)
      })),
    [settings.keyboard, editingId, editKeyboardRecording.keySequence, getDuplicateShortcut]
  )

  return (
    <div className="space-y-6">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('keyboard.action')}</TableHead>
              <TableHead>{t('keyboard.tableDescription')}</TableHead>
              <TableHead>{t('keyboard.shortcut')}</TableHead>
              <TableHead className="text-right">{t('keyboard.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shortcutsTableData.map(({ shortcut, isEditing, canSave }) => (
              <ShortcutTableRow
                key={shortcut.id}
                shortcut={shortcut}
                isEditing={isEditing}
                canSave={canSave}
                editKeyboardRecording={editKeyboardRecording}
                getDuplicateShortcut={getDuplicateShortcut}
                onEdit={handleEditShortcut}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onReset={handleResetShortcut}
                t={t}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {settings.keyboard.length} shortcuts total
        </div>
        <Button
          variant="outline"
          onClick={resetAllKeyboardShortcuts}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {t('keyboard.resetAll')}
        </Button>
      </div>
    </div>
  )
}

const ShortcutTableRow = memo(
  ({
    shortcut,
    isEditing,
    canSave,
    editKeyboardRecording,
    getDuplicateShortcut,
    onEdit,
    onSave,
    onCancel,
    onReset,
    t
  }: {
    shortcut: KeyboardShortcut
    isEditing: boolean
    canSave: boolean
    editKeyboardRecording: any
    getDuplicateShortcut: (keySequence: string[], excludeId?: string) => KeyboardShortcut | null
    onEdit: (shortcut: KeyboardShortcut) => void
    onSave: (shortcutId: string) => void
    onCancel: () => void
    onReset: (shortcut: KeyboardShortcut) => void
    t: any
  }) => {
    const duplicateShortcut = useMemo(
      () =>
        isEditing ? getDuplicateShortcut(editKeyboardRecording.keySequence, shortcut.id) : null,
      [isEditing, editKeyboardRecording.keySequence, shortcut.id, getDuplicateShortcut]
    )

    return (
      <TableRow>
        <TableCell className="font-medium">{shortcut.name}</TableCell>
        <TableCell className="text-muted-foreground">{shortcut.description}</TableCell>
        <TableCell>
          {isEditing ? (
            <div className="space-y-1">
              <KeyboardInput
                keySequence={editKeyboardRecording.keySequence}
                isRecording={editKeyboardRecording.isRecording}
                onKeyDown={editKeyboardRecording.handleKeyDown}
                onFocus={editKeyboardRecording.startRecording}
                onBlur={editKeyboardRecording.stopRecording}
                placeholder={t('keyboard.clickToRecord')}
                className="max-w-[200px]"
                inputRef={editKeyboardRecording.keyInputRef}
              />
              {!editKeyboardRecording.isRecording &&
                editKeyboardRecording.keySequence.length > 0 &&
                duplicateShortcut && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ Shortcut sudah digunakan untuk &quot;{duplicateShortcut.name}&quot;
                  </p>
                )}
            </div>
          ) : (
            <div className="flex gap-1 flex-wrap">
              {shortcut.keys.map((key, index) => (
                <Badge key={index} variant="outline" className="text-xs font-mono">
                  {key}
                </Badge>
              ))}
            </div>
          )}
        </TableCell>
        <TableCell className="text-right">
          <ShortcutRowActions
            shortcut={shortcut}
            isEditing={isEditing}
            onEdit={() => onEdit(shortcut)}
            onSave={() => onSave(shortcut.id)}
            onCancel={onCancel}
            onReset={() => onReset(shortcut)}
            canSave={canSave}
          />
        </TableCell>
      </TableRow>
    )
  }
)

ShortcutTableRow.displayName = 'ShortcutTableRow'
