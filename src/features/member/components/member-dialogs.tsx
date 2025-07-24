import { memo, useCallback } from 'react'
import { MemberViewDialog } from './member-view-dialog'
import { MemberFormDialog } from './member-form-dialog'
import type { Member, MemberDetail, MemberDialogType } from '@/types/members'

interface MemberDialogsProps {
  open: MemberDialogType | null
  currentMember: Member | null
  memberDetail: MemberDetail | null
  isLoadingDetail: boolean
  onOpenChange: (open: MemberDialogType | null) => void
  onRefetch: () => void
}

const MemberDialogsComponent = ({
  open,
  currentMember,
  memberDetail,
  isLoadingDetail,
  onOpenChange,
  onRefetch
}: MemberDialogsProps) => {
  const handleDialogClose = useCallback(() => {
    onOpenChange(null)
  }, [onOpenChange])

  return (
    <>
      {currentMember && (
        <>
          <MemberViewDialog
            key={`member-view-${currentMember.id}`}
            open={open === 'view'}
            memberDetail={memberDetail}
            isLoadingDetail={isLoadingDetail}
            onOpenChange={(isOpen) => {
              if (!isOpen) handleDialogClose()
            }}
            onEditClick={() => {
              onOpenChange('edit')
            }}
          />
        </>
      )}

      <MemberFormDialog
        key={`member-edit-${currentMember?.id || 'new'}`}
        open={open === 'edit' || open === 'create'}
        mode={open === 'edit' ? 'edit' : 'create'}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleDialogClose()
        }}
        currentMember={currentMember}
        onSuccess={() => {
          handleDialogClose()
          onRefetch()
        }}
      />
    </>
  )
}

export const MemberDialogs = memo(MemberDialogsComponent)
