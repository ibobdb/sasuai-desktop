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
  const [inputFocused, setInputFocused] = useState(false)
  const [amountString, setAmountString] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const getFormattedInputValue = (): string => {
    if (!amountString) return ''
    const numericValue = parseInt(amountString, 10)
    return numericValue.toLocaleString('id-ID')
  }

  useEffect(() => {
    if (isDialogOpen) {
      setAmountString('')
      onPaymentAmountChange(0)
    }
  }, [isDialogOpen, onPaymentAmountChange])

  useEffect(() => {
    if (isDialogOpen) {
      setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus()
          setInputFocused(true)
          const len = inputRef.current.value.length
          inputRef.current.setSelectionRange(len, len)
        }
      }, 150)
    }
  }, [isDialogOpen])

  useEffect(() => {
    if (externalAmount !== undefined) {
      if (externalAmount === 0) {
        setAmountString('')
      } else {
        setAmountString(externalAmount.toString())
      }
    }
  }, [externalAmount])

  const handleKeypadInput = (value: string) => {
    if (value === 'backspace') {
      const newValue = amountString.slice(0, -1)
      setAmountString(newValue)
      onPaymentAmountChange(parseInt(newValue || '0', 10))
    } else if (value === 'clear') {
      setAmountString('')
      onPaymentAmountChange(0)
    } else {
      let newValue = amountString
      if (newValue === '0' && value !== '0') {
        newValue = value
      } else if (newValue === '') {
        newValue = value === '0' ? '' : value
      } else {
        newValue = newValue + value
      }
      setAmountString(newValue)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d]/g, '')
    let newValue = inputValue
    if (newValue.length > 0 && newValue[0] === '0') {
      newValue = newValue.substring(1)
    }
    setAmountString(newValue)
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
        <Label htmlFor="paymentAmount" className={cn(inputFocused ? 'text-primary' : '')}>
          {t('cashier.payment.paymentAmount')}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground text-2xl">
            Rp
          </div>
          <Input
            ref={inputRef}
            id="paymentAmount"
            value={getFormattedInputValue()}
            onChange={handleInputChange}
            onFocus={() => {
              setInputFocused(true)
              setTimeout(() => {
                if (inputRef.current) {
                  const len = inputRef.current.value.length
                  inputRef.current.setSelectionRange(len, len)
                }
              }, 0)
            }}
            onBlur={() => setInputFocused(false)}
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
              onClick={() => handleKeypadInput(num.toString())}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-16 text-2xl font-semibold hover:bg-primary/10"
            onClick={() => handleKeypadInput('0')}
          >
            0
          </Button>
          <Button
            variant="outline"
            className="h-16 text-2xl font-semibold hover:bg-primary/10"
            onClick={() => handleKeypadInput('000')}
          >
            000
          </Button>
          <Button
            variant="outline"
            className="h-16 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleKeypadInput('backspace')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2">
          <Button
            variant="ghost"
            className="h-12 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleKeypadInput('clear')}
          >
            <Delete className="mr-2 h-4 w-4" /> {t('cashier.actions.clear')}
          </Button>
        </div>
      </div>
    </div>
  )
}
