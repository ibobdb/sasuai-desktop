import { PrinterStatusChecker } from './printer-status'
import { PrinterSettingsManager, PrinterSettings } from './printer-settings'
import { PrinterDiscovery } from './printer-discovery'
import { PrintEngine } from './print-engine'
import { generateTestPrintHTML, TestPrintData } from './test-print-template'

export class PrinterManager {
  private settingsManager = new PrinterSettingsManager()
  private printerDiscovery = new PrinterDiscovery()
  private printEngine = new PrintEngine()
  private printerStatusChecker = new PrinterStatusChecker()

  getSettings(): PrinterSettings {
    return this.settingsManager.getSettings()
  }

  saveSettings(settings: Partial<PrinterSettings>): void {
    this.settingsManager.saveSettings(settings)

    if (settings.printerName !== undefined) {
      this.printerDiscovery.clearCache()
    }
  }

  async getAvailablePrinters(): Promise<string[]> {
    return this.printerDiscovery.getAvailablePrinters()
  }

  clearPrintersCache(): void {
    this.printerDiscovery.clearCache()
  }

  async print(htmlContent: string): Promise<boolean> {
    if (this.printEngine.getIsPrinting()) {
      throw new Error('Another print operation is in progress')
    }

    const settings = this.getSettings()

    // Check printer status
    let printerToCheck: string | undefined = settings.printerName?.trim()

    // If no specific printer selected (System Default), try to get default printer name
    if (!printerToCheck) {
      printerToCheck = (await this.printerStatusChecker.getDefaultPrinterName()) || undefined
    }

    // Check status if we have a printer name to check
    if (printerToCheck) {
      const statusCheck = await this.printerStatusChecker.checkPrinterStatus(printerToCheck)
      if (!statusCheck.isOnline) {
        const printerDisplayName = settings.printerName?.trim()
          ? `Printer '${settings.printerName}'`
          : `Default printer '${printerToCheck}'`
        throw new Error(`${printerDisplayName} is offline`)
      }
    }
    // If we can't determine printer name, proceed without status check
    // (This handles edge cases where default printer detection fails)

    return this.printEngine.print(htmlContent, settings)
  }

  async testPrint(): Promise<boolean> {
    const settings = this.getSettings()
    const testContent = this.generateTestContent(
      'TEST PRINT',
      `Printer: ${settings.printerName || 'System Default'}`
    )
    return this.print(testContent)
  }

  private generateTestContent(title: string, additionalInfo: string = ''): string {
    const settings = this.getSettings()
    const currentTime = new Date()

    const testData: TestPrintData = {
      title,
      paperSize: settings.paperSize,
      paperWidth: this.printEngine.getPaperWidthMm(settings.paperSize),
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      enableBold: settings.enableBold,
      margin: settings.margin,
      additionalInfo: additionalInfo || 'System Default',
      currentDate: currentTime.toLocaleString('id-ID')
    }

    return generateTestPrintHTML(testData)
  }
}
