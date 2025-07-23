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

  // Caching for performance
  private cookieCache = new Map<string, { value: string | null; timestamp: number }>()
  private readonly CACHE_DURATION = 30000 // 30 seconds

  // URL caching
  private secureUrl: string
  private insecureUrl: string

  // Debouncing for flush operations
  private flushTimeout: NodeJS.Timeout | null = null
  private readonly FLUSH_DEBOUNCE = 500 // 500ms

  constructor(session: Session) {
    this.session = session
    this.secureUrl = `https://${COOKIE_DOMAIN}`
    this.insecureUrl = `http://${COOKIE_DOMAIN}`
  }

  private getSecureCookieName(name: string): string {
    return is.dev ? name : `${COOKIE_CONFIG.SECURE_PREFIX}${name}`
  }

  private getCookieUrl(secure = !is.dev): string {
    return secure ? this.secureUrl : this.insecureUrl
  }

  private getCacheKey(name: string): string {
    return `cookie:${name}`
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private invalidateCache(name: string): void {
    const cacheKey = this.getCacheKey(name)
    this.cookieCache.delete(cacheKey)
  }

  private debouncedFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }

    this.flushTimeout = setTimeout(async () => {
      try {
        await this.session.cookies.flushStore()
      } catch (error) {
        console.error('Failed to flush cookie store:', error)
      } finally {
        this.flushTimeout = null
      }
    }, this.FLUSH_DEBOUNCE)
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
    const cacheKey = this.getCacheKey(name)
    const cached = this.cookieCache.get(cacheKey)

    // Return cached value if valid
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.value
    }

    try {
      const cookieName = this.getSecureCookieName(name)
      const cookies = await this.session.cookies.get({ name: cookieName })

      let value: string | null = null

      if (cookies.length > 0) {
        value = cookies[0].value
      } else if (name === AUTH_COOKIE_NAME) {
        value = this.store.get(AUTH_STORE_TOKEN_KEY) || null
      } else if (name === USER_DATA_COOKIE_NAME) {
        value = this.store.get(AUTH_STORE_USER_KEY) || null
      }

      // Cache the result
      this.cookieCache.set(cacheKey, { value, timestamp: Date.now() })
      return value
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

      // Update store for auth cookies
      if (originalName === AUTH_COOKIE_NAME) {
        this.store.set(AUTH_STORE_TOKEN_KEY, options.value)
      } else if (originalName === USER_DATA_COOKIE_NAME) {
        this.store.set(AUTH_STORE_USER_KEY, options.value)
      }

      // Invalidate cache for this cookie
      this.invalidateCache(originalName)

      // Use debounced flush for auth cookies to reduce I/O
      if ([AUTH_COOKIE_NAME, USER_DATA_COOKIE_NAME].includes(originalName)) {
        this.debouncedFlush()
      }

      return true
    } catch (error) {
      console.error('Failed to set cookie:', error)
      return false
    }
  }

  async removeCookie(name: string): Promise<boolean> {
    try {
      const urls = [this.insecureUrl, this.secureUrl]
      const cookieNames = [name, this.getSecureCookieName(name)]

      // Batch cookie removal operations
      const removePromises = urls.flatMap((url) =>
        cookieNames.map((cookieName) =>
          this.session.cookies.remove(url, cookieName).catch(() => {})
        )
      )

      await Promise.all(removePromises)

      // Invalidate cache
      this.invalidateCache(name)

      // Use debounced flush
      this.debouncedFlush()
      return true
    } catch (error) {
      console.error('Failed to remove cookie:', error)
      return false
    }
  }

  async clearAuthCookies(): Promise<boolean> {
    try {
      const authCookies = [AUTH_COOKIE_NAME, USER_DATA_COOKIE_NAME]

      // Batch removal operations
      const removePromises = authCookies.map((cookieName) => this.removeCookie(cookieName))
      await Promise.all(removePromises)

      // Clear store data
      this.store.delete(AUTH_STORE_TOKEN_KEY)
      this.store.delete(AUTH_STORE_USER_KEY)

      // Clear cache for auth cookies
      authCookies.forEach((cookieName) => this.invalidateCache(cookieName))

      // Final flush (will be debounced)
      this.debouncedFlush()
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

  // Cache management methods
  clearCache(): void {
    this.cookieCache.clear()
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cookieCache.size,
      keys: Array.from(this.cookieCache.keys())
    }
  }

  // Force immediate flush (bypass debouncing)
  async forceFlush(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
      this.flushTimeout = null
    }

    try {
      await this.session.cookies.flushStore()
    } catch (error) {
      console.error('Failed to force flush cookie store:', error)
    }
  }

  // Cleanup method for memory management
  cleanup(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
      this.flushTimeout = null
    }
    this.clearCache()
  }
}
