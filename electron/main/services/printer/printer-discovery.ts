import { BrowserWindow } from 'electron'

export class PrinterDiscovery {
  private readonly EXCLUDED_PRINTERS = [
    'Microsoft XPS Document Writer',
    'Microsoft Print to PDF',
    'OneNote (Desktop)',
    'OneNote for Windows 10',
    'Fax',
    'Send To OneNote',
    'XPS Document Writer'
  ]

  private printersCache: { data: string[]; timestamp: number } | null = null
  private readonly CACHE_TTL = 30000

  async getAvailablePrinters(): Promise<string[]> {
    if (this.printersCache && Date.now() - this.printersCache.timestamp < this.CACHE_TTL) {
      return this.printersCache.data
    }

    try {
      const windows = BrowserWindow.getAllWindows()
      const targetWindow = windows[0] || this.createTempWindow()

      const printers = await targetWindow.webContents.getPrintersAsync()

      if (!windows[0]) {
        targetWindow.close()
      }

      const filteredPrinters = printers
        .map((printer) => printer.name)
        .filter((printerName) => {
          return !this.EXCLUDED_PRINTERS.some((excluded) =>
            printerName.toLowerCase().includes(excluded.toLowerCase())
          )
        })

      this.printersCache = {
        data: filteredPrinters,
        timestamp: Date.now()
      }

      return filteredPrinters
    } catch {
      return []
    }
  }

  clearCache(): void {
    this.printersCache = null
  }

  private createTempWindow(): BrowserWindow {
    return new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
  }
}
