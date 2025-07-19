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

export function MemberDialogs({
  open,
  currentMember,
  memberDetail,
  isLoadingDetail,
  onOpenChange,
  onRefetch
}: MemberDialogsProps) {
  const handleDialogClose = () => {
    onOpenChange(null)
  }

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
