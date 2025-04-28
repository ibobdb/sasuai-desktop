import { WindowControls } from '@/components/window-controls'

interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="h-svh flex flex-col">
      {/* Title bar with controls properly positioned */}
      <div className="h-10 w-full titlebar-drag-region flex items-center justify-between">
        <div className="flex-1"></div>
        <WindowControls />
      </div>

      {/* Content area */}
      <div className="flex-1 container grid items-center justify-center lg:max-w-none lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
          <div className="mb-4 flex flex-col items-center justify-center">
            <img
              src="/resources/icon.png"
              alt="Sasuai Store"
              className="mb-3 h-16 w-16 object-contain"
            />
            <h1 className="text-xl font-medium">Sasuai Store</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
