import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-context'
import { Button } from './ui/button'
import { useTranslation } from 'react-i18next'

interface Props {
  className?: string
  type?: React.HTMLInputTypeAttribute
}

export function Search({ className = '' }: Props) {
  const { t } = useTranslation(['common'])
  const { setOpen } = useSearch()
  return (
    <Button
      variant="outline"
      className={cn(
        'relative h-8 w-full flex-1 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted/50 sm:pr-12 md:w-60 md:flex-none lg:w-80 xl:w-96',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <IconSearch aria-hidden="true" className="absolute left-1.5 top-1/2 -translate-y-1/2" />
      <span className="ml-3">{t('actions.search')}</span>
      <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
