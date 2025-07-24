import { useState, useEffect, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Ticket, Check, UserPlus, Phone, CreditCard, MapPin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Member, MemberSectionProps, Discount, EnhancedDiscount } from '@/types/cashier'
import { MemberSearch } from './member-search'
import { Card } from '@/components/ui/card'
import { getTierBadgeVariant } from '@/features/member/components/member-columns'
import { isDiscountValid } from '../utils/cashier-utils'

export function MemberSection({
  onMemberSelect,
  onMemberDiscountSelect,
  selectedDiscount,
  member
}: MemberSectionProps) {
  const { t } = useTranslation(['cashier'])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  useEffect(() => {
    setSelectedMember(member)
  }, [member])

  const handleMemberSelect = useCallback(
    (member: Member | null) => {
      onMemberSelect?.(member)
    },
    [onMemberSelect]
  )

  const clearMember = useCallback(() => {
    setSelectedMember(null)
    onMemberSelect?.(null)
    onMemberDiscountSelect?.(null)
  }, [onMemberSelect, onMemberDiscountSelect])

  const formatDiscount = useCallback((discount: Discount) => {
    if (discount.type === 'PERCENTAGE') {
      return `${discount.value}%`
    }
    return `Rp ${discount.value.toLocaleString()}`
  }, [])

  // Get all available discounts from both member and tier (with basic validation)
  const getAllAvailableDiscounts = (): EnhancedDiscount[] => {
    if (!selectedMember) return []

    const allDiscounts: EnhancedDiscount[] = []

    // Add member personal discounts (filter only expired/usage limit)
    if (selectedMember.discounts) {
      const memberDiscounts = selectedMember.discounts
        .filter((discount) => isDiscountValid(discount, false))
        .map((discount) => ({
          ...discount,
          source: 'member' as const
        }))
      allDiscounts.push(...memberDiscounts)
    }

    // Add tier discounts (filter only expired/usage limit)
    if (selectedMember.tier?.discounts) {
      const tierDiscounts = selectedMember.tier.discounts
        .filter((discount) => isDiscountValid(discount, false))
        .map((discount) => ({
          ...discount,
          source: 'tier' as const
        }))
      allDiscounts.push(...tierDiscounts)
    }

    return allDiscounts
  }

  // Get source label for discount
  const getSourceLabel = (discount: EnhancedDiscount) => {
    return discount.source === 'member'
      ? t('cashier.memberSection.personalDiscount')
      : `${t('cashier.memberSection.tierDiscount')} (${selectedMember?.tier?.name})`
  }

  const availableDiscounts = getAllAvailableDiscounts()
  const hasAvailableDiscounts = availableDiscounts.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <UserPlus className="h-4 w-4 mr-2 text-muted-foreground" />
          {t('cashier.memberSection.title')}
        </h3>

        {selectedMember && (
          <Button variant="ghost" size="sm" onClick={clearMember} className="h-6 px-2">
            <X className="h-3 w-3 mr-1" /> {t('cashier.memberSection.clear')}
          </Button>
        )}
      </div>

      {/* Always show the search component */}
      <MemberSearch onMemberSelect={handleMemberSelect} />

      {selectedMember && (
        <Card className="overflow-hidden">
          {/* Member header with tier badge */}
          <div className="p-3 bg-primary/5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback className="bg-primary text-primary-foreground text-base font-medium">
                  {selectedMember.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium line-clamp-1">{selectedMember.name}</h4>
                <div className="flex items-center">
                  <Badge className={getTierBadgeVariant(selectedMember.tier?.name)}>
                    {selectedMember.tier?.name || t('member.tiers.regular')}
                  </Badge>
                  <div className="ml-2 flex items-center text-amber-500 dark:text-amber-400 font-medium">
                    <span className="text-xs">
                      {selectedMember.totalPoints} {t('cashier.memberSection.points')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Member contact details - reduced padding and spacing */}
          <div className="p-3 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{selectedMember.phone}</span>
            </div>

            {selectedMember.cardId && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Card ID: {selectedMember.cardId}</span>
              </div>
            )}

            {selectedMember.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{selectedMember.email}</span>
              </div>
            )}

            {selectedMember.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="line-clamp-1">{selectedMember.address}</span>
              </div>
            )}
          </div>

          {/* Available Discounts Section */}
          {selectedMember && (
            <>
              {hasAvailableDiscounts ? (
                <div className="p-2 bg-primary/5 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
                      <span className="font-medium text-sm">
                        {t('cashier.memberSection.availableDiscounts')}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            selectedDiscount
                              ? 'text-green-600 border-green-200 hover:bg-green-50 w-full sm:w-auto h-7 text-xs'
                              : 'w-full sm:w-auto h-7 text-xs'
                          }
                        >
                          {selectedDiscount
                            ? `${selectedDiscount.name} (${formatDiscount(selectedDiscount)})`
                            : t('cashier.memberSection.selectDiscount')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[280px] sm:w-auto">
                        {availableDiscounts.map((discount) => {
                          const sourceLabel = getSourceLabel(discount)

                          return (
                            <DropdownMenuItem
                              key={`${discount.source}-${discount.id}`}
                              onClick={() => onMemberDiscountSelect?.(discount)}
                              className={selectedDiscount?.id === discount.id ? 'bg-accent' : ''}
                            >
                              <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{discount.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {sourceLabel}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    {selectedDiscount?.id === discount.id && (
                                      <Check className="h-3 w-3 mr-1 text-green-600" />
                                    )}
                                    <span className="text-xs font-medium">
                                      {formatDiscount(discount)}
                                    </span>
                                  </div>
                                </div>
                                {discount.minPurchase > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Min. purchase: Rp {discount.minPurchase.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </DropdownMenuItem>
                          )
                        })}

                        {selectedDiscount && (
                          <>
                            <div className="border-t my-1" />
                            <DropdownMenuItem
                              onClick={() => onMemberDiscountSelect?.(null)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 font-medium"
                            >
                              <X className="h-4 w-4 mr-1.5" />
                              {t('cashier.memberSection.removeDiscount')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-muted/20 border-t">
                  <div className="flex items-center">
                    <Ticket className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t('cashier.memberSection.noDiscountsAvailable')}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  )
}

export default memo(MemberSection)
