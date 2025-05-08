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
  isBanned?: boolean
  banReason?: string | null
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
  memberPoints?: {
    id: string
    memberId: string
    transactionId: string
    pointsEarned: number
    dateEarned: string
    notes: string
    createdAt: string
    updatedAt: string
    transaction: Transaction
  }[]
  rewardClaims?: RewardClaim[]
  transactions?: Transaction[]
}

// Reward claim information
export interface RewardClaim {
  id: string
  memberId: string
  rewardId: string
  claimDate: string
  status: string
  createdAt: string
  updatedAt: string
  reward: Reward
}

export interface Reward {
  id: string
  name: string
  pointsCost: number
  stock: number
  isActive: boolean
  expiryDate: string | null
  imageUrl: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  tranId: string | null
  cashierId: string
  memberId: string
  totalAmount: number
  finalAmount: number
  paymentMethod: string
  discountMemberId: string | null
  discountValueType: string | null
  discountValue: number | null
  discountAmount: number | null
  paymentAmount: number | null
  change: number | null
  createdAt: string
  updatedAt: string
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
