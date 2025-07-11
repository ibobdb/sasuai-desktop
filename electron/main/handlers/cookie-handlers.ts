import { ipcMain } from 'electron'
import { persistentSession } from '../index'
import { CookieService } from '../services/cookie-service'

let cookieService: CookieService

export function setupCookieHandlers() {
  cookieService = new CookieService(persistentSession)

  ipcMain.handle('cookies:get', async (_event, filter) => {
    if (typeof filter === 'string') {
      return await cookieService.getCookie(filter)
    }

    if (filter?.name) {
      return await cookieService.getCookie(filter.name)
    }

    return null
  })

  ipcMain.handle('cookies:set', async (_event, details) => {
    try {
      if (typeof details === 'object' && details.name && details.value !== undefined) {
        return await cookieService.setCookie(details)
      }
      return false
    } catch (error) {
      console.error('Error setting cookie:', error)
      return false
    }
  })

  ipcMain.handle('cookies:remove', async (_event, url, name) => {
    const cookieName = name || url
    return await cookieService.removeCookie(cookieName)
  })

  ipcMain.handle('cookies:clearAuth', async () => {
    return await cookieService.clearAuthCookies()
  })
}

export async function clearAuthCookies() {
  if (cookieService) {
    return await cookieService.clearAuthCookies()
  }
  return false
}
