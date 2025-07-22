import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/format'
import { CalendarClock, Percent } from 'lucide-react'
import { MemberDetail } from '@/types/members'

interface MemberDiscountsTabProps {
  memberDetail: MemberDetail
}

export function MemberDiscountsTab({ memberDetail }: MemberDiscountsTabProps) {
  const { t } = useTranslation(['member'])

  if (!memberDetail.discounts?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('member.view.noDiscounts')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {memberDetail.discounts.map((discount) => (
        <div key={discount.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{discount.name}</h4>
                <Badge variant={discount.isActive ? 'default' : 'secondary'}>
                  {discount.isActive
                    ? t('member.discounts.active')
                    : t('member.discounts.inactive')}
                </Badge>
              </div>

              {discount.description && (
                <p className="text-sm text-muted-foreground">{discount.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarClock className="h-4 w-4" />
                  <span>
                    {format(new Date(discount.startDate), 'PP')} -{' '}
                    {format(new Date(discount.endDate), 'PP')}
                  </span>
                </div>

                {discount.maxUses && (
                  <div>
                    {t('member.discounts.usageLimit')}: {discount.usedCount || 0}/{discount.maxUses}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold text-primary">
                <Percent className="h-5 w-5" />
                {discount.type === 'PERCENTAGE' ? (
                  <span>{discount.value}%</span>
                ) : (
                  <span>{formatCurrency(discount.value)}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {discount.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}{' '}
                {t('member.discounts.discountValue')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
