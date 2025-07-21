import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Settings, TestTube, RefreshCw, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PrinterSettings } from '@/types/settings'

interface PrinterResponse {
  success: boolean
  data?: any
  error?: { message: string }
}

export function PrinterSettingsTab() {
  const { t } = useTranslation('settings')
  const [settings, setSettings] = useState<PrinterSettings>({
    printerName: '',
    paperSize: '58mm',
    margin: '0 0 0 0',
    copies: 1,
    timeOutPerLine: 400
  })
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingPrint, setIsTestingPrint] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
    loadPrinters()
  }, [])

  const loadSettings = async () => {
    try {
      const response: PrinterResponse = await window.api.printer.getSettings()
      if (response.success && response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('Failed to load printer settings:', error)
      toast.error('Failed to load printer settings')
    }
  }

  const loadPrinters = async () => {
    setIsLoading(true)
    try {
      const response: PrinterResponse = await window.api.printer.getPrinters()
      if (response.success && response.data) {
        setAvailablePrinters(response.data)
      } else {
        throw new Error(response.error?.message || 'Failed to get printers')
      }
    } catch (error) {
      console.error('Failed to get printers:', error)
      toast.error('Failed to get available printers')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (newSettings: PrinterSettings) => {
    setIsSaving(true)
    try {
      const response: PrinterResponse = await window.api.printer.saveSettings(newSettings)
      if (response.success) {
        setSettings(newSettings)
        toast.success('Printer settings saved successfully')
      } else {
        throw new Error(response.error?.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save printer settings:', error)
      toast.error('Failed to save printer settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestPrint = async () => {
    setIsTestingPrint(true)
    try {
      const response: PrinterResponse = await window.api.printer.testPrint()
      if (response.success) {
        toast.success('Test print completed successfully')
      } else {
        throw new Error(response.error?.message || 'Test print failed')
      }
    } catch (error) {
      console.error('Test print failed:', error)
      toast.error(error instanceof Error ? error.message : 'Test print failed')
    } finally {
      setIsTestingPrint(false)
    }
  }

  const updateSetting = <K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  return (
    <div className="space-y-6">
      {/* Printer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            {t('printer.selection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Available Printers</Label>
            <Button variant="outline" size="sm" onClick={loadPrinters} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Select Printer</Label>
            <Select
              value={settings.printerName || 'system-default'}
              onValueChange={(printerName) =>
                updateSetting('printerName', printerName === 'system-default' ? '' : printerName)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a printer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system-default">System Default</SelectItem>
                {availablePrinters.map((printer) => (
                  <SelectItem key={printer} value={printer}>
                    {printer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <CheckCircle className="h-3 w-3 mr-1" />
              {settings.printerName || 'System Default'}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleTestPrint} disabled={isTestingPrint}>
              {isTestingPrint ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Test Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Print Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paper Size</Label>
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
              <Label>Copies</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={settings.copies}
                onChange={(e) => updateSetting('copies', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Margin (CSS format)</Label>
              <Input
                type="text"
                placeholder="0 0 0 0"
                value={settings.margin}
                onChange={(e) => updateSetting('margin', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                CSS margin format: top right bottom left (e.g., &quot;0 5px 10px 5px&quot;)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Timeout per Line (ms)</Label>
              <Input
                type="number"
                min="100"
                max="2000"
                value={settings.timeOutPerLine}
                onChange={(e) => updateSetting('timeOutPerLine', parseInt(e.target.value) || 400)}
              />
              <p className="text-xs text-muted-foreground">
                Delay between each line print (recommended: 400ms)
              </p>
            </div>
          </div>

          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving settings...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
