import { useState } from 'react'
import { Main } from '@/components/layout/main'
import ProductSearch from './components/product-search'
import CartList from './components/cart-list'
import DiscountSection from './components/discount-section'
import TransactionSummary from './components/summary'
import PaymentSection from './components/payment-section'
import ActionButtons from './components/action-buttons'
import { MemberSection } from './components/member-section'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Member } from './components/member-section'

type Product = {
  id: string
  name: string
  price: number
  barcode?: string
}

type CartItem = Product & {
  quantity: number
  subtotal: number
}

type DiscountType = 'percentage' | 'fixed'
type PaymentMethod = 'cash' | 'card' | 'e-wallet' | 'qris' | 'transfer' | 'other'

export default function Cashier() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState<number>(0)
  const [discountType, setDiscountType] = useState<DiscountType>('fixed')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [member, setMember] = useState<Member | null>(null)

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const discountValue = discountType === 'percentage' ? subtotal * (discount / 100) : discount
  const tax = 0 // Implement tax calculation if needed

  // Total discount is just the discount value (no member discount)
  const totalDiscount = discountValue
  const total = subtotal - totalDiscount + tax
  const change = paymentAmount - total

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price
              }
            : item
        )
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          subtotal: product.price
        }
      ]
    })
  }

  // Update cart item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity, subtotal: quantity * item.price } : item
      )
    )
  }

  // Remove item from cart
  const removeItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  // Clear cart and reset member
  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setPaymentAmount(0)
    setMember(null)
  }

  // Handle payment
  const handlePayment = () => {
    // Handle payment logic and API calls
    if (member) {
      // The points update logic can remain here as this is the payment handler
      console.log(`Updating points for member ${member.name}`)
      // Here you would call an API to update member points
    }

    alert('Payment successful!')
    clearCart()
  }

  // Custom footer to display member information only
  const renderMemberInfo = () => {
    if (!member) return null

    return (
      <div className="text-sm mt-2 text-muted-foreground">
        <p>
          Member: {member.name} ({member.tier?.name || 'Regular'})
        </p>
        {/* Member discount display removed */}
      </div>
    )
  }

  return (
    <Main>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <ProductSearch onProductSelect={addToCart} />
          <CartList items={cart} onUpdateQuantity={updateQuantity} onRemoveItem={removeItem} />
        </div>

        <div className="space-y-4">
          <MemberSection onMemberSelect={setMember} subtotal={subtotal} />

          <Card>
            <CardContent>
              <DiscountSection
                subtotal={subtotal}
                discount={discount}
                discountType={discountType}
                onDiscountChange={setDiscount}
                onDiscountTypeChange={setDiscountType}
              />
              <Separator className="my-4" />
              <TransactionSummary
                itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                subtotal={subtotal}
                discount={totalDiscount}
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
