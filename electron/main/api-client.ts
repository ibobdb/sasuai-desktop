import axios, { AxiosInstance } from 'axios'
import { COOKIE_DOMAIN, AUTH_COOKIE_NAME, AUTH_STORE_TOKEN_KEY } from './constants'
import { persistentSession } from './index'
import { getTypedStore } from './index'
import { getDeviceInfo, getSessionMetadata } from './device-info'

class ApiClient {
  private instance: AxiosInstance
  private deviceInfo: any = null
  private sessionMetadata: any = null
  private authToken: string | null = null
  private lastAuthCheck: number = 0
  private readonly AUTH_CACHE_DURATION = 30000 // 30 seconds

  constructor() {
    this.instance = axios.create({
      timeout: 60000,
      withCredentials: true
    })

    this.initializeDeviceInfoSync()
    this.setupInterceptors()
  }

  private async initializeDeviceInfoSync() {
    if (!this.deviceInfo || !this.sessionMetadata) {
      try {
        this.deviceInfo = await getDeviceInfo()
        this.sessionMetadata = await getSessionMetadata()
      } catch (error) {
        console.error('Failed to initialize device info:', error)
        this.deviceInfo = { userAgent: 'Unknown' }
        this.sessionMetadata = {}
      }
    }
  }

  private async getAuthToken(): Promise<string | null> {
    const now = Date.now()

    if (this.authToken && now - this.lastAuthCheck < this.AUTH_CACHE_DURATION) {
      return this.authToken
    }

    try {
      const cookies = await persistentSession.cookies.get({ name: AUTH_COOKIE_NAME })

      if (cookies.length > 0) {
        this.authToken = cookies[0].value
        this.lastAuthCheck = now
        return this.authToken
      }

      const typedStore = getTypedStore()
      const storeToken = typedStore.get(AUTH_STORE_TOKEN_KEY)

      if (storeToken) {
        await this.restoreCookieFromStore(storeToken)
        this.authToken = storeToken
        this.lastAuthCheck = now
        return this.authToken
      }

      this.authToken = null
      this.lastAuthCheck = now
      return null
    } catch (error) {
      console.error('Failed to get auth token:', error)
      this.authToken = null
      this.lastAuthCheck = now
      return null
    }
  }

  private async restoreCookieFromStore(token: string) {
    try {
      await persistentSession.cookies.set({
        url: `https://${COOKIE_DOMAIN}`,
        name: AUTH_COOKIE_NAME,
        value: token,
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        domain: COOKIE_DOMAIN
      })
    } catch (error) {
      console.error('Failed to restore cookie from store:', error)
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

          const authToken = await this.getAuthToken()
          if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`
          }

          return config
        } catch (error) {
          console.error('Request interceptor error:', error)
          return config
        }
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          await this.clearAuthData()
        }
        return Promise.reject(error)
      }
    )
  }

  private async clearAuthData() {
    try {
      this.authToken = null
      this.lastAuthCheck = 0

      const typedStore = getTypedStore()
      typedStore.delete(AUTH_STORE_TOKEN_KEY)

      await persistentSession.cookies.remove(`https://${COOKIE_DOMAIN}`, AUTH_COOKIE_NAME)
      await persistentSession.cookies.remove(`http://${COOKIE_DOMAIN}`, AUTH_COOKIE_NAME)
      await persistentSession.cookies.flushStore()
    } catch (error) {
      console.error('Failed to clear auth data:', error)
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
