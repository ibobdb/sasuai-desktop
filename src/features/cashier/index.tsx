import { useState } from 'react'
import { Main } from '@/components/layout/main'
import ProductSearch from './components/product-search'
import CartList from './components/cart-list'
import TransactionSummary from './components/summary'
import PaymentSection from './components/payment-section'
import ActionButtons from './components/action-buttons'
import { MemberSection } from './components/member-section'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/config/api'
import { useAuthStore } from '@/stores/authStore'
import {
  CartItem,
  Discount,
  PaymentMethod,
  Product,
  TransactionData,
  Member,
  MemberDiscount
} from '@/types/cashier'

export default function Cashier() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [member, setMember] = useState<
    (Member & { discountRelationsMember?: MemberDiscount[] }) | null
  >(null)
  const [selectedMemberDiscount, setSelectedMemberDiscount] = useState<Discount | null>(null)
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)
  const { user } = useAuthStore()

  // Calculate cart totals with discounts
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const productDiscountsTotal = cart.reduce((sum, item) => sum + item.discountAmount, 0)

  // Calculate member discount amount if applicable
  const memberDiscountAmount = selectedMemberDiscount
    ? selectedMemberDiscount.valueType === 'percentage'
      ? (subtotal - productDiscountsTotal) * (selectedMemberDiscount.value / 100)
      : Math.min(selectedMemberDiscount.value, subtotal - productDiscountsTotal)
    : 0

  const totalDiscount = productDiscountsTotal + memberDiscountAmount
  const tax = 0 // Implement tax calculation if needed
  const total = subtotal - totalDiscount + tax
  const change = paymentAmount - total

  const addToCart = (product: Product) => {
    // Get best batch (could improve with FIFO logic)
    const batch =
      product.batches && product.batches.length > 0
        ? product.batches.find((b) => b.remainingQuantity > 0)
        : null

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
                finalPrice: calculateFinalPrice(
                  item.price,
                  item.quantity + 1,
                  item.selectedDiscount
                ),
                discountAmount: calculateDiscountAmount(
                  item.price,
                  item.quantity + 1,
                  item.selectedDiscount
                )
              }
            : item
        )
      }

      // Default to no discount selected
      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          subtotal: product.price,
          batchId: batch?.id,
          selectedDiscount: null,
          discountAmount: 0,
          finalPrice: product.price
        }
      ]
    })
  }

  // Calculate discount amount based on price, quantity and selected discount
  const calculateDiscountAmount = (
    price: number,
    quantity: number,
    discount: Discount | null | undefined
  ) => {
    if (!discount) return 0

    const itemTotal = price * quantity

    if (discount.valueType === 'percentage') {
      return itemTotal * (discount.value / 100)
    } else {
      return Math.min(discount.value, itemTotal) // Fixed discount can't exceed item total
    }
  }

  // Calculate final price after discount
  const calculateFinalPrice = (
    price: number,
    quantity: number,
    discount: Discount | null | undefined
  ) => {
    const itemTotal = price * quantity
    const discountAmount = calculateDiscountAmount(price, quantity, discount)
    return itemTotal - discountAmount
  }

  // Update cart item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id !== id) return item

        const newSubtotal = quantity * item.price
        const newDiscountAmount = calculateDiscountAmount(
          item.price,
          quantity,
          item.selectedDiscount
        )

        return {
          ...item,
          quantity,
          subtotal: newSubtotal,
          discountAmount: newDiscountAmount,
          finalPrice: newSubtotal - newDiscountAmount
        }
      })
    )
  }

  // Update item discount
  const updateItemDiscount = (id: string, discount: Discount | null) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id !== id) return item

        const discountAmount = calculateDiscountAmount(item.price, item.quantity, discount)

        return {
          ...item,
          selectedDiscount: discount,
          discountAmount,
          finalPrice: item.subtotal - discountAmount
        }
      })
    )
  }

  // Remove item from cart
  const removeItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  // Handle member selection and their available discounts
  const handleMemberSelect = (
    selectedMember: (Member & { discountRelationsMember?: MemberDiscount[] }) | null
  ) => {
    setMember(selectedMember)

    // Reset member discount when changing members
    setSelectedMemberDiscount(null)

    // Auto-select member discount if only one is available and meets minimum purchase
    if (selectedMember?.discountRelationsMember?.length === 1) {
      const memberDiscount = selectedMember.discountRelationsMember[0].discount
      if (subtotal >= memberDiscount.minPurchase) {
        setSelectedMemberDiscount(memberDiscount)
      }
    }
  }

  // Handle member discount selection
  const handleMemberDiscountSelect = (discount: Discount | null) => {
    setSelectedMemberDiscount(discount)
  }

  // Clear cart and reset transaction state
  const clearCart = () => {
    setCart([])
    setPaymentAmount(0)
    setMember(null)
    setSelectedMemberDiscount(null)
  }

  // Validate transaction before processing
  const validateTransaction = (): boolean => {
    // Check if cart has items
    if (cart.length === 0) {
      toast.error('Cart is empty', { description: 'Please add products to cart' })
      return false
    }

    // Check stock levels
    const invalidStockItem = cart.find((item) => item.quantity > (item.currentStock || 0))

    if (invalidStockItem) {
      toast.error('Insufficient stock', {
        description: `Only ${invalidStockItem.currentStock} units of ${invalidStockItem.name} available`
      })
      return false
    }

    // Validate payment amount
    if (paymentAmount < total) {
      toast.error('Insufficient payment amount', {
        description: `Payment amount must be at least Rp ${total.toLocaleString()}`
      })
      return false
    }

    // Validate member discount minimum purchase
    if (selectedMemberDiscount && subtotal < selectedMemberDiscount.minPurchase) {
      toast.error('Cannot apply member discount', {
        description: `Minimum purchase of Rp ${selectedMemberDiscount.minPurchase.toLocaleString()} required`
      })
      return false
    }

    return true
  }

  // Handle payment with proper processing
  const handlePayment = async (): Promise<void> => {
    // Prevent multiple submissions
    if (isProcessingTransaction) return

    // Validate transaction
    if (!validateTransaction()) return

    setIsProcessingTransaction(true)

    try {
      // Prepare transaction data according to backend structure
      const transactionData: TransactionData = {
        cashierId: user?.id || '',
        memberId: member?.id,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          batchId: item.batchId,
          discountId: item.selectedDiscount?.id || null
        })),
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? paymentAmount : undefined,
        selectedMemberDiscountId: selectedMemberDiscount?.id || null
      }

      // Call transaction processing endpoint
      const response = await window.api.fetchWithAuth(API_ENDPOINTS.TRANSACTIONS.CHECKOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: transactionData
      })

      if (response.success) {
        // Handle successful transaction
        const { data, change, information } = response

        // Show success message with transaction details
        toast.success('Payment successful!', {
          description: `Transaction #${data.id} completed`
        })

        // Show change if paying with cash
        if (paymentMethod === 'cash' && change > 0) {
          toast.info(`Change: Rp ${change.toLocaleString()}`, {
            duration: 5000
          })
        }

        // Show member points information if applicable
        if (member && information?.member) {
          toast.info(information.member, {
            duration: 5000
          })
        }

        // Clear cart after successful payment
        clearCart()
        return Promise.resolve() // Explicitly resolve to signal success to the dialog
      } else {
        // Handle transaction failure
        toast.error('Transaction failed', {
          description: response.message || 'Please try again'
        })
        return Promise.reject(new Error(response.message || 'Transaction failed')) // Reject to keep dialog open
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment processing error', {
        description: 'An unexpected error occurred. Please try again.'
      })
      return Promise.reject(error) // Reject to keep dialog open
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  // Custom footer to display member discount information
  const renderMemberInfo = () => {
    if (!member) return null

    return (
      <div className="text-sm mt-2 text-muted-foreground">
        {/* Show points to earn information */}
        {subtotal > 0 && (
          <p className="text-green-600 dark:text-green-400">
            Points to earn: {Math.floor(subtotal / 1000)}
          </p>
        )}
      </div>
    )
  }

  return (
    <Main>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <ProductSearch onProductSelect={addToCart} />
          <CartList
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onUpdateDiscount={updateItemDiscount}
          />
        </div>

        <div className="space-y-4">
          <MemberSection
            onMemberSelect={handleMemberSelect}
            onMemberDiscountSelect={handleMemberDiscountSelect}
            selectedDiscount={selectedMemberDiscount}
            subtotal={subtotal}
          />

          <Card>
            <CardContent className="pt-6">
              <TransactionSummary
                itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                subtotal={subtotal}
                productDiscounts={productDiscountsTotal}
                memberDiscount={memberDiscountAmount}
                tax={tax}
                total={total}
              />
              {renderMemberInfo()}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <PaymentSection
                total={total}
                paymentMethod={paymentMethod}
                paymentAmount={paymentAmount}
                change={change}
                onPaymentMethodChange={setPaymentMethod}
                onPaymentAmountChange={setPaymentAmount}
              />
            </CardContent>
          </Card>

          <ActionButtons
            onPay={handlePayment}
            onClear={clearCart}
            onPrint={() => alert('Printing receipt...')}
            isPayEnabled={cart.length > 0 && paymentAmount >= total}
            isPrintEnabled={false}
          />
        </div>
      </div>
    </Main>
  )
}
