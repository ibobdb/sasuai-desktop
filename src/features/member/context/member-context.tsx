import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {
  Member,
  MemberDetail,
  MemberFilterParams,
  MemberFilterUIState,
  MemberDialogType
} from '@/types/members'
import { API_ENDPOINTS } from '@/config/api'
import { createDataProvider } from '@/context/data-context'

// Create the member-specific data provider
const { DataProvider, useData } = createDataProvider<
  Member,
  MemberDetail,
  MemberFilterParams,
  MemberFilterUIState
>()

interface MembersContextType {
  isLoading: boolean
  filters: MemberFilterParams
  updateFilters: (newFilters: Partial<MemberFilterParams>) => void
  filterUIState: MemberFilterUIState
  setFilterUIState: React.Dispatch<React.SetStateAction<MemberFilterUIState>>
  resetFilters: () => void
  debouncedSearch: (searchTerm: string) => void
  executeSearch: (searchTerm: string) => void
  isLoadingDetail: boolean
  open: MemberDialogType | null
  setOpen: (str: MemberDialogType | null) => void
  members: Member[]
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>
  currentMember: Member | null
  setCurrentMember: React.Dispatch<React.SetStateAction<Member | null>>
  memberDetail: MemberDetail | null
  setMemberDetail: React.Dispatch<React.SetStateAction<MemberDetail | null>>
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  fetchMemberDetail: (id: string) => Promise<MemberDetail | null>
  applyFilters: () => Promise<void>
}

const MembersContext = React.createContext<MembersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function MemberProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<MemberDialogType>(null)

  // Add this to track if dialog state changes should trigger data refresh
  const ignoreDialogStateChanges = React.useRef(false)

  // Custom setOpen function that won't trigger data refresh
  const handleSetOpen = (state: MemberDialogType | null) => {
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
    apiEndpoint: API_ENDPOINTS.MEMBERS.BASE,
    detailEndpoint: (id: string) => `${API_ENDPOINTS.MEMBERS.BASE}/${id}`,
    defaultFilters: {
      page: 1,
      pageSize: 10,
      sortField: 'createdAt',
      sortDirection: 'desc' as const
    },
    defaultFilterUIState: {
      search: '',
      tier: []
    },
    responseAdapter: (response: any) => {
      if (response?.success && response?.data?.members) {
        return {
          success: response.success,
          data: response.data.members,
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
      <MembersWrapper open={open} setOpen={handleSetOpen}>
        {children}
      </MembersWrapper>
    </DataProvider>
  )
}

function MembersWrapper({
  children,
  open,
  setOpen
}: {
  children: React.ReactNode
  open: MemberDialogType | null
  setOpen: (str: MemberDialogType | null) => void
}) {
  const dataContext = useData()

  const contextValue = React.useMemo(
    () => ({
      ...dataContext,
      open,
      setOpen,
      members: dataContext.items,
      setMembers: dataContext.setItems,
      currentMember: dataContext.currentItem,
      setCurrentMember: dataContext.setCurrentItem,
      memberDetail: dataContext.itemDetail,
      setMemberDetail: dataContext.setItemDetail,
      totalCount: dataContext.pagination.totalCount,
      totalPages: dataContext.pagination.totalPages,
      currentPage: dataContext.pagination.currentPage,
      pageSize: dataContext.pagination.pageSize,
      fetchMemberDetail: dataContext.fetchItemDetail,
      applyFilters: dataContext.fetchItems
    }),
    [dataContext, open, setOpen]
  )

  return <MembersContext.Provider value={contextValue}>{children}</MembersContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMembers = () => {
  const membersContext = React.useContext(MembersContext)

  if (!membersContext) {
    throw new Error('useMembers has to be used within <MembersContext>')
  }

  return membersContext
}
