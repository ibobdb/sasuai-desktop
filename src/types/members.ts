import { BaseFilterParams, BaseFilterUIState } from './common'

// Available dialog types
export type MemberDialogType = 'view' | 'create' | 'edit'

// Member tier information
export interface MemberTier {
  id: string
  name: string
  minPoints: number
  multiplier: number
  createdAt: string
  updatedAt: string
}

// Member discount relation
export interface MemberDiscountRelation {
  id: string
  memberId: string
  discountId: string
  discount: {
    id: string
    name: string
    value: number
    valueType: string
    minPurchase: number
    isActive: boolean
  }
}

// Basic member information for table listing
export interface Member {
  id: string
  name: string
  email: string | null
  phone: string
  cardId: string
  address: string | null
  tierId: string
  totalPoints: number
  totalPointsEarned: number
  joinDate: string
  createdAt: string
  updatedAt: string
  tier?: MemberTier
  discountRelationsMember?: MemberDiscountRelation[]
}

// Extended member information for detail view
export interface MemberDetail extends Member {
  transactionSummary?: {
    count: number
    totalSpent: number
    lastTransaction: string | null
  }
}

// API response structure for member list
export interface MemberListResponse {
  success: boolean
  data: {
    members: Member[]
    totalCount: number
    totalPages: number
    currentPage: number
  }
}

// API response structure for single member
export interface MemberDetailResponse {
  success: boolean
  data: MemberDetail
}

// Filter parameters for API requests
export interface MemberFilterParams extends BaseFilterParams {
  tier?: string | string[]
}

// UI state for filters
export interface MemberFilterUIState extends BaseFilterUIState {
  tier: string[]
}
