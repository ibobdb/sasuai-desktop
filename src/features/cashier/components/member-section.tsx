import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Ticket, Check, UserPlus, Phone, CreditCard, MapPin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Member, MemberSectionProps, Discount } from '@/types/cashier'
import { MemberSearch } from './member-search'
import { Card } from '@/components/ui/card'
import { getTierBadgeVariant } from '@/features/member/components/member-columns'
import { isDiscountValid } from '../utils'

// Enhanced discount interface that includes source information for UI
interface EnhancedDiscount extends Discount {
  source: 'member' | 'tier'
}

export function MemberSection({
  onMemberSelect,
  onMemberDiscountSelect,
  selectedDiscount,
  subtotal = 0,
  member
}: MemberSectionProps) {
  const { t } = useTranslation(['cashier'])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // Synchronize internal state with parent state
  useEffect(() => {
    setSelectedMember(member)
  }, [member])

  // Handle member selection and their available discounts
  const handleMemberSelect = (member: Member | null) => {
    setSelectedMember(member)

    // Pass to parent component
    if (onMemberSelect) {
      onMemberSelect(member)
    }

    // Reset member discount when changing members
    if (onMemberDiscountSelect) {
      onMemberDiscountSelect(null)
    }

    // Auto-select member discount if only one is available and meets minimum purchase
    if (member) {
      const availableDiscounts = getAvailableMemberDiscounts()
      if (availableDiscounts.length === 1) {
        const memberDiscount = availableDiscounts[0]
        if (subtotal >= memberDiscount.minPurchase && onMemberDiscountSelect) {
          onMemberDiscountSelect(memberDiscount)
        }
      }
    }
  }

  // Clear selected member
  const clearMember = () => {
    setSelectedMember(null)
    if (onMemberSelect) {
      onMemberSelect(null)
    }
    if (onMemberDiscountSelect) {
      onMemberDiscountSelect(null)
    }
  }

  // Format discount for display
  const formatDiscount = (discount: Discount) => {
    if (discount.type === 'PERCENTAGE') {
      return `${discount.value}%`
    }
    return `Rp ${discount.value.toLocaleString()}`
  }

  // Check if discount is applicable based on minimum purchase
  const isDiscountApplicable = (discount: Discount) => {
    return !discount.minPurchase || subtotal >= discount.minPurchase
  }

  // Get available member discounts from both member and tier
  const getAvailableMemberDiscounts = (): EnhancedDiscount[] => {
    if (!selectedMember) return []

    // Get member's direct discounts
    const memberDiscounts: EnhancedDiscount[] = (selectedMember.discounts || [])
      .filter(isDiscountValid)
      .map((discount) => ({
        ...discount,
        source: 'member'
      }))

    // Get tier discounts
    const tierDiscounts: EnhancedDiscount[] = (selectedMember.tier?.discounts || [])
      .filter(isDiscountValid)
      .map((discount) => ({
        ...discount,
        source: 'tier'
      }))

    // Combine both sources
    return [...memberDiscounts, ...tierDiscounts]
  }

  // Get source label for discount (for display purposes)
  const getSourceLabel = (discount: EnhancedDiscount) => {
    return discount.source === 'member'
      ? t('cashier.memberSection.personalDiscount')
      : t('cashier.memberSection.tierDiscount')
  }

  // Handle discount selection with source information
  const handleDiscountSelect = (discount: EnhancedDiscount, applicable: boolean) => {
    if (applicable && onMemberDiscountSelect) {
      // Pass both the discount and its source to the parent component
      onMemberDiscountSelect(discount)
    } else if (!applicable) {
      toast.error(
        `${t('cashier.memberSection.minPurchase', {
          amount: discount.minPurchase?.toLocaleString()
        })}`
      )
    }
  }

  const availableDiscounts = getAvailableMemberDiscounts()
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

          {/* Member discount section - adjusted padding */}
          {hasAvailableDiscounts && (
            <div className="p-2 bg-primary/5 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center">
                  <Ticket className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
                  <span className="font-medium text-sm">
                    {t('cashier.memberSection.discounts')}
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
                      const applicable = isDiscountApplicable(discount)
                      return (
                        <DropdownMenuItem
                          key={discount.id}
                          onClick={() => {
                            if (applicable) {
                              handleDiscountSelect(discount, applicable)
                            } else {
                              toast.error(
                                `${t('cashier.memberSection.minPurchase', {
                                  amount: discount.minPurchase?.toLocaleString()
                                })}`
                              )
                            }
                          }}
                          disabled={!applicable}
                          className={selectedDiscount?.id === discount.id ? 'bg-accent' : ''}
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between">
                              <span>
                                {discount.name}
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({getSourceLabel(discount)})
                                </span>
                              </span>
                              <span className="ml-2 text-xs">
                                {selectedDiscount?.id === discount.id && (
                                  <Check className="h-3 w-3 inline mr-1" />
                                )}
                                {formatDiscount(discount)}
                              </span>
                            </div>
                            {discount.minPurchase > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('cashier.memberSection.minPurchase', {
                                  amount: discount.minPurchase.toLocaleString()
                                })}
                              </p>
                            )}
                          </div>
                        </DropdownMenuItem>
                      )
                    })}

                    {selectedDiscount && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onMemberDiscountSelect && onMemberDiscountSelect(null)}
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
          )}
        </Card>
      )}
    </div>
  )
}
