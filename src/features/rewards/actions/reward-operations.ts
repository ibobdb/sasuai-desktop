import { API_ENDPOINTS } from '@/config/api'
import {
  RewardFilterParams,
  RewardClaimFilterParams,
  ApiResponse,
  RewardListResponse,
  RewardClaimListResponse
} from '@/types/rewards'

export const fetchRewards = async (
  filters: RewardFilterParams
): Promise<ApiResponse<RewardListResponse>> => {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.pageSize) params.append('limit', filters.pageSize.toString())
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortDirection) params.append('sortDirection', filters.sortDirection)
  if (filters.query) params.append('search', filters.query)
  if (filters.includeInactive !== undefined) {
    params.append('includeInactive', filters.includeInactive.toString())
  }

  const response = await window.api.request(`${API_ENDPOINTS.REWARDS.BASE}?${params.toString()}`, {
    method: 'GET'
  })

  return response
}

export const fetchRewardClaims = async (
  filters: RewardClaimFilterParams
): Promise<ApiResponse<RewardClaimListResponse>> => {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.pageSize) params.append('limit', filters.pageSize.toString())
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortDirection) params.append('sortDirection', filters.sortDirection)
  if (filters.search) params.append('search', filters.search)
  if (filters.statusFilter) params.append('status', filters.statusFilter)

  const response = await window.api.request(`${API_ENDPOINTS.REWARDS.CLAIM}?${params.toString()}`, {
    method: 'GET'
  })

  return response
}

export const claimReward = async (
  memberId: string,
  rewardId: string
): Promise<ApiResponse<null>> => {
  const response = await window.api.request(API_ENDPOINTS.REWARDS.CLAIM, {
    method: 'POST',
    data: { memberId, rewardId }
  })

  return response
}
