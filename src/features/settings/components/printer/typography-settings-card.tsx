import { useTranslation } from 'react-i18next'
import { Type } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { PrinterSettings } from '@/types/settings'

interface TypographySettingsCardProps {
  settings: PrinterSettings
  onUpdateSetting: <K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) => void
}

export function TypographySettingsCard({ settings, onUpdateSetting }: TypographySettingsCardProps) {
  const { t } = useTranslation(['settings'])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          {t('printer.typography')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('printer.fontFamily')}</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(fontFamily: string) => onUpdateSetting('fontFamily', fontFamily)}
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
            <Label>{t('printer.fontSize')} (px)</Label>
            <Input
              type="number"
              min="8"
              max="24"
              value={settings.fontSize}
              onChange={(e) => onUpdateSetting('fontSize', parseInt(e.target.value) || 12)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('printer.lineHeight')}</Label>
            <Input
              type="number"
              min="0.8"
              max="3"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => onUpdateSetting('lineHeight', parseFloat(e.target.value) || 1.2)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('printer.encoding')}</Label>
            <Select
              value={settings.encoding}
              onValueChange={(encoding: string) => onUpdateSetting('encoding', encoding)}
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

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableBold"
              checked={settings.enableBold}
              onCheckedChange={(enableBold) => onUpdateSetting('enableBold', enableBold)}
            />
            <Label htmlFor="enableBold">{t('printer.enableBold')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="autocut"
              checked={settings.autocut}
              onCheckedChange={(autocut) => onUpdateSetting('autocut', autocut)}
            />
            <Label htmlFor="autocut">{t('printer.autocut')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="cashdrawer"
              checked={settings.cashdrawer}
              onCheckedChange={(cashdrawer) => onUpdateSetting('cashdrawer', cashdrawer)}
            />
            <Label htmlFor="cashdrawer">{t('printer.drawer')}</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
