import { BrowserWindow } from 'electron'
import { PrinterSettings } from './printer-settings'

export interface PrintOptions {
  silent: boolean
  copies: number
  pageSize: {
    width: number
    height: number
  }
  margins: {
    marginType: 'default' | 'none' | 'printableArea' | 'custom'
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  printBackground: boolean
  color: boolean
  landscape: boolean
  scaleFactor: number
  deviceName?: string
  dpi?: {
    horizontal: number
    vertical: number
  }
}

export class PrintEngine {
  private readonly PAPER_WIDTHS: Record<string, number> = {
    '44mm': 44,
    '57mm': 57,
    '58mm': 58,
    '76mm': 76,
    '78mm': 78,
    '80mm': 80
  }

  private readonly PRINT_DELAY = 2000
  private readonly CLEANUP_DELAY = 3000

  private isPrinting = false

  getPaperWidthMm(paperSize: string): number {
    return this.PAPER_WIDTHS[paperSize] || 58
  }

  private calculateOptimalHeight(htmlContent: string): number {
    const itemMatches = htmlContent.match(/<div[^>]*class="item"[^>]*>/g) || []
    const itemCount = itemMatches.length

    const baseHeight = 200000
    const perItemHeight = 15000
    const calculatedHeight = baseHeight + itemCount * perItemHeight

    return Math.min(Math.max(calculatedHeight, 300000), 800000)
  }

  private parseMarginSettings(marginString: string): {
    marginType: 'default' | 'none' | 'printableArea' | 'custom'
    top?: number
    bottom?: number
    left?: number
    right?: number
  } {
    if (!marginString?.trim()) {
      return { marginType: 'none' }
    }

    const margins = marginString.trim().split(/\s+/)

    switch (margins.length) {
      case 1: {
        const val = Math.max(0, parseFloat(margins[0]) || 0)
        return { marginType: 'custom', top: val, bottom: val, left: val, right: val }
      }
      case 2: {
        const vertical = Math.max(0, parseFloat(margins[0]) || 0)
        const horizontal = Math.max(0, parseFloat(margins[1]) || 0)
        return {
          marginType: 'custom',
          top: vertical,
          bottom: vertical,
          left: horizontal,
          right: horizontal
        }
      }
      case 4: {
        const [top, right, bottom, left] = margins.map((m) => Math.max(0, parseFloat(m) || 0))
        return { marginType: 'custom', top, right, bottom, left }
      }
      default:
        return { marginType: 'none' }
    }
  }

  private buildPrintOptions(settings: PrinterSettings, htmlContent?: string): PrintOptions {
    const paperWidthMicrons = this.getPaperWidthMm(settings.paperSize) * 1000
    const optimalHeight = htmlContent ? this.calculateOptimalHeight(htmlContent) : 600000

    const printOptions: PrintOptions = {
      silent: true,
      copies: settings.copies || 1,
      pageSize: {
        width: paperWidthMicrons,
        height: optimalHeight
      },
      margins: this.parseMarginSettings(settings.margin),
      printBackground: true,
      color: false,
      landscape: false,
      scaleFactor: 100,
      dpi: {
        horizontal: 203,
        vertical: 203
      }
    }

    if (settings.printerName?.trim()) {
      printOptions.deviceName = settings.printerName.trim()
    }

    return printOptions
  }

  async print(htmlContent: string, settings: PrinterSettings): Promise<boolean> {
    if (this.isPrinting) {
      throw new Error('Another print operation is in progress')
    }

    this.isPrinting = true

    return new Promise((resolve, reject) => {
      const paperWidthPx = this.getPaperWidthMm(settings.paperSize) * 3.7795

      const printWindow = new BrowserWindow({
        show: false,
        width: Math.max(300, Math.ceil(paperWidthPx)),
        height: 2000,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: false,
          backgroundThrottling: false,
          offscreen: false
        },
        skipTaskbar: true,
        focusable: false
      })

      const cleanup = (success: boolean, error?: string) => {
        this.isPrinting = false
        printWindow.close()
        if (success) {
          resolve(true)
        } else {
          reject(new Error(error || 'Print failed'))
        }
      }

      const loadTimeout = setTimeout(() => {
        cleanup(false, 'Failed to load print content: timeout')
      }, 20000)

      printWindow.webContents.once('did-finish-load', () => {
        clearTimeout(loadTimeout)

        setTimeout(() => {
          const printOptions = this.buildPrintOptions(settings, htmlContent)

          printWindow.webContents.print(printOptions, (success, failureReason) => {
            if (success) {
              setTimeout(() => cleanup(true), this.CLEANUP_DELAY)
            } else {
              cleanup(false, `Print failed: ${failureReason || 'Unknown error'}`)
            }
          })
        }, this.PRINT_DELAY)
      })

      printWindow.webContents.once('did-fail-load', (_event, _errorCode, errorDescription) => {
        clearTimeout(loadTimeout)
        cleanup(false, `Failed to load content: ${errorDescription}`)
      })

      printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent))
    })
  }

  getIsPrinting(): boolean {
    return this.isPrinting
  }
}
