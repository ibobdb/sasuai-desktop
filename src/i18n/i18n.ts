import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { languageStore } from '@/utils/language-store'

// Load only essential resources first for faster startup
import commonEN from './locales/en/common.json'
import authEN from './locales/en/auth.json'
import sidebarEN from './locales/en/sidebar.json'

import commonID from './locales/id/common.json'
import authID from './locales/id/auth.json'
import sidebarID from './locales/id/sidebar.json'

// Essential resources for initial load
const essentialResources = {
  en: {
    common: commonEN,
    auth: authEN,
    sidebar: sidebarEN
  },
  id: {
    common: commonID,
    auth: authID,
    sidebar: sidebarID
  }
}

// Function to lazy load remaining resources
export const loadAdditionalResources = async () => {
  const [
    transactionsEN,
    cashierEN,
    memberEN,
    updaterEN,
    rewardsEN,
    settingsEN,
    transactionsID,
    cashierID,
    memberID,
    updaterID,
    rewardsID,
    settingsID
  ] = await Promise.all([
    import('./locales/en/transactions.json'),
    import('./locales/en/cashier.json'),
    import('./locales/en/member.json'),
    import('./locales/en/updater.json'),
    import('./locales/en/rewards.json'),
    import('./locales/en/settings.json'),
    import('./locales/id/transactions.json'),
    import('./locales/id/cashier.json'),
    import('./locales/id/member.json'),
    import('./locales/id/updater.json'),
    import('./locales/id/rewards.json'),
    import('./locales/id/settings.json')
  ])

  i18n.addResourceBundle('en', 'transactions', transactionsEN.default)
  i18n.addResourceBundle('en', 'cashier', cashierEN.default)
  i18n.addResourceBundle('en', 'member', memberEN.default)
  i18n.addResourceBundle('en', 'updater', updaterEN.default)
  i18n.addResourceBundle('en', 'rewards', rewardsEN.default)
  i18n.addResourceBundle('en', 'settings', settingsEN.default)

  i18n.addResourceBundle('id', 'transactions', transactionsID.default)
  i18n.addResourceBundle('id', 'cashier', cashierID.default)
  i18n.addResourceBundle('id', 'member', memberID.default)
  i18n.addResourceBundle('id', 'updater', updaterID.default)
  i18n.addResourceBundle('id', 'rewards', rewardsID.default)
  i18n.addResourceBundle('id', 'settings', settingsID.default)
}

// Initialize i18next with essential resources only
i18n.use(initReactI18next).init({
  resources: essentialResources,
  lng: 'id', // Default to Indonesian
  fallbackLng: 'en',
  supportedLngs: ['en', 'id'],
  debug: import.meta.env.DEV,
  interpolation: {
    escapeValue: false // React already safes from xss
  },
  react: {
    useSuspense: false
  }
})

// Load language preference and additional resources after startup
const initializeLanguageAndResources = async () => {
  try {
    const savedLanguage = await languageStore.get()
    if (savedLanguage && savedLanguage !== i18n.language) {
      await i18n.changeLanguage(savedLanguage)
    }

    // Load additional resources in background
    setTimeout(() => {
      loadAdditionalResources()
    }, 100)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to initialize language:', error)
    }
  }
}

// Initialize after DOM is ready
if (typeof window !== 'undefined') {
  initializeLanguageAndResources()
}

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  languageStore.set(lng)
})

export default i18n
