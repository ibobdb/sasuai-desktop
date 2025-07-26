import { PrinterStatusChecker, PrinterStatusResult } from './printer-status'
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
    this.printerStatusChecker.clearCaches()
  }

  /**
   * Force refresh printer status (bypass cache)
   */
  async refreshPrinterStatus(printerName?: string): Promise<PrinterStatusResult | null> {
    const targetPrinter =
      printerName?.trim() || (await this.printerStatusChecker.getDefaultPrinterName())

    if (!targetPrinter) {
      return null
    }

    return this.printerStatusChecker.checkPrinterStatus(targetPrinter, true)
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return this.printerStatusChecker.getCacheStats()
  }

  async print(htmlContent: string, skipStatusCheck = false): Promise<boolean> {
    if (this.printEngine.getIsPrinting()) {
      throw new Error('Another print operation is in progress')
    }

    const settings = this.getSettings()

    // Only check printer status if not explicitly skipped
    if (!skipStatusCheck) {
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
    }

    const result = await this.printEngine.print(htmlContent, settings)

    // Mark successful print for fast path optimization
    if (result) {
      const printerName =
        settings.printerName?.trim() ||
        (await this.printerStatusChecker.getDefaultPrinterName()) ||
        'default'
      this.printerStatusChecker.markPrintSuccess(printerName)
    }

    return result
  }

  /**
   * Quick print without status check (for consecutive prints)
   */
  async quickPrint(htmlContent: string): Promise<boolean> {
    return this.print(htmlContent, true)
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
