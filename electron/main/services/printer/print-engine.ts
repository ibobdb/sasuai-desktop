import { BrowserWindow, webContents } from 'electron'
import { PrinterConfig } from './printer-config'
import { PrintHtmlGenerator } from './print-html-generator'

export class PrintEngine {
  private config = new PrinterConfig()
  private htmlGenerator = new PrintHtmlGenerator()

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

      const fullHtml = this.htmlGenerator.generateHtml(htmlContent, settings)
      printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml))

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
    const testContent = this.htmlGenerator.generateTestContent()
    return this.print(testContent)
  }
}
