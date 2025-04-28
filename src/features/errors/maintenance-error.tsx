import { Button } from '@/components/ui/button'
import { WindowControls } from '@/components/window-controls'

export default function MaintenanceError() {
  return (
    <div className="h-svh flex flex-col">
      {/* Title bar with controls properly positioned */}
      <div className="h-10 w-full titlebar-drag-region flex items-center justify-between">
        <div className="flex-1"></div>
        <WindowControls />
      </div>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">503</h1>
        <span className="font-medium">Website is under maintenance!</span>
        <p className="text-center text-muted-foreground">
          The site is not available at the moment. <br />
          We&apos;ll be back online shortly.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline">Learn more</Button>
        </div>
      </div>
    </div>
  )
}
