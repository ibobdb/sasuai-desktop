import axios from 'axios'
import { COOKIE_DOMAIN, AUTH_COOKIE_NAME, AUTH_STORE_TOKEN_KEY } from './constants'
import { persistentSession } from './index'
import { getTypedStore } from './store'
import { getDeviceInfo, getSessionMetadata } from './device-info'

// Create axios instance with default config
export const createApiClient = () => {
  const instance = axios.create({
    timeout: 60000,
    withCredentials: true
  })

  // Request interceptor to add auth token and device info
  instance.interceptors.request.use(async (config) => {
    try {
      // Get device info for user agent and headers
      const deviceInfo = await getDeviceInfo()
      const sessionMetadata = await getSessionMetadata()

      // Set custom user agent
      config.headers = config.headers || {}
      config.headers['User-Agent'] = deviceInfo.userAgent

      // Add session metadata headers
      Object.assign(config.headers, sessionMetadata)

      // Try to get auth token (first from cookies, then from store)
      let authToken: string | null = null
      const cookies = await persistentSession.cookies.get({
        name: AUTH_COOKIE_NAME
      })

      if (cookies.length > 0) {
        authToken = cookies[0].value
      } else {
        // Fallback to electron-store
        const typedStore = getTypedStore()
        authToken = typedStore.get(AUTH_STORE_TOKEN_KEY) || null
        if (authToken) {
          // Restore the cookie from the store value
          await persistentSession.cookies
            .set({
              url: `https://${COOKIE_DOMAIN}`,
              name: AUTH_COOKIE_NAME,
              value: authToken,
              secure: true,
              httpOnly: true,
              sameSite: 'strict',
              domain: COOKIE_DOMAIN
            })
            .catch(() => {})
        }
      }

      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`
      }

      return config
    } catch (error) {
      console.error('Error during API request:', error)
      return config
    }
  })

  return instance
}
