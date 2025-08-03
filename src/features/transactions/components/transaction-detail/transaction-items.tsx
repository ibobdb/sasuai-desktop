import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/format'
import { TransactionDetail } from '@/types/transactions'

interface TransactionItemsProps {
  transactionDetail: TransactionDetail
}

export function TransactionItems({ transactionDetail }: TransactionItemsProps) {
  const { t } = useTranslation(['transactions'])

  const { items = [] } = transactionDetail
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div>
      <h3 className="font-semibold mb-3">
        {t('transaction.details.itemsPurchased')} ({totalItems})
      </h3>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[300px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 sticky top-0 bg-muted z-10">
                  {t('transaction.details.item')}
                </th>
                <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                  {t('transaction.details.price')}
                </th>
                <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                  {t('transaction.details.quantity')}
                </th>
                <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                  {t('transaction.details.total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items && items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="break-words max-w-[200px] sm:max-w-[300px]">
                        <p className="font-medium">{item.product?.name || 'Unknown Item'}</p>
                        {item.discountApplied && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs text-rose-600">
                              {item.discountApplied.name}: -
                              {formatCurrency(item.discountApplied.amount)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right p-3 whitespace-nowrap">
                      {formatCurrency(item.product?.price || 0)}
                    </td>
                    <td className="text-right p-3 whitespace-nowrap">{item.quantity || 0}</td>
                    <td className="text-right p-3 whitespace-nowrap font-medium">
                      {formatCurrency(item.originalAmount || 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-muted-foreground">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
