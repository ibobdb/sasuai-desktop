import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {
  Reward,
  RewardDetail,
  RewardFilterParams,
  RewardFilterUIState,
  RewardDialogType
} from '@/types/rewards'
import { API_ENDPOINTS } from '@/config/api'
import { createDataProvider } from '@/context/data-context'

// Create the reward-specific data provider
const { DataProvider, useData } = createDataProvider<
  Reward,
  RewardDetail,
  RewardFilterParams,
  RewardFilterUIState
>()

interface RewardsContextType {
  isLoading: boolean
  filters: RewardFilterParams
  updateFilters: (newFilters: Partial<RewardFilterParams>) => void
  filterUIState: RewardFilterUIState
  setFilterUIState: React.Dispatch<React.SetStateAction<RewardFilterUIState>>
  resetFilters: () => void
  debouncedSearch: (searchTerm: string) => void
  executeSearch: (searchTerm: string) => void
  isLoadingDetail: boolean
  open: RewardDialogType | null
  setOpen: (str: RewardDialogType | null) => void
  rewards: Reward[]
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>
  currentReward: Reward | null
  setCurrentReward: React.Dispatch<React.SetStateAction<Reward | null>>
  rewardDetail: RewardDetail | null
  setRewardDetail: React.Dispatch<React.SetStateAction<RewardDetail | null>>
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  fetchRewardDetail: (id: string) => Promise<RewardDetail | null>
  applyFilters: () => Promise<void>
}

const RewardsContext = React.createContext<RewardsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function RewardProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<RewardDialogType>(null)

  // Add this to track if dialog state changes should trigger data refresh
  const ignoreDialogStateChanges = React.useRef(false)

  // Custom setOpen function that won't trigger data refresh
  const handleSetOpen = (state: RewardDialogType | null) => {
    // Set flag to true before changing state
    ignoreDialogStateChanges.current = true
    setOpen(state)
    // Reset flag after a short delay (after state updates have completed)
    setTimeout(() => {
      ignoreDialogStateChanges.current = false
    }, 100)
  }

  // Configuration for data provider with adapter functions
  const dataConfig = {
    apiEndpoint: API_ENDPOINTS.REWARDS.BASE,
    detailEndpoint: (id: string) => `${API_ENDPOINTS.REWARDS.BASE}/${id}`,
    defaultFilters: {
      page: 1,
      pageSize: 10,
      sortBy: 'pointsCost',
      sortDirection: 'asc' as const,
      includeInactive: false
    },
    defaultFilterUIState: {
      search: '',
      status: []
    },
    responseAdapter: (response: any) => {
      if (response?.success && response?.data?.rewards) {
        return {
          success: response.success,
          data: response.data.rewards,
          pagination: {
            totalCount: response.data.totalCount || 0,
            totalPages: response.data.totalPages || 1,
            currentPage: response.data.currentPage || 1
          }
        }
      }
      return response
    },
    detailAdapter: (response: any) => {
      if (response?.success && response?.data) {
        return {
          success: response.success,
          data: response.data
        }
      }
      return response
    },
    // Add this to prevent fetching when dialog state changes
    shouldFetchItems: () => !ignoreDialogStateChanges.current
  }

  return (
    <DataProvider config={dataConfig}>
      <RewardsWrapper open={open} setOpen={handleSetOpen}>
        {children}
      </RewardsWrapper>
    </DataProvider>
  )
}

function RewardsWrapper({
  children,
  open,
  setOpen
}: {
  children: React.ReactNode
  open: RewardDialogType | null
  setOpen: (str: RewardDialogType | null) => void
}) {
  const dataContext = useData()

  const contextValue = React.useMemo(
    () => ({
      ...dataContext,
      open,
      setOpen,
      rewards: dataContext.items,
      setRewards: dataContext.setItems,
      currentReward: dataContext.currentItem,
      setCurrentReward: dataContext.setCurrentItem,
      rewardDetail: dataContext.itemDetail,
      setRewardDetail: dataContext.setItemDetail,
      totalCount: dataContext.pagination.totalCount,
      totalPages: dataContext.pagination.totalPages,
      currentPage: dataContext.pagination.currentPage,
      pageSize: dataContext.pagination.pageSize,
      fetchRewardDetail: dataContext.fetchItemDetail,
      applyFilters: dataContext.fetchItems
    }),
    [dataContext, open, setOpen]
  )

  return <RewardsContext.Provider value={contextValue}>{children}</RewardsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRewards = () => {
  const rewardsContext = React.useContext(RewardsContext)

  if (!rewardsContext) {
    throw new Error('useRewards has to be used within <RewardsContext>')
  }

  return rewardsContext
}
