import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/format'
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
import { MemberDetail } from '@/types/members'

interface MemberTransactionSummaryProps {
  memberDetail: MemberDetail
}

export function MemberTransactionSummary({ memberDetail }: MemberTransactionSummaryProps) {
  const { t } = useTranslation(['member'])

  const totalTransactions = memberDetail.transactions?.length || 0
  const totalSpent =
    memberDetail.transactions?.reduce((sum, transaction) => sum + transaction.totalAmount, 0) || 0

  const totalSaved =
    memberDetail.transactions?.reduce(
      (sum, transaction) => sum + (transaction.discountAmount || 0),
      0
    ) || 0

  const averageTransactionValue = totalTransactions > 0 ? totalSpent / totalTransactions : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h4 className="font-medium">{t('member.view.totalSpent')}</h4>
        </div>
        <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(totalSpent)}</p>
        <p className="text-sm text-muted-foreground">
          {totalTransactions} {t('member.view.totalTransactions')}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium">{t('member.view.avgSpent')}</h4>
        </div>
        <p className="mt-2 text-2xl font-bold text-blue-600">
          {formatCurrency(averageTransactionValue)}
        </p>
        <p className="text-sm text-muted-foreground">{t('member.view.avgSpent')}</p>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-orange-600" />
          <h4 className="font-medium">{t('member.view.totalSaved')}</h4>
        </div>
        <p className="mt-2 text-2xl font-bold text-orange-600">{formatCurrency(totalSaved)}</p>
        <p className="text-sm text-muted-foreground">{t('member.discounts.value')}</p>
      </div>
    </div>
  )
}
