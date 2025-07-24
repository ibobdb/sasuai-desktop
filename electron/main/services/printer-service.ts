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
