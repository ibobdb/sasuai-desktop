import { useMembers } from '../context/member-context'
import { MemberViewDialog } from './member-view-dialog'
import { MemberFormDialog } from './member-form-dialog'

export function MemberDialogs() {
  const { open, setOpen, currentMember, setCurrentMember } = useMembers()

  const handleDialogClose = () => {
    setOpen(null)
    const isTransitioning = open === 'view'

    if (!isTransitioning) {
      setTimeout(() => {
        setCurrentMember(null)
      }, 500)
    }
  }

  return (
    <>
      {currentMember && (
        <>
          <MemberViewDialog
            key={`member-view-${currentMember.id}`}
            open={open === 'view'}
            onOpenChange={(isOpen) => {
              if (!isOpen) handleDialogClose()
            }}
            currentMember={currentMember}
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
      />
    </>
  )
}
