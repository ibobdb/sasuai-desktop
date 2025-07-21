import { PrinterConfig } from './printer/printer-config'
import { PrintEngine } from './printer/print-engine'
import { PrinterSettings } from '../types/printer'

// Remove ReceiptBuilder import since we'll use HTML directly
// export type { PrintReceipt } from './printer/receipt-builder'

export class PrinterService {
  private config = new PrinterConfig()
  private printEngine = new PrintEngine()
  // Remove receiptBuilder since we'll use HTML directly
  // private receiptBuilder = new ReceiptBuilder()

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

  // Remove the old printReceipt method that used ReceiptBuilder
  // async printReceipt(receipt: PrintReceipt): Promise<boolean> {
  //   const receiptContent = this.receiptBuilder.buildReceiptContent(receipt)
  //   return this.printEngine.print(receiptContent)
  // }

  async printHTML(htmlContent: string): Promise<boolean> {
    return this.printEngine.print(htmlContent)
  }
}
