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
import { Member, MemberSectionProps, Discount, MemberDiscount } from '@/types/cashier'
import { MemberSearch } from './member-search'
import { Card } from '@/components/ui/card'
import { getTierBadgeVariant } from '@/features/member/components/member-columns'

export function MemberSection({
  onMemberSelect,
  onMemberDiscountSelect,
  selectedDiscount,
  subtotal = 0,
  member
}: MemberSectionProps) {
  const { t } = useTranslation(['cashier'])
  const [selectedMember, setSelectedMember] = useState<
    (Member & { discountRelationsMember?: MemberDiscount[] }) | null
  >(null)

  // Synchronize internal state with parent state
  useEffect(() => {
    setSelectedMember(member)
  }, [member])

  // Handle member selection and their available discounts
  const handleMemberSelect = (
    member: (Member & { discountRelationsMember?: MemberDiscount[] }) | null
  ) => {
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
    if (member?.discountRelationsMember?.length === 1) {
      const memberDiscount = member.discountRelationsMember[0].discount
      if (subtotal >= memberDiscount.minPurchase && onMemberDiscountSelect) {
        onMemberDiscountSelect(memberDiscount)
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
    if (discount.valueType === 'percentage') {
      return `${discount.value}%`
    }
    return `Rp ${discount.value.toLocaleString()}`
  }

  // Check if discount is applicable based on minimum purchase
  const isDiscountApplicable = (discount: Discount) => {
    return subtotal >= discount.minPurchase
  }

  // Get available member discounts
  const getAvailableMemberDiscounts = () => {
    if (!selectedMember?.discountRelationsMember) return []
    return selectedMember.discountRelationsMember
      .filter((relation) => relation.discount.isActive)
      .map((relation) => relation.discount)
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
                    {t('cashier.memberSection.memberDiscount')}
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
                            if (applicable && onMemberDiscountSelect) {
                              onMemberDiscountSelect(discount)
                            } else if (!applicable) {
                              toast.error(
                                `Minimum purchase of Rp ${discount.minPurchase.toLocaleString()} required`
                              )
                            }
                          }}
                          disabled={!applicable}
                          className={selectedDiscount?.id === discount.id ? 'bg-accent' : ''}
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between">
                              <span>{discount.name}</span>
                              <span className="ml-2 text-xs">
                                {selectedDiscount?.id === discount.id && (
                                  <Check className="h-3 w-3 inline mr-1" />
                                )}
                                {formatDiscount(discount)}
                              </span>
                            </div>
                            {discount.minPurchase > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Min. purchase: Rp {discount.minPurchase.toLocaleString()}
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
                          Remove Discount
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
