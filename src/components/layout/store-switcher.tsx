import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { SidebarMenu, SidebarMenuButton } from '@/components/ui/sidebar'

export function StoreSwitcher({
  stores
}: {
  stores: {
    name: string
    logo: string
    plan: string
  }[]
}) {
  const [activeStore] = React.useState(stores[0])
  const { t } = useTranslation()

  // Helper function to handle translation with namespaces
  const translateWithNamespace = (key: string) => {
    if (typeof key !== 'string') return key

    if (key.includes(':')) {
      const [namespace, path] = key.split(':')
      return t(path, { ns: namespace })
    }

    return t(key)
  }

  return (
    <SidebarMenu>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
          {typeof activeStore.logo === 'string' ? (
            <img src={activeStore.logo} alt={activeStore.name} className="size-10 object-contain" />
          ) : (
            React.createElement(activeStore.logo, { className: 'size-4' })
          )}
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{activeStore.name}</span>
          <span className="truncate text-xs">{translateWithNamespace(activeStore.plan)}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenu>
  )
}
