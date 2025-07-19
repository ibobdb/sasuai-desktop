import { API_ENDPOINTS } from '@/config/api'
import { CrudOperations, ApiResponse, PaginatedResponse } from '@/types/data-provider'
import {
  Member,
  MemberDetail,
  MemberFilterParams,
  CreateMemberData,
  UpdateMemberData,
  BanMemberData
} from '@/types/members'

// Member-specific API operations
export const memberOperations: CrudOperations<
  Member,
  MemberDetail,
  CreateMemberData,
  UpdateMemberData
> = {
  // Read operations
  fetchItems: async (
    filters: MemberFilterParams
  ): Promise<ApiResponse<PaginatedResponse<Member>>> => {
    try {
      const params = new URLSearchParams()

      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.sortField) params.append('sortField', filters.sortField)
      if (filters.sortDirection) params.append('sortDirection', filters.sortDirection)
      if (filters.tier && Array.isArray(filters.tier)) {
        filters.tier.forEach((t) => params.append('tier', t))
      }

      const response = await window.api.request(
        `${API_ENDPOINTS.MEMBERS.BASE}?${params.toString()}`
      )

      // Directly use the API response structure
      const responseData = response?.data?.data || response?.data

      return {
        success: true,
        data: {
          items: responseData?.members || responseData || [],
          currentPage: responseData?.currentPage || filters.page || 1,
          totalPages: responseData?.totalPages || 1,
          totalCount: responseData?.totalCount || 0,
          pageSize: responseData?.pageSize || filters.pageSize || 10
        }
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      return {
        success: false,
        message: 'Failed to fetch members',
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

  fetchItemDetail: async (id: string): Promise<ApiResponse<MemberDetail>> => {
    try {
      const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}`)

      return {
        success: true,
        data: response?.data?.data || response?.data
      }
    } catch (error) {
      console.error('Error fetching member detail:', error)
      return {
        success: false,
        message: 'Failed to fetch member detail'
      }
    }
  },

  // Write operations
  createItem: async (data: CreateMemberData): Promise<ApiResponse<Member>> => {
    try {
      const response = await window.api.request(API_ENDPOINTS.MEMBERS.BASE, {
        method: 'POST',
        data: data
      })

      return {
        success: response?.data?.success ?? true,
        data: response?.data?.data || response?.data,
        message: response?.data?.message
      }
    } catch (error) {
      console.error('Error creating member:', error)

      // Extract meaningful error message
      let errorMessage = 'Failed to create member'

      if (error instanceof Error) {
        // Check if it's an API error with more details
        if ('data' in error && (error as any).data?.message) {
          errorMessage = (error as any).data.message
        } else if ('status' in error) {
          const status = (error as any).status
          if (status === 400) {
            errorMessage = 'Invalid data provided'
          } else if (status === 409) {
            errorMessage = 'Member with this card ID or phone already exists'
          } else if (status === 422) {
            errorMessage = 'Validation error - please check your input'
          } else {
            errorMessage = error.message
          }
        } else {
          errorMessage = error.message
        }
      }

      return {
        success: false,
        message: errorMessage
      }
    }
  },

  updateItem: async (data: UpdateMemberData & { id: string }): Promise<ApiResponse<Member>> => {
    try {
      const { id, ...updateData } = data
      const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}`, {
        method: 'PUT',
        data: updateData
      })

      return {
        success: response?.data?.success ?? true,
        data: response?.data?.data || response?.data,
        message: response?.data?.message
      }
    } catch (error) {
      console.error('Error updating member:', error)
      return {
        success: false,
        message: 'Failed to update member'
      }
    }
  },

  deleteItem: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}`, {
        method: 'DELETE'
      })

      return {
        success: response?.data?.success ?? true,
        message: response?.data?.message || 'Member deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      return {
        success: false,
        message: 'Failed to delete member'
      }
    }
  }
}

// Additional member-specific operations (not part of generic CRUD)
export const banMember = async (id: string, data: BanMemberData): Promise<ApiResponse<Member>> => {
  try {
    const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}/ban`, {
      method: 'POST',
      data: data
    })

    return {
      success: response?.data?.success ?? true,
      data: response?.data?.data || response?.data,
      message: response?.data?.message || 'Member banned successfully'
    }
  } catch (error) {
    console.error('Error banning member:', error)
    return {
      success: false,
      message: 'Failed to ban member'
    }
  }
}

export const unbanMember = async (id: string): Promise<ApiResponse<Member>> => {
  try {
    const response = await window.api.request(`${API_ENDPOINTS.MEMBERS.BASE}/${id}/unban`, {
      method: 'POST'
    })

    return {
      success: response?.data?.success ?? true,
      data: response?.data?.data || response?.data,
      message: response?.data?.message || 'Member unbanned successfully'
    }
  } catch (error) {
    console.error('Error unbanning member:', error)
    return {
      success: false,
      message: 'Failed to unban member'
    }
  }
}
