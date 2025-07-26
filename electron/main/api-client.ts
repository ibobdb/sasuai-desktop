import { AxiosInstance } from 'axios'
import axios from 'axios'
import { persistentSession, store } from './index'
import { getDeviceInfo } from './device-info'
import { CookieService } from './services/cookie-service'

const COOKIE_DOMAIN = 'sasuai.blastify.tech'

class ApiClient {
  private instance: AxiosInstance
  private deviceInfo: any = null
  private cookieService: CookieService
  private sessionMetadata: any = null

  constructor() {
    this.cookieService = new CookieService(persistentSession)
    this.instance = axios.create({
      timeout: 30000
    })

    this.initializeDeviceInfoSync()
    this.setupInterceptors()
    this.loadCookiesFromStore()
  }

  private async loadCookiesFromStore(): Promise<void> {
    try {
      const storedCookies = (store.get('auth_cookies') as any[]) || []

      for (const cookie of storedCookies) {
        await this.cookieService.setCookie({
          name: cookie.name,
          value: cookie.value,
          url: `https://${COOKIE_DOMAIN}`,
          domain: COOKIE_DOMAIN,
          path: '/',
          httpOnly: cookie.httpOnly || true,
          secure: cookie.secure || true,
          sameSite: cookie.sameSite || 'lax',
          expirationDate: cookie.expirationDate
        })
      }
    } catch {
      // Silent fail - AuthStore will handle validation
    }
  }

  private async initializeDeviceInfoSync() {
    if (!this.deviceInfo) {
      try {
        this.deviceInfo = await getDeviceInfo()
        this.sessionMetadata = {
          'X-Device-ID': this.deviceInfo.deviceId,
          'X-Platform': this.deviceInfo.platform,
          'X-App-Version': this.deviceInfo.version
        }
      } catch {
        // Silent fail
      }
    }
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          if (!this.deviceInfo || !this.sessionMetadata) {
            await this.initializeDeviceInfoSync()
          }

          config.headers = config.headers || {}
          config.headers['User-Agent'] = this.deviceInfo.userAgent
          Object.assign(config.headers, this.sessionMetadata)

          // Add authentication cookies to request header
          const allCookies = await persistentSession.cookies.get({ domain: COOKIE_DOMAIN })
          const authCookies = allCookies.filter((cookie) => cookie.name.includes('better-auth'))

          if (authCookies.length > 0) {
            const cookieHeader = authCookies
              .map((cookie) => `${cookie.name}=${cookie.value}`)
              .join('; ')
            config.headers['Cookie'] = cookieHeader
          }

          return config
        } catch {
          return config
        }
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      async (response) => {
        if (response.headers && response.headers['set-cookie']) {
          for (const cookieString of response.headers['set-cookie']) {
            await this.saveCookieFromHeader(cookieString)
          }
        }
        return response
      },
      async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          await this.clearAuthData()
        }
        return Promise.reject(error)
      }
    )
  }

  private async clearAuthData(): Promise<void> {
    try {
      await this.cookieService.clearAuthCookies()
      store.delete('auth_cookies')
    } catch {
      // Silent fail
    }
  }

  private async saveCookieFromHeader(cookieString: string): Promise<void> {
    try {
      const [nameValue] = cookieString.split(';')
      const separatorIndex = nameValue.indexOf('=')

      if (separatorIndex === -1) return

      const name = nameValue.substring(0, separatorIndex).trim()
      const value = nameValue.substring(separatorIndex + 1).trim()

      if (!name || !value || !name.includes('better-auth')) return

      // Set expiration date for persistence (7 days for session_token, 5 minutes for session_data)
      const isSessionToken = name.includes('session_token')
      const expirationDate = Math.floor(Date.now() / 1000) + (isSessionToken ? 604800 : 300)

      const cookieOptions = {
        name,
        value,
        url: `https://${COOKIE_DOMAIN}`,
        domain: COOKIE_DOMAIN,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        expirationDate: expirationDate
      }

      // Save to session for immediate use
      const success = await this.cookieService.setCookie(cookieOptions)

      if (success) {
        const currentStored = (store.get('auth_cookies') as any[]) || []
        const existingIndex = currentStored.findIndex((c) => c.name === name)

        const storeCookie = {
          name,
          value,
          expirationDate,
          secure: true,
          httpOnly: true,
          sameSite: 'lax'
        }

        if (existingIndex >= 0) {
          currentStored[existingIndex] = storeCookie
        } else {
          currentStored.push(storeCookie)
        }

        store.set('auth_cookies', currentStored)
      }
    } catch {
      // Silent fail
    }
  }

  getInstance(): AxiosInstance {
    return this.instance
  }
}

let apiClientInstance: ApiClient | null = null

export const createApiClient = () => {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient()
  }
  return apiClientInstance.getInstance()
}
