import { BrowserWindow, webContents } from 'electron'
import { getTypedStore } from '../../index'
import { PrinterSettings } from '../../types/printer'

export class PrinterManager {
  private store = getTypedStore()

  // Default printer settings
  private getDefaultSettings(): PrinterSettings {
    return {
      printerName: '',
      paperSize: '58mm',
      margin: '0 0 0 0',
      copies: 1,
      timeOutPerLine: 400,
      fontSize: 12,
      fontFamily: 'Courier New',
      lineHeight: 1.2,
      enableBold: true,
      autocut: false,
      cashdrawer: false,
      encoding: 'utf-8'
    }
  }

  // Settings management
  getSettings(): PrinterSettings {
    const settings = this.store.get('printer.settings')
    return settings ? { ...this.getDefaultSettings(), ...settings } : this.getDefaultSettings()
  }

  saveSettings(settings: Partial<PrinterSettings>): void {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    this.store.set('printer.settings', newSettings)
  }

  // Utility functions
  getPaperWidthMm(paperSize: string): number {
    const widthMap: Record<string, number> = {
      '44mm': 44,
      '57mm': 57,
      '58mm': 58,
      '76mm': 76,
      '78mm': 78,
      '80mm': 80
    }
    return widthMap[paperSize] || 58
  }

  private mmToMicrons(mm: number): number {
    return Math.round(mm * 1000)
  }

  private parseMarginString(marginString: string): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    const margins = marginString
      .trim()
      .split(/\s+/)
      .map((val) => parseFloat(val) || 0)

    if (margins.length === 1) {
      return { top: margins[0], right: margins[0], bottom: margins[0], left: margins[0] }
    } else if (margins.length === 2) {
      return { top: margins[0], right: margins[1], bottom: margins[0], left: margins[1] }
    } else if (margins.length === 3) {
      return { top: margins[0], right: margins[1], bottom: margins[2], left: margins[1] }
    } else if (margins.length >= 4) {
      return { top: margins[0], right: margins[1], bottom: margins[2], left: margins[3] }
    }

    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  // Printer discovery
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

  // Print functionality
  async print(htmlContent: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const settings = this.getSettings()

      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })

      printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent))

      printWindow.webContents.once('did-finish-load', () => {
        const marginValues = this.parseMarginString(settings.margin)

        const printOptions = {
          silent: true,
          printBackground: true,
          color: false,
          deviceName: settings.printerName || undefined,
          copies: settings.copies,
          dpi: { horizontal: 300, vertical: 300 },
          pageSize: {
            width: this.mmToMicrons(this.getPaperWidthMm(settings.paperSize)),
            height: this.mmToMicrons(200)
          },
          margins: {
            marginType: 'custom' as const,
            top: marginValues.top,
            bottom: marginValues.bottom,
            left: marginValues.left,
            right: marginValues.right
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
    const settings = this.getSettings()
    const paperWidth = this.getPaperWidthMm(settings.paperSize)

    const testContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Print</title>
        <style>
          @page {
            margin: ${settings.margin};
            size: ${paperWidth}mm auto;
          }
          body {
            width: ${paperWidth}mm;
            font-family: '${settings.fontFamily}', 'Courier New', 'Consolas', monospace;
            font-size: ${settings.fontSize}px;
            line-height: ${settings.lineHeight};
            margin: 0;
            padding: 8px;
            text-align: center;
            color: #000000 !important;
            background-color: #ffffff !important;
            font-weight: ${settings.enableBold ? '900' : '700'};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header { 
            font-size: ${settings.fontSize + 4}px; 
            font-weight: 900 !important; 
            margin-bottom: 10px; 
            color: #000000 !important;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .separator { 
            border-top: 2px solid #000000; 
            margin: 8px 0; 
          }
          .footer { 
            font-size: ${settings.fontSize - 2}px; 
            margin-top: 10px; 
            font-weight: 700;
            color: #000000 !important;
          }
        </style>
      </head>
      <body>
        <div class="header">TEST PRINT</div>
        <div class="separator"></div>
        <div>Hello World!</div>
        <div>Printer Test</div>
        <div style="font-size: ${settings.fontSize - 2}px;">${new Date().toLocaleString('id-ID')}</div>
        <div class="separator"></div>
        <div class="footer">Success!</div>
      </body>
      </html>
    `
    return this.print(testContent)
  }
}
