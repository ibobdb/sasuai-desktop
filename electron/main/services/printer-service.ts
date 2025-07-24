import { ipcMain } from 'electron'
import { PrinterManager } from './printer/printer-manager'

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

export class PrinterService {
  private static instance: PrinterService
  private printerManager = new PrinterManager()

  private constructor() {
    this.setupIpcHandlers()
  }

  static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService()
    }
    return PrinterService.instance
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('printer:get-printers', async () => {
      try {
        const printers = await this.getAvailablePrinters()
        return { success: true, data: printers }
      } catch (error) {
        console.error('Failed to get printers:', error)
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Failed to get printers'
          }
        }
      }
    })

    ipcMain.handle('printer:get-settings', () => {
      try {
        const settings = this.getSettings()
        return { success: true, data: settings }
      } catch (error) {
        console.error('Failed to get printer settings:', error)
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Failed to get printer settings'
          }
        }
      }
    })

    ipcMain.handle('printer:save-settings', (_event, settings: Partial<PrinterSettings>) => {
      try {
        this.saveSettings(settings)
        return { success: true }
      } catch (error) {
        console.error('Failed to save printer settings:', error)
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Failed to save printer settings'
          }
        }
      }
    })

    ipcMain.handle('printer:test-print', async () => {
      try {
        const result = await this.testPrint()
        return { success: true, data: result }
      } catch (error) {
        console.error('Failed to test print:', error)
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Failed to test print'
          }
        }
      }
    })

    ipcMain.handle('printer:print-html', async (_event, htmlContent: string) => {
      try {
        const result = await this.printHTML(htmlContent)
        return { success: true, data: result }
      } catch (error) {
        console.error('Failed to print HTML:', error)
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Failed to print HTML content'
          }
        }
      }
    })
  }

  getSettings(): PrinterSettings {
    return this.printerManager.getSettings()
  }

  saveSettings(settings: Partial<PrinterSettings>): void {
    this.printerManager.saveSettings(settings)
  }

  async getAvailablePrinters(): Promise<string[]> {
    return this.printerManager.getAvailablePrinters()
  }

  async testPrint(): Promise<boolean> {
    return this.printerManager.testPrint()
  }

  async printHTML(htmlContent: string): Promise<boolean> {
    return this.printerManager.print(htmlContent)
  }
}

// Export setup function for easy initialization
export function setupPrinterService(): void {
  PrinterService.getInstance()
}
