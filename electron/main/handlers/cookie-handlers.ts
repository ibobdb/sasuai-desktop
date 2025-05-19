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

// Helper function to get cookie name with production prefix
function getSecureCookieName(name: string): string {
  return !is.dev ? `__Secure-${name}` : name
}

// Helper function to get all possible cookie names (both regular and prefixed versions)
function getAllPossibleCookieNames(name: string): string[] {
  return [name, `__Secure-${name}`]
}

export async function clearAuthCookies() {
  try {
    // Clear both regular and prefixed cookie versions
    const cookiesToRemove = [
      ...getAllPossibleCookieNames(AUTH_COOKIE_NAME),
      ...getAllPossibleCookieNames(USER_DATA_COOKIE_NAME)
    ]

    for (const cookieName of cookiesToRemove) {
      await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, cookieName)
      await persistentSession.cookies.remove(`https://${COOKIE_DOMAIN}`, cookieName)
    }

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

      // First try with original name
      let cookies = await persistentSession.cookies.get(cookieFilter)

      // If not found and it's a string filter, try with prefixed name in production
      if (cookies.length === 0 && typeof filter === 'string' && !is.dev) {
        const prefixedFilter = { ...cookieFilter, name: getSecureCookieName(filter) }
        cookies = await persistentSession.cookies.get(prefixedFilter)
      }

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
          // Apply secure prefix in production if needed
          const cookieName = !is.dev ? getSecureCookieName(details.name) : details.name

          cookieDetails = {
            url: !is.dev ? `https://${COOKIE_DOMAIN}` : `http://${COOKIE_DOMAIN}`,
            name: cookieName,
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
          // For direct cookie details, apply prefix if in production
          if (!is.dev && details.url.startsWith('https://')) {
            details.name = getSecureCookieName(details.name)
          }
          cookieDetails = details
        } else {
          throw new Error('Invalid cookie details')
        }
      } else {
        throw new Error('Invalid cookie details')
      }

      // Use persistent session
      await persistentSession.cookies.set(cookieDetails)

      // Store auth data in electron-store as backup (use original names as keys)
      const originalName =
        !is.dev && cookieDetails.name.startsWith('__Secure-')
          ? cookieDetails.name.substring(9)
          : cookieDetails.name

      if (originalName === AUTH_COOKIE_NAME) {
        typedStore.set(AUTH_STORE_TOKEN_KEY, cookieDetails.value)
      } else if (originalName === USER_DATA_COOKIE_NAME) {
        typedStore.set(AUTH_STORE_USER_KEY, cookieDetails.value)
      }

      // Force write cookies to disk for auth cookies
      if (originalName === AUTH_COOKIE_NAME || originalName === USER_DATA_COOKIE_NAME) {
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

      // Remove regular version
      await persistentSession.cookies.remove(cookieUrl, cookieName)

      // If in production, also try to remove prefixed version
      if (!is.dev) {
        const secureUrl = cookieUrl.replace('http://', 'https://')
        await persistentSession.cookies.remove(secureUrl, getSecureCookieName(cookieName))
      }

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
