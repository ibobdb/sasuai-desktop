import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { GiftIcon } from 'lucide-react'
import { useRewardColumns } from './components/reward-columns'
import { useRewardClaimColumns } from './components/reward-claim-columns'
import { RewardTable } from './components/reward-table'
import { RewardClaimsTable } from './components/reward-claims-table'
import RewardProvider, { useRewards } from './context/reward-context'
import { RewardClaimsProvider, useRewardClaims } from './context/reward-claims-context'
import { FilterToolbar } from './components/filter-toolbar'
import { ClaimFilterToolbar } from './components/claim-filter-toolbar'
import { ClaimRewardDialog } from './components/claim-reward-dialog'
import { Reward } from '@/types/rewards'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function RewardContent() {
  const { t } = useTranslation(['rewards'])
  const [tab, setTab] = useState<string>('rewards')
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)

  // Handle claim button click
  const handleClaimClick = () => {
    setIsClaimDialogOpen(true)
  }

  return (
    <>
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={handleClaimClick}>
              <GiftIcon className="mr-2 h-4 w-4" />
              {t('actions.claimReward')}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="rewards" value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="rewards">{t('tabs.rewards')}</TabsTrigger>
            <TabsTrigger value="claims">{t('tabs.claims')}</TabsTrigger>
          </TabsList>
          <TabsContent value="rewards">
            <RewardsTab />
          </TabsContent>
          <TabsContent value="claims">
            <RewardClaimsProvider>
              <ClaimsTab />
            </RewardClaimsProvider>
          </TabsContent>
        </Tabs>
      </Main>

      <ClaimRewardDialog
        reward={selectedReward}
        isOpen={isClaimDialogOpen}
        onClose={() => {
          setIsClaimDialogOpen(false)
          setSelectedReward(null)
        }}
      />
    </>
  )
}

function RewardsTab() {
  const columns = useRewardColumns()
  const {
    isLoading,
    rewards,
    filters,
    updateFilters,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    applyFilters
  } = useRewards()

  // Fetch rewards on component mount
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

  // Ensure we're working with an array
  const rewardData = Array.isArray(rewards) ? rewards : []

  return (
    <>
      {/* Filter toolbar */}
      <FilterToolbar />

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <RewardTable
            data={rewardData}
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
        )}
      </div>
    </>
  )
}

function ClaimsTab() {
  const columns = useRewardClaimColumns()
  const {
    isLoading,
    rewardClaims,
    filters,
    updateFilters,
    totalCount,
    totalPages,
    currentPage,
    pageSize
  } = useRewardClaims()

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

  // Ensure we're working with an array
  const claimsData = Array.isArray(rewardClaims) ? rewardClaims : []

  return (
    <>
      {/* Filter toolbar */}
      <ClaimFilterToolbar />

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <RewardClaimsTable
            data={claimsData}
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
        )}
      </div>
    </>
  )
}

export default function Rewards() {
  return (
    <RewardProvider>
      <RewardContent />
    </RewardProvider>
  )
}
