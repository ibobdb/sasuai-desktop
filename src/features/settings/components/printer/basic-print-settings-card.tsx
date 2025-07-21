import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PrinterSettings } from '@/types/settings'

interface BasicPrintSettingsCardProps {
  settings: PrinterSettings
  availablePrinters: string[]
  isSaving: boolean
  onUpdateSetting: <K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) => void
  onSaveSettings: () => void
}

export function BasicPrintSettingsCard({
  settings,
  availablePrinters,
  isSaving,
  onUpdateSetting,
  onSaveSettings
}: BasicPrintSettingsCardProps) {
  const { t } = useTranslation(['settings'])
  const [isTestingPrint, setIsTestingPrint] = useState(false)

  const handleTestPrint = async () => {
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
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        {/* Printer Selection */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-3 space-y-2">
              <Label className="text-sm">{t('printer.selectPrinter')}</Label>
              <Select
                value={settings.printerName || 'system-default'}
                onValueChange={(printerName) =>
                  onUpdateSetting(
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

        {/* Print Settings */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">{t('printer.paperSize')}</Label>
              <Select
                value={settings.paperSize}
                onValueChange={(paperSize: PrinterSettings['paperSize']) =>
                  onUpdateSetting('paperSize', paperSize)
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
                onChange={(e) => onUpdateSetting('copies', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">{t('printer.margin')}</Label>
              <Input
                type="text"
                placeholder="0 0 0 0"
                value={settings.margin}
                onChange={(e) => onUpdateSetting('margin', e.target.value)}
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
                onChange={(e) => onUpdateSetting('timeOutPerLine', parseInt(e.target.value) || 400)}
              />
              <p className="text-xs text-muted-foreground">{t('printer.timeoutHelp')}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('printer.saving')}
              </>
            ) : (
              t('actions.save', { ns: 'common' })
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
