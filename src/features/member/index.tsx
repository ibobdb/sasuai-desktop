import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { UserPlus, RefreshCw } from 'lucide-react'
import { useMemberColumns } from './components/member-columns'
import { MemberDialogs } from './components/member-dialogs'
import { MemberTable } from './components/member-table'
import MemberProvider, { useMembers } from './context/member-context'
import { FilterToolbar } from './components/filter-toolbar'

function MemberContent() {
  const { t } = useTranslation(['member'])
  const columns = useMemberColumns()
  const {
    isLoading,
    members,
    filters,
    updateFilters,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    setOpen,
    applyFilters
  } = useMembers()

  // Fetch members on component mount
  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ page })
    },
    [updateFilters]
  )

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      updateFilters({ pageSize, page: 1 })
    },
    [updateFilters]
  )

  // Handle refresh button click
  const handleRefresh = () => {
    applyFilters()
  }

  // Ensure we're working with an array
  const memberData = Array.isArray(members) ? members : []

  return (
    <>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('member.title')}</h2>
            <p className="text-muted-foreground">{t('member.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('member.actions.refresh')}
            </Button>

            <Button onClick={() => setOpen('create')}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('member.actions.addMember')}
            </Button>
          </div>
        </div>

        {/* Filter toolbar */}
        <FilterToolbar />

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : memberData.length > 0 ? (
            <MemberTable
              data={memberData}
              columns={columns}
              pageCount={totalPages || 0}
              pagination={{
                pageIndex: (currentPage || filters.page || 1) - 1,
                pageSize: pageSize || filters.pageSize || 10
              }}
              onPaginationChange={{
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange
              }}
              totalCount={totalCount || 0}
            />
          ) : (
            <div className="w-full text-center py-10">
              <p className="text-muted-foreground mb-4">{t('member.noMembersFound')}</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('member.actions.refresh')}
              </Button>
            </div>
          )}
        </div>
      </Main>

      <MemberDialogs />
    </>
  )
}

export default function Members() {
  return (
    <MemberProvider>
      <MemberContent />
    </MemberProvider>
  )
}
