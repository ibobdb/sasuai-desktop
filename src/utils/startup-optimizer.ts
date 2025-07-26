import { loadAdditionalResources } from '@/i18n/i18n'

export class StartupOptimizer {
  private static instance: StartupOptimizer | null = null
  private isResourcesLoaded = false

  static getInstance(): StartupOptimizer {
    if (!StartupOptimizer.instance) {
      StartupOptimizer.instance = new StartupOptimizer()
    }
    return StartupOptimizer.instance
  }

  async preloadResources(): Promise<void> {
    if (this.isResourcesLoaded) return

    try {
      await loadAdditionalResources()
      setTimeout(() => {
        this.preloadModules()
      }, 2000)
      this.isResourcesLoaded = true
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to preload resources:', error)
      }
    }
  }

  private async preloadModules(): Promise<void> {
    try {
      const preloadPromises = [
        import('@/components/command-menu'),
        import('@/components/update-dialog')
      ]
      await Promise.allSettled(preloadPromises)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to preload modules:', error)
      }
    }
  }

  initialize(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.preloadResources(), 100)
      })
    } else {
      setTimeout(() => this.preloadResources(), 100)
    }
  }
}

if (import.meta.env.PROD) {
  StartupOptimizer.getInstance().initialize()
}

export const startupOptimizer = StartupOptimizer.getInstance()
