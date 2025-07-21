import { TransactionDetail } from '@/types/transactions'
import { PrinterSettings } from '@/types/settings'
import { formatCurrency } from '@/utils/format'

// Store info constants to avoid duplication
const DEFAULT_STORE_INFO = {
  name: 'Sasuai Store',
  address: 'Jl. Contoh No. 123, Jakarta',
  phone: '021-12345678'
}

// Helper function to format payment method
function formatPaymentMethod(paymentMethod?: string): string {
  if (!paymentMethod) return 'Cash'
  return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1).replace(/[_-]/g, ' ')
}

export interface ReceiptData {
  storeInfo: {
    name: string
    address?: string
    phone?: string
  }
  transaction: {
    id: string
    date: string
    cashier: string
    customer: string
    customerTier?: string
  }
  items: Array<{
    name: string
    price: number
    quantity: number
    total: number
    discount?: {
      name: string
      amount: number
    }
  }>
  pricing: {
    subtotal: number
    productDiscounts: number
    memberDiscount: number
    totalDiscount: number
    finalAmount: number
    paymentAmount: number
    change: number
  }
  payment: {
    method: string
  }
  pointsEarned?: number
}

export function generateReceiptData(transactionDetail: TransactionDetail): ReceiptData {
  const { pricing, cashier, member, items = [], payment } = transactionDetail
  const paymentMethod = payment?.method || transactionDetail.paymentMethod

  const date = new Date(transactionDetail.createdAt)
  const formattedDate = date.toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Store info - you may want to get this from settings
  const storeInfo = DEFAULT_STORE_INFO

  // Items
  const receiptItems = items.map((item) => ({
    name: item.product?.name || 'Unknown Item',
    price: item.product?.price || 0,
    quantity: item.quantity || 0,
    total: item.originalAmount || 0,
    discount: item.discountApplied
      ? {
          name: item.discountApplied.name,
          amount: item.discountApplied.amount
        }
      : undefined
  }))

  // Pricing
  const receiptPricing = {
    subtotal: pricing?.originalAmount || 0,
    productDiscounts: Number(pricing?.discounts?.products || 0),
    memberDiscount: Number(pricing?.discounts?.member?.amount || 0),
    totalDiscount: Number(pricing?.discounts?.total || 0),
    finalAmount: Math.abs(pricing?.finalAmount || 0),
    paymentAmount: Number(payment?.amount || 0),
    change: Number(payment?.change || 0)
  }

  // Payment
  const receiptPayment = {
    method: formatPaymentMethod(paymentMethod)
  }

  return {
    storeInfo,
    transaction: {
      id: transactionDetail.tranId || 'NO-TRANS',
      date: formattedDate,
      cashier: cashier.name,
      customer: member ? member.name : 'Guest',
      customerTier: member?.tier
    },
    items: receiptItems,
    pricing: receiptPricing,
    payment: receiptPayment,
    pointsEarned: transactionDetail.pointsEarned
  }
}

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
    paperSize: '80mm'
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
          margin: 0;
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
          font-weight: bold;
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
          color: #666;
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
          margin-top: 15px;
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
