import { Session } from 'electron'
import { store } from '../index'

const COOKIE_DOMAIN = 'sasuai.blastify.tech'

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
  private secureUrl: string

  constructor(session: Session) {
    this.session = session
    this.secureUrl = `https://${COOKIE_DOMAIN}`
  }

  private createCookieOptions(options: CookieOptions): Electron.CookiesSetDetails {
    return {
      url: options.url || this.secureUrl,
      name: options.name,
      value: options.value,
      domain: options.domain || COOKIE_DOMAIN,
      path: options.path || '/',
      secure: options.secure ?? true,
      httpOnly: options.httpOnly ?? true,
      sameSite: options.sameSite || 'strict',
      ...(options.expirationDate && { expirationDate: options.expirationDate })
    }
  }

  async getCookie(name: string): Promise<string | null> {
    try {
      const cookies = await this.session.cookies.get({ name })
      return cookies.length > 0 ? cookies[0].value : null
    } catch {
      return null
    }
  }

  async setCookie(options: CookieOptions): Promise<boolean> {
    try {
      const cookieOptions = this.createCookieOptions(options)
      await this.session.cookies.set(cookieOptions)
      return true
    } catch {
      return false
    }
  }

  async removeCookie(name: string): Promise<boolean> {
    try {
      await this.session.cookies.remove(this.secureUrl, name).catch(() => {})
      return true
    } catch {
      return false
    }
  }

  async clearAuthCookies(): Promise<boolean> {
    try {
      const allCookies = await this.session.cookies.get({ domain: COOKIE_DOMAIN })
      const authCookieNames = allCookies
        .filter((cookie) => cookie.name.includes('better-auth'))
        .map((cookie) => cookie.name)

      const removePromises = authCookieNames.map((cookieName) => this.removeCookie(cookieName))
      await Promise.all(removePromises)

      // Also clear from store for persistence
      store.delete('auth_cookies')

      return true
    } catch {
      return false
    }
  }

  async getAllCookies(): Promise<Electron.Cookie[]> {
    try {
      return await this.session.cookies.get({ domain: COOKIE_DOMAIN })
    } catch {
      return []
    }
  }
}
