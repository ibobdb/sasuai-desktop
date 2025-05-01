import { useNavigate, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { WindowControls } from '@/components/window-controls'

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function GeneralError({ className, minimal = false }: GeneralErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className={cn('h-svh w-full', className)}>
      {/* Title bar with controls properly positioned */}
      <div className="h-10 w-full titlebar-drag-region flex items-center justify-between">
        <div className="flex-1"></div>
        <WindowControls />
      </div>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        {!minimal && <h1 className="text-[7rem] font-bold leading-tight">500</h1>}
        <span className="font-medium">Oops! Something went wrong {`:')`}</span>
        <p className="text-center text-muted-foreground">
          We apologize for the inconvenience. <br /> Please try again later.
        </p>
        {!minimal && (
          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={() => history.go(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  )
}
