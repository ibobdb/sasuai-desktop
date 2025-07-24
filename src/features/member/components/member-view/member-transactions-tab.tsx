import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/format'
import { MemberDetail } from '@/types/members'

interface MemberTransactionsTabProps {
  memberDetail: MemberDetail
}

const MemberTransactionsTabComponent = ({ memberDetail }: MemberTransactionsTabProps) => {
  const { t } = useTranslation(['member'])

  if (!memberDetail.transactions?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('member.view.noTransactions')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {memberDetail.transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{transaction.tranId || transaction.id.substring(0, 8)}</p>
              <Badge variant="outline" className="capitalize">
                {transaction.paymentMethod.toLowerCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(transaction.createdAt), 'PPP p')}
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="font-semibold">{formatCurrency(transaction.totalAmount)}</p>
            {transaction.discountAmount && transaction.discountAmount > 0 && (
              <p className="text-sm text-green-600">
                -{formatCurrency(transaction.discountAmount)} {t('member.transactions.discount')}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {t('member.transactions.finalAmount')}: {formatCurrency(transaction.finalAmount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export const MemberTransactionsTab = memo(MemberTransactionsTabComponent)
