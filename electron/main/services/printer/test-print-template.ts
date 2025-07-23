export interface TestPrintData {
  title: string
  paperSize: string
  paperWidth: number
  fontFamily: string
  fontSize: number
  lineHeight: number
  enableBold: boolean
  margin: string
  additionalInfo: string
  currentDate: string
}

export function generateTestPrintHTML(data: TestPrintData): string {
  const parseMarginForCSS = (marginString: string): string => {
    if (!marginString?.trim() || marginString === '0' || marginString === '0 0 0 0') {
      return '0'
    }

    const margins = marginString.trim().split(/\s+/)

    switch (margins.length) {
      case 1:
        return `${margins[0]}mm`
      case 2:
        return `${margins[0]}mm ${margins[1]}mm`
      case 4:
        return `${margins[0]}mm ${margins[1]}mm ${margins[2]}mm ${margins[3]}mm`
      default:
        return '0'
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: ${parseMarginForCSS(data.margin)};
      size: ${data.paperWidth}mm auto;
    }
    body { 
      font-family: '${data.fontFamily}', monospace;
      font-size: ${data.fontSize}px;
      line-height: ${data.lineHeight};
      font-weight: ${data.enableBold ? 'bold' : 'normal'};
      margin: 0;
      padding: 0;
      width: 100%;
      box-sizing: border-box;
    }
    .header { 
      text-align: center; 
      font-weight: bold; 
      margin-bottom: 3mm; 
      border-bottom: 1px solid #000;
      padding-bottom: 2mm;
    }
    .info-line { 
      margin: 1mm 0; 
      font-size: ${Math.max(8, data.fontSize - 2)}px;
    }
    .test-block { 
      margin: 3mm 0; 
      padding: 2mm 0;
    }
    .border-line { 
      border: 1px solid #000; 
      padding: 1mm; 
      margin: 2mm 0; 
      display: flex;
      justify-content: space-between;
    }
    .separator {
      text-align: center;
      margin: 2mm 0;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">${data.title}</div>
  
  <div class="info-line">Paper: ${data.paperSize} | Font: ${data.fontFamily} ${data.fontSize}px</div>
  <div class="info-line">Margin: ${data.margin || 'None'} | ${data.additionalInfo}</div>
  <div class="info-line">Date: ${data.currentDate}</div>
  
  <div class="separator">• • • • • • • • • • • • • • • •</div>
  
  <div class="test-block">
    <div style="text-align: center; font-weight: bold;">WIDTH & ALIGNMENT TEST</div>
    <div class="border-line">
      <span>◄ LEFT</span>
      <span>CENTER</span>
      <span>RIGHT ►</span>
    </div>
  </div>
  
  <div class="test-block">
    <div style="text-align: center; font-weight: bold;">CHARACTER TEST</div>
    <div>Numbers: 1234567890</div>
    <div>Letters: ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
    <div>Symbols: !@#$%^&*()_+-=[]{}|</div>
    <div>Currency: Rp 1.000.000,-</div>
  </div>
  
  <div class="test-block">
    <div style="text-align: center; font-weight: bold;">MARGIN & BORDER TEST</div>
    <div style="border: 1px solid #000; padding: 2mm; text-align: center;">
      Paper Width: ${data.paperWidth}mm<br>
      This content respects margin settings
    </div>
  </div>
  
  <div class="separator">• • • • • • • • • • • • • • • •</div>
  <div style="text-align: center; font-weight: bold; margin-top: 3mm;">✓ TEST COMPLETED</div>
</body>
</html>`
}
