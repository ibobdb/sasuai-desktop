import { ipcMain } from 'electron'
import { createApiClient } from '../api-client'
import { clearAuthCookies } from './cookie-handlers'

export function setupApiHandlers() {
  // Create API client instance
  const apiClient = createApiClient()

  // API request handler
  ipcMain.handle('api:request', async (_event, url: string, options = {}) => {
    try {
      const response = await apiClient({
        url,
        ...options
      })

      return { success: true, data: response.data }
    } catch (error: any) {
      if (error.response) {
        // For auth errors, clear cookies
        if (error.response.status === 401 || error.response.status === 403) {
          await clearAuthCookies()
        }

        return {
          success: false,
          error: {
            status: error.response.status,
            message: error.response.data?.message || 'Server error',
            data: error.response.data
          }
        }
      } else if (error.request) {
        return {
          success: false,
          error: {
            status: 0,
            message: 'No response from server'
          }
        }
      } else {
        return {
          success: false,
          error: {
            status: 0,
            message: error.message || 'Unknown error occurred'
          }
        }
      }
    }
  })
}
