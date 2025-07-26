import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Delete } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PaymentInputProps {
  onPaymentAmountChange: (amount: number) => void
  isDialogOpen: boolean
  onTabToPayButton: () => void
  externalAmount?: number
}

export default function PaymentInput({
  onPaymentAmountChange,
  isDialogOpen,
  onTabToPayButton,
  externalAmount
}: PaymentInputProps) {
  const { t } = useTranslation(['cashier'])
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [displayAmount, setDisplayAmount] = useState('')
  const [previousExternalAmount, setPreviousExternalAmount] = useState<number | undefined>(
    undefined
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const formatDisplayValue = (): string => {
    if (!displayAmount) return ''
    const numericValue = parseInt(displayAmount, 10)
    return numericValue.toLocaleString('id-ID')
  }

  // Reset input when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setDisplayAmount('')
      setPreviousExternalAmount(undefined)
      onPaymentAmountChange(0)
    }
  }, [isDialogOpen, onPaymentAmountChange])

  useEffect(() => {
    let focusTimer: NodeJS.Timeout | undefined

    if (isDialogOpen) {
      focusTimer = setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus()
          setIsInputFocused(true)
          const len = inputRef.current.value.length
          inputRef.current.setSelectionRange(len, len)
        }
      }, 150)
    }

    return () => {
      if (focusTimer) {
        clearTimeout(focusTimer)
      }
    }
  }, [isDialogOpen])

  // Handle external amount changes from quick cash buttons
  useEffect(() => {
    if (externalAmount !== undefined) {
      // Only update if externalAmount actually changed (user clicked quick cash button)
      if (externalAmount !== previousExternalAmount) {
        if (externalAmount === 0) {
          setDisplayAmount('')
        } else {
          // Update input when external amount changes (from quick cash buttons)
          setDisplayAmount(externalAmount.toString())
        }
        setPreviousExternalAmount(externalAmount)
      }
    }
  }, [externalAmount, previousExternalAmount])

  const handleKeypadClick = (value: string) => {
    if (value === 'backspace') {
      const newValue = displayAmount.slice(0, -1)
      setDisplayAmount(newValue)
      onPaymentAmountChange(parseInt(newValue || '0', 10))
    } else if (value === 'clear') {
      setDisplayAmount('')
      onPaymentAmountChange(0)
    } else {
      let newValue = displayAmount
      if (newValue === '0' && value !== '0') {
        newValue = value
      } else if (newValue === '') {
        newValue = value === '0' ? '' : value
      } else {
        newValue = newValue + value
      }
      setDisplayAmount(newValue)
      onPaymentAmountChange(parseInt(newValue || '0', 10))
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        const len = inputRef.current.value.length
        inputRef.current.setSelectionRange(len, len)
      }
    }, 0)
  }

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d]/g, '')
    let newValue = inputValue
    if (newValue.length > 0 && newValue[0] === '0') {
      newValue = newValue.substring(1)
    }
    setDisplayAmount(newValue)
    onPaymentAmountChange(parseInt(newValue || '0', 10))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      onTabToPayButton()
    }
  }

  return (
    <div className="p-6 pt-0 flex flex-col">
      <div className="space-y-2 mb-4">
        <Label htmlFor="paymentAmount" className={cn(isInputFocused ? 'text-primary' : '')}>
          {t('cashier.payment.paymentAmount')}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground text-2xl">
            Rp
          </div>
          <Input
            ref={inputRef}
            id="paymentAmount"
            value={formatDisplayValue()}
            onChange={handleManualInput}
            onFocus={() => {
              setIsInputFocused(true)
              setTimeout(() => {
                if (inputRef.current) {
                  const len = inputRef.current.value.length
                  inputRef.current.setSelectionRange(len, len)
                }
              }, 0)
            }}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleKeyDown}
            className="pl-12 text-right font-bold h-16 [&:not(:focus)]:text-2xl [&:focus]:text-2xl"
            style={{ fontSize: '1.5rem' }}
            autoFocus={false}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[400px]">
        <div className="grid grid-cols-3 gap-2 flex-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              className="h-16 text-2xl font-semibold hover:bg-primary/10"
              onClick={() => handleKeypadClick(num.toString())}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-16 text-2xl font-semibold hover:bg-primary/10"
            onClick={() => handleKeypadClick('0')}
          >
            0
          </Button>
          <Button
            variant="outline"
            className="h-16 text-2xl font-semibold hover:bg-primary/10"
            onClick={() => handleKeypadClick('000')}
          >
            000
          </Button>
          <Button
            variant="outline"
            className="h-16 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleKeypadClick('backspace')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2">
          <Button
            variant="ghost"
            className="h-12 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleKeypadClick('clear')}
          >
            <Delete className="mr-2 h-4 w-4" /> {t('cashier.actions.clear')}
          </Button>
        </div>
      </div>
    </div>
  )
}
