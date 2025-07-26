import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useNetworkHealth, NetworkStatus } from '@/hooks/use-network-health'
import { cn } from '@/lib/utils'
import { memo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface NetworkHealthIndicatorProps {
  className?: string
  showLabel?: boolean
  showLatency?: boolean
  showRefresh?: boolean
  checkInterval?: number
}

const NetworkHealthIndicator = memo(function NetworkHealthIndicator({
  className,
  showLabel = false,
  showLatency = false,
  showRefresh = false,
  checkInterval = 30000
}: NetworkHealthIndicatorProps) {
  const { t } = useTranslation('common')
  const networkHealth = useNetworkHealth({
    checkInterval
  })

  const previousStatusRef = useRef<NetworkStatus>('online')

  useEffect(() => {
    if (networkHealth.status !== 'checking') {
      previousStatusRef.current = networkHealth.status
    }
  }, [networkHealth.status])

  const getStatusConfig = (status: NetworkStatus) => {
    switch (status) {
      case 'online':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          label: t('networkHealth.status.online'),
          description: t('networkHealth.description.online')
        }
      case 'offline':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          label: t('networkHealth.status.offline'),
          description: t('networkHealth.description.offline')
        }
      case 'checking':
        return getStatusConfig(previousStatusRef.current)
      case 'error':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          label: t('networkHealth.status.error'),
          description: t('networkHealth.description.error')
        }
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          label: t('networkHealth.status.unknown'),
          description: t('networkHealth.description.unknown')
        }
    }
  }

  const config = getStatusConfig(networkHealth.status)

  const formatLatency = (latency?: number) => {
    if (!latency) return ''
    if (latency < 100) return `${latency}ms`
    if (latency < 1000) return `${Math.round(latency)}ms`
    return `${(latency / 1000).toFixed(1)}s`
  }

  const getTooltipContent = () => {
    const parts = [
      `${t('networkHealth.tooltip.status')}: ${config.label}`,
      networkHealth.lastChecked &&
        `${t('networkHealth.tooltip.lastChecked')}: ${networkHealth.lastChecked.toLocaleTimeString()}`,
      showLatency &&
        networkHealth.latency &&
        `${t('networkHealth.tooltip.latency')}: ${formatLatency(networkHealth.latency)}`,
      networkHealth.error && `Error: ${networkHealth.error}`
    ].filter(Boolean)

    return parts.join('\n')
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-2', className)}>
            {/* Simple dot indicator */}
            <div className="relative">
              <div className={cn('w-3 h-3 rounded-full', config.color)} />

              {networkHealth.status === 'online' && (
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500/30 animate-ping" />
              )}
            </div>

            {showLabel && (
              <div className="flex flex-col">
                <span className={cn('text-sm font-medium', config.textColor)}>{config.label}</span>
                {showLatency && networkHealth.latency && (
                  <span className="text-xs text-muted-foreground">
                    {formatLatency(networkHealth.latency)}
                  </span>
                )}
              </div>
            )}

            {showRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={networkHealth.refresh}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="whitespace-pre-line">{getTooltipContent()}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

export default NetworkHealthIndicator
