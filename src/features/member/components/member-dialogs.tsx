import { useMembers } from '../context/member-context'
import { MemberViewDialog } from './member-view-dialog'
import { MemberFormDialog } from './member-form-dialog'

export function MemberDialogs() {
  const { open, setOpen, currentMember, setCurrentMember } = useMembers()

  const handleDialogClose = () => {
    // Close dialog without triggering a fetch
    setOpen(null)

    // Clear current member after dialog animation completes
    setTimeout(() => {
      setCurrentMember(null)
    }, 500)
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
