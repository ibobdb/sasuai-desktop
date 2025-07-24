import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PrinterSettings } from '@/types/settings'

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
    margin: '0',
    copies: 1,
    fontSize: 12,
    fontFamily: 'Courier New',
    lineHeight: 1.2,
    enableBold: true
  })
  const [originalSettings, setOriginalSettings] = useState<PrinterSettings>(settings)
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingPrint, setIsTestingPrint] = useState(false)

  const settingsHash = useMemo(() => {
    return Object.entries(settings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
  }, [settings])

  const originalHash = useMemo(() => {
    return Object.entries(originalSettings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
  }, [originalSettings])

  const hasUnsavedChanges = useMemo(() => {
    return settingsHash !== originalHash
  }, [settingsHash, originalHash])

  const loadSettings = useCallback(async () => {
    try {
      const response: PrinterResponse = await window.api.printer.getSettings()
      if (response.success && response.data) {
        setSettings(response.data)
        setOriginalSettings(response.data)
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
          setOriginalSettings(newSettings)
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
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: value
      }))
    },
    []
  )

  const handleSaveSettings = useCallback(async () => {
    await saveSettings(settings)
  }, [saveSettings, settings])

  const handleTestPrint = useCallback(async () => {
    setIsTestingPrint(true)
    try {
      const response = await window.api.printer.testPrint()
      if (response.success) {
        toast.success(t('printer.testPrintSuccess'))
      } else {
        throw new Error(response.error?.message || t('printer.testPrintError'))
      }
    } catch (error) {
      console.error('Test print failed:', error)
      toast.error(error instanceof Error ? error.message : t('printer.testPrintError'))
    } finally {
      setIsTestingPrint(false)
    }
  }, [t])

  const paperSizeOptions = useMemo(
    () => [
      { value: '58mm', label: '58mm' },
      { value: '57mm', label: '57mm' },
      { value: '76mm', label: '76mm' },
      { value: '78mm', label: '78mm' },
      { value: '80mm', label: '80mm' },
      { value: '44mm', label: '44mm' }
    ],
    []
  )

  const fontFamilyOptions = useMemo(
    () => [
      { value: 'Courier New', label: 'Courier New' },
      { value: 'Consolas', label: 'Consolas' },
      { value: 'Monaco', label: 'Monaco' },
      { value: 'Lucida Console', label: 'Lucida Console' },
      { value: 'Arial', label: 'Arial' },
      { value: 'Verdana', label: 'Verdana' }
    ],
    []
  )

  const printerOptions = useMemo(() => {
    return [
      { value: 'system-default', label: t('printer.systemDefault') },
      ...availablePrinters.map((printer) => ({ value: printer, label: printer }))
    ]
  }, [availablePrinters, t])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Printer Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">{t('printer.selectPrinter')}</Label>
              <Select
                value={settings.printerName || 'system-default'}
                onValueChange={(printerName) =>
                  updateSetting('printerName', printerName === 'system-default' ? '' : printerName)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('printer.selectPrinterPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {printerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Paper & Print Settings */}
            <div className="space-y-2">
              <Label className="text-sm">{t('printer.paperSize')}</Label>
              <Select
                value={settings.paperSize}
                onValueChange={(paperSize: PrinterSettings['paperSize']) =>
                  updateSetting('paperSize', paperSize)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paperSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('printer.copies')}</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={settings.copies}
                onChange={(e) => updateSetting('copies', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('printer.margin')} (mm)</Label>
              <Input
                type="text"
                placeholder="0"
                value={settings.margin}
                onChange={(e) => updateSetting('margin', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('printer.fontSize')} (px)</Label>
              <Input
                type="number"
                min="8"
                max="24"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value) || 12)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('printer.fontFamily')}</Label>
              <Select
                value={settings.fontFamily}
                onValueChange={(fontFamily: string) => updateSetting('fontFamily', fontFamily)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('printer.lineHeight')}</Label>
              <Input
                type="number"
                min="0.8"
                max="3"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value) || 1.2)}
              />
            </div>
          </div>

          {/* Print Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('printer.printOptions')}</Label>
            <div className="space-y-2">
              <Label htmlFor="enableBold" className="text-sm cursor-pointer">
                {t('printer.enableBold')}
              </Label>
              <Switch
                id="enableBold"
                checked={settings.enableBold}
                onCheckedChange={(enableBold) => updateSetting('enableBold', enableBold)}
              />
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    {t('printer.unsavedChanges')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button
                onClick={handleTestPrint}
                disabled={isTestingPrint}
                variant="outline"
                className="min-w-[120px]"
              >
                {isTestingPrint ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('printer.testing')}
                  </>
                ) : (
                  t('printer.testPrint')
                )}
              </Button>
              {hasUnsavedChanges && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSettings(originalSettings)
                    toast.success(t('printer.changesDiscarded'))
                  }}
                  disabled={isSaving}
                  className="min-w-[100px]"
                >
                  {t('actions.cancel', { ns: 'common' })}
                </Button>
              )}
              <Button
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges || isSaving}
                className="min-w-[120px]"
                size="default"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('printer.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('actions.save', { ns: 'common' })}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
