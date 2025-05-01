import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DetailDialog } from '@/components/common/detail-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { format } from 'date-fns'
import { useMembers } from '../context/member-context'
import { Member, MemberDetail } from '@/types/members'
import { IconUser, IconEdit } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils/format'

interface MemberViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMember: Member
}

export function MemberViewDialog({ open, onOpenChange, currentMember }: MemberViewDialogProps) {
  const { t } = useTranslation(['member'])
  const { fetchMemberDetail, setOpen } = useMembers()
  const [detail, setDetail] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

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

  // Ensure all tier options have non-empty values
  const tierOptions = useMemo(
    () => [
      { label: 'Regular', value: 'regular' },
      { label: 'Bronze', value: 'bronze' },
      { label: 'Silver', value: 'silver' },
      { label: 'Gold', value: 'gold' },
      { label: 'Platinum', value: 'platinum' },
      { label: 'Diamond', value: 'diamond' }
    ],
    []
  )

  const handleEditClick = () => {
    onOpenChange(false) // Close the view dialog
    setOpen('edit') // Open the edit dialog
  }

  const renderMemberDetails = () => {
    if (!detail) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('member.view.contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.phone')}</p>
                <p className="font-medium">{detail.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.email')}</p>
                <p className="font-medium">{detail.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.address')}</p>
                <p className="font-medium">{detail.address || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('member.view.membershipInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.cardId')}</p>
                <p className="font-medium">{detail.cardId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.tier')}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{detail.tier?.name || 'Regular'}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {detail.tier && t('member.view.minPoints', { points: detail.tier.minPoints })}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('member.fields.totalPoints')}</p>
                <p className="font-medium">
                  {detail.totalPoints} {t('member.fields.points')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('member.view.memberSince')}</p>
                <p className="font-medium">
                  {detail.joinDate
                    ? format(new Date(detail.joinDate), 'PPP')
                    : format(new Date(detail.createdAt), 'PPP')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {detail.transactionSummary && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('member.view.transactionSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('member.view.totalTransactions')}
                  </p>
                  <p className="font-medium">{detail.transactionSummary.count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('member.view.totalSpent')}</p>
                  <p className="font-medium">
                    {formatCurrency(detail.transactionSummary.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('member.view.lastTransaction')}
                  </p>
                  <p className="font-medium">
                    {detail.transactionSummary.lastTransaction
                      ? format(new Date(detail.transactionSummary.lastTransaction), 'PPP')
                      : t('member.view.never')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tier Selection - Make sure each SelectItem has a valid non-empty value */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tier Details</CardTitle>
            <CardDescription>Select a different tier to see requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <Select defaultValue={detail.tier?.name?.toLowerCase() || 'regular'}>
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Tiers</SelectLabel>
                  {tierOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
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
      title={detail?.name || currentMember.name}
      icon={<IconUser className="h-5 w-5" />}
      footerContent={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <Skeleton className="h-[100px] w-full" />
        </div>
      ) : (
        renderMemberDetails()
      )}
    </DetailDialog>
  )
}
