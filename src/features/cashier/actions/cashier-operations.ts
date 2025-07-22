import { API_ENDPOINTS } from '@/config/api'
import {
  ProductResponse,
  Member,
  MemberResponse,
  TransactionData,
  ProductSearchParams,
  MemberSearchParams,
  PointsCalculationParams,
  DiscountValidationParams,
  TransactionResponse,
  PointsResponse,
  DiscountResponse
} from '@/types/cashier'

export const cashierOperations = {
  // Product operations
  searchProducts: async (params: ProductSearchParams): Promise<ProductResponse> => {
    const searchParams = new URLSearchParams()
    searchParams.append('search', params.query)
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const response = await window.api.request(
      `${API_ENDPOINTS.PRODUCTS.BASE}?${searchParams.toString()}`
    )
    return response
  },

  // Member operations
  searchMembers: async (params: MemberSearchParams): Promise<MemberResponse> => {
    const searchParams = new URLSearchParams()
    searchParams.append('search', params.query)
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const response = await window.api.request(
      `${API_ENDPOINTS.MEMBERS.BASE}?${searchParams.toString()}`
    )
    return response
  },

  createMember: async (memberData: {
    name: string
    email?: string | null
    address?: string | null
    cardId: string
    phone: string
  }): Promise<{ success: boolean; data: Member; message?: string }> => {
    const response = await window.api.request(API_ENDPOINTS.MEMBERS.BASE, {
      method: 'POST',
      data: memberData
    })
    return response
  },

  // Points calculation
  calculatePoints: async (params: PointsCalculationParams): Promise<PointsResponse> => {
    const response = await window.api.request(API_ENDPOINTS.MEMBERS.CALCULATE_POINTS, {
      method: 'POST',
      data: params
    })
    return response
  },

  // Discount operations
  validateDiscountCode: async (params: DiscountValidationParams): Promise<DiscountResponse> => {
    const response = await window.api.request(
      `${API_ENDPOINTS.DISCOUNTS.BASE}?code=${encodeURIComponent(params.code)}`,
      {
        method: 'GET'
      }
    )
    return response
  },

  // Transaction operations
  processTransaction: async (transactionData: TransactionData): Promise<TransactionResponse> => {
    const response = await window.api.request(API_ENDPOINTS.TRANSACTIONS.BASE, {
      method: 'POST',
      data: transactionData
    })
    return response
  }
}
