import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { TransactionDetail } from '@/types/transactions'
import { getTierBadgeVariant } from '@/features/member/components/member-columns'

interface TransactionHeaderProps {
  transactionDetail: TransactionDetail
}

export function TransactionHeader({ transactionDetail }: TransactionHeaderProps) {
  const { t } = useTranslation(['transactions'])

  const { cashier, member, payment } = transactionDetail
  const paymentMethod = payment?.method || transactionDetail.paymentMethod
  const date = new Date(transactionDetail.createdAt)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{t('transaction.details.dateAndTime')}</p>
          <p className="font-medium">{formattedDate}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('transaction.details.cashier')}</p>
          <p className="font-medium">{cashier?.name || '-'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{t('transaction.details.customer')}</p>
          <p className="font-medium flex flex-wrap gap-2 items-center">
            {member ? (
              <>
                {member.name}
                <Badge className={getTierBadgeVariant(member.tier)}>
                  {member.tier || t('transaction.tiers.regular')}
                </Badge>
              </>
            ) : (
              t('transaction.details.guest')
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('transaction.details.paymentMethod')}</p>
          <p className="font-medium capitalize">
            {paymentMethod ? paymentMethod.replace(/[_-]/g, ' ') : '-'}
          </p>
        </div>
      </div>
    </div>
  )
}
