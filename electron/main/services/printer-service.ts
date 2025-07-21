import { BrowserWindow, webContents } from 'electron'
import { getTypedStore } from '../index'

export interface PrinterSettings {
  printerName: string
  paperSize: '58mm' | '80mm' | '78mm' | '76mm' | '57mm' | '44mm'
  margin: string
  copies: number
  timeOutPerLine: number
}

export interface PrintReceipt {
  id: string
  storeName: string
  address: string
  phone: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  payment: {
    method: string
    amount: number
    change: number
  }
  transactionDate: Date
  cashier: string
}

export class PrinterService {
  private store = getTypedStore()

  constructor() {
    console.log('PrinterService initialized')
  }

  private getDefaultSettings(): PrinterSettings {
    return {
      printerName: '',
      paperSize: '58mm',
      margin: '0 0 0 0',
      copies: 1,
      timeOutPerLine: 400
    }
  }

  getSettings(): PrinterSettings {
    const settings = this.store.get('printer.settings')
    return settings ? { ...this.getDefaultSettings(), ...settings } : this.getDefaultSettings()
  }

  saveSettings(settings: Partial<PrinterSettings>): void {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    this.store.set('printer.settings', newSettings)
  }

  async getAvailablePrinters(): Promise<string[]> {
    try {
      const windows = webContents.getAllWebContents()
      if (windows.length === 0) {
        return []
      }

      const printers = await windows[0].getPrintersAsync()
      return printers.map((printer) => printer.name)
    } catch (error) {
      console.error('Failed to get available printers:', error)
      return []
    }
  }

  private createPrintHtml(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Print</title>
    <style>
        @page {
            margin: 0;
            size: 58mm auto;
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            line-height: 1.2;
            margin: 0;
            padding: 5px;
            width: 58mm;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        * {
            font-weight: bold !important;
        }
        .center { text-align: center; font-weight: bold; }
        .right { text-align: right; font-weight: bold; }
        .bold { font-weight: 900 !important; }
        .large { font-size: 16px; font-weight: 900; }
        .small { font-size: 10px; font-weight: bold; }
        .separator { 
            border-top: 2px dashed #000; 
            margin: 5px 0; 
            font-weight: bold;
        }
        div, span {
            font-weight: bold !important;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`
  }

  async testPrint(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const settings = this.getSettings()

      // Create a hidden window for printing
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })

      const testHtml = this.createPrintHtml(`
        <div class="center bold large">TEST PRINT</div>
        <div class="separator"></div>
        <div class="center bold">Hello World!</div>
        <div class="center bold">Native Print Test</div>
        <div class="center bold small">${new Date().toLocaleString('id-ID')}</div>
        <div class="separator"></div>
        <div class="center bold">Success!</div>
      `)

      printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(testHtml))

      printWindow.webContents.once('did-finish-load', () => {
        const printOptions = {
          silent: true,
          printBackground: false,
          deviceName: settings.printerName || undefined,
          copies: 1,
          pageSize: {
            width: this.mmToMicrons(58),
            height: this.mmToMicrons(100) // Auto height
          },
          margins: {
            marginType: 'none' as const
          }
        }

        console.log('Native print options:', printOptions)

        printWindow.webContents.print(printOptions, (success, failureReason) => {
          console.log('Native print result:', { success, failureReason })

          printWindow.close()

          if (success) {
            console.log('Native test print completed successfully')
            resolve(true)
          } else {
            console.error('Native print failed:', failureReason)
            reject(new Error(`Native print failed: ${failureReason}`))
          }
        })
      })
    })
  }

  async printReceipt(receipt: PrintReceipt): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const settings = this.getSettings()

      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })

      const receiptHtml = this.createPrintHtml(`
        <div class="center bold large">${receipt.storeName}</div>
        <div class="center bold small">${receipt.address}</div>
        <div class="center bold small">${receipt.phone}</div>
        <div class="separator"></div>
        
        <div class="bold">Receipt: ${receipt.id}</div>
        <div class="bold">Date: ${receipt.transactionDate.toLocaleDateString('id-ID')}</div>
        <div class="bold">Cashier: ${receipt.cashier}</div>
        <div class="separator"></div>
        
        ${receipt.items
          .map(
            (item) => `
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span class="bold">${item.name}</span>
            <span class="bold">${this.formatCurrency(item.total)}</span>
          </div>
          <div style="margin-left: 10px; font-size: 10px; font-weight: bold;" class="bold small">
            ${item.quantity}x @ ${this.formatCurrency(item.price)}
          </div>
        `
          )
          .join('')}
        
        <div class="separator"></div>
        
        <div class="right bold">Subtotal: ${this.formatCurrency(receipt.subtotal)}</div>
        <div class="right bold">Tax: ${this.formatCurrency(receipt.tax)}</div>
        <div class="right bold large">TOTAL: ${this.formatCurrency(receipt.total)}</div>
        
        <div class="separator"></div>
        
        <div class="right bold">Payment: ${this.formatCurrency(receipt.payment.amount)}</div>
        <div class="right bold">Change: ${this.formatCurrency(receipt.payment.change)}</div>
        
        <div class="separator"></div>
        <div class="center bold">Thank you for your purchase!</div>
      `)

      printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(receiptHtml))

      printWindow.webContents.once('did-finish-load', () => {
        const printOptions = {
          silent: true,
          printBackground: false,
          deviceName: settings.printerName || undefined,
          copies: settings.copies,
          pageSize: {
            width: this.mmToMicrons(58),
            height: this.mmToMicrons(200) // Auto height
          },
          margins: {
            marginType: 'none' as const
          }
        }

        printWindow.webContents.print(printOptions, (success, failureReason) => {
          printWindow.close()

          if (success) {
            resolve(true)
          } else {
            reject(new Error(`Receipt print failed: ${failureReason}`))
          }
        })
      })
    })
  }

  private mmToMicrons(mm: number): number {
    return Math.round(mm * 1000)
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }
}
