import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import ProductSearch from './components/product-search'
import CartList from './components/cart-list'
import TransactionSummary from './components/summary'
import PaymentDialog from './components/payment-dialog'
import { MemberSection } from './components/member-section'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, X } from 'lucide-react'
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
  MemberDiscount,
  TransactionItem
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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [pointsToEarn, setPointsToEarn] = useState<number>(0)
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
  const total = subtotal - totalDiscount

  // Function to calculate points
  const calculatePoints = async (amount: number, memberId?: string) => {
    try {
      const data = await window.api.request(API_ENDPOINTS.MEMBERS.CALCULATE_POINTS, {
        method: 'POST',
        data: {
          amount,
          memberId
        }
      })

      if (data.points !== undefined) {
        setPointsToEarn(data.points)
      }
    } catch (error) {
      console.error('Error calculating points:', error)
      setPointsToEarn(0)
      toast.error('Failed to calculate points', {
        description: 'Please try again later'
      })
    }
  }

  // When opening the payment dialog, set payment amount to match the total for non-cash methods
  const handleOpenPaymentDialog = () => {
    // For non-cash payment methods, set the amount equal to the total
    if (paymentMethod !== 'cash') {
      setPaymentAmount(total)
    } else if (paymentAmount < total) {
      // For cash, set a minimum amount if it's less than total
      setPaymentAmount(total)
    }
    setPaymentDialogOpen(true)
  }

  // Add to cart function - modify to accept quantity parameter
  const addToCart = (product: Product, quantity: number = 1) => {
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
                quantity: item.quantity + quantity, // Use the provided quantity
                subtotal: (item.quantity + quantity) * item.price,
                finalPrice: calculateFinalPrice(
                  item.price,
                  item.quantity + quantity,
                  item.selectedDiscount
                ),
                discountAmount: calculateDiscountAmount(
                  item.price,
                  item.quantity + quantity,
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
          quantity: quantity, // Use the provided quantity
          subtotal: product.price * quantity, // Multiply by quantity
          batchId: batch?.id,
          unitId: product.unitId || '', // Ensure unit ID is provided in product data
          selectedDiscount: null,
          discountAmount: 0,
          finalPrice: product.price * quantity // Multiply by quantity
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

    // Validate payment amount against the total after discounts
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
    if (isProcessingTransaction) return

    if (!validateTransaction()) return

    setIsProcessingTransaction(true)

    try {
      // Calculate total amount before discounts
      const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)

      // Calculate final amount after all discounts (both product and member discounts)
      const finalAmount = totalAmount - totalDiscount

      // Prepare transaction items according to backend structure
      const transactionItems: TransactionItem[] = cart.map((item) => {
        const batch = item.batches?.find((b) => b.id === item.batchId)

        if (!batch) {
          throw new Error(`No valid batch found for product ${item.name}`)
        }

        return {
          productId: item.id,
          quantity: item.quantity,
          unitId: item.unitId || '', // Ensure unit ID is provided in product data
          cost: batch.buyPrice,
          pricePerUnit: item.price,
          subtotal: item.finalPrice, // Price after product-specific discount
          batchId: batch.id,
          discountId: item.selectedDiscount?.id || null
        }
      })

      // Prepare complete transaction data
      const transactionData: TransactionData = {
        cashierId: user?.id || '',
        memberId: member?.id,
        selectedMemberDiscountId: selectedMemberDiscount?.id || null,
        totalAmount,
        finalAmount,
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? paymentAmount : undefined,
        items: transactionItems
      }

      // Call transaction processing endpoint
      const response = await window.api.request(API_ENDPOINTS.TRANSACTIONS.CHECKOUT, {
        method: 'POST',
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
        // Close payment dialog
        setPaymentDialogOpen(false)
        return Promise.resolve()
      } else {
        toast.error('Transaction failed', {
          description: response.message || 'Please try again'
        })
        return Promise.reject(new Error(response.message || 'Transaction failed'))
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment processing error', {
        description: 'An unexpected error occurred. Please try again.'
      })
      return Promise.reject(error)
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  useEffect(() => {
    if (member && subtotal > 0) {
      calculatePoints(subtotal, member.id)
    } else {
      setPointsToEarn(0)
    }
  }, [subtotal, member])

  return (
    <Main>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
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
                pointsToEarn={pointsToEarn}
                memberTier={
                  member?.tier
                    ? {
                        name: member.tier.name || '',
                        multiplier: member.tier.multiplier || 1
                      }
                    : null
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed payment buttons */}
      <div className="fixed bottom-6 right-6 flex gap-2 z-10 shadow-lg">
        <Button
          className="w-32"
          size="lg"
          onClick={handleOpenPaymentDialog}
          disabled={cart.length === 0}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Payment
        </Button>

        <Button variant="destructive" size="lg" onClick={clearCart}>
          <X className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>

      {/* Payment dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        total={total}
        paymentMethod={paymentMethod}
        paymentAmount={paymentAmount}
        onPaymentMethodChange={setPaymentMethod}
        onPaymentAmountChange={setPaymentAmount}
        onPay={handlePayment}
        isPayEnabled={cart.length > 0 && paymentAmount >= total}
        isProcessing={isProcessingTransaction}
      />
    </Main>
  )
}
