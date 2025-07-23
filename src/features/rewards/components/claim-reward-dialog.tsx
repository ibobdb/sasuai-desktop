import { useState, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Member } from '@/types/cashier'
import { Reward } from '@/types/rewards'
import { claimReward } from '../actions/reward-operations'
import { MemberSearch } from '@/features/cashier/components/member-search'

interface ClaimRewardDialogProps {
  reward: Reward | null
  isOpen: boolean
  onClose: () => void
  rewards: Reward[]
  onClaimSuccess?: () => void
}

export function ClaimRewardDialog({
  reward: initialReward,
  isOpen,
  onClose,
  rewards,
  onClaimSuccess
}: ClaimRewardDialogProps) {
  const { t } = useTranslation(['rewards'])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedRewardId, setSelectedRewardId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialReward) {
      setSelectedRewardId(initialReward.id)
    }
  }, [initialReward])

  useEffect(() => {
    if (!isOpen) {
      setSelectedMember(null)
      setSelectedRewardId('')
    }
  }, [isOpen])

  const availableRewards = rewards.filter((r) => r.isActive && r.stock > 0)
  const selectedReward = availableRewards.find((r) => r.id === selectedRewardId) || null

  const handleMemberSelect = (member: Member | null) => {
    setSelectedMember(member)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReward || !selectedMember) return

    setIsSubmitting(true)

    try {
      const response = await claimReward(selectedMember.id, selectedReward.id)
      if (response.success) {
        toast.success(t('messages.claimSuccess'), {
          description: t('messages.claimSuccessDesc')
        })
        onClaimSuccess?.()
        onClose()
        setSelectedMember(null)
        setSelectedRewardId('')
      } else {
        toast.error(t('messages.claimError'), {
          description: response.error || t('messages.claimErrorDesc')
        })
      }
    } catch (error) {
      toast.error(t('messages.claimError'), {
        description: error instanceof Error ? error.message : t('messages.claimErrorDesc')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('claimDialog.title')}</DialogTitle>
          <DialogDescription>{t('claimDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Reward Selection */}
            <div className="grid gap-2">
              <Label htmlFor="reward-select">{t('claimDialog.selectReward')}</Label>
              <Select value={selectedRewardId} onValueChange={setSelectedRewardId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('claimDialog.selectReward')} />
                </SelectTrigger>
                <SelectContent>
                  {availableRewards.map((reward) => (
                    <SelectItem key={reward.id} value={reward.id}>
                      {reward.name} - {reward.pointsCost} {t('table.points')} ({reward.stock}{' '}
                      {t('claimDialog.available')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Reward Details */}
            {selectedReward && (
              <Card className="mb-2">
                <CardContent className="pt-6">
                  <div className="grid gap-2">
                    <div className="text-lg font-medium">{selectedReward.name}</div>
                    <div className="text-muted-foreground">{selectedReward.description}</div>
                    <div className="font-semibold text-amber-600">
                      {t('claimDialog.pointsCost', { points: selectedReward.pointsCost })}
                    </div>
                    <div className="text-sm">
                      {t('claimDialog.availableStock', { count: selectedReward.stock })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Member Search */}
            <div className="grid gap-2">
              <Label>{t('claimDialog.searchMember')}</Label>
              <MemberSearch onMemberSelect={handleMemberSelect} />
            </div>

            {/* Selected Member Details */}
            {selectedMember && (
              <Card className="mb-2">
                <CardContent className="pt-6">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{selectedMember.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedMember.phone}
                        {selectedMember.cardId && (
                          <span className="ml-2">Card: {selectedMember.cardId}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-600 font-medium">
                        {selectedMember.totalPoints} {t('table.points')}
                      </div>
                      {selectedReward && selectedMember.totalPoints < selectedReward.pointsCost && (
                        <div className="text-destructive text-xs">
                          {t('claimDialog.insufficientPoints')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              {t('claimDialog.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                !!(
                  isSubmitting ||
                  !selectedMember ||
                  !selectedRewardId ||
                  (selectedReward &&
                    selectedMember &&
                    selectedMember.totalPoints < selectedReward.pointsCost)
                )
              }
            >
              {isSubmitting ? t('claimDialog.process') : t('claimDialog.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
