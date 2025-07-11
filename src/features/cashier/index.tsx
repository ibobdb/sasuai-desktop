import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import ProductSearch from './components/product-search'
import CartList from './components/cart-list'
import TransactionSummary from './components/summary'
import PaymentDialog from './components/payment-dialog'
import { PaymentStatusDialog } from './components/payment-status-dialog'
import { MemberSection } from './components/member-section'
import { RedeemCodeSection } from './components/redeem-code-section'
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
  TransactionItem
} from '@/types/cashier'
import { isDiscountValid } from './utils'

export default function Cashier() {
  const { t } = useTranslation(['cashier'])
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [member, setMember] = useState<Member | null>(null)
  const [selectedMemberDiscount, setSelectedMemberDiscount] = useState<Discount | null>(null)
  const [selectedTierDiscount, setSelectedTierDiscount] = useState<Discount | null>(null)
  const [globalDiscount, setGlobalDiscount] = useState<Discount | null>(null)
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [pointsToEarn, setPointsToEarn] = useState<number>(0)
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<{
    success: boolean
    transactionId?: string
    change?: number
    errorMessage?: string
  }>({
    success: false
  })
  const { user } = useAuthStore()

  // Calculate cart totals with discounts
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const productDiscountsTotal = cart.reduce((sum, item) => sum + item.discountAmount, 0)

  // Calculate member discount amount if applicable
  const memberDiscountAmount = selectedMemberDiscount
    ? selectedMemberDiscount.type === 'PERCENTAGE'
      ? (subtotal - productDiscountsTotal) * (selectedMemberDiscount.value / 100)
      : Math.min(selectedMemberDiscount.value, subtotal - productDiscountsTotal)
    : 0

  // Calculate tier discount amount if applicable
  const tierDiscountAmount = selectedTierDiscount
    ? selectedTierDiscount.type === 'PERCENTAGE'
      ? (subtotal - productDiscountsTotal) * (selectedTierDiscount.value / 100)
      : Math.min(selectedTierDiscount.value, subtotal - productDiscountsTotal)
    : 0

  // Calculate global discount amount if applicable
  const globalDiscountAmount = globalDiscount
    ? globalDiscount.type === 'PERCENTAGE'
      ? (subtotal - productDiscountsTotal) * (globalDiscount.value / 100)
      : Math.min(globalDiscount.value, subtotal - productDiscountsTotal)
    : 0

  // Only apply one type of discount (member, tier, or global)
  const totalGeneralDiscount =
    memberDiscountAmount > 0
      ? memberDiscountAmount
      : tierDiscountAmount > 0
        ? tierDiscountAmount
        : globalDiscountAmount
  const totalDiscount = productDiscountsTotal + totalGeneralDiscount
  const tax = 0 // Implement tax calculation if needed
  const total = subtotal - totalDiscount

  // Function to calculate points
  const calculatePoints = useCallback(
    async (amount: number, memberId?: string) => {
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
        toast.error(t('cashier.errors.calculatePoints'), {
          description: t('cashier.errors.calculatePointsDescription')
        })
      }
    },
    [t]
  )

  const handleOpenPaymentDialog = () => {
    setPaymentDialogOpen(true)
  }

  // Add to cart function - modify to accept quantity parameter
  const addToCart = (product: Product, quantity: number = 1) => {
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
                quantity: item.quantity + quantity,
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
          quantity: quantity,
          subtotal: product.price * quantity,
          batchId: batch?.id,
          unitId: product.unitId || '',
          selectedDiscount: null,
          discountAmount: 0,
          finalPrice: product.price * quantity
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

    if (discount.type === 'PERCENTAGE') {
      return itemTotal * (discount.value / 100)
    } else {
      return Math.min(discount.value, itemTotal)
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
  const handleMemberSelect = (selectedMember: Member | null) => {
    setMember(selectedMember)

    // Reset discounts when changing members
    setSelectedMemberDiscount(null)
    setSelectedTierDiscount(null)
    setGlobalDiscount(null)

    if (selectedMember) {
      // Check if member has personal discounts
      const memberDiscounts = (selectedMember.discounts || []).filter(isDiscountValid)

      // Check if tier has discounts
      const tierDiscounts = (selectedMember.tier?.discounts || []).filter(isDiscountValid)

      // Auto-select member personal discount if only one is available and meets minimum purchase
      if (memberDiscounts.length === 1 && subtotal >= memberDiscounts[0].minPurchase) {
        setSelectedMemberDiscount(memberDiscounts[0])
      }
      // Otherwise, auto-select tier discount if only one is available and meets minimum purchase
      else if (tierDiscounts.length === 1 && subtotal >= tierDiscounts[0].minPurchase) {
        setSelectedTierDiscount(tierDiscounts[0])
      }
    }
  }

  // Handle member discount selection
  const handleMemberDiscountSelect = (discount: Discount | null) => {
    // Check if this is a tier discount
    const isTierDiscount = member?.tier?.discounts?.some((d) => d.id === discount?.id)

    if (isTierDiscount) {
      setSelectedTierDiscount(discount)
      setSelectedMemberDiscount(null) // Clear member personal discount
    } else {
      setSelectedMemberDiscount(discount)
      setSelectedTierDiscount(null) // Clear tier discount
    }

    // Clear global discount if any member discount is selected
    if (discount) {
      setGlobalDiscount(null)
    }
  }

  // Handle global discount code application
  const handleGlobalDiscountApply = (discount: Discount | null) => {
    setGlobalDiscount(discount)

    // Clear member and tier discounts if global discount is applied
    if (discount) {
      setSelectedMemberDiscount(null)
      setSelectedTierDiscount(null)
    }
  }

  // Clear cart and reset transaction state
  const clearCart = () => {
    setCart([])
    setPaymentAmount(0)
    setMember(null)
    setSelectedMemberDiscount(null)
    setSelectedTierDiscount(null)
    setGlobalDiscount(null)
  }

  // Validate transaction before processing
  const validateTransaction = (): boolean => {
    // Check if cart has items
    if (cart.length === 0) {
      toast.error(t('cashier.validation.emptyCart'), {
        description: t('cashier.validation.emptyCartDescription')
      })
      return false
    }

    // Check stock levels
    const invalidStockItem = cart.find((item) => item.quantity > (item.currentStock || 0))

    if (invalidStockItem) {
      toast.error(t('cashier.validation.insufficientStock'), {
        description: t('cashier.validation.insufficientStockDescription', {
          quantity: invalidStockItem.currentStock,
          product: invalidStockItem.name
        })
      })
      return false
    }

    // Validate payment amount against the total after discounts
    if (paymentAmount < total) {
      toast.error(t('cashier.validation.insufficientPayment'), {
        description: t('cashier.validation.insufficientPaymentDescription', {
          amount: total.toLocaleString()
        })
      })
      return false
    }

    // Validate member discount minimum purchase
    if (selectedMemberDiscount && subtotal < selectedMemberDiscount.minPurchase) {
      toast.error(t('cashier.validation.cannotApplyDiscount'), {
        description: t('cashier.validation.cannotApplyDiscountDescription', {
          amount: selectedMemberDiscount.minPurchase.toLocaleString()
        })
      })
      return false
    }

    // Validate tier discount minimum purchase
    if (selectedTierDiscount && subtotal < selectedTierDiscount.minPurchase) {
      toast.error(t('cashier.validation.cannotApplyDiscount'), {
        description: t('cashier.validation.cannotApplyDiscountDescription', {
          amount: selectedTierDiscount.minPurchase.toLocaleString()
        })
      })
      return false
    }

    // Check if any selected discounts have reached usage limits
    const cartItemWithInvalidDiscount = cart.find(
      (item) => item.selectedDiscount && !isDiscountValid(item.selectedDiscount)
    )

    if (cartItemWithInvalidDiscount) {
      toast.error(t('cashier.validation.invalidDiscount'), {
        description: t('cashier.validation.invalidDiscountDescription', {
          product: cartItemWithInvalidDiscount.name,
          discount: cartItemWithInvalidDiscount.selectedDiscount?.name
        })
      })
      return false
    }

    // Check member personal discount validity
    if (selectedMemberDiscount && !isDiscountValid(selectedMemberDiscount)) {
      toast.error(t('cashier.validation.invalidMemberDiscount'), {
        description: t('cashier.validation.invalidMemberDiscountDescription', {
          discount: selectedMemberDiscount.name
        })
      })
      return false
    }

    // Check tier discount validity
    if (selectedTierDiscount && !isDiscountValid(selectedTierDiscount)) {
      toast.error(t('cashier.validation.invalidTierDiscount'), {
        description: t('cashier.validation.invalidTierDiscountDescription', {
          discount: selectedTierDiscount.name
        })
      })
      return false
    }

    // Check global discount validity
    if (globalDiscount && !isDiscountValid(globalDiscount)) {
      toast.error(t('cashier.validation.invalidGlobalDiscount'), {
        description: t('cashier.validation.invalidGlobalDiscountDescription', {
          discount: globalDiscount.name
        })
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
      const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)
      const finalAmount = totalAmount - totalDiscount

      const transactionItems: TransactionItem[] = cart.map((item) => {
        const batch = item.batches?.find((b) => b.id === item.batchId)

        if (!batch) {
          throw new Error(`No valid batch found for product ${item.name}`)
        }

        return {
          productId: item.id,
          quantity: item.quantity,
          unitId: item.unitId || '',
          cost: batch.buyPrice,
          pricePerUnit: item.price,
          subtotal: item.finalPrice,
          batchId: batch.id,
          discountId: item.selectedDiscount?.id || null
        }
      })

      // Prepare complete transaction data including tier discount
      const transactionData: TransactionData = {
        cashierId: user?.id || '',
        memberId: member?.id,
        selectedMemberDiscountId: selectedMemberDiscount?.id || null,
        selectedTierDiscountId: selectedTierDiscount?.id || null,
        globalDiscountCode: globalDiscount?.code || null,
        totalAmount,
        finalAmount,
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? paymentAmount : undefined,
        items: transactionItems
      }

      // Call transaction processing endpoint
      const response = await window.api.request(API_ENDPOINTS.TRANSACTIONS.BASE, {
        method: 'POST',
        data: transactionData
      })

      if (response.success) {
        const { data, change } = response

        // Set payment status for the dialog
        setPaymentStatus({
          success: true,
          transactionId: data.tranId,
          change
        })

        // Close payment dialog and show status dialog
        setPaymentDialogOpen(false)
        setPaymentStatusDialogOpen(true)

        return Promise.resolve()
      } else {
        // Handle failed transaction
        setPaymentStatus({
          success: false,
          errorMessage: response.message || t('cashier.errors.transactionFailed')
        })

        // Close payment dialog and show status dialog
        setPaymentDialogOpen(false)
        setPaymentStatusDialogOpen(true)

        return Promise.reject(new Error(response.message || t('cashier.errors.transactionFailed')))
      }
    } catch (error) {
      console.error('Payment error:', error)

      // Handle error
      setPaymentStatus({
        success: false,
        errorMessage: t('cashier.errors.unexpectedError')
      })

      // Close payment dialog and show status dialog
      setPaymentDialogOpen(false)
      setPaymentStatusDialogOpen(true)

      return Promise.reject(error)
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  // Handle close of payment status dialog
  const handleStatusDialogClose = () => {
    setPaymentStatusDialogOpen(false)

    // If payment was successful, clear the cart
    if (paymentStatus.success) {
      clearCart()
    }
  }

  useEffect(() => {
    if (member && subtotal > 0) {
      calculatePoints(subtotal, member.id)
    } else {
      setPointsToEarn(0)
    }
  }, [subtotal, member, calculatePoints])

  // Add global keyboard shortcut for payment (Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl+Spacebar is pressed
      if (e.ctrlKey && (e.key === ' ' || e.key === 'Space')) {
        e.preventDefault()

        // Only open payment dialog if cart is not empty
        if (cart.length > 0) {
          handleOpenPaymentDialog()
        }
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown)

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cart.length])

  return (
    <Main>
      {/* Mobile-specific layout (order: Product search → Cart → Member → Summary) */}
      <div className="block lg:hidden space-y-4">
        {/* 1. Product Search */}
        <ProductSearch onProductSelect={addToCart} />

        {/* 2. Shopping Cart */}
        <CartList
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onUpdateDiscount={updateItemDiscount}
        />

        {/* 3. Member Section */}
        <MemberSection
          onMemberSelect={handleMemberSelect}
          onMemberDiscountSelect={handleMemberDiscountSelect}
          selectedDiscount={selectedMemberDiscount || selectedTierDiscount}
          subtotal={subtotal}
          member={member}
        />

        {/* 3.5 Redeem Code Section - Only if member is selected */}
        {member && (
          <RedeemCodeSection
            onApplyDiscount={handleGlobalDiscountApply}
            appliedDiscount={globalDiscount}
            disabled={!!selectedMemberDiscount || !!selectedTierDiscount}
            disabledReason={t('cashier.redeemCode.memberDiscountAlreadyApplied')}
            subtotal={subtotal}
          />
        )}

        {/* 4. Transaction Summary */}
        <Card>
          <CardContent className="pt-4">
            <TransactionSummary
              itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
              subtotal={subtotal}
              productDiscounts={productDiscountsTotal}
              memberDiscount={memberDiscountAmount}
              tierDiscount={tierDiscountAmount}
              globalDiscount={globalDiscountAmount}
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

        {/* 5. Mobile-specific payment buttons (non-fixed) */}
        <div className="mt-4 mb-6">
          <div className="flex gap-2">
            <Button variant="destructive" size="lg" onClick={clearCart} tabIndex={4}>
              <X className="mr-2 h-4 w-4" />
              {t('cashier.actions.clearCart')}
            </Button>

            <Button
              size="lg"
              onClick={handleOpenPaymentDialog}
              disabled={cart.length === 0}
              tabIndex={3}
              className="bg-primary hover:bg-primary/90"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {t('cashier.actions.payment')}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop layout (unchanged) */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
        {/* Left side - Products and Cart */}
        <div className="lg:col-span-2 space-y-4">
          <ProductSearch onProductSelect={addToCart} />
          <CartList
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onUpdateDiscount={updateItemDiscount}
          />
        </div>

        {/* Right side - Member and Summary */}
        <div className="space-y-4">
          <div className="sticky top-4">
            <MemberSection
              onMemberSelect={handleMemberSelect}
              onMemberDiscountSelect={handleMemberDiscountSelect}
              selectedDiscount={selectedMemberDiscount || selectedTierDiscount}
              subtotal={subtotal}
              member={member}
            />

            {/* Add Redeem Code Section - Only if member is selected */}
            {member && (
              <div className="mt-3">
                <RedeemCodeSection
                  onApplyDiscount={handleGlobalDiscountApply}
                  appliedDiscount={globalDiscount}
                  disabled={!!selectedMemberDiscount || !!selectedTierDiscount}
                  disabledReason={t('cashier.redeemCode.memberDiscountAlreadyApplied')}
                  subtotal={subtotal}
                />
              </div>
            )}

            <Card className="mt-4">
              <CardContent className="pt-6">
                <TransactionSummary
                  itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                  subtotal={subtotal}
                  productDiscounts={productDiscountsTotal}
                  memberDiscount={memberDiscountAmount}
                  tierDiscount={tierDiscountAmount}
                  globalDiscount={globalDiscountAmount}
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
      </div>

      {/* Fixed payment buttons (desktop only) */}
      <div className="hidden lg:block fixed bottom-0 right-0 left-0 p-4 z-20 bg-background border-t shadow-lg md:bg-transparent md:border-none md:shadow-none md:left-auto md:p-6">
        <div className="flex gap-2 justify-end">
          <Button
            variant="destructive"
            size="lg"
            onClick={clearCart}
            tabIndex={4}
            className="w-full md:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t('cashier.actions.clear')}</span>
            <span className="md:hidden">{t('cashier.actions.clearCart')}</span>
          </Button>

          <Button
            size="lg"
            onClick={handleOpenPaymentDialog}
            disabled={cart.length === 0}
            tabIndex={3}
            className="w-full md:w-auto bg-primary hover:bg-primary/90"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t('cashier.actions.payment')}</span>
            <span className="md:hidden">
              {t('cashier.actions.pay')} {total > 0 ? `(Rp ${total.toLocaleString('id-ID')})` : ''}
            </span>
          </Button>
        </div>
      </div>

      {/* Dialogs */}
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

      <PaymentStatusDialog
        open={paymentStatusDialogOpen}
        onClose={handleStatusDialogClose}
        success={paymentStatus.success}
        transactionId={paymentStatus.transactionId}
        paymentMethod={paymentMethod}
        change={paymentStatus.change}
        paymentAmount={paymentAmount}
        errorMessage={paymentStatus.errorMessage}
        memberInfo={member ? { member } : undefined}
      />
    </Main>
  )
}
