import { Main } from '@/components/layout/main'

export default function Dashboard() {
  return (
    <Main>
      <div className="mb-2 flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">System Dashboard</h1>
      </div>
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          This is a simple dashboard layout. You can add your components here.
        </p>
      </div>
    </Main>
  )
}
