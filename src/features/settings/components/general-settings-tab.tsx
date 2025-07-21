import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useSettings } from '../hooks/use-settings'

export function GeneralSettingsTab() {
  const { t } = useTranslation('settings')
  const { settings, updateGeneralSettings } = useSettings()

  const updateConfig = (updates: Partial<typeof settings.general>) => {
    updateGeneralSettings(updates)
  }

  return (
    <div className="space-y-6">
      {/* Application Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>{t('general.applicationBehavior')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('general.autoStart')}</Label>
              <p className="text-sm text-muted-foreground">{t('general.autoStartDescription')}</p>
            </div>
            <Switch
              checked={settings.general.autoStart}
              onCheckedChange={(autoStart) => updateConfig({ autoStart })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('general.minimizeToTray')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('general.minimizeToTrayDescription')}
              </p>
            </div>
            <Switch
              checked={settings.general.minimizeToTray}
              onCheckedChange={(minimizeToTray) => updateConfig({ minimizeToTray })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('general.autoUpdate')}</Label>
              <p className="text-sm text-muted-foreground">{t('general.autoUpdateDescription')}</p>
            </div>
            <Switch
              checked={settings.general.autoUpdate}
              onCheckedChange={(autoUpdate) => updateConfig({ autoUpdate })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
