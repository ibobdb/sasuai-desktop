import { getTypedStore } from '../../index'
import { PrinterSettings } from '../../types/printer'

export class PrinterConfig {
  private store = getTypedStore()

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

  getSettings(): PrinterSettings {
    const settings = this.store.get('printer.settings')
    return settings ? { ...this.getDefaultSettings(), ...settings } : this.getDefaultSettings()
  }

  saveSettings(settings: Partial<PrinterSettings>): void {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    this.store.set('printer.settings', newSettings)
  }

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

  mmToMicrons(mm: number): number {
    return Math.round(mm * 1000)
  }
}
