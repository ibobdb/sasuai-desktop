import { Main } from '@/components/layout/main'

export default function Transactions() {
  return (
    <Main>
      <div className="mb-2 flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">System Transactions</h1>
      </div>
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          This is a work in progress. The transactions page is not yet implemented. Please check
          back later for updates.
        </p>
      </div>
    </Main>
  )
}
