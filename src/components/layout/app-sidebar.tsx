import { Github } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { StoreSwitcher } from '@/components/layout/store-switcher'
import { sidebarData } from './data/sidebar-data'
import { Footer } from '@/components/layout/footer'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const { t } = useTranslation(['sidebar'])

  // Process navigation groups to translate titles
  const translatedNavGroups = sidebarData.navGroups.map((group) => ({
    ...group,
    title: t(group.title),
    items: group.items.map((item) => ({
      ...item,
      title: t(item.title)
    }))
  }))

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="mt-12 h-[calc(100vh-3rem)]" /* Add margin-top and adjust height */
      {...props}
    >
      <SidebarHeader>
        <StoreSwitcher stores={sidebarData.stores} />
      </SidebarHeader>
      <SidebarContent>
        {translatedNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {state === 'collapsed' ? (
          <a
            href="https://github.com/nestorzamili"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center py-4 hover:text-primary transition-colors"
          >
            <Github size={20} />
          </a>
        ) : (
          <Footer />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
