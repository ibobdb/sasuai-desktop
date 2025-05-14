export interface Reward {
  id: string
  name: string
  description: string | null
  pointsCost: number
  stock: number
  monetaryValue: number | null
  isActive: boolean
  expiryDate: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    rewardClaims: number
  }
}

export interface RewardDetail extends Reward {
  rewardClaims?: RewardClaim[]
}

export interface RewardClaim {
  id: string
  memberId: string
  rewardId: string
  claimDate: string
  status: string
  createdAt: string
  updatedAt: string
  member: {
    id: string
    cardId: string | null
    name: string
    email: string | null
    phone: string
    address: string | null
    tierId: string | null
    totalPoints: number
    totalPointsEarned: number
    joinDate: string
    isBanned: boolean
    banReason: string | null
  }
  reward: {
    id: string
    name: string
    pointsCost: number
    stock: number
    isActive: boolean
    expiryDate: string | null
    imageUrl: string | null
    description: string | null
  }
}

export interface RewardFilterParams {
  query?: string
  page: number
  pageSize: number
  sortBy: string
  sortDirection: 'asc' | 'desc'
  includeInactive?: boolean
}

export interface RewardFilterUIState {
  search: string
  status: string[]
}

export type RewardDialogType = 'view' | 'create' | 'edit'

export interface RewardClaimFilterParams {
  page: number
  pageSize: number
  sortBy: string
  sortDirection: 'asc' | 'desc'
  search?: string
  statusFilter?: string // Added this property for status filtering
}

export interface RewardClaimFilterUIState {
  search: string
  dateRange?: {
    from: Date | null
    to: Date | null
  }
}
