import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  PaymentMethod,
  CartItem,
  Discount,
  TransactionItem,
  TransactionData,
  PaymentStatus,
  UseTransactionReturn
} from '@/types/cashier'
import { useAuthStore } from '@/stores/authStore'
import { useProcessTransaction } from './use-cashier-queries'
import { isDiscountValid } from '../utils/cashier-utils'

export function useTransaction(
  cart: CartItem[],
  total: number,
  totalDiscount: number,
  selectedMemberDiscount: Discount | null,
  selectedTierDiscount: Discount | null,
  globalDiscount: Discount | null,
  memberId?: string
): UseTransactionReturn {
  const { t } = useTranslation(['cashier'])
  const { user } = useAuthStore()
  const processTransactionMutation = useProcessTransaction()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    success: false
  })

  const isProcessingTransaction = processTransactionMutation.isPending

  // Validate transaction before processing
  const validateTransaction = useCallback((): boolean => {
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

    // Check if any selected discounts are still valid (expired/usage limit)
    const cartItemWithInvalidDiscount = cart.find(
      (item) => item.selectedDiscount && !isDiscountValid(item.selectedDiscount, false)
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

    // Check member personal discount validity (expired/usage limit)
    if (selectedMemberDiscount && !isDiscountValid(selectedMemberDiscount, false)) {
      toast.error(t('cashier.validation.invalidMemberDiscount'), {
        description: t('cashier.validation.invalidMemberDiscountDescription', {
          discount: selectedMemberDiscount.name
        })
      })
      return false
    }

    // Check tier discount validity (expired/usage limit)
    if (selectedTierDiscount && !isDiscountValid(selectedTierDiscount, false)) {
      toast.error(t('cashier.validation.invalidTierDiscount'), {
        description: t('cashier.validation.invalidTierDiscountDescription', {
          discount: selectedTierDiscount.name
        })
      })
      return false
    }

    return true
  }, [cart, paymentAmount, total, selectedMemberDiscount, selectedTierDiscount, t])

  // Handle payment processing
  const handlePayment = useCallback(async (): Promise<void> => {
    if (isProcessingTransaction) return

    if (!validateTransaction()) return

    try {
      const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)
      const finalAmount = totalAmount - totalDiscount

      const transactionItems: TransactionItem[] = cart.map((item) => {
        const batch = item.batches?.find((b) => b.id === item.batchId)

        if (!batch) {
          throw new Error(`Batch not found for product ${item.name}`)
        }

        return {
          productId: item.id,
          quantity: item.quantity,
          unitId: item.unitId,
          cost: batch.buyPrice * item.quantity,
          pricePerUnit: item.price,
          subtotal: item.subtotal,
          batchId: item.batchId || '',
          discountId: item.selectedDiscount?.id || null
        }
      })

      const transactionData: TransactionData = {
        cashierId: user?.id || '',
        memberId: memberId || null,
        selectedMemberDiscountId: selectedMemberDiscount?.id || null,
        selectedTierDiscountId: selectedTierDiscount?.id || null,
        globalDiscountCode: globalDiscount?.code || null,
        totalAmount,
        finalAmount,
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? paymentAmount : undefined,
        items: transactionItems
      }

      const result = await processTransactionMutation.mutateAsync(transactionData)

      if (result.success) {
        const change = paymentMethod === 'cash' ? paymentAmount - finalAmount : 0

        setPaymentStatus({
          success: true,
          transactionId: result.data.tranId,
          change: change > 0 ? change : undefined
        })
      } else {
        setPaymentStatus({
          success: false,
          errorMessage: result.message || t('cashier.paymentStatus.errorDefault')
        })
      }

      setPaymentDialogOpen(false)
      setPaymentStatusDialogOpen(true)
    } catch (error) {
      console.error('Transaction error:', error)
      setPaymentStatus({
        success: false,
        errorMessage:
          error instanceof Error ? error.message : t('cashier.paymentStatus.errorDefault')
      })
      setPaymentDialogOpen(false)
      setPaymentStatusDialogOpen(true)
    }
  }, [
    isProcessingTransaction,
    validateTransaction,
    cart,
    totalDiscount,
    user?.id,
    memberId,
    selectedMemberDiscount?.id,
    selectedTierDiscount?.id,
    globalDiscount?.code,
    paymentMethod,
    paymentAmount,
    processTransactionMutation,
    t
  ])

  const handleStatusDialogClose = useCallback(() => {
    setPaymentStatusDialogOpen(false)
    // Reset payment status after closing
    setTimeout(() => {
      setPaymentStatus({ success: false })
    }, 500)
  }, [])

  return {
    paymentMethod,
    paymentAmount,
    paymentDialogOpen,
    paymentStatusDialogOpen,
    paymentStatus,
    isProcessingTransaction,
    setPaymentMethod,
    setPaymentAmount,
    setPaymentDialogOpen,
    handlePayment,
    handleStatusDialogClose
  }
}
