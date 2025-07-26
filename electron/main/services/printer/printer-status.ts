import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface PrinterStatusResult {
  isOnline: boolean
  message: string
}

export class PrinterStatusChecker {
  private readonly COMMAND_TIMEOUT = 3000

  async getDefaultPrinterName(): Promise<string | null> {
    try {
      const command = `wmic printer where "Default=true" get Name /value`

      const { stdout } = await execAsync(command, {
        timeout: this.COMMAND_TIMEOUT,
        encoding: 'utf8'
      })

      if (!stdout?.trim()) {
        return null
      }

      const nameMatch = stdout.match(/Name=(.+)/i)

      if (!nameMatch || !nameMatch[1]?.trim()) {
        return null
      }

      return nameMatch[1].trim()
    } catch {
      return null
    }
  }

  async checkPrinterStatus(printerName: string): Promise<PrinterStatusResult> {
    const trimmedName = printerName?.trim()

    if (!trimmedName) {
      return {
        isOnline: false,
        message: 'Printer name is required'
      }
    }

    try {
      const command = `wmic printer where "name='${trimmedName.replace(/'/g, "''")}'" get WorkOffline /value`

      const { stdout, stderr } = await execAsync(command, {
        timeout: this.COMMAND_TIMEOUT,
        encoding: 'utf8'
      })

      if (stderr && stderr.includes('Invalid query')) {
        return {
          isOnline: false,
          message: `Printer '${trimmedName}' not found`
        }
      }

      if (!stdout?.trim()) {
        return {
          isOnline: false,
          message: `Printer '${trimmedName}' not found`
        }
      }

      const workOfflineMatch = stdout.match(/WorkOffline=(\w+)/i)

      if (!workOfflineMatch) {
        return {
          isOnline: false,
          message: `Failed to parse printer status`
        }
      }

      const workOffline = workOfflineMatch[1].toLowerCase() === 'true'
      const isOnline = !workOffline

      return {
        isOnline,
        message: isOnline
          ? `Printer '${trimmedName}' is online and ready`
          : `Printer '${trimmedName}' is offline`
      }
    } catch (error) {
      return {
        isOnline: false,
        message: error instanceof Error ? error.message : 'Failed to check printer status'
      }
    }
  }
}
