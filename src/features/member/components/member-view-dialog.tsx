import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DetailDialog } from '@/components/common/detail-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MemberDetail } from '@/types/members'
import {
  MemberHeader,
  MemberBasicInfo,
  MemberTransactionSummary,
  MemberTransactionsTab,
  MemberDiscountsTab
} from './member-view'

interface MemberViewDialogProps {
  open: boolean
  memberDetail: MemberDetail | null
  isLoadingDetail: boolean
  onOpenChange: (open: boolean) => void
  onEditClick?: () => void
}

export function MemberViewDialog({
  open,
  memberDetail,
  isLoadingDetail,
  onOpenChange,
  onEditClick
}: MemberViewDialogProps) {
  const { t } = useTranslation(['member', 'common'])
  const [activeTab, setActiveTab] = useState('info')

  const handleEditClick = () => {
    onOpenChange(false)
    onEditClick?.()
  }

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('member.view.title')}
      loading={isLoadingDetail}
      loadingDescription={t('member.view.loading')}
      footerContent={
        memberDetail && (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('actions.close', { ns: 'common' })}
            </Button>
            <Button onClick={handleEditClick}>{t('member.actions.edit')}</Button>
          </>
        )
      }
    >
      {memberDetail && (
        <div className="space-y-6">
          <MemberHeader memberDetail={memberDetail} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">{t('member.view.tabs.info')}</TabsTrigger>
              <TabsTrigger value="transactions">{t('member.view.tabs.transactions')}</TabsTrigger>
              <TabsTrigger value="discounts">{t('member.view.tabs.discounts')}</TabsTrigger>
              <TabsTrigger value="summary">{t('member.view.tabs.summary')}</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-6">
              <MemberBasicInfo memberDetail={memberDetail} />
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <MemberTransactionsTab memberDetail={memberDetail} />
            </TabsContent>

            <TabsContent value="discounts" className="mt-6">
              <MemberDiscountsTab memberDetail={memberDetail} />
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <MemberTransactionSummary memberDetail={memberDetail} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DetailDialog>
  )
}
