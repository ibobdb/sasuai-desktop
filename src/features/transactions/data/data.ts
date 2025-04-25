import {
  IconCash,
  IconCreditCard,
  IconWallet,
  IconQrcode,
  IconBuildingBank,
  IconDots
} from '@tabler/icons-react'

export const paymentMethods = [
  {
    label: 'Cash',
    value: 'cash',
    icon: IconCash
  },
  {
    label: 'Card',
    value: 'card',
    icon: IconCreditCard
  },
  {
    label: 'Debit',
    value: 'debit',
    icon: IconCreditCard
  },
  {
    label: 'E-Wallet',
    value: 'e-wallet',
    icon: IconWallet
  },
  {
    label: 'QRIS',
    value: 'qris',
    icon: IconQrcode
  },
  {
    label: 'Transfer',
    value: 'transfer',
    icon: IconBuildingBank
  },
  {
    label: 'Other',
    value: 'other',
    icon: IconDots
  }
] as const
