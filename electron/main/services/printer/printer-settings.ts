import { getTypedStore } from '../../index'

export interface PrinterSettings {
  printerName: string
  paperSize: '58mm' | '80mm' | '78mm' | '76mm' | '57mm' | '44mm'
  margin: string
  copies: number
  fontSize: number
  fontFamily: string
  lineHeight: number
  enableBold: boolean
}

export class PrinterSettingsManager {
  private store = getTypedStore()

  private getDefaultSettings(): PrinterSettings {
    return {
      printerName: '',
      paperSize: '58mm',
      margin: '0',
      copies: 1,
      fontSize: 12,
      fontFamily: 'Courier New',
      lineHeight: 1.2,
      enableBold: true
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

  resetToDefaults(): void {
    this.store.set('printer.settings', this.getDefaultSettings())
  }
}
