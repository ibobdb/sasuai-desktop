import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { WindowControls } from '@/components/window-controls'

export default function ForbiddenError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className="h-svh flex flex-col">
      {/* Title bar with controls properly positioned */}
      <div className="h-10 w-full titlebar-drag-region flex items-center justify-between">
        <div className="flex-1"></div>
        <WindowControls />
      </div>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">403</h1>
        <span className="font-medium">Access Forbidden</span>
        <p className="text-center text-muted-foreground">
          You don&apos;t have necessary permission <br />
          to view this resource.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => history.go(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
