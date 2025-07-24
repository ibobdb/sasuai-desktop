import { useState, useCallback, useMemo } from 'react'
import { Product, CartItem, Discount, UseCartReturn } from '@/types/cashier'

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>([])

  const calculateDiscountAmount = useCallback(
    (price: number, quantity: number, discount: Discount | null | undefined) => {
      if (!discount) return 0

      const itemTotal = price * quantity

      if (discount.type === 'PERCENTAGE') {
        return itemTotal * (discount.value / 100)
      } else {
        return Math.min(discount.value, itemTotal)
      }
    },
    []
  )

  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      const batch =
        product.batches && product.batches.length > 0
          ? product.batches.find((b) => b.remainingQuantity > 0)
          : null

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id)

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity
          const newSubtotal = newQuantity * existingItem.price
          const newDiscountAmount = calculateDiscountAmount(
            existingItem.price,
            newQuantity,
            existingItem.selectedDiscount
          )

          return prevCart.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: newQuantity,
                  subtotal: newSubtotal,
                  finalPrice: newSubtotal - newDiscountAmount,
                  discountAmount: newDiscountAmount
                }
              : item
          )
        }

        const itemSubtotal = product.price * quantity
        return [
          ...prevCart,
          {
            ...product,
            quantity,
            subtotal: itemSubtotal,
            batchId: batch?.id,
            unitId: product.unitId || '',
            selectedDiscount: null,
            discountAmount: 0,
            finalPrice: itemSubtotal
          }
        ]
      })
    },
    [calculateDiscountAmount]
  )

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
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
    },
    [calculateDiscountAmount]
  )

  const updateItemDiscount = useCallback(
    (id: string, discount: Discount | null) => {
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
    },
    [calculateDiscountAmount]
  )

  const removeItem = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart])
  const productDiscountsTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.discountAmount, 0),
    [cart]
  )
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

  return {
    cart,
    addToCart,
    updateQuantity,
    updateItemDiscount,
    removeItem,
    clearCart,
    subtotal,
    productDiscountsTotal,
    totalItems
  }
}
