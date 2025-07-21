export interface PrintReceipt {
  id: string
  storeName: string
  address: string
  phone: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  payment: {
    method: string
    amount: number
    change: number
  }
  transactionDate: Date
  cashier: string
}

export class ReceiptBuilder {
  buildReceiptContent(receipt: PrintReceipt): string {
    let receiptContent = ''

    // Header
    receiptContent += `<div class="center bold large">${receipt.storeName}</div>`
    receiptContent += `<div class="center bold small">${receipt.address}</div>`
    receiptContent += `<div class="center bold small">${receipt.phone}</div>`
    receiptContent += `<div class="separator"></div>`

    // Receipt info
    receiptContent += `<div class="bold">Receipt: ${receipt.id}</div>`
    receiptContent += `<div class="bold">Date: ${receipt.transactionDate.toLocaleDateString('id-ID')} ${receipt.transactionDate.toLocaleTimeString('id-ID')}</div>`
    receiptContent += `<div class="bold">Cashier: ${receipt.cashier}</div>`
    receiptContent += `<div class="separator"></div>`

    // Items
    receipt.items.forEach((item) => {
      receiptContent += `
        <div style="display: flex; justify-content: space-between;">
          <span class="bold">${item.name}</span>
          <span class="bold">${this.formatCurrency(item.total)}</span>
        </div>
        <div style="margin-left: 10px;" class="bold small">
          ${item.quantity}x @ ${this.formatCurrency(item.price)}
        </div>
      `
    })

    receiptContent += `<div class="separator"></div>`

    // Totals
    receiptContent += `<div class="right bold">Subtotal: ${this.formatCurrency(receipt.subtotal)}</div>`
    receiptContent += `<div class="right bold">Tax: ${this.formatCurrency(receipt.tax)}</div>`
    receiptContent += `<div class="right bold large">TOTAL: ${this.formatCurrency(receipt.total)}</div>`
    receiptContent += `<div class="separator"></div>`

    // Payment
    receiptContent += `<div class="right bold">Payment: ${this.formatCurrency(receipt.payment.amount)}</div>`
    receiptContent += `<div class="right bold">Change: ${this.formatCurrency(receipt.payment.change)}</div>`
    receiptContent += `<div class="separator"></div>`

    // Footer
    receiptContent += `<div class="center bold">Thank you for your purchase!</div>`

    return receiptContent
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }
}
