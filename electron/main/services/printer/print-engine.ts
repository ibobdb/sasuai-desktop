import { BrowserWindow } from 'electron'
import { PrinterSettings } from './printer-settings'

export interface PrintOptions {
  silent: boolean
  copies: number
  pageSize: {
    width: number
    height: number
  }
  margins: any
  printBackground: boolean
  color: boolean
  landscape: boolean
  scaleFactor: number
  deviceName?: string
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

  private readonly PRINT_TIMEOUT = 10000
  private readonly PRINT_DELAY = 1000
  private readonly CLEANUP_DELAY = 2000

  private isPrinting = false

  getPaperWidthMm(paperSize: string): number {
    return this.PAPER_WIDTHS[paperSize] || 58
  }

  private parseMarginSettings(marginString: string): any {
    if (!marginString?.trim() || marginString === '0' || marginString === '0 0 0 0') {
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

  private buildPrintOptions(settings: PrinterSettings): PrintOptions {
    const printOptions: PrintOptions = {
      silent: true,
      copies: settings.copies || 1,
      pageSize: {
        width: this.getPaperWidthMm(settings.paperSize) * 1000,
        height: 0 // Auto height untuk thermal receipt
      },
      margins: this.parseMarginSettings(settings.margin),
      printBackground: true, // Enable background untuk thermal printer
      color: false,
      landscape: false,
      scaleFactor: 100
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
      const printWindow = new BrowserWindow({
        show: false,
        width: 400,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
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
        cleanup(false, 'Print timeout: Failed to load content')
      }, this.PRINT_TIMEOUT)

      printWindow.webContents.once('did-finish-load', () => {
        clearTimeout(loadTimeout)

        setTimeout(() => {
          const printOptions = this.buildPrintOptions(settings)

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
