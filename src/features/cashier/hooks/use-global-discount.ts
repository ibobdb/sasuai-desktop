import { useState, useCallback } from 'react'
import { Discount, UseGlobalDiscountReturn } from '@/types/cashier'

export function useGlobalDiscount(): UseGlobalDiscountReturn {
  const [globalDiscount, setGlobalDiscount] = useState<Discount | null>(null)

  const clearGlobalDiscount = useCallback(() => {
    setGlobalDiscount(null)
  }, [])

  return {
    globalDiscount,
    setGlobalDiscount,
    clearGlobalDiscount
  }
}
