import { PrinterConfig } from './printer/printer-config'
import { PrintEngine } from './printer/print-engine'
import { ReceiptBuilder, PrintReceipt } from './printer/receipt-builder'
import { PrinterSettings } from '../types/printer'

export type { PrintReceipt } from './printer/receipt-builder'

export class PrinterService {
  private config = new PrinterConfig()
  private printEngine = new PrintEngine()
  private receiptBuilder = new ReceiptBuilder()

  getSettings(): PrinterSettings {
    return this.config.getSettings()
  }

  saveSettings(settings: Partial<PrinterSettings>): void {
    this.config.saveSettings(settings)
  }

  async getAvailablePrinters(): Promise<string[]> {
    return this.printEngine.getAvailablePrinters()
  }

  async testPrint(): Promise<boolean> {
    return this.printEngine.testPrint()
  }

  async printReceipt(receipt: PrintReceipt): Promise<boolean> {
    const receiptContent = this.receiptBuilder.buildReceiptContent(receipt)
    return this.printEngine.print(receiptContent)
  }
}
