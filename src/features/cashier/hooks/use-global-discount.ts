import { useState, useCallback } from 'react'
import { Discount } from '@/types/cashier'

export interface UseGlobalDiscountReturn {
  globalDiscount: Discount | null
  setGlobalDiscount: (discount: Discount | null) => void
  clearGlobalDiscount: () => void
}

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
