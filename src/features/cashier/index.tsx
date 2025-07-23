import { useEffect, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import ProductSearch from './components/product-search'
import CartList from './components/cart-list'
import TransactionSummary from './components/summary'
import PaymentDialog from './components/payment-dialog'
import { PaymentStatusDialog } from './components/payment-status-dialog'
import { MemberSection } from './components/member-section'
import { RedeemCodeSection } from './components/redeem-code-section'
import { Button } from '@/components/ui/button'
import { CreditCard, X } from 'lucide-react'
import { useCart } from './hooks/use-cart'
import { useMemberDiscounts } from './hooks/use-member-discounts'
import { useGlobalDiscount } from './hooks/use-global-discount'
import { useTransaction } from './hooks/use-transaction'
import { useCashierCalculations } from './hooks/use-cashier-calculations'
import { usePointsCalculation } from './hooks/use-cashier-queries'
import { useGlobalShortcuts } from '@/hooks/use-global-shortcuts'
import { Member, Discount } from '@/types/cashier'

function Cashier() {
  const { t } = useTranslation(['cashier'])
  const productSearchRef = useRef<HTMLInputElement>(null)

  // Core hooks
  const cart = useCart()
  const memberDiscounts = useMemberDiscounts()
  const globalDiscount = useGlobalDiscount()

  // Calculations
  const calculations = useCashierCalculations(
    cart.subtotal,
    cart.productDiscountsTotal,
    memberDiscounts.selectedMemberDiscount,
    memberDiscounts.selectedTierDiscount,
    globalDiscount.globalDiscount
  )

  // Points calculation - should be based on subtotal, not final total
  const { data: pointsToEarn = 0 } = usePointsCalculation(
    {
      amount: calculations.subtotal, // Use subtotal instead of total
      memberId: memberDiscounts.selectedMember?.id
    },
    calculations.subtotal > 0 && !!memberDiscounts.selectedMember
  )

  // Transaction handling
  const transaction = useTransaction(
    cart.cart,
    calculations.total,
    calculations.totalDiscount,
    memberDiscounts.selectedMemberDiscount,
    memberDiscounts.selectedTierDiscount,
    globalDiscount.globalDiscount,
    memberDiscounts.selectedMember?.id
  )

  // Keyboard shortcuts handlers
  const shortcutHandlers = {
    'focus-product-search': () => {
      productSearchRef.current?.focus()
    },
    'open-payment-dialog': () => {
      if (cart.cart.length === 0) {
        return
      }
      handleOpenPaymentDialog()
    },
    'clear-cart': () => {
      if (cart.cart.length === 0) {
        return
      }
      clearAll()
    },
    'search-member': () => {
      // Focus to member search input
      const memberSearchInput = document.querySelector(
        '[data-member-search-input]'
      ) as HTMLInputElement
      if (memberSearchInput) {
        memberSearchInput.focus()
      }
    },
    'add-discount': () => {
      // Focus to discount/redeem code section
      const redeemInput = document.querySelector('[data-redeem-input]') as HTMLInputElement
      if (redeemInput) {
        redeemInput.focus()
      }
    },
    'quick-payment': () => {
      if (cart.cart.length === 0) {
        return
      }
      // Auto set payment amount to total and open dialog
      transaction.setPaymentAmount(calculations.total)
      handleOpenPaymentDialog()
    },
    'execute-transaction': () => {
      if (cart.cart.length === 0) {
        return
      }

      // Check if payment dialog is open
      if (transaction.paymentDialogOpen) {
        // Execute payment if dialog is open and payment is valid
        if (transaction.paymentAmount >= calculations.total) {
          transaction.handlePayment()
        }
      } else {
        // Open payment dialog with current total
        transaction.setPaymentAmount(calculations.total)
        handleOpenPaymentDialog()
      }
    },
    'void-transaction': () => {
      if (cart.cart.length === 0) {
        return
      }
      clearAll()
    }
  }

  // Initialize global shortcuts
  useGlobalShortcuts(shortcutHandlers)

  // Clear cart and reset transaction state
  const clearAll = () => {
    cart.clearCart()
    memberDiscounts.clearMemberData()
    globalDiscount.clearGlobalDiscount()
    transaction.setPaymentAmount(0)
  }

  const handleOpenPaymentDialog = () => {
    transaction.setPaymentDialogOpen(true)
  }

  // Handle member selection with discount reset
  const handleMemberSelect = (member: Member | null) => {
    memberDiscounts.handleMemberSelect(member)
    if (member) {
      globalDiscount.clearGlobalDiscount()
    }
  }

  // Handle member discount selection with global discount reset
  const handleMemberDiscountSelect = (discount: Discount | null) => {
    memberDiscounts.handleMemberDiscountSelect(discount)
    if (discount) {
      globalDiscount.clearGlobalDiscount()
    }
  }

  // Handle global discount application with member discount reset
  const handleGlobalDiscountApply = (discount: Discount | null) => {
    globalDiscount.setGlobalDiscount(discount)
    if (discount) {
      memberDiscounts.handleMemberDiscountSelect(null)
    }
  }

  // Auto-set payment amount when total changes
  useEffect(() => {
    if (calculations.total > 0 && transaction.paymentMethod === 'cash') {
      transaction.setPaymentAmount(calculations.total)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculations.total, transaction.paymentMethod])

  // Handle successful payment
  const handleStatusDialogClose = () => {
    transaction.handleStatusDialogClose()
    if (transaction.paymentStatus.success) {
      clearAll()
    }
  }

  return (
    <Main>
      <div className="flex flex-col lg:flex-row gap-6 pb-20 lg:pb-6">
        {/* Left Panel - Product Search & Cart */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t('cashier.productSearch.title')}</h3>
            <ProductSearch onProductSelect={cart.addToCart} inputRef={productSearchRef} />
          </div>

          <CartList
            items={cart.cart}
            onUpdateQuantity={cart.updateQuantity}
            onRemoveItem={cart.removeItem}
            onUpdateDiscount={cart.updateItemDiscount}
          />
        </div>

        {/* Right Panel - Transaction Details */}
        <div className="w-full lg:w-96 space-y-6">
          <MemberSection
            onMemberSelect={handleMemberSelect}
            onMemberDiscountSelect={handleMemberDiscountSelect}
            selectedDiscount={
              memberDiscounts.selectedMemberDiscount || memberDiscounts.selectedTierDiscount
            }
            subtotal={calculations.subtotal}
            member={memberDiscounts.selectedMember}
          />

          <RedeemCodeSection
            onApplyDiscount={handleGlobalDiscountApply}
            appliedDiscount={globalDiscount.globalDiscount}
            disabled={
              !!(memberDiscounts.selectedMemberDiscount || memberDiscounts.selectedTierDiscount)
            }
            disabledReason={
              memberDiscounts.selectedMemberDiscount
                ? t('cashier.redeemCode.memberDiscountActive')
                : memberDiscounts.selectedTierDiscount
                  ? t('cashier.redeemCode.tierDiscountActive')
                  : undefined
            }
            subtotal={calculations.subtotal}
          />

          <TransactionSummary
            itemCount={cart.cart.length}
            subtotal={calculations.subtotal}
            productDiscounts={calculations.productDiscountsTotal}
            memberDiscount={calculations.memberDiscountAmount}
            tierDiscount={calculations.tierDiscountAmount}
            globalDiscount={calculations.globalDiscountAmount}
            tax={0}
            total={calculations.total}
            pointsToEarn={pointsToEarn}
          />

          {cart.cart.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                {t('cashier.actions.clear')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Payment Button */}
      <div className="hidden lg:block fixed bottom-0 right-0 left-0 p-4 z-20 bg-background border-t shadow-lg md:bg-transparent md:border-none md:shadow-none md:left-auto md:p-6">
        <div className="flex gap-2 justify-end">
          <Button
            size="lg"
            onClick={handleOpenPaymentDialog}
            disabled={cart.cart.length === 0}
            tabIndex={3}
            className="w-full md:w-auto bg-primary hover:bg-primary/90"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t('cashier.actions.payment')}</span>
            <span className="md:hidden">
              {t('cashier.actions.pay')}{' '}
              {calculations.total > 0 ? `(Rp ${calculations.total.toLocaleString('id-ID')})` : ''}
            </span>
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <PaymentDialog
        open={transaction.paymentDialogOpen}
        onOpenChange={transaction.setPaymentDialogOpen}
        total={calculations.total}
        paymentMethod={transaction.paymentMethod}
        paymentAmount={transaction.paymentAmount}
        onPaymentMethodChange={transaction.setPaymentMethod}
        onPaymentAmountChange={transaction.setPaymentAmount}
        onPay={transaction.handlePayment}
        isPayEnabled={cart.cart.length > 0 && transaction.paymentAmount >= calculations.total}
        isProcessing={transaction.isProcessingTransaction}
      />

      <PaymentStatusDialog
        open={transaction.paymentStatusDialogOpen}
        onClose={handleStatusDialogClose}
        success={transaction.paymentStatus.success}
        transactionId={transaction.paymentStatus.transactionId}
        paymentMethod={transaction.paymentMethod}
        change={transaction.paymentStatus.change}
        paymentAmount={transaction.paymentAmount}
        errorMessage={transaction.paymentStatus.errorMessage}
        memberInfo={
          memberDiscounts.selectedMember ? { member: memberDiscounts.selectedMember } : undefined
        }
      />
    </Main>
  )
}

export default memo(Cashier)
