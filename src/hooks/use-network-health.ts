import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { API_ENDPOINTS } from '@/config/api'

export type NetworkStatus = 'online' | 'offline' | 'checking' | 'error'

interface NetworkHealthState {
  status: NetworkStatus
  lastChecked?: Date
  latency?: number
  error?: string
}

interface UseNetworkHealthOptions {
  checkInterval?: number
  retryCount?: number
  apiEndpoint?: string
}

export function useNetworkHealth(options: UseNetworkHealthOptions = {}) {
  const { checkInterval = 30000, retryCount = 3, apiEndpoint = API_ENDPOINTS.HEALTH } = options

  const { t } = useTranslation('common')

  const [health, setHealth] = useState<NetworkHealthState>({
    status: 'checking'
  })

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const isNetworkError = useCallback((error: Error | null): boolean => {
    if (!error) return false

    const errorMessage = error.message.toLowerCase()
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('offline') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('net::err') ||
      !navigator.onLine
    )
  }, [])

  const checkNetworkHealth = useCallback(async () => {
    try {
      setHealth((prev) => (prev.status !== 'checking' ? { ...prev, status: 'checking' } : prev))
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= retryCount; attempt++) {
        const attemptStartTime = Date.now()

        try {
          await window.api.request(apiEndpoint, {
            method: 'GET'
          })

          const latency = Date.now() - attemptStartTime

          setHealth({
            status: 'online',
            lastChecked: new Date(),
            latency,
            error: undefined
          })
          return
        } catch (error) {
          lastError = error as Error

          if (isNetworkError(error as Error)) {
            setHealth({
              status: 'offline',
              lastChecked: new Date(),
              error: t('networkHealth.errors.noInternet')
            })
            return
          }

          if (attempt < retryCount) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          }
        }
      }

      if (isNetworkError(lastError)) {
        setHealth({
          status: 'offline',
          lastChecked: new Date(),
          error: t('networkHealth.errors.noInternet')
        })
      } else {
        setHealth({
          status: 'error',
          lastChecked: new Date(),
          error: lastError?.message || t('networkHealth.errors.serverError')
        })
      }
    } catch (error) {
      if (isNetworkError(error as Error)) {
        setHealth({
          status: 'offline',
          lastChecked: new Date(),
          error: t('networkHealth.errors.noInternet')
        })
      } else {
        setHealth({
          status: 'error',
          lastChecked: new Date(),
          error: (error as Error).message
        })
      }
    }
  }, [apiEndpoint, retryCount, isNetworkError, t])

  const refresh = useCallback(() => {
    checkNetworkHealth()
  }, [checkNetworkHealth])

  useEffect(() => {
    checkNetworkHealth()

    let intervalId: NodeJS.Timeout | undefined
    if (checkInterval > 0) {
      intervalId = setInterval(checkNetworkHealth, checkInterval)
      intervalRef.current = intervalId
    }

    const handleOnline = () => checkNetworkHealth()
    const handleOffline = () => {
      setHealth((prev) => ({
        ...prev,
        status: 'offline',
        lastChecked: new Date(),
        error: t('networkHealth.errors.browserOffline')
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalRef.current = undefined
      }
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkNetworkHealth, checkInterval, t])

  return useMemo(
    () => ({
      ...health,
      refresh,
      isOnline: health.status === 'online',
      isOffline: health.status === 'offline',
      isChecking: health.status === 'checking',
      hasError: health.status === 'error'
    }),
    [health, refresh]
  )
}
