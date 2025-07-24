import { useState, useCallback, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { GiftIcon } from 'lucide-react'
import { ClaimRewardDialog } from './components/claim-reward-dialog'
import { RewardTable } from './components/reward-table'
import { RewardClaimsTable } from './components/reward-claims-table'
import { Reward, RewardFilterParams } from '@/types/rewards'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchRewards } from './actions/reward-operations'

function RewardContentComponent() {
  const { t } = useTranslation(['rewards'])
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<string>('rewards')
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [rewardFilters] = useState<RewardFilterParams>({
    page: 1,
    pageSize: 100,
    sortBy: 'pointsCost',
    sortDirection: 'asc',
    includeInactive: false
  })

  const rewardQueryConfig = useMemo(
    () => ({
      queryKey: ['rewards-for-dialog', rewardFilters],
      queryFn: () => fetchRewards(rewardFilters),
      select: (response: any) => response.data,
      staleTime: 5 * 60 * 1000
    }),
    [rewardFilters]
  )

  const { data: rewardDialogData } = useQuery(rewardQueryConfig)

  const availableRewards = useMemo(
    () => rewardDialogData?.rewards || [],
    [rewardDialogData?.rewards]
  )

  const handleClaimClick = useCallback(() => {
    setIsClaimDialogOpen(true)
  }, [])

  const handleClaimSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rewards'] })
    queryClient.invalidateQueries({ queryKey: ['reward-claims'] })
    queryClient.invalidateQueries({ queryKey: ['rewards-for-dialog'] })
  }, [queryClient])

  const handleCloseDialog = useCallback(() => {
    setIsClaimDialogOpen(false)
    setSelectedReward(null)
  }, [])

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
            <RewardTable />
          </TabsContent>
          <TabsContent value="claims">
            <RewardClaimsTable />
          </TabsContent>
        </Tabs>
      </Main>

      <ClaimRewardDialog
        reward={selectedReward}
        isOpen={isClaimDialogOpen}
        rewards={availableRewards}
        onClaimSuccess={handleClaimSuccess}
        onClose={handleCloseDialog}
      />
    </>
  )
}

const RewardContent = memo(RewardContentComponent)

export default function Rewards() {
  return <RewardContent />
}
