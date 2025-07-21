import { ipcMain } from 'electron'
import { PrinterService } from '../services/printer-service'
import { PrinterSettings } from '../types/printer'

let printerService: PrinterService | null = null

function getPrinterService(): PrinterService {
  if (!printerService) {
    printerService = new PrinterService()
  }
  return printerService
}

export function setupPrinterHandlers() {
  // Get available printers
  ipcMain.handle('printer:get-printers', async () => {
    try {
      const service = getPrinterService()
      const printers = await service.getAvailablePrinters()
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

  // Get printer settings
  ipcMain.handle('printer:get-settings', () => {
    try {
      const service = getPrinterService()
      const settings = service.getSettings()
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

  // Save printer settings
  ipcMain.handle('printer:save-settings', (_event, settings: Partial<PrinterSettings>) => {
    try {
      const service = getPrinterService()
      service.saveSettings(settings)
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

  // Test print
  ipcMain.handle('printer:test-print', async () => {
    try {
      const service = getPrinterService()
      await service.testPrint()
      return { success: true }
    } catch (error) {
      console.error('Test print failed:', error)
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Test print failed'
        }
      }
    }
  })

  // Print HTML content
  ipcMain.handle('printer:print-html', async (_event, htmlContent: string) => {
    try {
      const service = getPrinterService()
      await service.printHTML(htmlContent)
      return { success: true }
    } catch (error) {
      console.error('Print HTML failed:', error)
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Print HTML failed'
        }
      }
    }
  })
}
