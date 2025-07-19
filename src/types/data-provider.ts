// Generic types for data provider pattern
export interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

export interface BaseFilterParams {
  page: number
  pageSize: number
  sortField: string
  sortDirection?: 'asc' | 'desc'
  search?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends PaginationData {
  items: T[]
}

export interface BaseDialogState<T = unknown> {
  open: string | null
  currentItem: T | null
}

export interface BaseFilterUIState {
  search: string
  [key: string]: string | number | boolean | string[] | undefined
}

// Generic CRUD operations
export interface CrudOperations<T, TDetail, TCreateData, TUpdateData> {
  // Read operations
  fetchItems: (filters: BaseFilterParams) => Promise<ApiResponse<PaginatedResponse<T>>>
  fetchItemDetail: (id: string) => Promise<ApiResponse<TDetail>>

  // Write operations
  createItem: (data: TCreateData) => Promise<ApiResponse<T>>
  updateItem: (data: TUpdateData & { id: string }) => Promise<ApiResponse<T>>
  deleteItem: (id: string) => Promise<ApiResponse<void>>
}

// Generic context interface
export interface BaseDataContextType<
  T,
  TDetail,
  TFilterParams extends BaseFilterParams,
  TFilterUIState extends BaseFilterUIState
> {
  // Data
  items: T[]
  itemDetail: TDetail | null
  currentItem: T | null

  // Loading states
  isLoading: boolean
  isLoadingDetail: boolean

  // Filters and pagination
  filters: TFilterParams
  filterUIState: TFilterUIState
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number

  // Dialog state
  open: string | null

  // Actions
  setCurrentItem: (item: T | null) => void
  setOpen: (state: string | null) => void
  updateFilters: (newFilters: Partial<TFilterParams>) => void
  setFilterUIState: React.Dispatch<React.SetStateAction<TFilterUIState>>
  resetFilters: () => void
  debouncedSearch: (searchTerm: string) => void
  executeSearch: (searchTerm: string) => void
  refetch: () => void
}
