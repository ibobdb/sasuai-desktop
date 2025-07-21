import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardShortcut, PrinterConfig, GeneralConfig, SettingsConfig } from '@/types/settings'
import { DEFAULT_KEYBOARD_SHORTCUTS, getKeyboardShortcuts } from '@/config/keyboard-shortcuts'

const defaultGeneralConfig: GeneralConfig = {
  language: 'id',
  theme: 'system',
  autoStart: false,
  minimizeToTray: true,
  autoUpdate: true
}

const defaultPrinterConfig: PrinterConfig = {
  id: 'default-printer',
  name: 'Default Printer',
  type: 'thermal',
  connection: 'usb',
  settings: {
    paperWidth: 80,
    dpi: 203,
    characterSet: 'utf-8',
    autocut: true,
    buzzer: false,
    drawer: false
  },
  isDefault: true,
  isActive: false
}

const defaultSettings: SettingsConfig = {
  general: defaultGeneralConfig,
  keyboard: DEFAULT_KEYBOARD_SHORTCUTS,
  printer: defaultPrinterConfig
}

// Utility functions
const mergeKeyboardShortcuts = (
  stored: KeyboardShortcut[] | undefined,
  defaults: KeyboardShortcut[]
): KeyboardShortcut[] => {
  if (!stored || !Array.isArray(stored)) {
    return defaults
  }

  return defaults.map((defaultShortcut) => {
    const storedShortcut = stored.find((s) => s.id === defaultShortcut.id)
    return storedShortcut || defaultShortcut
  })
}

export function useSettings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<SettingsConfig>(defaultSettings)
  const [loading, setLoading] = useState(true)

  // Get translated keyboard shortcuts
  const translatedKeyboardShortcuts = getKeyboardShortcuts(t)

  const loadSettings = useCallback(async () => {
    try {
      // Load settings from Electron Store instead of localStorage
      const [storedGeneral, storedKeyboard, storedPrinter] = await Promise.all([
        window.api?.store?.get('settings.general'),
        window.api?.store?.get('settings.keyboard'),
        window.api?.store?.get('settings.printer')
      ])

      // Merge keyboard shortcuts to ensure all defaults exist
      const keyboardShortcuts = mergeKeyboardShortcuts(
        storedKeyboard as KeyboardShortcut[] | undefined,
        translatedKeyboardShortcuts
      )

      setSettings({
        general: { ...defaultGeneralConfig, ...storedGeneral },
        keyboard: keyboardShortcuts,
        printer: { ...defaultPrinterConfig, ...storedPrinter }
      })
    } catch (error) {
      console.error('Failed to load settings from Electron Store:', error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }, [translatedKeyboardShortcuts])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = useCallback(async (newSettings: SettingsConfig): Promise<boolean> => {
    try {
      // Save to Electron Store instead of localStorage
      await Promise.all([
        window.api?.store?.set('settings.general', newSettings.general),
        window.api?.store?.set('settings.keyboard', newSettings.keyboard),
        window.api?.store?.set('settings.printer', newSettings.printer)
      ])

      setSettings(newSettings)
      return true
    } catch (error) {
      console.error('Failed to save settings to Electron Store:', error)
      return false
    }
  }, [])

  const updateGeneralSettings = useCallback(
    async (updates: Partial<GeneralConfig>): Promise<boolean> => {
      const newSettings = {
        ...settings,
        general: { ...settings.general, ...updates }
      }
      return await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  const updateKeyboardShortcuts = useCallback(
    async (shortcuts: KeyboardShortcut[]): Promise<boolean> => {
      const newSettings = {
        ...settings,
        keyboard: shortcuts
      }
      return await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  const updateKeyboardShortcut = useCallback(
    async (shortcut: KeyboardShortcut): Promise<boolean> => {
      const updatedShortcuts = settings.keyboard.map((s) => (s.id === shortcut.id ? shortcut : s))
      return await updateKeyboardShortcuts(updatedShortcuts)
    },
    [settings.keyboard, updateKeyboardShortcuts]
  )

  const resetKeyboardShortcut = useCallback(
    async (shortcutId: string): Promise<boolean> => {
      const shortcut = settings.keyboard.find((s) => s.id === shortcutId)
      if (shortcut) {
        const resetShortcut = { ...shortcut, keys: [...shortcut.defaultKeys] }
        return await updateKeyboardShortcut(resetShortcut)
      }
      return false
    },
    [settings.keyboard, updateKeyboardShortcut]
  )

  const resetAllKeyboardShortcuts = useCallback(async (): Promise<boolean> => {
    const resetShortcuts = settings.keyboard.map((shortcut) => ({
      ...shortcut,
      keys: [...shortcut.defaultKeys]
    }))
    return await updateKeyboardShortcuts(resetShortcuts)
  }, [settings.keyboard, updateKeyboardShortcuts])

  const updatePrinterSettings = useCallback(
    async (updates: Partial<PrinterConfig>): Promise<boolean> => {
      const newSettings = {
        ...settings,
        printer: { ...settings.printer, ...updates }
      }
      return await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    return await saveSettings(defaultSettings)
  }, [saveSettings])

  const exportSettings = useCallback((): boolean => {
    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `sasuai-store-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Failed to export settings:', error)
      return false
    }
  }, [settings])

  const importSettings = useCallback(
    (file: File): Promise<boolean> =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string
            const importedSettings = JSON.parse(content)

            if (importedSettings.general && importedSettings.keyboard && importedSettings.printer) {
              const success = await saveSettings(importedSettings)
              resolve(success)
            } else {
              resolve(false)
            }
          } catch (error) {
            console.error('Failed to import settings:', error)
            resolve(false)
          }
        }
        reader.onerror = () => resolve(false)
        reader.readAsText(file)
      }),
    [saveSettings]
  )

  return {
    settings,
    loading,
    updateGeneralSettings,
    updateKeyboardShortcuts,
    updateKeyboardShortcut,
    resetKeyboardShortcut,
    resetAllKeyboardShortcuts,
    updatePrinterSettings,
    resetToDefaults,
    exportSettings,
    importSettings
  }
}
