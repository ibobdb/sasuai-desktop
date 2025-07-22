import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Save, Loader2, Settings, Type, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  const [originalSettings, setOriginalSettings] = useState<PrinterSettings>(settings)
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingPrint, setIsTestingPrint] = useState(false)

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }, [settings, originalSettings])

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
      setSettings((prevSettings) => ({ ...prevSettings, [key]: value }))
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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-8">
          {/* Basic Print Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label className="text-sm font-medium">{t('printer.basicSettings')}</Label>
            </div>

            {/* Printer Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-3 space-y-2">
                  <Label className="text-sm">{t('printer.selectPrinter')}</Label>
                  <Select
                    value={settings.printerName || 'system-default'}
                    onValueChange={(printerName) =>
                      updateSetting(
                        'printerName',
                        printerName === 'system-default' ? '' : printerName
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('printer.selectPrinterPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system-default">{t('printer.systemDefault')}</SelectItem>
                      {availablePrinters.map((printer) => (
                        <SelectItem key={printer} value={printer}>
                          {printer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleTestPrint} disabled={isTestingPrint} className="w-full">
                    {isTestingPrint ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('printer.testing')}
                      </>
                    ) : (
                      t('printer.testPrint')
                    )}
                  </Button>
                </div>
              </div>

              <Badge variant="secondary" className="text-xs w-fit">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('printer.active')}: {settings.printerName || t('printer.systemDefault')}
              </Badge>
            </div>

            {/* Print Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="57mm">57mm</SelectItem>
                    <SelectItem value="76mm">76mm</SelectItem>
                    <SelectItem value="78mm">78mm</SelectItem>
                    <SelectItem value="80mm">80mm</SelectItem>
                    <SelectItem value="44mm">44mm</SelectItem>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">{t('printer.margin')}</Label>
                <Input
                  type="text"
                  placeholder="0 0 0 0"
                  value={settings.margin}
                  onChange={(e) => updateSetting('margin', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{t('printer.marginHelp')}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t('printer.timeoutPerLine')}</Label>
                <Input
                  type="number"
                  min="100"
                  max="2000"
                  value={settings.timeOutPerLine}
                  onChange={(e) => updateSetting('timeOutPerLine', parseInt(e.target.value) || 400)}
                />
                <p className="text-xs text-muted-foreground">{t('printer.timeoutHelp')}</p>
              </div>
            </div>
          </div>

          {/* Typography Settings */}
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <Label className="text-sm font-medium">{t('printer.typography')}</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Tahoma">Tahoma</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label className="text-sm">{t('printer.encoding')}</Label>
                <Select
                  value={settings.encoding}
                  onValueChange={(encoding: string) => updateSetting('encoding', encoding)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utf-8">UTF-8</SelectItem>
                    <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
                    <SelectItem value="windows-1252">Windows-1252</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Print Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('printer.printOptions')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                  <Switch
                    id="enableBold"
                    checked={settings.enableBold}
                    onCheckedChange={(enableBold) => updateSetting('enableBold', enableBold)}
                  />
                  <Label htmlFor="enableBold" className="text-sm cursor-pointer">
                    {t('printer.enableBold')}
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                  <Switch
                    id="autocut"
                    checked={settings.autocut}
                    onCheckedChange={(autocut) => updateSetting('autocut', autocut)}
                  />
                  <Label htmlFor="autocut" className="text-sm cursor-pointer">
                    {t('printer.autocut')}
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                  <Switch
                    id="cashdrawer"
                    checked={settings.cashdrawer}
                    onCheckedChange={(cashdrawer) => updateSetting('cashdrawer', cashdrawer)}
                  />
                  <Label htmlFor="cashdrawer" className="text-sm cursor-pointer">
                    {t('printer.drawer')}
                  </Label>
                </div>
              </div>
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
