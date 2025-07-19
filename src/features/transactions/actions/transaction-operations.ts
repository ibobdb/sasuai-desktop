import { API_ENDPOINTS } from '@/config/api'
import { ApiResponse, PaginatedResponse } from '@/types/data-provider'
import { Transaction, TransactionDetail, TransactionFilterParams } from '@/types/transactions'

// Transaction-specific API operations (read-only for desktop)
export const transactionOperations = {
  fetchItems: async (
    filters: TransactionFilterParams
  ): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    try {
      const params = new URLSearchParams()

      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
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

      const responseData = response?.data?.data || response?.data

      return {
        success: true,
        data: {
          items: responseData?.transactions || responseData || [],
          currentPage: responseData?.pagination?.currentPage || filters.page || 1,
          totalPages: responseData?.pagination?.totalPages || 1,
          totalCount: responseData?.pagination?.totalCount || 0,
          pageSize: responseData?.pagination?.pageSize || filters.pageSize || 10
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return {
        success: false,
        message: 'Failed to fetch transactions',
        data: {
          items: [],
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          pageSize: 10
        }
      }
    }
  },

  fetchItemDetail: async (id: string): Promise<ApiResponse<TransactionDetail>> => {
    try {
      const response = await window.api.request(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`)

      return {
        success: true,
        data: response?.data?.transactionDetails
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error)
      return {
        success: false,
        message: 'Failed to fetch transaction detail'
      }
    }
  }
}
