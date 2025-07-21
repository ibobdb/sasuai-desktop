import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Settings, TestTube, Check, RefreshCw } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSettings } from '../hooks/use-settings'

export function PrinterSettingsTab() {
  const { t } = useTranslation('settings')
  const { settings, updatePrinterSettings } = useSettings()
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingPrint, setIsTestingPrint] = useState(false)

  const handleRefreshPrinters = async () => {
    setIsLoading(true)
    try {
      // Simulate getting printer list from electron main process
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAvailablePrinters([
        'Default Printer',
        'Thermal Printer 80mm',
        'Receipt Printer',
        'PDF Printer'
      ])
    } catch (error) {
      console.error('Failed to refresh printers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestPrint = async () => {
    setIsTestingPrint(true)
    try {
      // Simulate test print
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Test print failed:', error)
    } finally {
      setIsTestingPrint(false)
    }
  }

  const updateConfig = (updates: Partial<typeof settings.printer>) => {
    updatePrinterSettings(updates)
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
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.printer.isActive}
                onCheckedChange={(isActive) => updateConfig({ isActive })}
              />
              <Label>{t('printer.enabled')}</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPrinters}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('printer.refresh')}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t('printer.selectPrinter')}</Label>
            <Select
              value={settings.printer.name}
              onValueChange={(name) => updateConfig({ name })}
              disabled={!settings.printer.isActive}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('printer.selectPrinterPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {availablePrinters.map((printer) => (
                  <SelectItem key={printer} value={printer}>
                    {printer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {settings.printer.name && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Check className="h-3 w-3 mr-1" />
                {t('printer.connected')}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestPrint}
                disabled={isTestingPrint || !settings.printer.isActive}
              >
                <TestTube className={`h-4 w-4 mr-2 ${isTestingPrint ? 'animate-pulse' : ''}`} />
                {t('printer.testPrint')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('printer.printSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('printer.type')}</Label>
              <Select
                value={settings.printer.type}
                onValueChange={(type: 'thermal' | 'inkjet' | 'laser') => updateConfig({ type })}
                disabled={!settings.printer.isActive}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Thermal</SelectItem>
                  <SelectItem value="inkjet">Inkjet</SelectItem>
                  <SelectItem value="laser">Laser</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('printer.connection')}</Label>
              <Select
                value={settings.printer.connection}
                onValueChange={(connection: 'usb' | 'network' | 'bluetooth') =>
                  updateConfig({ connection })
                }
                disabled={!settings.printer.isActive}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usb">USB</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="bluetooth">Bluetooth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">{t('printer.settings')}</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('printer.paperWidth')} (mm)</Label>
                <Input
                  type="number"
                  min="50"
                  max="300"
                  value={settings.printer.settings.paperWidth}
                  onChange={(e) =>
                    updateConfig({
                      settings: {
                        ...settings.printer.settings,
                        paperWidth: parseInt(e.target.value) || 80
                      }
                    })
                  }
                  disabled={!settings.printer.isActive}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('printer.dpi')}</Label>
                <Input
                  type="number"
                  min="200"
                  max="600"
                  value={settings.printer.settings.dpi}
                  onChange={(e) =>
                    updateConfig({
                      settings: {
                        ...settings.printer.settings,
                        dpi: parseInt(e.target.value) || 203
                      }
                    })
                  }
                  disabled={!settings.printer.isActive}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.printer.settings.autocut}
                  onCheckedChange={(autocut) =>
                    updateConfig({
                      settings: {
                        ...settings.printer.settings,
                        autocut
                      }
                    })
                  }
                  disabled={!settings.printer.isActive}
                />
                <Label>{t('printer.autocut')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.printer.settings.buzzer}
                  onCheckedChange={(buzzer) =>
                    updateConfig({
                      settings: {
                        ...settings.printer.settings,
                        buzzer
                      }
                    })
                  }
                  disabled={!settings.printer.isActive}
                />
                <Label>{t('printer.buzzer')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.printer.settings.drawer}
                  onCheckedChange={(drawer) =>
                    updateConfig({
                      settings: {
                        ...settings.printer.settings,
                        drawer
                      }
                    })
                  }
                  disabled={!settings.printer.isActive}
                />
                <Label>{t('printer.drawer')}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Configuration (if network connection) */}
      {settings.printer.connection === 'network' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('printer.networkConfig')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('printer.ipAddress')}</Label>
                <Input
                  type="text"
                  placeholder="192.168.1.100"
                  value={settings.printer.networkConfig?.ipAddress || ''}
                  onChange={(e) =>
                    updateConfig({
                      networkConfig: {
                        ...settings.printer.networkConfig,
                        ipAddress: e.target.value,
                        port: settings.printer.networkConfig?.port || 9100
                      }
                    })
                  }
                  disabled={!settings.printer.isActive}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('printer.port')}</Label>
                <Input
                  type="number"
                  min="1"
                  max="65535"
                  placeholder="9100"
                  value={settings.printer.networkConfig?.port || ''}
                  onChange={(e) =>
                    updateConfig({
                      networkConfig: {
                        ...settings.printer.networkConfig,
                        ipAddress: settings.printer.networkConfig?.ipAddress || '',
                        port: parseInt(e.target.value) || 9100
                      }
                    })
                  }
                  disabled={!settings.printer.isActive}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
