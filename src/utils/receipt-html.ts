import { PrinterSettings, FooterInfo } from '@/types/settings'
import { formatCurrency } from '@/utils/format'
import { ReceiptData } from './receipt-data'

// Inline utility function
function getPaperWidthMm(paperSize: string): number {
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

export function generateReceiptHTML(
  receiptData: ReceiptData,
  printerSettings?: PrinterSettings,
  footerInfo?: FooterInfo
): string {
  const { storeInfo, transaction, items, pricing, payment, pointsEarned } = receiptData

  // Use footer info or defaults
  const defaultFooterInfo: FooterInfo = {
    thankYouMessage: 'Terima kasih atas kunjungan Anda!',
    returnMessage: 'Selamat berbelanja kembali'
  }

  const footer = footerInfo || defaultFooterInfo

  // Use printer settings or defaults
  const settings = printerSettings || {
    fontSize: 12,
    fontFamily: 'Courier New',
    lineHeight: 1.3,
    enableBold: true,
    paperSize: '58mm' as const,
    margin: '0'
  }

  const paperWidth = getPaperWidthMm(settings.paperSize || '58mm')
  const maxWidth = Math.max(280, paperWidth * 3.77953) // Convert mm to px (approx)

  // Parse margin setting untuk CSS @page
  const parseMarginForCSS = (marginString: string): string => {
    if (
      !marginString ||
      marginString.trim() === '' ||
      marginString === '0' ||
      marginString === '0 0 0 0'
    ) {
      return '0mm'
    }

    const margins = marginString.trim().split(/\s+/)

    if (margins.length === 1) {
      return `${margins[0]}mm`
    } else if (margins.length === 2) {
      return `${margins[0]}mm ${margins[1]}mm`
    } else if (margins.length === 4) {
      return `${margins[0]}mm ${margins[1]}mm ${margins[2]}mm ${margins[3]}mm`
    }

    return '0mm'
  }

  // Parse margin setting untuk body padding (setengah dari margin)
  const parseBodyPadding = (marginString: string): string => {
    if (
      !marginString ||
      marginString.trim() === '' ||
      marginString === '0' ||
      marginString === '0 0 0 0'
    ) {
      return '1mm' // minimal padding untuk readability
    }

    const margins = marginString.trim().split(/\s+/)

    if (margins.length === 1) {
      const val = Math.max(0.5, parseFloat(margins[0]) / 2)
      return `${val}mm`
    } else if (margins.length === 2) {
      const vertical = Math.max(0.5, parseFloat(margins[0]) / 2)
      const horizontal = Math.max(0.5, parseFloat(margins[1]) / 2)
      return `${vertical}mm ${horizontal}mm`
    } else if (margins.length === 4) {
      const top = Math.max(0.5, parseFloat(margins[0]) / 2)
      const right = Math.max(0.5, parseFloat(margins[1]) / 2)
      const bottom = Math.max(0.5, parseFloat(margins[2]) / 2)
      const left = Math.max(0.5, parseFloat(margins[3]) / 2)
      return `${top}mm ${right}mm ${bottom}mm ${left}mm`
    }

    return '1mm'
  }

  const cssMargin = parseMarginForCSS(settings.margin || '0')
  const bodyPadding = parseBodyPadding(settings.margin || '0')

  // Calculate total items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt</title>
      <style>
        @page {
          margin: ${cssMargin};
          size: ${paperWidth}mm auto; /* Auto height penting untuk receipt panjang */
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important; /* Auto height */
        }
        
        body {
          width: ${paperWidth}mm;
          max-width: ${maxWidth}px;
          min-height: auto; /* Auto height */
          font-family: '${settings.fontFamily}', 'Courier New', 'Consolas', 'Monaco', 'Lucida Console', monospace;
          font-size: ${settings.fontSize}px;
          line-height: ${settings.lineHeight};
          margin: 0;
          padding: ${bodyPadding};
          color: #000000 !important;
          background-color: #ffffff !important;
          font-weight: ${settings.enableBold ? 'bold' : '600'};
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          overflow: visible !important; /* Penting: visible bukan hidden */
          page-break-inside: avoid;
        }
        
        .header {
          text-align: center;
          margin-bottom: 8px;
          border-bottom: 2px solid #000000;
          padding-bottom: 6px;
          page-break-inside: avoid;
        }
        
        .store-name {
          font-size: ${settings.fontSize + 2}px;
          font-weight: 900 !important;
          margin-bottom: 2px;
          color: #000000 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .store-info {
          font-size: ${settings.fontSize - 2}px;
          margin-bottom: 1px;
          font-weight: 600;
          color: #000000 !important;
        }
        
        .transaction-info {
          margin-bottom: 8px;
          font-size: ${settings.fontSize - 2}px;
          font-weight: 600;
          color: #000000 !important;
          page-break-inside: avoid;
        }
        
        .transaction-info div {
          margin-bottom: 1px;
          font-weight: 600;
        }
        
        .items-section {
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        
        .items-header {
          border-top: 2px solid #000000;
          border-bottom: 2px solid #000000;
          padding: 3px 0;
          font-weight: 900 !important;
          font-size: ${settings.fontSize - 1}px;
          color: #000000 !important;
          text-transform: uppercase;
          letter-spacing: 1px;
          page-break-after: avoid;
        }
        
        .item {
          margin-bottom: 4px;
          font-size: ${settings.fontSize - 1}px;
          font-weight: 600;
          color: #000000 !important;
          page-break-inside: avoid;
        }
        
        .item-name {
          word-wrap: break-word;
          word-break: break-word; /* Tambahan untuk text wrapping */
          margin-bottom: 1px;
          font-weight: 700;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1px;
          align-items: flex-start; /* Align ke atas untuk text panjang */
        }
        
        .item-details {
          display: flex;
          justify-content: space-between;
          margin-left: 3px;
          font-size: ${settings.fontSize - 2}px;
          font-weight: 600;
        }
        
        .item-discount {
          font-size: ${settings.fontSize - 3}px;
          color: #000000 !important;
          margin-left: 3px;
          font-weight: 600;
        }
        
        .totals {
          border-top: 2px solid #000000;
          padding-top: 6px;
          font-size: ${settings.fontSize - 1}px;
          font-weight: 700;
          color: #000000 !important;
          page-break-inside: avoid;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-weight: 700;
        }
        
        .total-label {
          flex: 1;
          font-weight: 700;
        }
        
        .total-value {
          flex-shrink: 0;
          text-align: right;
          font-weight: 700;
          margin-left: 5px; /* Spacing dari label */
        }
        
        .final-total {
          border-top: 3px double #000000;
          border-bottom: 2px solid #000000;
          font-weight: 900 !important;
          font-size: ${settings.fontSize + 1}px;
          padding: 6px 0;
          margin-top: 6px;
          color: #000000 !important;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .payment-info {
          margin-top: 8px;
          font-size: ${settings.fontSize - 1}px;
          font-weight: 700;
          color: #000000 !important;
          page-break-inside: avoid;
        }
        
        .points-earned {
          text-align: center;
          margin-top: 6px;
          border: 1px solid #000000;
          padding: 3px;
          font-size: ${settings.fontSize - 2}px;
          font-weight: 700;
          color: #000000 !important;
          background-color: #ffffff;
          page-break-inside: avoid;
        }
        
        .footer {
          text-align: center;
          margin-top: 8px;
          font-size: ${settings.fontSize - 2}px;
          padding-top: 4px;
          font-weight: 600;
          color: #000000 !important;
          page-break-inside: avoid;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        /* Print specific optimizations */
        @media print {
          body {
            overflow: visible !important;
            height: auto !important;
          }
          
          .item-name {
            max-width: ${Math.floor(paperWidth * 0.6)}mm; /* 60% dari paper width */
            overflow-wrap: break-word;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="store-name">${storeInfo.name}</div>
        ${storeInfo.address ? `<div class="store-info">${storeInfo.address}</div>` : ''}
        ${storeInfo.phone ? `<div class="store-info">Tel: ${storeInfo.phone}</div>` : ''}
        ${storeInfo.email ? `<div class="store-info">Email: ${storeInfo.email}</div>` : ''}
        ${storeInfo.website ? `<div class="store-info">${storeInfo.website}</div>` : ''}
      </div>
      
      <!-- Transaction Info -->
      <div class="transaction-info">
        <div>ID: ${transaction.id}</div>
        <div>Tanggal: ${transaction.date}</div>
        <div>Kasir: ${transaction.cashier}</div>
        ${
          transaction.customer &&
          transaction.customer !== 'Guest' &&
          transaction.customer !== 'Umum'
            ? `<div>Customer: ${transaction.customer}${transaction.customerTier ? ` (${transaction.customerTier})` : ''}</div>`
            : ''
        }
        <div>Pembayaran: ${payment.method}</div>
      </div>
      
      <!-- Items -->
      <div class="items-section">
        <div class="items-header text-center">
          ITEMS (${totalItems})
        </div>
        
        ${items
          .map(
            (item) => `
          <div class="item">
            <div class="item-row">
              <span class="item-name">${item.name}</span>
              <span class="total-value">${formatCurrency(item.total)}</span>
            </div>
            <div class="item-details">
              <span>${item.quantity} x ${formatCurrency(item.price)}</span>
              <span></span>
            </div>
            ${item.discount ? `<div class="item-discount">Diskon ${item.discount.name}: -${formatCurrency(item.discount.amount)}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
      
      <!-- Totals -->
      <div class="totals">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-value">${formatCurrency(pricing.subtotal)}</span>
        </div>
        
        ${
          pricing.discounts.product > 0
            ? `
        <div class="total-row">
          <span class="total-label">Diskon Produk:</span>
          <span class="total-value">-${formatCurrency(pricing.discounts.product)}</span>
        </div>
        `
            : ''
        }
        
        ${
          pricing.discounts.member > 0
            ? `
        <div class="total-row">
          <span class="total-label">Diskon Member:</span>
          <span class="total-value">-${formatCurrency(pricing.discounts.member)}</span>
        </div>
        `
            : ''
        }
        
        ${
          pricing.discounts.tier > 0
            ? `
        <div class="total-row">
          <span class="total-label">Diskon Tier:</span>
          <span class="total-value">-${formatCurrency(pricing.discounts.tier)}</span>
        </div>
        `
            : ''
        }
        
        ${
          pricing.discounts.global > 0
            ? `
        <div class="total-row">
          <span class="total-label">Diskon Voucher:</span>
          <span class="total-value">-${formatCurrency(pricing.discounts.global)}</span>
        </div>
        `
            : ''
        }
        
        <div class="total-row final-total">
          <span class="total-label">TOTAL:</span>
          <span class="total-value">${formatCurrency(pricing.finalAmount)}</span>
        </div>
      </div>
      
      <!-- Payment Info -->
      <div class="payment-info">
        <div class="total-row">
          <span class="total-label">Bayar:</span>
          <span class="total-value">${formatCurrency(pricing.paymentAmount)}</span>
        </div>
        
        ${
          pricing.change > 0
            ? `
        <div class="total-row">
          <span class="total-label">Kembalian:</span>
          <span class="total-value">${formatCurrency(pricing.change)}</span>
        </div>
        `
            : ''
        }
      </div>
      
      <!-- Points Earned -->
      ${
        pointsEarned && pointsEarned > 0
          ? `
      <div class="points-earned">
        Poin Diperoleh: ${pointsEarned} Poin
      </div>
      `
          : ''
      }
      
      <!-- Footer -->
      <div class="footer">
        <div>${footer.thankYouMessage}</div>
        <div>${footer.returnMessage}</div>
        <div style="margin-top: 5px;">Powered by samunu x ibobdb</div>
      </div>
    </body>
    </html>
  `
}
