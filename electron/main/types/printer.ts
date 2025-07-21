export interface PrinterSettings {
  printerName: string
  paperSize: '58mm' | '80mm' | '78mm' | '76mm' | '57mm' | '44mm'
  margin: string
  copies: number
  timeOutPerLine: number
  fontSize: number
  fontFamily: string
  lineHeight: number
  enableBold: boolean
  autocut: boolean
  cashdrawer: boolean
  encoding: string
}
