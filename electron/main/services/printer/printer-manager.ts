import { BrowserWindow } from 'electron'
import { getTypedStore } from '../../index'
import { generateTestPrintHTML, TestPrintData } from './test-print-template'

interface PrinterSettings {
  printerName: string
  paperSize: '58mm' | '80mm' | '78mm' | '76mm' | '57mm' | '44mm'
  margin: string
  copies: number
  fontSize: number
  fontFamily: string
  lineHeight: number
  enableBold: boolean
}

export class PrinterManager {
  private store = getTypedStore()
  private readonly PAPER_WIDTHS: Record<string, number> = {
    '44mm': 44,
    '57mm': 57,
    '58mm': 58,
    '76mm': 76,
    '78mm': 78,
    '80mm': 80
  }
  private isPrinting = false

  private getDefaultSettings(): PrinterSettings {
    return {
      printerName: '',
      paperSize: '58mm',
      margin: '0',
      copies: 1,
      fontSize: 12,
      fontFamily: 'Courier New',
      lineHeight: 1.2,
      enableBold: true
    }
  }

  // Settings management
  getSettings(): PrinterSettings {
    const settings = this.store.get('printer.settings')
    return settings ? { ...this.getDefaultSettings(), ...settings } : this.getDefaultSettings()
  }

  saveSettings(settings: Partial<PrinterSettings>): void {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    this.store.set('printer.settings', newSettings)
  }

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

  async getAvailablePrinters(): Promise<string[]> {
    try {
      const windows = BrowserWindow.getAllWindows()
      const targetWindow = windows[0] || this.createTempWindow()

      const printers = await targetWindow.webContents.getPrintersAsync()

      if (!windows[0]) {
        targetWindow.close()
      }

      return printers.map((printer) => printer.name)
    } catch (error) {
      console.error('Failed to get available printers:', error)
      return []
    }
  }

  private createTempWindow(): BrowserWindow {
    return new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
  }

  async print(htmlContent: string): Promise<boolean> {
    if (this.isPrinting) {
      throw new Error('Another print operation is in progress')
    }

    this.isPrinting = true
    const settings = this.getSettings()

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
      }, 10000)

      printWindow.webContents.once('did-finish-load', () => {
        clearTimeout(loadTimeout)

        setTimeout(() => {
          const printOptions: any = {
            silent: true,
            copies: settings.copies || 1,
            pageSize: {
              width: this.getPaperWidthMm(settings.paperSize) * 1000,
              height: 100000
            },
            margins: this.parseMarginSettings(settings.margin),
            printBackground: false,
            color: false,
            landscape: false,
            scaleFactor: 100
          }

          if (settings.printerName?.trim()) {
            printOptions.deviceName = settings.printerName.trim()
          }

          printWindow.webContents.print(printOptions, (success, failureReason) => {
            if (success) {
              setTimeout(() => cleanup(true), 2000)
            } else {
              cleanup(false, `Print failed: ${failureReason || 'Unknown error'}`)
            }
          })
        }, 1000)
      })

      printWindow.webContents.once('did-fail-load', (_event, _errorCode, errorDescription) => {
        clearTimeout(loadTimeout)
        cleanup(false, `Failed to load content: ${errorDescription}`)
      })

      printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent))
    })
  }

  private generateTestContent(title: string, additionalInfo: string = ''): string {
    const settings = this.getSettings()
    const currentTime = new Date()

    const testData: TestPrintData = {
      title,
      paperSize: settings.paperSize,
      paperWidth: this.getPaperWidthMm(settings.paperSize),
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      enableBold: settings.enableBold,
      margin: settings.margin,
      additionalInfo: additionalInfo || 'System Default',
      currentDate: currentTime.toLocaleString('id-ID')
    }

    return generateTestPrintHTML(testData)
  }

  async testPrint(): Promise<boolean> {
    const settings = this.getSettings()
    const testContent = this.generateTestContent(
      'TEST PRINT',
      `Printer: ${settings.printerName || 'System Default'}`
    )
    return this.print(testContent)
  }
}
