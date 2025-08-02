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
import { PrinterSettings } from '@/types/settings'
import { useAuthStore } from '@/stores/authStore'
import { useProcessTransaction } from './use-cashier-queries'
import { isDiscountValid } from '../utils/cashier-utils'
import { generateReceiptData } from '@/utils/receipt-data'
import { generateReceiptHTML } from '@/utils/receipt-html'
import { transactionOperations } from '@/features/transactions/actions/transaction-operations'
import { useSettings } from '@/features/settings/hooks/use-settings'

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
  const { settings } = useSettings()
  const { user } = useAuthStore()
  const processTransactionMutation = useProcessTransaction()

  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>('cash')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    success: false
  })
  const [isRetryingPrint, setIsRetryingPrint] = useState(false)

  // Custom payment method setter to handle non-cash payment amounts
  const setPaymentMethod = useCallback(
    (method: PaymentMethod) => {
      setPaymentMethodState(method)

      // Auto-set payment amount for non-cash methods
      if (method !== 'cash') {
        setPaymentAmount(total)
      } else {
        // Reset to 0 for cash payments to allow manual input
        setPaymentAmount(0)
      }
    },
    [total]
  )

  const isProcessingTransaction = processTransactionMutation.isPending

  const validateTransaction = useCallback((): boolean => {
    if (cart.length === 0) {
      toast.error(t('cashier.validation.emptyCart'), {
        description: t('cashier.validation.emptyCartDescription')
      })
      return false
    }

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

    if (paymentMethod === 'cash' && paymentAmount < total) {
      toast.error(t('cashier.validation.insufficientPayment'), {
        description: t('cashier.validation.insufficientPaymentDescription', {
          amount: total.toLocaleString()
        })
      })
      return false
    }

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

    if (selectedMemberDiscount && !isDiscountValid(selectedMemberDiscount, false)) {
      toast.error(t('cashier.validation.invalidMemberDiscount'), {
        description: t('cashier.validation.invalidMemberDiscountDescription', {
          discount: selectedMemberDiscount.name
        })
      })
      return false
    }

    if (selectedTierDiscount && !isDiscountValid(selectedTierDiscount, false)) {
      toast.error(t('cashier.validation.invalidTierDiscount'), {
        description: t('cashier.validation.invalidTierDiscountDescription', {
          discount: selectedTierDiscount.name
        })
      })
      return false
    }

    return true
  }, [cart, paymentAmount, total, selectedMemberDiscount, selectedTierDiscount, paymentMethod, t])

  const printReceiptAfterTransaction = useCallback(
    async (transactionId: string) => {
      try {
        const detailResponse = await transactionOperations.fetchItemDetail(transactionId)

        if (!detailResponse.success || !detailResponse.data) {
          return
        }

        const transactionDetail = detailResponse.data

        const printerSettingsResponse = await window.api.printer.getSettings()
        const printerSettings = printerSettingsResponse.success
          ? (printerSettingsResponse.data as PrinterSettings)
          : undefined

        const receiptData = generateReceiptData(transactionDetail, settings.general.storeInfo)
        const receiptHTML = generateReceiptHTML(
          receiptData,
          printerSettings,
          settings.general.footerInfo
        )
        const response = await window.api.printer.printHTML(receiptHTML)

        if (response.success) {
          toast.success(t('cashier.paymentStatus.printSuccess'), {
            description: t('cashier.paymentStatus.printSuccessDescription')
          })
        } else {
          const errorMessage = response.error?.message || t('cashier.paymentStatus.printError')
          toast.error(t('cashier.paymentStatus.printError'), {
            description: errorMessage
          })
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('cashier.paymentStatus.printError')
        toast.error(t('cashier.paymentStatus.printError'), {
          description: errorMessage
        })
      }
    },
    [settings.general.storeInfo, settings.general.footerInfo, t]
  )

  const retryPrintReceipt = useCallback(async (): Promise<void> => {
    if (!paymentStatus.internalId || isRetryingPrint) return

    setIsRetryingPrint(true)

    try {
      await printReceiptAfterTransaction(paymentStatus.internalId)
      // printReceiptAfterTransaction already handles success/error toasts
    } catch {
      // printReceiptAfterTransaction already handles error toasts
    } finally {
      setIsRetryingPrint(false)
    }
  }, [paymentStatus.internalId, isRetryingPrint, printReceiptAfterTransaction])

  const handlePayment = useCallback(async (): Promise<void> => {
    if (isProcessingTransaction || !validateTransaction()) return

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
          internalId: result.data.id,
          change: change > 0 ? change : undefined
        })

        if (result.data.id) {
          printReceiptAfterTransaction(result.data.id)
        }
      } else {
        setPaymentStatus({
          success: false,
          errorMessage: result.message || t('cashier.paymentStatus.errorDefault')
        })
      }

      setPaymentDialogOpen(false)
      setPaymentStatusDialogOpen(true)
    } catch (error) {
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
    printReceiptAfterTransaction,
    t
  ])

  const handleStatusDialogClose = useCallback(() => {
    setPaymentStatusDialogOpen(false)
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
    isRetryingPrint,
    setPaymentMethod,
    setPaymentAmount,
    setPaymentDialogOpen,
    handlePayment,
    handleStatusDialogClose,
    retryPrintReceipt
  }
}
