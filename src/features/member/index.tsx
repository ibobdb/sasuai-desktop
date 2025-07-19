import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { createDataHooks } from '@/hooks/use-data-provider'
import { memberOperations } from './actions/member-operations'
import {
  Member,
  MemberDetail,
  MemberFilterParams,
  MemberFilterUIState,
  MemberDialogType,
  CreateMemberData,
  UpdateMemberData
} from '@/types/members'
import { useMemberColumns } from './components/member-columns'
import { MemberDialogs } from './components/member-dialogs'
import { MemberTable } from './components/member-table'
import { FilterToolbar } from './components/filter-toolbar'

const defaultMemberFilters: MemberFilterParams = {
  page: 1,
  pageSize: 10,
  sortField: 'createdAt',
  sortDirection: 'desc'
}

const defaultMemberFilterUIState: MemberFilterUIState = {
  search: '',
  tier: []
}

export default function Members() {
  const { t } = useTranslation(['member'])
  const [open, setOpen] = useState<MemberDialogType | null>(null)
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [filterUIState, setFilterUIState] = useState<MemberFilterUIState>(
    defaultMemberFilterUIState
  )
  const [filters, setFilters] = useState<MemberFilterParams>(defaultMemberFilters)

  const { useItems: useMembers, useItemDetail: useMemberDetail } = createDataHooks<
    Member,
    MemberDetail,
    CreateMemberData,
    UpdateMemberData,
    MemberFilterParams
  >('members', memberOperations, 'member')

  const { data: membersResponse, isLoading, refetch } = useMembers(filters)

  const { data: memberDetailResponse, isLoading: isLoadingDetail } = useMemberDetail(
    currentMember?.id || '',
    !!currentMember?.id
  )

  const members = membersResponse?.data?.items || []
  const memberDetail = memberDetailResponse?.data || null
  const pagination = {
    totalPages: membersResponse?.data?.totalPages || 0,
    currentPage: membersResponse?.data?.currentPage || 1,
    pageSize: membersResponse?.data?.pageSize || 10,
    totalCount: membersResponse?.data?.totalCount || 0
  }

  // Update filters function
  const updateFilters = useCallback((newFilters: Partial<MemberFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultMemberFilters)
    setFilterUIState(defaultMemberFilterUIState)
  }, [])

  const columns = useMemberColumns({
    onEdit: (member) => {
      setCurrentMember(member)
      setOpen('edit')
    },
    onView: (member) => {
      setCurrentMember(member)
      setOpen('view')
    }
  })

  const memberData = Array.isArray(members) ? members : []

  return (
    <Main>
      <div className="mb-4 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('member.title')}</h2>
          <p className="text-muted-foreground">{t('member.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpen('create')}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('member.actions.addMember')}
          </Button>
        </div>
      </div>

      <FilterToolbar
        filters={filters}
        filterUIState={filterUIState}
        onFiltersChange={updateFilters}
        onFilterUIStateChange={setFilterUIState}
        onResetFilters={resetFilters}
      />

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <MemberTable
            data={memberData}
            columns={columns}
            pageCount={pagination.totalPages || 0}
            pagination={{
              pageIndex: (pagination.currentPage || 1) - 1,
              pageSize: pagination.pageSize || 10
            }}
            onPaginationChange={{
              onPageChange: (page) => updateFilters({ page: page + 1 }),
              onPageSizeChange: (size) => updateFilters({ pageSize: size, page: 1 })
            }}
            totalCount={pagination.totalCount || 0}
          />
        )}
      </div>

      <MemberDialogs
        open={open}
        currentMember={currentMember}
        memberDetail={memberDetail}
        isLoadingDetail={isLoadingDetail}
        onOpenChange={setOpen}
        onRefetch={refetch}
      />
    </Main>
  )
}
