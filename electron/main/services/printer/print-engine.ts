import { BrowserWindow, webContents } from 'electron'
import { PrinterConfig } from './printer-config'

export class PrintEngine {
  private config = new PrinterConfig()

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

  async print(htmlContent: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const settings = this.config.getSettings()

      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })

      // Use the HTML content directly - it should already be a complete HTML document
      printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent))

      printWindow.webContents.once('did-finish-load', () => {
        const printOptions = {
          silent: true,
          printBackground: false,
          deviceName: settings.printerName || undefined,
          copies: settings.copies,
          pageSize: {
            width: this.config.mmToMicrons(this.config.getPaperWidthMm(settings.paperSize)),
            height: this.config.mmToMicrons(200)
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
            reject(new Error(`Print failed: ${failureReason}`))
          }
        })
      })
    })
  }

  async testPrint(): Promise<boolean> {
    const testContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Print</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.3;
            margin: 0;
            padding: 8px;
            text-align: center;
          }
          .header { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
          .separator { border-top: 1px dashed #000; margin: 8px 0; }
          .footer { font-size: 10px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">TEST PRINT</div>
        <div class="separator"></div>
        <div>Hello World!</div>
        <div>Printer Test</div>
        <div style="font-size: 10px;">${new Date().toLocaleString('id-ID')}</div>
        <div class="separator"></div>
        <div class="footer">Success!</div>
      </body>
      </html>
    `
    return this.print(testContent)
  }
}
