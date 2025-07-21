import { useState } from 'react'
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

  const getDuplicateShortcut = (keySequence: string[], excludeId?: string) => {
    if (keySequence.length === 0) return null
    const keySequenceString = keySequence.join(' + ')
    return settings.keyboard.find(
      (s) => s.id !== excludeId && s.keys.join(' + ') === keySequenceString
    )
  }

  const handleEditShortcut = (shortcut: KeyboardShortcut) => {
    setEditingId(shortcut.id)
    editKeyboardRecording.setKeySequence([...shortcut.keys])
  }

  const handleSaveEdit = (shortcutId: string) => {
    if (editKeyboardRecording.keySequence.length > 0) {
      const shortcut = settings.keyboard.find((s) => s.id === shortcutId)
      if (shortcut) {
        const keySequenceString = editKeyboardRecording.keySequence.join(' + ')
        const duplicateShortcut = settings.keyboard.find(
          (s) => s.id !== shortcutId && s.keys.join(' + ') === keySequenceString
        )

        if (duplicateShortcut) {
          alert(`Shortcut "${keySequenceString}" sudah digunakan untuk "${duplicateShortcut.name}"`)
          return
        }

        updateKeyboardShortcut({ ...shortcut, keys: editKeyboardRecording.keySequence })
      }
    }
    setEditingId(null)
    editKeyboardRecording.clearKeySequence()
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    editKeyboardRecording.clearKeySequence()
  }

  const handleResetShortcut = (shortcut: KeyboardShortcut) => {
    const newKeys = [...shortcut.defaultKeys]
    updateKeyboardShortcut({ ...shortcut, keys: newKeys })
  }

  return (
    <div className="space-y-6">
      {/* Shortcuts Table */}
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
            {settings.keyboard.map((shortcut) => (
              <TableRow key={shortcut.id}>
                <TableCell className="font-medium">{shortcut.name}</TableCell>
                <TableCell className="text-muted-foreground">{shortcut.description}</TableCell>
                <TableCell>
                  {editingId === shortcut.id ? (
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
                        getDuplicateShortcut(editKeyboardRecording.keySequence, shortcut.id) && (
                          <p className="text-xs text-red-600 font-medium">
                            ⚠️ Shortcut sudah digunakan untuk &quot;
                            {
                              getDuplicateShortcut(editKeyboardRecording.keySequence, shortcut.id)
                                ?.name
                            }
                            &quot;
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
                    isEditing={editingId === shortcut.id}
                    onEdit={() => handleEditShortcut(shortcut)}
                    onSave={() => handleSaveEdit(shortcut.id)}
                    onCancel={handleCancelEdit}
                    onReset={() => handleResetShortcut(shortcut)}
                    canSave={
                      editKeyboardRecording.keySequence.length > 0 &&
                      !getDuplicateShortcut(editKeyboardRecording.keySequence, shortcut.id)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Actions */}
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
