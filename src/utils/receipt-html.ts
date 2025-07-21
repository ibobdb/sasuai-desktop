import { PrinterSettings } from '@/types/settings'
import { formatCurrency } from '@/utils/format'
import { ReceiptData } from './receipt-data'

export function generateReceiptHTML(
  receiptData: ReceiptData,
  printerSettings?: PrinterSettings
): string {
  const { storeInfo, transaction, items, pricing, payment, pointsEarned } = receiptData

  // Use printer settings or defaults
  const settings = printerSettings || {
    fontSize: 12,
    fontFamily: 'Courier New',
    lineHeight: 1.3,
    enableBold: true,
    paperSize: '80mm' as const,
    margin: '0'
  }

  // Calculate paper width
  const getPaperWidthMm = (paperSize: string): number => {
    const widthMap: Record<string, number> = {
      '44mm': 44,
      '57mm': 57,
      '58mm': 58,
      '76mm': 76,
      '78mm': 78,
      '80mm': 80
    }
    return widthMap[paperSize] || 80
  }

  const paperWidth = getPaperWidthMm(settings.paperSize || '80mm')
  const maxWidth = Math.max(280, paperWidth * 3.77953) // Convert mm to px (approx)

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
          margin: ${settings.margin || '0'};
          size: ${paperWidth}mm auto;
        }
        
        body {
          width: ${paperWidth}mm;
          max-width: ${maxWidth}px;
          font-family: '${settings.fontFamily}', monospace;
          font-size: ${settings.fontSize}px;
          line-height: ${settings.lineHeight};
          margin: 0;
          padding: 6px;
          color: #000;
          ${settings.enableBold ? 'font-weight: bold;' : ''}
        }
        
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }
        
        .store-name {
          font-size: ${settings.fontSize + 2}px;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .store-info {
          font-size: ${settings.fontSize - 2}px;
          margin-bottom: 2px;
        }
        
        .transaction-info {
          margin-bottom: 10px;
          font-size: ${settings.fontSize - 2}px;
        }
        
        .transaction-info div {
          margin-bottom: 2px;
        }
        
        .items-section {
          margin-bottom: 10px;
        }
        
        .items-header {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 3px 0;
          font-weight: bold;
          font-size: ${settings.fontSize - 2}px;
        }
        
        .item {
          margin-bottom: 5px;
          font-size: ${settings.fontSize - 2}px;
        }
        
        .item-name {
          word-wrap: break-word;
          margin-bottom: 2px;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        
        .item-details {
          display: flex;
          justify-content: space-between;
          margin-left: 10px;
          font-size: ${settings.fontSize - 3}px;
        }
        
        .item-discount {
          font-size: ${settings.fontSize - 4}px;
          color: #000;
          margin-left: 10px;
        }
        
        .totals {
          border-top: 1px dashed #000;
          padding-top: 5px;
          font-size: ${settings.fontSize - 2}px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        
        .total-label {
          flex: 1;
        }
        
        .total-value {
          flex-shrink: 0;
          text-align: right;
        }
        
        .final-total {
          border-top: 1px solid #000;
          font-weight: bold;
          font-size: ${settings.fontSize - 1}px;
          padding-top: 5px;
          margin-top: 5px;
        }
        
        .payment-info {
          margin-top: 8px;
          font-size: ${settings.fontSize - 2}px;
        }
        
        .points-earned {
          text-align: center;
          margin-top: 10px;
          border: 1px dashed #000;
          padding: 8px;
          font-size: ${settings.fontSize - 3}px;
        }
        
        .footer {
          text-align: center;
          margin-top: 8px;
          font-size: ${settings.fontSize - 2}px;
          padding-top: 8px;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="store-name">${storeInfo.name}</div>
        ${storeInfo.address ? `<div class="store-info">${storeInfo.address}</div>` : ''}
        ${storeInfo.phone ? `<div class="store-info">Tel: ${storeInfo.phone}</div>` : ''}
      </div>
      
      <!-- Transaction Info -->
      <div class="transaction-info">
        <div>ID: ${transaction.id}</div>
        <div>Tanggal: ${transaction.date}</div>
        <div>Kasir: ${transaction.cashier}</div>
        <div>Customer: ${transaction.customer}${transaction.customerTier ? ` (${transaction.customerTier})` : ''}</div>
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
          pricing.productDiscounts > 0
            ? `
        <div class="total-row">
          <span class="total-label">Diskon Produk:</span>
          <span class="total-value">-${formatCurrency(pricing.productDiscounts)}</span>
        </div>
        `
            : ''
        }
        
        ${
          pricing.memberDiscount > 0
            ? `
        <div class="total-row">
          <span class="total-label">Diskon Member:</span>
          <span class="total-value">-${formatCurrency(pricing.memberDiscount)}</span>
        </div>
        `
            : ''
        }
        
        ${
          pricing.totalDiscount > 0
            ? `
        <div class="total-row">
          <span class="total-label">Total Diskon:</span>
          <span class="total-value">-${formatCurrency(pricing.totalDiscount)}</span>
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
        <div style="font-weight: bold;">🌟 POIN DIPEROLEH: ${pointsEarned} Poin 🌟</div>
      </div>
      `
          : ''
      }
      
      <!-- Footer -->
      <div class="footer">
        <div>Terima kasih atas kunjungan Anda!</div>
        <div>Selamat berbelanja kembali</div>
        <div style="margin-top: 5px;">Powered by samunu x ibobdb</div>
      </div>
    </body>
    </html>
  `
}
