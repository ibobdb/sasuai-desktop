import { useEffect, useState } from 'react'
import { IconMoon, IconSun, IconDeviceDesktop } from '@tabler/icons-react'
import { useTheme } from '@/context/theme-context'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation(['common'])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /* Update theme-color meta tag when theme is updated */
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  const handleToggle = () => {
    // Cycle through: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // Get current icon based on theme
  const getCurrentIcon = () => {
    switch (theme) {
      case 'light':
        return IconSun
      case 'dark':
        return IconMoon
      case 'system':
        return IconDeviceDesktop
      default:
        return IconSun
    }
  }

  const getCurrentThemeLabel = () => {
    switch (theme) {
      case 'light':
        return t('themeSwitcher.lightMode')
      case 'dark':
        return t('themeSwitcher.darkMode')
      case 'system':
        return t('themeSwitcher.systemMode')
      default:
        return t('themeSwitcher.lightMode')
    }
  }

  const getNextThemeLabel = () => {
    switch (theme) {
      case 'light':
        return t('themeSwitcher.switchToDark')
      case 'dark':
        return t('themeSwitcher.switchToSystem')
      case 'system':
        return t('themeSwitcher.switchToLight')
      default:
        return t('themeSwitcher.switchToDark')
    }
  }

  // Don't render on server-side
  if (!mounted) {
    return <div className="h-9 w-9 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
  }

  const CurrentIcon = getCurrentIcon()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="gap-2 transition-all duration-200 hover:scale-105"
      title={`${getCurrentThemeLabel()} - ${t('themeSwitcher.clickTo')} ${getNextThemeLabel().toLowerCase()}`}
      aria-label={`${getCurrentThemeLabel()} - ${t('themeSwitcher.clickTo')} ${getNextThemeLabel().toLowerCase()}`}
    >
      <CurrentIcon className="h-4 w-4 transition-transform duration-200" />
      <span className="sr-only">{getCurrentThemeLabel()}</span>
    </Button>
  )
}
