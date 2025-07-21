import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PrinterSettings } from '@/types/settings'
import { BasicPrintSettingsCard } from './printer/basic-print-settings-card'
import { TypographySettingsCard } from './printer/typography-settings-card'

interface PrinterResponse {
  success: boolean
  data?: any
  error?: { message: string }
}

export function PrinterSettingsTab() {
  const { t } = useTranslation(['settings'])
  const [settings, setSettings] = useState<PrinterSettings>({
    printerName: '',
    paperSize: '58mm',
    margin: '0 0 0 0',
    copies: 1,
    timeOutPerLine: 400,
    fontSize: 12,
    fontFamily: 'Courier New',
    lineHeight: 1.2,
    enableBold: true,
    autocut: false,
    cashdrawer: false,
    encoding: 'utf-8'
  })
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const response: PrinterResponse = await window.api.printer.getSettings()
      if (response.success && response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('Failed to load printer settings:', error)
      toast.error(t('printer.loadError'))
    }
  }, [t])

  const loadPrinters = useCallback(async () => {
    try {
      const response: PrinterResponse = await window.api.printer.getPrinters()
      if (response.success && response.data) {
        setAvailablePrinters(response.data)
      } else {
        throw new Error(response.error?.message || t('printer.getPrintersError'))
      }
    } catch (error) {
      console.error('Failed to get printers:', error)
      toast.error(t('printer.getPrintersError'))
    }
  }, [t])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
    loadPrinters()
  }, [loadSettings, loadPrinters])

  const saveSettings = useCallback(
    async (newSettings: PrinterSettings) => {
      setIsSaving(true)
      try {
        const response: PrinterResponse = await window.api.printer.saveSettings(newSettings)
        if (response.success) {
          setSettings(newSettings)
          toast.success(t('printer.saveSuccess'))
        } else {
          throw new Error(response.error?.message || t('printer.saveError'))
        }
      } catch (error) {
        console.error('Failed to save printer settings:', error)
        toast.error(t('printer.saveError'))
      } finally {
        setIsSaving(false)
      }
    },
    [t]
  )

  const updateSetting = useCallback(
    <K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) => {
      setSettings((prevSettings) => ({ ...prevSettings, [key]: value }))
    },
    []
  )

  const handleSaveSettings = useCallback(async () => {
    await saveSettings(settings)
  }, [saveSettings, settings])

  return (
    <div className="space-y-6">
      <BasicPrintSettingsCard
        settings={settings}
        availablePrinters={availablePrinters}
        isSaving={isSaving}
        onUpdateSetting={updateSetting}
        onSaveSettings={handleSaveSettings}
      />

      <TypographySettingsCard settings={settings} onUpdateSetting={updateSetting} />
    </div>
  )
}
