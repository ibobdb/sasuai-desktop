import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { Badge as BadgeIcon } from 'lucide-react'
import { IconInfoCircle } from '@tabler/icons-react'
import { MemberDetail } from '@/types/members'

interface MemberHeaderProps {
  memberDetail: MemberDetail
}

const MemberHeaderComponent = ({ memberDetail }: MemberHeaderProps) => {
  const { t } = useTranslation(['member'])

  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-16 w-16 border">
        <AvatarFallback className="bg-primary/10 text-primary">
          {memberDetail.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{memberDetail.name}</h2>
          <Badge variant={memberDetail.isBanned ? 'destructive' : 'default'}>
            {memberDetail.isBanned ? t('member.fields.banned') : t('member.fields.active')}
          </Badge>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>ID: {memberDetail.cardId}</span>
          <span>•</span>
          <span>
            {t('member.view.memberSince')}:{' '}
            {format(new Date(memberDetail.joinDate || memberDetail.createdAt), 'PP')}
          </span>
          {memberDetail.discounts && memberDetail.discounts.length > 0 && (
            <>
              <span>•</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <BadgeIcon className="h-3 w-3" />
                {memberDetail.discounts.length} {t('member.discounts.active')}
              </Badge>
            </>
          )}
        </div>

        {memberDetail.isBanned && memberDetail.banReason && (
          <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
            <IconInfoCircle className="h-4 w-4" />
            <span>{memberDetail.banReason}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export const MemberHeader = memo(MemberHeaderComponent)
