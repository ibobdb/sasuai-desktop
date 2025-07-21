import { PrinterSettings } from '../../types/printer'

export class PrintHtmlGenerator {
  generateHtml(content: string, settings: PrinterSettings): string {
    const paperWidth = this.getPaperWidthMm(settings.paperSize)

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="${settings.encoding}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Print</title>
    <style>
        @page {
            margin: ${settings.margin};
            size: ${paperWidth}mm auto;
        }
        body {
            font-family: '${settings.fontFamily}', monospace;
            font-size: ${settings.fontSize}px;
            font-weight: ${settings.enableBold ? 'bold' : 'normal'};
            line-height: ${settings.lineHeight};
            margin: 0;
            padding: 5px;
            width: ${paperWidth}mm;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        ${settings.enableBold ? '* { font-weight: bold !important; }' : ''}
        .center { text-align: center; }
        .left { text-align: left; }
        .right { text-align: right; }
        .bold { font-weight: 900 !important; }
        .large { font-size: ${settings.fontSize + 4}px; font-weight: 900; }
        .small { font-size: ${settings.fontSize - 2}px; }
        .separator { 
            border-top: 2px dashed #000; 
            margin: 5px 0; 
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`
  }

  private getPaperWidthMm(paperSize: string): number {
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

  generateTestContent(): string {
    return `
        <div class="center bold large header">TEST PRINT</div>
        <div class="separator"></div>
        <div class="center bold body">Hello World!</div>
        <div class="center bold body">Flexible Print Test</div>
        <div class="center bold small body">${new Date().toLocaleString('id-ID')}</div>
        <div class="separator"></div>
        <div class="center bold footer">Success!</div>
      `
  }
}
