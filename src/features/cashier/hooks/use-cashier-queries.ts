import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { cashierOperations } from '../actions/cashier-operations'
import {
  TransactionData,
  ProductSearchParams,
  MemberSearchParams,
  PointsCalculationParams,
  DiscountValidationParams,
  TransactionResponse
} from '@/types/cashier'

// Query keys
export const CASHIER_QUERY_KEYS = {
  products: (params: ProductSearchParams) => ['cashier', 'products', params] as const,
  members: (params: MemberSearchParams) => ['cashier', 'members', params] as const,
  points: (params: PointsCalculationParams) => ['cashier', 'points', params] as const,
  discount: (code: string) => ['cashier', 'discount', code] as const
}

// Product search hook
export function useProductSearch(params: ProductSearchParams, enabled: boolean = true) {
  return useQuery({
    queryKey: CASHIER_QUERY_KEYS.products(params),
    queryFn: () => cashierOperations.searchProducts(params),
    enabled: enabled && params.query.length >= 3 && params.query.trim().length >= 3,
    staleTime: 60000,
    gcTime: 600000,
    select: (data) => data.data || []
  })
}

// Member search hook
export function useMemberSearch(params: MemberSearchParams, enabled: boolean = true) {
  return useQuery({
    queryKey: CASHIER_QUERY_KEYS.members(params),
    queryFn: () => cashierOperations.searchMembers(params),
    enabled: enabled && params.query.length >= 3,
    staleTime: 60000,
    select: (data) => data.data?.members || []
  })
}

// Points calculation hook
export function usePointsCalculation(params: PointsCalculationParams, enabled: boolean = true) {
  return useQuery({
    queryKey: CASHIER_QUERY_KEYS.points(params),
    queryFn: () => cashierOperations.calculatePoints(params),
    enabled: enabled && params.amount > 0,
    staleTime: 30000,
    gcTime: 300000,
    select: (data) => data.points || 0
  })
}

// Discount validation hook
export function useDiscountValidation() {
  const { t } = useTranslation(['cashier'])

  return useMutation({
    mutationFn: (params: DiscountValidationParams) =>
      cashierOperations.validateDiscountCode(params),
    onError: (error) => {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error validating discount code:', error)
      toast.error(t('cashier.redeemCode.validationError'), {
        description: t('cashier.redeemCode.tryAgainLater')
      })
    }
  })
}

// Member creation hook
export function useCreateMember() {
  const { t } = useTranslation(['cashier'])
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cashierOperations.createMember,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(t('cashier.createMember.successTitle'), {
          description: t('cashier.createMember.successDescription', { name: data.data.name })
        })
        // Invalidate member search queries
        queryClient.invalidateQueries({
          queryKey: ['cashier', 'members']
        })
      } else {
        toast.error(t('cashier.createMember.errorTitle'), {
          description: data.message || t('cashier.createMember.errorDefault')
        })
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error creating member:', error)
      toast.error(t('cashier.createMember.errorTitle'), {
        description: t('cashier.createMember.errorDefault')
      })
    }
  })
}

// Transaction processing hook
export function useProcessTransaction() {
  const { t } = useTranslation(['cashier'])
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transactionData: TransactionData) =>
      cashierOperations.processTransaction(transactionData),
    onSuccess: (data: TransactionResponse) => {
      if (data.success) {
        // Invalidate relevant queries after successful transaction
        queryClient.invalidateQueries({
          queryKey: ['cashier', 'products']
        })
        queryClient.invalidateQueries({
          queryKey: ['transactions']
        })
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV) if (import.meta.env.DEV) console.error('Transaction error:', error)
      toast.error(t('cashier.errors.transactionFailed'), {
        description: t('cashier.errors.unexpectedError')
      })
    }
  })
}
