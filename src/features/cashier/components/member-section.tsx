import { useState, useRef, useCallback } from 'react'
import { Search, Loader2, UserPlus, X, Ticket, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/config/api'
import { CreateMemberDialog } from './create-member-dialog'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Member, MemberResponse, MemberSectionProps, Discount } from '@/types/cashier'
import { useDebounce } from '@/hooks/use-debounce'
import { useClickOutside } from '@/hooks/use-click-outside'

export function MemberSection({
  onMemberSelect,
  onMemberDiscountSelect,
  selectedDiscount,
  subtotal = 0
}: MemberSectionProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showCreateMemberDialog, setShowCreateMemberDialog] = useState(false)
  const [lastSearchedQuery, setLastSearchedQuery] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Create a memoized search function that avoids duplicate API calls
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
    isDebouncing,
    isTooShort
  } = useDebounce('', {
    minLength: 3,
    callback: searchCallback
  })

  // Use click outside hook
  useClickOutside([resultsRef, inputRef], () => {
    setShowResults(false)
  })

  const searchMembers = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)

    try {
      const response = (await window.api.request(
        `${API_ENDPOINTS.MEMBERS.BASE}?search=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET'
        }
      )) as MemberResponse

      if (response.success && response.data?.members?.length > 0) {
        setSearchResults(response.data.members)
        setShowResults(true)

        // Auto-select if there's an exact match
        const exactMatch = response.data.members.find(
          (m) =>
            m.phone === searchQuery ||
            m.cardId === searchQuery ||
            m.name.toLowerCase() === searchQuery.toLowerCase()
        )
        if (exactMatch) {
          handleMemberSelect(exactMatch)
        }
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
  }

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member)
    setShowResults(false)
    setQuery('')
    setLastSearchedQuery('')
    if (onMemberSelect) {
      onMemberSelect(member)
    }
  }

  const clearMember = () => {
    setSelectedMember(null)
    setLastSearchedQuery('')
    if (onMemberSelect) {
      onMemberSelect(null)
    }
    if (onMemberDiscountSelect) {
      onMemberDiscountSelect(null)
    }
  }

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearchResults([])
    setShowResults(false)
    setLastSearchedQuery('')
    inputRef.current?.focus()
  }

  const handleManualSearch = () => {
    if (query.trim().length >= 3 && query !== lastSearchedQuery) {
      searchMembers(query)
      setLastSearchedQuery(query)
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
          Member
        </h3>

        {selectedMember && (
          <Button variant="ghost" size="sm" onClick={clearMember} className="h-8 px-2">
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {selectedMember ? (
        <div className="rounded-md border bg-card p-3 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedMember.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 sm:hidden">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{selectedMember.name}</p>
                  <Badge
                    variant={selectedMember.tier?.name ? 'default' : 'outline'}
                    className="ml-2"
                  >
                    {selectedMember.tier?.name || 'Regular'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="hidden sm:flex items-center justify-between">
                <p className="font-medium truncate">{selectedMember.name}</p>
                <Badge variant={selectedMember.tier?.name ? 'default' : 'outline'} className="ml-2">
                  {selectedMember.tier?.name || 'Regular'}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1 gap-1 sm:gap-0">
                <div className="text-xs text-muted-foreground">
                  <p>{selectedMember.phone}</p>
                  {selectedMember.cardId && (
                    <p className="mt-1">Card ID: {selectedMember.cardId}</p>
                  )}
                </div>
                <div className="flex items-center text-xs">
                  <span className="font-medium text-amber-500">{selectedMember.totalPoints}</span>
                  <span className="text-muted-foreground ml-1">points</span>
                </div>
              </div>

              {/* Member discount dropdown */}
              {hasAvailableDiscounts && (
                <div className="mt-2 pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Ticket className="h-3 w-3 mr-1" />
                    Member Discount:
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          selectedDiscount
                            ? 'text-green-600 border-green-200 hover:bg-green-50 h-7 text-xs w-full sm:w-auto'
                            : 'h-7 text-xs w-full sm:w-auto'
                        }
                      >
                        {selectedDiscount
                          ? `${selectedDiscount.name} (${formatDiscount(selectedDiscount)})`
                          : 'Select discount'}
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
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Remove Discount
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="Search member ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim().length >= 3) {
                  handleManualSearch()
                  e.preventDefault()
                }
              }}
              onFocus={handleInputFocus}
              className="pr-16"
            />

            {query && !isLoading && !isDebouncing && (
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
              onClick={handleManualSearch}
              disabled={query.trim().length < 3 || isLoading || isDebouncing}
            >
              {isLoading || isDebouncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>

            {/* Search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <Card
                className="absolute z-50 w-full left-0 right-0 mt-1 max-h-64 overflow-auto shadow-lg"
                ref={resultsRef}
              >
                <ul className="py-1 divide-y divide-border">
                  {searchResults.map((member) => (
                    <li
                      key={member.id}
                      className="px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleMemberSelect(member)}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
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
                            <Badge
                              variant={member.tier?.name ? 'default' : 'outline'}
                              className="sm:ml-2"
                            >
                              {member.tier?.name || 'Regular'}
                            </Badge>
                          </div>
                          <p className="text-xs text-amber-500 mt-1">
                            Points: {member.totalPoints}
                          </p>

                          {member.discountRelationsMember &&
                            member.discountRelationsMember.length > 0 && (
                              <p className="text-xs text-green-600 mt-1">
                                <Ticket className="h-3 w-3 inline mr-1" />
                                {member.discountRelationsMember.length} discount(s)
                              </p>
                            )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Loading state */}
          {(isLoading || isDebouncing) && query.trim() !== '' && (
            <div className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Searching members...
            </div>
          )}

          {/* No results message */}
          {!isLoading &&
            !isDebouncing &&
            query.trim().length >= 3 &&
            searchResults.length === 0 && (
              <div className="text-sm text-muted-foreground flex items-center">
                <X className="h-3 w-3 mr-2" />
                No members found
              </div>
            )}

          {/* Minimum character hint */}
          {isTooShort && (
            <div className="text-sm text-muted-foreground flex items-center">
              Enter at least 3 characters to search
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowCreateMemberDialog(true)}
          >
            <UserPlus className="h-3 w-3 mr-1" /> New Member
          </Button>
        </div>
      )}

      <CreateMemberDialog
        open={showCreateMemberDialog}
        onOpenChange={setShowCreateMemberDialog}
        onSuccess={handleMemberSelect}
      />
    </div>
  )
}
