import { Session } from 'electron'
import { is } from '@electron-toolkit/utils'
import {
  COOKIE_DOMAIN,
  AUTH_COOKIE_NAME,
  USER_DATA_COOKIE_NAME,
  AUTH_STORE_TOKEN_KEY,
  AUTH_STORE_USER_KEY,
  COOKIE_CONFIG
} from '../constants'
import { getTypedStore } from '../index'

interface CookieOptions {
  name: string
  value: string
  url?: string
  domain?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'unspecified' | 'no_restriction' | 'lax' | 'strict'
  expirationDate?: number
}

export class CookieService {
  private session: Session
  private store = getTypedStore()

  constructor(session: Session) {
    this.session = session
  }

  private getSecureCookieName(name: string): string {
    return is.dev ? name : `${COOKIE_CONFIG.SECURE_PREFIX}${name}`
  }

  private getCookieUrl(secure = !is.dev): string {
    return `${secure ? 'https' : 'http'}://${COOKIE_DOMAIN}`
  }

  private createCookieOptions(options: CookieOptions): Electron.CookiesSetDetails {
    const isProduction = !is.dev
    const cookieName = this.getSecureCookieName(options.name)

    return {
      url: options.url || this.getCookieUrl(),
      name: cookieName,
      value: options.value,
      domain: options.domain || COOKIE_DOMAIN,
      path: options.path || COOKIE_CONFIG.DEFAULT_PATH,
      secure: options.secure ?? (isProduction ? COOKIE_CONFIG.DEFAULT_SECURE : false),
      httpOnly: options.httpOnly ?? COOKIE_CONFIG.DEFAULT_HTTPONLY,
      sameSite: options.sameSite || COOKIE_CONFIG.DEFAULT_SAMSITE,
      ...(options.expirationDate && { expirationDate: options.expirationDate })
    }
  }

  async getCookie(name: string): Promise<string | null> {
    try {
      const cookieName = this.getSecureCookieName(name)
      const cookies = await this.session.cookies.get({ name: cookieName })

      if (cookies.length > 0) {
        return cookies[0].value
      }

      if (name === AUTH_COOKIE_NAME) {
        return this.store.get(AUTH_STORE_TOKEN_KEY) || null
      }

      if (name === USER_DATA_COOKIE_NAME) {
        return this.store.get(AUTH_STORE_USER_KEY) || null
      }

      return null
    } catch (error) {
      console.error('Failed to get cookie:', error)
      return null
    }
  }

  async setCookie(options: CookieOptions): Promise<boolean> {
    try {
      const cookieOptions = this.createCookieOptions(options)
      await this.session.cookies.set(cookieOptions)

      const originalName = options.name
      if (originalName === AUTH_COOKIE_NAME) {
        this.store.set(AUTH_STORE_TOKEN_KEY, options.value)
      } else if (originalName === USER_DATA_COOKIE_NAME) {
        this.store.set(AUTH_STORE_USER_KEY, options.value)
      }

      if ([AUTH_COOKIE_NAME, USER_DATA_COOKIE_NAME].includes(originalName)) {
        await this.session.cookies.flushStore()
      }

      return true
    } catch (error) {
      console.error('Failed to set cookie:', error)
      return false
    }
  }

  async removeCookie(name: string): Promise<boolean> {
    try {
      const urls = [this.getCookieUrl(false), this.getCookieUrl(true)]
      const cookieNames = [name, this.getSecureCookieName(name)]

      for (const url of urls) {
        for (const cookieName of cookieNames) {
          await this.session.cookies.remove(url, cookieName).catch(() => {})
        }
      }

      await this.session.cookies.flushStore()
      return true
    } catch (error) {
      console.error('Failed to remove cookie:', error)
      return false
    }
  }

  async clearAuthCookies(): Promise<boolean> {
    try {
      const authCookies = [AUTH_COOKIE_NAME, USER_DATA_COOKIE_NAME]

      for (const cookieName of authCookies) {
        await this.removeCookie(cookieName)
      }

      this.store.delete(AUTH_STORE_TOKEN_KEY)
      this.store.delete(AUTH_STORE_USER_KEY)

      await this.session.cookies.flushStore()
      return true
    } catch (error) {
      console.error('Failed to clear auth cookies:', error)
      return false
    }
  }

  async getAllCookies(): Promise<Electron.Cookie[]> {
    try {
      return await this.session.cookies.get({ domain: COOKIE_DOMAIN })
    } catch (error) {
      console.error('Failed to get all cookies:', error)
      return []
    }
  }
}
