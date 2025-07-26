import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface PrinterStatusResult {
  isOnline: boolean
  message: string
}

interface CachedStatus {
  status: PrinterStatusResult
  timestamp: number
}

export class PrinterStatusChecker {
  private readonly COMMAND_TIMEOUT = 3000
  private readonly STATUS_CACHE_TTL = 15000 // 15 seconds cache
  private readonly DEFAULT_PRINTER_CACHE_TTL = 30000 // 30 seconds for default printer
  private readonly FAST_PATH_TTL = 30000 // 30 seconds for fast path after successful print

  private statusCache = new Map<string, CachedStatus>()
  private defaultPrinterCache: { name: string | null; timestamp: number } | null = null
  private lastPrintSuccess = new Map<string, number>() // Track successful prints

  async getDefaultPrinterName(): Promise<string | null> {
    const now = Date.now()

    // Return cached result if still valid
    if (
      this.defaultPrinterCache &&
      now - this.defaultPrinterCache.timestamp < this.DEFAULT_PRINTER_CACHE_TTL
    ) {
      return this.defaultPrinterCache.name
    }

    try {
      const command = `wmic printer where "Default=true" get Name /value`
      const { stdout } = await execAsync(command, {
        timeout: this.COMMAND_TIMEOUT,
        encoding: 'utf8'
      })

      if (!stdout?.trim()) {
        this.defaultPrinterCache = { name: null, timestamp: now }
        return null
      }

      const nameMatch = stdout.match(/Name=(.+)/i)
      const defaultPrinterName = nameMatch && nameMatch[1]?.trim() ? nameMatch[1].trim() : null

      // Cache the result
      this.defaultPrinterCache = { name: defaultPrinterName, timestamp: now }
      return defaultPrinterName
    } catch {
      this.defaultPrinterCache = { name: null, timestamp: now }
      return null
    }
  }

  async checkPrinterStatus(printerName: string, skipCache = false): Promise<PrinterStatusResult> {
    const trimmedName = printerName?.trim()

    if (!trimmedName) {
      return {
        isOnline: false,
        message: 'Printer name is required'
      }
    }

    const now = Date.now()
    const cacheKey = trimmedName.toLowerCase()

    // Fast path: If printer had successful print recently, assume it's online
    if (!skipCache) {
      const lastSuccess = this.lastPrintSuccess.get(cacheKey)
      if (lastSuccess && now - lastSuccess < this.FAST_PATH_TTL) {
        return {
          isOnline: true,
          message: 'Printer assumed online based on recent successful print'
        }
      }

      // Check cache first
      const cached = this.statusCache.get(cacheKey)
      if (cached && now - cached.timestamp < this.STATUS_CACHE_TTL) {
        return cached.status
      }
    }

    try {
      const command = `wmic printer where "name='${trimmedName.replace(/'/g, "''")}'" get WorkOffline /value`

      const { stdout, stderr } = await execAsync(command, {
        timeout: this.COMMAND_TIMEOUT,
        encoding: 'utf8'
      })

      if (stderr && stderr.includes('Invalid query')) {
        return {
          isOnline: false,
          message: `Printer '${trimmedName}' not found`
        }
      }

      if (!stdout?.trim()) {
        return {
          isOnline: false,
          message: `Printer '${trimmedName}' not found`
        }
      }

      const workOfflineMatch = stdout.match(/WorkOffline=(\w+)/i)

      if (!workOfflineMatch) {
        return {
          isOnline: false,
          message: `Failed to parse printer status`
        }
      }

      const workOffline = workOfflineMatch[1].toLowerCase() === 'true'
      const isOnline = !workOffline

      const result: PrinterStatusResult = {
        isOnline,
        message: isOnline
          ? `Printer '${trimmedName}' is online and ready`
          : `Printer '${trimmedName}' is offline`
      }

      // Cache the result
      this.statusCache.set(cacheKey, {
        status: result,
        timestamp: now
      })

      return result
    } catch (error) {
      const errorResult: PrinterStatusResult = {
        isOnline: false,
        message: error instanceof Error ? error.message : 'Failed to check printer status'
      }

      // Cache error result with shorter TTL
      this.statusCache.set(cacheKey, {
        status: errorResult,
        timestamp: now - this.STATUS_CACHE_TTL + 5000 // 5 seconds TTL for errors
      })

      return errorResult
    }
  }

  /**
   * Mark a successful print for fast path optimization
   */
  markPrintSuccess(printerName: string): void {
    const cacheKey = printerName?.trim()?.toLowerCase()
    if (cacheKey) {
      this.lastPrintSuccess.set(cacheKey, Date.now())
    }
  }

  /**
   * Clear all caches (useful for debugging or settings changes)
   */
  clearCaches(): void {
    this.statusCache.clear()
    this.lastPrintSuccess.clear()
    this.defaultPrinterCache = null
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    statusCacheSize: number
    successCacheSize: number
    hasDefaultCache: boolean
  } {
    return {
      statusCacheSize: this.statusCache.size,
      successCacheSize: this.lastPrintSuccess.size,
      hasDefaultCache: this.defaultPrinterCache !== null
    }
  }
}
