import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { MemberDetail } from '@/types/members'

interface MemberBasicInfoProps {
  memberDetail: MemberDetail
}

const MemberBasicInfoComponent = ({ memberDetail }: MemberBasicInfoProps) => {
  const { t } = useTranslation(['member'])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <h4 className="font-medium text-muted-foreground">{t('member.fields.name')}</h4>
        <p className="mt-1">{memberDetail.name}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground">{t('member.fields.cardId')}</h4>
        <p className="mt-1">{memberDetail.cardId}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground">{t('member.fields.email')}</h4>
        <p className="mt-1">{memberDetail.email || '-'}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground">{t('member.fields.phone')}</h4>
        <p className="mt-1">{memberDetail.phone || '-'}</p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground">{t('member.fields.joinDate')}</h4>
        <p className="mt-1">
          {format(new Date(memberDetail.joinDate || memberDetail.createdAt), 'PPP')}
        </p>
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground">{t('member.fields.status')}</h4>
        <p className="mt-1">
          {memberDetail.isBanned ? t('member.fields.banned') : t('member.fields.active')}
        </p>
      </div>

      {memberDetail.address && (
        <div className="sm:col-span-2">
          <h4 className="font-medium text-muted-foreground">{t('member.fields.address')}</h4>
          <p className="mt-1">{memberDetail.address}</p>
        </div>
      )}

      {memberDetail.notes && (
        <div className="sm:col-span-2">
          <h4 className="font-medium text-muted-foreground">{t('member.fields.notes')}</h4>
          <p className="mt-1">{memberDetail.notes}</p>
        </div>
      )}
    </div>
  )
}

export const MemberBasicInfo = memo(MemberBasicInfoComponent)
