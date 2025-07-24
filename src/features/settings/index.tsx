import { useTranslation } from 'react-i18next'
import { Settings as SettingsIcon, Keyboard, Printer, User } from 'lucide-react'
import { useState, useMemo } from 'react'
import { KeyboardShortcutsTab } from './components/keyboard-shortcuts-tab'
import { PrinterSettingsTab } from './components/printer-settings-tab'
import { GeneralSettingsTab } from './components/general-settings-tab'
import { useSettings } from './hooks/use-settings'

type TabType = 'general' | 'keyboard' | 'printer'

interface TabConfig {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  component: React.ComponentType
}

export default function Settings() {
  const { t } = useTranslation('settings')
  const { loading } = useSettings()
  const [activeTab, setActiveTab] = useState<TabType>('general')

  const tabConfigs = useMemo<Record<TabType, TabConfig>>(
    () => ({
      general: {
        icon: User,
        title: t('general.title'),
        description: t('general.description'),
        component: GeneralSettingsTab
      },
      keyboard: {
        icon: Keyboard,
        title: t('keyboard.title'),
        description: t('keyboard.description'),
        component: KeyboardShortcutsTab
      },
      printer: {
        icon: Printer,
        title: t('printer.title'),
        description: t('printer.description'),
        component: PrinterSettingsTab
      }
    }),
    [t]
  )

  const sidebarTabs = useMemo(() => {
    const tabs: Array<{
      key: TabType
      label: string
      description: string
      icon: React.ComponentType<{ className?: string }>
    }> = [
      {
        key: 'general',
        label: t('tabs.general'),
        description: t('general.description'),
        icon: User
      },
      {
        key: 'keyboard',
        label: t('tabs.keyboard'),
        description: t('keyboard.description'),
        icon: Keyboard
      },
      {
        key: 'printer',
        label: t('tabs.printer'),
        description: t('printer.description'),
        icon: Printer
      }
    ]
    return tabs
  }, [t])

  const loadingContent = useMemo(
    () => (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <SettingsIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t('loading')}</p>
        </div>
      </div>
    ),
    [t]
  )

  if (loading) {
    return loadingContent
  }

  const activeConfig = tabConfigs[activeTab]
  const ActiveComponent = activeConfig.component
  const IconComponent = activeConfig.icon

  const renderContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{activeConfig.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{activeConfig.description}</p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <ActiveComponent />
      </div>
    </>
  )

  return (
    <div>
      <div className="flex w-full p-4">
        <div className="w-72 flex flex-col">
          <div className="flex flex-col h-fit w-full space-y-1 bg-transparent p-4 pt-6">
            {sidebarTabs.map(({ key, label, description, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full justify-start flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                  activeTab === key ? 'ring-2 ring-primary/50' : ''
                }`}
              >
                <div className="p-1 rounded-md bg-background/20">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs opacity-70">{description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  )
}
