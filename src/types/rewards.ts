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

export interface RewardClaimFilterParams {
  page: number
  pageSize: number
  sortBy: string
  sortDirection: 'asc' | 'desc'
  search?: string
  statusFilter?: string
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface RewardListResponse {
  rewards: Reward[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface RewardClaimListResponse {
  claims: RewardClaim[]
  totalCount: number
  totalPages: number
  currentPage: number
}
