import { ipcMain } from 'electron'
import { PrinterService } from '../services/printer-service'

interface PrinterSettings {
  printerName: string
  paperSize: '58mm' | '80mm' | '78mm' | '76mm' | '57mm' | '44mm'
  margin: string
  copies: number
  timeOutPerLine: number
  fontSize: number
  fontFamily: string
  lineHeight: number
  enableBold: boolean
  autocut: boolean
  cashdrawer: boolean
  encoding: string
}

class PrinterHandlerManager {
  private static instance: PrinterHandlerManager
  private printerService: PrinterService

  private constructor() {
    this.printerService = new PrinterService()
  }

  static getInstance(): PrinterHandlerManager {
    if (!PrinterHandlerManager.instance) {
      PrinterHandlerManager.instance = new PrinterHandlerManager()
    }
    return PrinterHandlerManager.instance
  }

  setupHandlers(): void {
    ipcMain.handle('printer:get-printers', async () => {
      try {
        const printers = await this.printerService.getAvailablePrinters()
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
        const settings = this.printerService.getSettings()
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
        this.printerService.saveSettings(settings)
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
        const result = await this.printerService.testPrint()
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
        const result = await this.printerService.printHTML(htmlContent)
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
}

export function setupPrinterHandlers(): void {
  PrinterHandlerManager.getInstance().setupHandlers()
}
