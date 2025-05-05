import { Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/ui/sidebar'
import { useUpdater } from '@/context/updater-provider'

export function Footer() {
  const { appInfo } = useUpdater()
  const currentYear = new Date().getFullYear()
  const { state: sidebarState = 'expanded' } = useSidebar?.() || {}

  return (
    <footer
      className={cn('border-t py-2 w-full mt-auto', sidebarState === 'collapsed' ? 'px-2' : 'px-4')}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-1 text-xs',
          sidebarState === 'collapsed' ? 'text-center' : ''
        )}
      >
        <p className="flex flex-wrap justify-center items-center">
          © {currentYear}{' '}
          <a
            href="https://github.com/nestorzamili"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline mx-1"
          >
            samunu
          </a>
          <a
            href="https://github.com/ibobdb"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline mx-1"
          >
            ibobdb
          </a>
        </p>
        <p className="flex items-center">
          Made with <Coffee size={14} className="mx-1" />
          {sidebarState === 'expanded' && 'coffee'}
        </p>

        {/* App Version */}
        <p className="text-xs">
          {appInfo?.version && (
            <span className="text-muted-foreground">Version: {appInfo.version}</span>
          )}
        </p>
      </div>
    </footer>
  )
}
