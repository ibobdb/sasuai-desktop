import { API_ENDPOINTS } from '@/config/api'
import {
  TransactionFilterParams,
  TransactionListResponse,
  TransactionDetailResponse
} from '@/types/transactions'

export const transactionOperations = {
  fetchItems: async (filters: TransactionFilterParams): Promise<TransactionListResponse> => {
    const params = new URLSearchParams()

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.pageSize) params.append('limit', filters.pageSize.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.sortField) params.append('sortField', filters.sortField)
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection)
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString())
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString())
    if (filters.minAmount) params.append('minAmount', filters.minAmount.toString())
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString())
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod)

    const response = await window.api.request(
      `${API_ENDPOINTS.TRANSACTIONS.BASE}?${params.toString()}`
    )

    return response
  },

  fetchItemDetail: async (id: string): Promise<TransactionDetailResponse> => {
    const response = await window.api.request(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`)
    return response
  }
}
