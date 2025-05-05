import { ipcMain } from 'electron'
import { persistentSession } from '../index'
import { getTypedStore } from '../store'
import {
  COOKIE_DOMAIN,
  AUTH_COOKIE_NAME,
  USER_DATA_COOKIE_NAME,
  AUTH_STORE_TOKEN_KEY,
  AUTH_STORE_USER_KEY
} from '../constants'
import { is } from '@electron-toolkit/utils'

export async function clearAuthCookies() {
  try {
    await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, AUTH_COOKIE_NAME)
    await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, USER_DATA_COOKIE_NAME)
    await persistentSession.cookies.flushStore()
    const typedStore = getTypedStore()
    typedStore.delete(AUTH_STORE_TOKEN_KEY)
    typedStore.delete(AUTH_STORE_USER_KEY)
  } catch (err) {
    console.log('Error clearing auth cookies:', err)
  }
}

export function setupCookieHandlers() {
  const typedStore = getTypedStore()

  // Cookie management handlers
  ipcMain.handle('cookies:get', async (_event, filter) => {
    try {
      const cookieFilter = typeof filter === 'string' ? { name: filter } : filter
      const cookies = await persistentSession.cookies.get(cookieFilter)

      // If cookie exists, return its value
      if (cookies.length > 0) {
        return cookies[0].value
      }

      // Fallback to electron-store for auth cookies
      if (typeof filter === 'string') {
        if (filter === AUTH_COOKIE_NAME) {
          return typedStore.get(AUTH_STORE_TOKEN_KEY) || null
        } else if (filter === USER_DATA_COOKIE_NAME) {
          return typedStore.get(AUTH_STORE_USER_KEY) || null
        }
      }

      return null
    } catch (error) {
      console.error('Error getting cookie:', error)
      return null
    }
  })

  ipcMain.handle('cookies:set', async (_event, details) => {
    try {
      let cookieDetails

      if (typeof details === 'object') {
        if (details.name && details.value !== undefined) {
          cookieDetails = {
            url: `http://${COOKIE_DOMAIN}`,
            name: details.name,
            value: details.value,
            domain: COOKIE_DOMAIN
          }

          if (details.expirationDate) {
            cookieDetails.expirationDate = details.expirationDate
          }

          // Add security settings
          if (!is.dev) {
            cookieDetails.secure = true
            cookieDetails.httpOnly = true
          }
          cookieDetails.sameSite = 'lax'
        } else if (details.url && details.name) {
          cookieDetails = details
        } else {
          throw new Error('Invalid cookie details')
        }
      } else {
        throw new Error('Invalid cookie details')
      }

      // Use persistent session
      await persistentSession.cookies.set(cookieDetails)

      // Store auth data in electron-store as backup
      if (cookieDetails.name === AUTH_COOKIE_NAME) {
        typedStore.set(AUTH_STORE_TOKEN_KEY, cookieDetails.value)
      } else if (cookieDetails.name === USER_DATA_COOKIE_NAME) {
        typedStore.set(AUTH_STORE_USER_KEY, cookieDetails.value)
      }

      // Force write cookies to disk for auth cookies
      if (cookieDetails.name === AUTH_COOKIE_NAME || cookieDetails.name === USER_DATA_COOKIE_NAME) {
        await persistentSession.cookies.flushStore()
      }
      return true
    } catch (error) {
      console.error('Error setting cookie:', error)
      return false
    }
  })

  ipcMain.handle('cookies:remove', async (_event, url, name) => {
    try {
      const cookieUrl = typeof url === 'string' && name ? url : `http://${COOKIE_DOMAIN}`
      const cookieName = name || url // If only one arg, it's the name
      await persistentSession.cookies.remove(cookieUrl, cookieName)
      await persistentSession.cookies.flushStore()
      return true
    } catch (error) {
      console.error('Error removing cookie:', error)
      return false
    }
  })

  // Handles removal of all auth-related cookies
  ipcMain.handle('cookies:clearAuth', async () => {
    try {
      await clearAuthCookies()
      return true
    } catch (error) {
      console.error('Error clearing auth cookies:', error)
      return false
    }
  })
}
