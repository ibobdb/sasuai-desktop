import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '../hooks/use-settings'
import { GeneralConfig } from '@/types/settings'

export function GeneralSettingsTab() {
  const { t } = useTranslation('settings')
  const { settings, updateStoreInfo, updateFooterInfo } = useSettings()
  const [localSettings, setLocalSettings] = useState<GeneralConfig>(settings.general)
  const [isStoreInfoSaving, setIsStoreInfoSaving] = useState(false)
  const [isFooterInfoSaving, setIsFooterInfoSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const hasStoreInfoChanges = useMemo(
    () => JSON.stringify(localSettings.storeInfo) !== JSON.stringify(settings.general.storeInfo),
    [localSettings.storeInfo, settings.general.storeInfo]
  )

  const hasFooterInfoChanges = useMemo(
    () => JSON.stringify(localSettings.footerInfo) !== JSON.stringify(settings.general.footerInfo),
    [localSettings.footerInfo, settings.general.footerInfo]
  )

  useEffect(() => {
    setLocalSettings(settings.general)
  }, [settings.general])

  const updateLocalConfig = useCallback((updates: Partial<GeneralConfig>) => {
    setLocalSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const debouncedSave = useCallback(async (saveFunction: () => Promise<void>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      await saveFunction()
    }, 500)
  }, [])
  const handleSaveStoreInfo = useCallback(async () => {
    await debouncedSave(async () => {
      setIsStoreInfoSaving(true)
      try {
        const success = await updateStoreInfo(localSettings.storeInfo)
        if (success) {
          toast.success(t('general.storeInfoSaved'))
        } else {
          toast.error(t('general.saveError'))
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to update store info:', error)
        }
        toast.error(t('general.saveError'))
      } finally {
        setIsStoreInfoSaving(false)
      }
    })
  }, [localSettings.storeInfo, updateStoreInfo, t, debouncedSave])

  const handleSaveFooterInfo = useCallback(async () => {
    await debouncedSave(async () => {
      setIsFooterInfoSaving(true)
      try {
        const success = await updateFooterInfo(localSettings.footerInfo)
        if (success) {
          toast.success(t('general.footerInfoSaved'))
        } else {
          toast.error(t('general.saveError'))
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to update footer info:', error)
        }
        toast.error(t('general.saveError'))
      } finally {
        setIsFooterInfoSaving(false)
      }
    })
  }, [localSettings.footerInfo, updateFooterInfo, t, debouncedSave])

  return (
    <div className="space-y-6">
      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('general.storeInformation')}
            {hasStoreInfoChanges && (
              <span className="text-sm text-orange-600 font-normal">
                {t('general.unsavedChanges')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">{t('general.storeName')}</Label>
              <Input
                id="storeName"
                value={localSettings.storeInfo.name}
                onChange={(e) =>
                  updateLocalConfig({
                    storeInfo: { ...localSettings.storeInfo, name: e.target.value }
                  })
                }
                placeholder={t('general.storeNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storePhone">{t('general.storePhone')}</Label>
              <Input
                id="storePhone"
                value={localSettings.storeInfo.phone}
                onChange={(e) =>
                  updateLocalConfig({
                    storeInfo: { ...localSettings.storeInfo, phone: e.target.value }
                  })
                }
                placeholder={t('general.storePhonePlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeAddress">{t('general.storeAddress')}</Label>
            <Textarea
              id="storeAddress"
              value={localSettings.storeInfo.address}
              onChange={(e) =>
                updateLocalConfig({
                  storeInfo: { ...localSettings.storeInfo, address: e.target.value }
                })
              }
              placeholder={t('general.storeAddressPlaceholder')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeEmail">{t('general.storeEmail')}</Label>
              <Input
                id="storeEmail"
                type="email"
                value={localSettings.storeInfo.email || ''}
                onChange={(e) =>
                  updateLocalConfig({
                    storeInfo: { ...localSettings.storeInfo, email: e.target.value }
                  })
                }
                placeholder={t('general.storeEmailPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeWebsite">{t('general.storeWebsite')}</Label>
              <Input
                id="storeWebsite"
                type="url"
                value={localSettings.storeInfo.website || ''}
                onChange={(e) =>
                  updateLocalConfig({
                    storeInfo: { ...localSettings.storeInfo, website: e.target.value }
                  })
                }
                placeholder={t('general.storeWebsitePlaceholder')}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSaveStoreInfo}
              disabled={isStoreInfoSaving || !hasStoreInfoChanges}
              className="w-full sm:w-auto"
            >
              {isStoreInfoSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {t('general.saveStoreInfo')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('general.receiptFooter')}
            {hasFooterInfoChanges && (
              <span className="text-sm text-orange-600 font-normal">
                {t('general.unsavedChanges')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thankYouMessage">{t('general.thankYouMessage')}</Label>
            <Input
              id="thankYouMessage"
              value={localSettings.footerInfo.thankYouMessage}
              onChange={(e) =>
                updateLocalConfig({
                  footerInfo: { ...localSettings.footerInfo, thankYouMessage: e.target.value }
                })
              }
              placeholder={t('general.thankYouMessagePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnMessage">{t('general.returnMessage')}</Label>
            <Input
              id="returnMessage"
              value={localSettings.footerInfo.returnMessage}
              onChange={(e) =>
                updateLocalConfig({
                  footerInfo: { ...localSettings.footerInfo, returnMessage: e.target.value }
                })
              }
              placeholder={t('general.returnMessagePlaceholder')}
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSaveFooterInfo}
              disabled={isFooterInfoSaving || !hasFooterInfoChanges}
              className="w-full sm:w-auto"
            >
              {isFooterInfoSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {t('general.saveFooterInfo')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
