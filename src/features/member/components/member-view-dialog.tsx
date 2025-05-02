import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DetailDialog } from '@/components/common/detail-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { format } from 'date-fns'
import { useMembers } from '../context/member-context'
import { Member, MemberDetail, Transaction } from '@/types/members'
import {
  IconUser,
  IconEdit,
  IconReceipt2,
  IconCoins,
  IconTag,
  IconInfoCircle
} from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils/format'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface MemberViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMember: Member
}

export function MemberViewDialog({ open, onOpenChange, currentMember }: MemberViewDialogProps) {
  const { t } = useTranslation(['member', 'common'])
  const { fetchMemberDetail, setOpen } = useMembers()
  const [detail, setDetail] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (open && currentMember) {
      setLoading(true)
      fetchMemberDetail(currentMember.id)
        .then((data) => {
          if (data) {
            setDetail(data)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setDetail(null)
    }
  }, [open, currentMember, fetchMemberDetail])

  const handleEditClick = () => {
    onOpenChange(false)
    setTimeout(() => {
      setOpen('edit')
    }, 0)
  }

  const calculateTotalSpent = (transactions: Transaction[] | undefined): number => {
    if (!transactions || !transactions.length) return 0
    return transactions.reduce((total, transaction) => total + transaction.totalAmount, 0)
  }

  const renderMemberHeader = () => {
    if (!detail) return null

    return (
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border">
          <AvatarFallback className="bg-primary/10 text-primary">
            {detail.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{detail.name}</h2>
            <Badge variant={detail.isBanned ? 'destructive' : 'default'}>
              {detail.isBanned ? t('member.fields.banned') : t('member.fields.active')}
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>ID: {detail.cardId}</span>
            <span>•</span>
            <span>
              {t('member.view.memberSince')}:{' '}
              {format(new Date(detail.joinDate || detail.createdAt), 'PP')}
            </span>
          </div>

          {detail.isBanned && detail.banReason && (
            <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
              <IconInfoCircle className="h-4 w-4" />
              <span>{detail.banReason}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderBasicInfo = () => {
    if (!detail) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconUser className="h-4 w-4" />
              {t('member.view.contactInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.phone')}</p>
                <p className="font-medium">{detail.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.email')}</p>
                <p className="font-medium">{detail.email || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t('member.fields.address')}</p>
              <p className="font-medium">{detail.address || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconCoins className="h-4 w-4" />
              {t('member.view.membershipInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.tier')}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{detail.tier?.name || 'Regular'}</Badge>
                  {detail.tier?.minPoints && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {t('member.view.minPoints', { points: detail.tier.minPoints })}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

              {detail.tier?.multiplier && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('member.fields.pointMultiplier')}
                  </p>
                  <p className="font-medium">x{detail.tier.multiplier}</p>
                </div>
              )}
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.totalPoints')}</p>
                <p className="font-medium">
                  {detail.totalPoints} {t('member.fields.points')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('member.fields.totalPointsEarned')}
                </p>
                <p className="font-medium">
                  {detail.totalPointsEarned} {t('member.fields.points')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTransactionSummary = () => {
    if (!detail || !detail.transactions || !detail.transactions.length) {
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconReceipt2 className="h-4 w-4" />
              {t('member.view.transactionSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('member.view.noTransactions')}</p>
          </CardContent>
        </Card>
      )
    }

    const totalSpent = calculateTotalSpent(detail.transactions)
    const lastTransaction = detail.transactions[0]
    const avgSpent = totalSpent / detail.transactions.length

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IconReceipt2 className="h-4 w-4" />
            {t('member.view.transactionSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('member.view.totalTransactions')}</p>
              <p className="text-2xl font-semibold">{detail.transactions.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('member.view.totalSpent')}</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('member.view.avgSpent')}</p>
              <p className="text-2xl font-semibold">{formatCurrency(avgSpent)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">{t('member.view.lastTransaction')}</p>
            <p className="font-medium">
              {lastTransaction.createdAt
                ? format(new Date(lastTransaction.createdAt), 'PPpp')
                : t('member.view.never')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTransactionsTab = () => {
    if (!detail || !detail.transactions || detail.transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IconReceipt2 className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('member.view.noTransactions')}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t('member.view.noTransactionsDescription')}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="rounded-lg border overflow-hidden">
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>{t('member.transactions.transId')}</TableHead>
                  <TableHead>{t('member.transactions.date')}</TableHead>
                  <TableHead className="text-right">{t('member.transactions.amount')}</TableHead>
                  <TableHead className="text-right">
                    {t('member.transactions.finalAmount')}
                  </TableHead>
                  <TableHead>{t('member.transactions.discount')}</TableHead>
                  <TableHead>{t('member.transactions.paymentMethod')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.transactions.map((transaction, index) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground text-sm font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.tranId || transaction.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>{format(new Date(transaction.createdAt), 'PP')}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(transaction.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(transaction.finalAmount)}
                    </TableCell>
                    <TableCell>
                      {transaction.discountAmount ? (
                        <Badge variant="default" className="gap-1">
                          <span>
                            {transaction.discountValueType === 'percentage'
                              ? `${transaction.discountValue}%`
                              : formatCurrency(transaction.discountValue || 0)}
                          </span>
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {transaction.paymentMethod.toLowerCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {detail.transactions.length > 10 && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              {t('member.view.loadMore')}
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderPointsHistoryTab = () => {
    if (!detail || !detail.memberPoints || detail.memberPoints.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IconCoins className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('member.view.noPointsHistory')}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t('member.view.noPointsHistoryDescription')}
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-lg border overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>{t('member.points.date')}</TableHead>
                <TableHead className="text-right">{t('member.points.pointsEarned')}</TableHead>
                <TableHead className="text-right">{t('member.points.transactionAmount')}</TableHead>
                <TableHead>{t('member.points.notes')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.memberPoints.map((point, index) => (
                <TableRow key={point.id} className="hover:bg-muted/50">
                  <TableCell className="text-muted-foreground text-sm font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>{format(new Date(point.dateEarned), 'PP')}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="default" className="font-semibold gap-1">
                      <span>+{point.pointsEarned}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {point.transaction ? formatCurrency(point.transaction.totalAmount) : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{point.notes || '-'}</span>
                        </TooltipTrigger>
                        {point.notes && (
                          <TooltipContent className="max-w-[300px]">
                            <p>{point.notes}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const renderDiscountsTab = () => {
    if (!detail || !detail.discountRelationsMember || detail.discountRelationsMember.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IconTag className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('member.discounts.noDiscounts')}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t('member.discounts.noDiscountsDescription')}
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detail.discountRelationsMember.map((discount, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{discount.discountId}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      loading={loading}
      loadingTitle={t('member.view.loading')}
      loadingDescription={t('member.view.loadingDescription')}
      title={t('member.view.title')}
      icon={<IconUser className="h-5 w-5" />}
      footerContent={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('actions.close', { ns: 'common' })}
          </Button>
          <Button onClick={handleEditClick}>
            <IconEdit className="mr-2 h-4 w-4" />
            {t('member.actions.edit')}
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <Skeleton className="h-[150px] w-full" />
        </div>
      ) : detail ? (
        <div className="space-y-6">
          {renderMemberHeader()}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">
                <IconUser className="h-4 w-4 mr-2" />
                {t('member.view.tabs.info')}
              </TabsTrigger>
              <TabsTrigger value="transactions">
                <IconReceipt2 className="h-4 w-4 mr-2" />
                {t('member.view.tabs.transactions')}
              </TabsTrigger>
              <TabsTrigger value="points">
                <IconCoins className="h-4 w-4 mr-2" />
                {t('member.view.tabs.points')}
              </TabsTrigger>
              <TabsTrigger value="discounts">
                <IconTag className="h-4 w-4 mr-2" />
                {t('member.view.tabs.discounts')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-6">
              {renderBasicInfo()}
              {renderTransactionSummary()}
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              {renderTransactionsTab()}
            </TabsContent>

            <TabsContent value="points" className="mt-6">
              {renderPointsHistoryTab()}
            </TabsContent>

            <TabsContent value="discounts" className="mt-6">
              {renderDiscountsTab()}
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </DetailDialog>
  )
}
