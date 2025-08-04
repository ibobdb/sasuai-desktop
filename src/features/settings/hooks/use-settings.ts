import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  KeyboardShortcut,
  PrinterSettings,
  GeneralConfig,
  SettingsConfig,
  StoreInfo,
  FooterInfo
} from '@/types/settings'
import { DEFAULT_KEYBOARD_SHORTCUTS, getKeyboardShortcuts } from '@/config/keyboard-shortcuts'

const defaultStoreInfo: StoreInfo = {
  name: 'Sasuai Store',
  address: 'Jl. Contoh No. 123, Jakarta',
  phone: '021-12345678',
  email: '',
  website: ''
}

const defaultFooterInfo: FooterInfo = {
  thankYouMessage: 'Terima kasih atas kunjungan Anda!',
  returnMessage: 'Selamat berbelanja kembali'
}

const defaultGeneralConfig: GeneralConfig = {
  language: 'id',
  theme: 'system',
  autoStart: false,
  autoUpdate: true,
  storeInfo: defaultStoreInfo,
  footerInfo: defaultFooterInfo
}

const defaultPrinterConfig: PrinterSettings = {
  printerName: '',
  paperSize: '58mm',
  margin: '0',
  copies: 1,
  fontSize: 12,
  fontFamily: 'Courier New',
  lineHeight: 1.2,
  enableBold: true
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
  const cacheRef = useRef<SettingsConfig | null>(null)

  const translatedKeyboardShortcuts = getKeyboardShortcuts(t)

  const loadSettings = useCallback(async () => {
    if (cacheRef.current) {
      setSettings(cacheRef.current)
      setLoading(false)
      return
    }

    try {
      const [storedGeneral, storedKeyboard, storedPrinter] = await Promise.all([
        window.api?.store?.get('settings.general'),
        window.api?.store?.get('settings.keyboard'),
        window.api?.store?.get('settings.printer')
      ])

      const keyboardShortcuts = mergeKeyboardShortcuts(
        storedKeyboard as KeyboardShortcut[] | undefined,
        translatedKeyboardShortcuts
      )

      // Pastikan general config ter-merge dengan benar
      const generalConfig =
        storedGeneral && typeof storedGeneral === 'object'
          ? {
              language: storedGeneral.language || defaultGeneralConfig.language,
              theme: storedGeneral.theme || defaultGeneralConfig.theme,
              autoStart: storedGeneral.autoStart ?? defaultGeneralConfig.autoStart,
              autoUpdate: storedGeneral.autoUpdate ?? defaultGeneralConfig.autoUpdate,
              storeInfo: storedGeneral.storeInfo || defaultStoreInfo,
              footerInfo: storedGeneral.footerInfo || defaultFooterInfo
            }
          : defaultGeneralConfig

      // Pastikan store info dan footer info tidak null/undefined
      if (generalConfig.storeInfo && typeof generalConfig.storeInfo === 'object') {
        generalConfig.storeInfo = { ...generalConfig.storeInfo }
      } else {
        generalConfig.storeInfo = defaultStoreInfo
      }

      if (generalConfig.footerInfo && typeof generalConfig.footerInfo === 'object') {
        generalConfig.footerInfo = { ...generalConfig.footerInfo }
      } else {
        generalConfig.footerInfo = defaultFooterInfo
      }

      const loadedSettings = {
        general: generalConfig,
        keyboard: keyboardShortcuts,
        printer: { ...defaultPrinterConfig, ...storedPrinter }
      }

      cacheRef.current = loadedSettings
      setSettings(loadedSettings)
    } catch {
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
      await Promise.all([
        window.api?.store?.set('settings.general', newSettings.general),
        window.api?.store?.set('settings.keyboard', newSettings.keyboard),
        window.api?.store?.set('settings.printer', newSettings.printer)
      ])

      cacheRef.current = newSettings
      setSettings(newSettings)
      return true
    } catch {
      return false
    }
  }, [])

  const updateStoreInfo = useCallback(
    async (storeInfo: StoreInfo): Promise<boolean> => {
      try {
        const success = await window.api?.store?.setStoreInfo?.(storeInfo)
        if (success) {
          const newSettings = {
            ...settings,
            general: { ...settings.general, storeInfo }
          }
          cacheRef.current = newSettings
          setSettings(newSettings)
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [settings]
  )

  const updateFooterInfo = useCallback(
    async (footerInfo: FooterInfo): Promise<boolean> => {
      try {
        const success = await window.api?.store?.setFooterInfo?.(footerInfo)
        if (success) {
          const newSettings = {
            ...settings,
            general: { ...settings.general, footerInfo }
          }
          cacheRef.current = newSettings
          setSettings(newSettings)
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [settings]
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
    async (updates: Partial<PrinterSettings>): Promise<boolean> => {
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
    } catch {
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
          } catch {
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
    updateStoreInfo,
    updateFooterInfo,
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
