import * as React from 'react'
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
import { Reward } from '@/types/rewards'
import { useRewards } from '../context/reward-context'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Member } from '@/types/cashier'
import { Badge } from '@/components/ui/badge'
import { getTierBadgeVariant } from '@/features/member/components/member-columns'
import { API_ENDPOINTS } from '@/config/api'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { useClickOutside } from '@/hooks/use-click-outside'

interface ClaimRewardDialogProps {
  reward: Reward | null
  isOpen: boolean
  onClose: () => void
}

export function ClaimRewardDialog({
  reward: initialReward,
  isOpen,
  onClose
}: ClaimRewardDialogProps) {
  const { t } = useTranslation(['rewards'])
  const { claimReward, rewards } = useRewards()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedRewardId, setSelectedRewardId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSearchedQuery, setLastSearchedQuery] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Set initial reward if provided
  useEffect(() => {
    if (initialReward) {
      setSelectedRewardId(initialReward.id)
    }
  }, [initialReward])

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMember(null)
      setSelectedRewardId(initialReward?.id || '')
      setSearchResults([])
      setShowResults(false)
    }
  }, [isOpen, initialReward])

  const searchCallback = useCallback(
    (value: string) => {
      if (value.trim() && value !== lastSearchedQuery) {
        searchMembers(value)
        setLastSearchedQuery(value)
      }
    },
    [lastSearchedQuery]
  )

  // Use the debounce hook
  const {
    value: query,
    setValue: setQuery,
    isDebouncing
  } = useDebounce('', {
    minLength: 3,
    callback: searchCallback
  })

  const searchMembers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)

    try {
      const response = await window.api.request(
        `${API_ENDPOINTS.MEMBERS.BASE}?search=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET'
        }
      )

      if (response.success && response.data?.members?.length > 0) {
        setSearchResults(response.data.members)
        setShowResults(true)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    } catch (error) {
      console.error('Failed to search for member:', error)
      toast.error('Failed to search for member', {
        description: 'Please try again later'
      })
      setSearchResults([])
      setShowResults(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleMemberSelect = useCallback(
    (member: Member) => {
      if (member.isBanned) {
        toast.error('Member is banned', {
          description: 'This member cannot claim rewards'
        })
        return
      }

      setSelectedMember(member)
      setShowResults(false)
      setQuery('')
      setLastSearchedQuery('')
      setSearchResults([])
    },
    [setQuery]
  )

  const handleManualSearch = useCallback(() => {
    if (query.trim().length >= 3 && query !== lastSearchedQuery) {
      searchMembers(query)
      setLastSearchedQuery(query)
    }
  }, [query, lastSearchedQuery, searchMembers])

  // Use click outside hook
  useClickOutside([resultsRef, inputRef], () => {
    setShowResults(false)
  })

  const clearSearch = () => {
    setQuery('')
    setSearchResults([])
    setShowResults(false)
    setLastSearchedQuery('')
    inputRef.current?.focus()
  }

  // Get available rewards (in stock and active)
  const availableRewards = rewards.filter((r) => r.isActive && r.stock > 0)
  const selectedReward = availableRewards.find((r) => r.id === selectedRewardId) || null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReward || !selectedMember) return

    setIsSubmitting(true)

    try {
      const success = await claimReward(selectedMember.id, selectedReward.id)
      if (success) {
        onClose()
        setSelectedMember(null)
        setSelectedRewardId('')
      }
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
                      {reward.name} - {reward.pointsCost} pts ({reward.stock}{' '}
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
              <div className="relative">
                <Input
                  ref={inputRef}
                  placeholder={t('claimDialog.searchPlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pr-16 h-9"
                  disabled={!!selectedMember}
                />

                {query && !isLoading && !isDebouncing && !selectedMember && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-10 top-0 h-full w-8"
                    onClick={clearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}

                <Button
                  size="icon"
                  className="absolute right-0 top-0 h-full rounded-l-none w-10"
                  onClick={selectedMember ? () => setSelectedMember(null) : handleManualSearch}
                  disabled={
                    selectedMember ? false : query.trim().length < 3 || isLoading || isDebouncing
                  }
                >
                  {selectedMember ? (
                    <X className="h-4 w-4" />
                  ) : isLoading || isDebouncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>

                {/* Search results dropdown */}
                {showResults && searchResults.length > 0 && !selectedMember && (
                  <Card
                    className="absolute z-50 w-full left-0 right-0 mt-1 max-h-64 overflow-auto shadow-lg"
                    ref={resultsRef}
                  >
                    <ul className="py-1 divide-y divide-border">
                      {searchResults.map((member) => (
                        <li
                          key={member.id}
                          className={`px-3 py-2 transition-colors ${
                            member.isBanned
                              ? 'cursor-not-allowed opacity-70'
                              : 'cursor-pointer hover:bg-accent'
                          }`}
                          onClick={() => !member.isBanned && handleMemberSelect(member)}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.name}</p>
                                {member.isBanned && (
                                  <Badge variant="destructive" className="text-xs">
                                    Banned
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <span>Phone: {member.phone}</span>
                                {member.cardId && (
                                  <span className="block sm:inline sm:ml-2">
                                    Card ID: {member.cardId}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="sm:text-right mt-2 sm:mt-0">
                              <div className="flex sm:justify-end">
                                <Badge className={getTierBadgeVariant(member.tier?.name)}>
                                  {member.tier?.name || 'Regular'}
                                </Badge>
                              </div>
                              <p className="text-xs text-amber-500 mt-1">
                                Points: {member.totalPoints}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {!isLoading &&
                !isDebouncing &&
                query.trim().length >= 3 &&
                searchResults.length === 0 &&
                !selectedMember && (
                  <div className="text-xs text-muted-foreground flex items-center pt-0.5">
                    <X className="h-3 w-3 mr-1" />
                    {t('claimDialog.noMembersFound')}
                  </div>
                )}
            </div>

            {/* Selected Member Details */}
            {selectedMember && (
              <Card className="mb-2">
                <CardContent className="pt-6">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{selectedMember.name}</div>
                        <Badge className={getTierBadgeVariant(selectedMember.tier?.name)}>
                          {selectedMember.tier?.name || 'Regular'}
                        </Badge>
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
                        {selectedMember.totalPoints} points
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
