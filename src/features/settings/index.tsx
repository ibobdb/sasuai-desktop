import { useTranslation } from 'react-i18next'
import { Settings as SettingsIcon, Keyboard, Printer, User } from 'lucide-react'
import { useState } from 'react'
import { KeyboardShortcutsTab } from './components/keyboard-shortcuts-tab'
import { PrinterSettingsTab } from './components/printer-settings-tab'
import { GeneralSettingsTab } from './components/general-settings-tab'
import { useSettings } from './hooks/use-settings'

export default function Settings() {
  const { t } = useTranslation('settings')
  const { loading } = useSettings()
  const [activeTab, setActiveTab] = useState('general')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <SettingsIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t('general.title')}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{t('general.description')}</p>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <GeneralSettingsTab />
            </div>
          </>
        )
      case 'keyboard':
        return (
          <>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Keyboard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t('keyboard.title')}</h2>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <KeyboardShortcutsTab />
            </div>
          </>
        )
      case 'printer':
        return (
          <>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Printer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t('printer.title')}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{t('printer.description')}</p>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <PrinterSettingsTab />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex w-full p-4">
        {/* Sidebar */}
        <div className="w-72 flex flex-col">
          <div className="flex flex-col h-fit w-full space-y-1 bg-transparent p-4 pt-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full justify-start flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                activeTab === 'general' ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <div className="p-1 rounded-md bg-background/20">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{t('tabs.general')}</div>
                <div className="text-xs opacity-70">Bahasa & Tema</div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('keyboard')}
              className={`w-full justify-start flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                activeTab === 'keyboard' ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <div className="p-1 rounded-md bg-background/20">
                <Keyboard className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{t('tabs.keyboard')}</div>
                <div className="text-xs opacity-70">Pintasan Keyboard</div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('printer')}
              className={`w-full justify-start flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                activeTab === 'printer' ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <div className="p-1 rounded-md bg-background/20">
                <Printer className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{t('tabs.printer')}</div>
                <div className="text-xs opacity-70">Konfigurasi Printer</div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  )
}
