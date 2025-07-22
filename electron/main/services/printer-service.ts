import { PrinterManager } from './printer/printer-manager'
import { PrinterSettings } from '../types/printer'

export class PrinterService {
  private printerManager = new PrinterManager()

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
