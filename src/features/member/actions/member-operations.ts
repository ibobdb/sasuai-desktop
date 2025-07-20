import { API_ENDPOINTS } from '@/config/api'
import {
  MemberFilterParams,
  CreateMemberData,
  UpdateMemberData,
  BanMemberData,
  MemberListResponse,
  MemberDetailResponse,
  MemberCreateResponse,
  MemberUpdateResponse,
  MemberDeleteResponse,
  MemberBanResponse
} from '@/types/members'

// Member-specific API operations
export const memberOperations = {
  // Read operations
  fetchItems: async (filters: MemberFilterParams): Promise<MemberListResponse> => {
    const params = new URLSearchParams()

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.pageSize) params.append('limit', filters.pageSize.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.sortField) params.append('sortField', filters.sortField)
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection)
    if (filters.tier && Array.isArray(filters.tier)) {
      params.append('tier', filters.tier.join(','))
    }

    const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}?${params.toString()}`)
    return response
  },

  fetchItemDetail: async (id: string): Promise<MemberDetailResponse> => {
    const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}`)
    return response
  },

  // Write operations
  createItem: async (data: CreateMemberData): Promise<MemberCreateResponse> => {
    const response = await window.api.request(API_ENDPOINTS.MEMBERS.BASE, {
      method: 'POST',
      data: data
    })
    return response
  },

  updateItem: async (data: UpdateMemberData & { id: string }): Promise<MemberUpdateResponse> => {
    const { id, ...updateData } = data
    const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}`, {
      method: 'PUT',
      data: updateData
    })
    return response
  },

  deleteItem: async (id: string): Promise<MemberDeleteResponse> => {
    const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}`, {
      method: 'DELETE'
    })
    return response
  }
}

// Additional member-specific operations (not part of generic CRUD)
export const banMember = async (id: string, data: BanMemberData): Promise<MemberBanResponse> => {
  const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}/ban`, {
    method: 'POST',
    data: data
  })
  return response
}

export const unbanMember = async (id: string): Promise<MemberBanResponse> => {
  const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}/unban`, {
    method: 'POST'
  })
  return response
}
