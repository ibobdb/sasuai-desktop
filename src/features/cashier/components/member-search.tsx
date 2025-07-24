import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Loader2, UserPlus, X, Ticket } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { CreateMemberDialog } from './create-member-dialog'
import { Member, MemberSearchProps } from '@/types/cashier'
import { useDebounce } from '@/hooks/use-debounce'
import { useClickOutside } from '@/hooks/use-click-outside'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { getTierBadgeVariant } from '@/features/member/components/member-columns'
import { useMemberSearch as useMemberSearchQuery } from '../hooks/use-cashier-queries'

export function MemberSearch({ onMemberSelect }: MemberSearchProps) {
  const { t } = useTranslation(['cashier'])
  const [showResults, setShowResults] = useState(false)
  const [showCreateMemberDialog, setShowCreateMemberDialog] = useState(false)
  const [lastSearchedQuery, setLastSearchedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const searchCallback = useCallback(
    (value: string) => {
      if (value.trim() && value !== lastSearchedQuery) {
        setLastSearchedQuery(value)
        setShowResults(true)
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

  // Use React Query for member search
  const { data: searchResults = [], isLoading } = useMemberSearchQuery(
    { query: lastSearchedQuery },
    lastSearchedQuery.length >= 3
  )

  const handleMemberSelect = useCallback(
    (member: Member) => {
      if (member.isBanned) {
        toast.error(t('cashier.memberSearch.memberBanned'), {
          description: t('cashier.memberSearch.memberBannedDescription')
        })
        return
      }

      setShowResults(false)
      setQuery('')
      setLastSearchedQuery('')
      onMemberSelect(member)
    },
    [onMemberSelect, setQuery, t]
  )

  const handleManualSearch = useCallback(() => {
    if (query.trim().length >= 3 && query !== lastSearchedQuery) {
      setLastSearchedQuery(query)
      setShowResults(true)
    }
  }, [query, lastSearchedQuery])

  // Auto-select exact matches
  const handleAutoSelect = useCallback(() => {
    if (searchResults.length > 0 && query.trim().length >= 3) {
      const exactMatch = searchResults.find(
        (m) =>
          m.phone === query || m.cardId === query || m.name.toLowerCase() === query.toLowerCase()
      )
      if (exactMatch) {
        handleMemberSelect(exactMatch)
      }
    }
  }, [searchResults, query, handleMemberSelect])

  // Call auto-select when search results change
  useEffect(() => {
    handleAutoSelect()
  }, [handleAutoSelect])

  const { focusedIndex, listItemsRef, handleKeyDown, handleItemMouseEnter } = useKeyboardNavigation(
    {
      items: searchResults,
      onSelectItem: handleMemberSelect,
      isDropdownVisible: showResults,
      setDropdownVisible: setShowResults,
      onSearch: handleManualSearch,
      searchQuery: query,
      minQueryLength: 3
    }
  )

  // Use click outside hook
  useClickOutside([resultsRef, inputRef], () => {
    setShowResults(false)
  })

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setShowResults(false)
    setLastSearchedQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={t('cashier.memberSearch.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className="pr-16 h-9"
          tabIndex={2}
          data-member-search-input
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
              {searchResults.map((member, index) => (
                <li
                  key={member.id}
                  ref={(el) => {
                    listItemsRef.current[index] = el
                  }}
                  className={`px-3 py-2 transition-colors ${
                    member.isBanned
                      ? 'cursor-not-allowed opacity-70'
                      : 'cursor-pointer ' +
                        (index === focusedIndex ? 'bg-accent' : 'hover:bg-accent')
                  }`}
                  onClick={() => !member.isBanned && handleMemberSelect(member)}
                  onMouseEnter={() => !member.isBanned && handleItemMouseEnter(index)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        {member.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            {t('cashier.memberSearch.banned')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span>
                          {t('cashier.memberSearch.phone')}: {member.phone}
                        </span>
                        {member.cardId && (
                          <span className="block sm:inline sm:ml-2">
                            {t('cashier.memberSearch.cardId')}: {member.cardId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="sm:text-right mt-2 sm:mt-0">
                      <div className="flex sm:justify-end">
                        <Badge className={`capitalize ${getTierBadgeVariant(member.tier?.name)}`}>
                          {member.tier?.name || t('member.tiers.regular')}
                        </Badge>
                      </div>
                      <p className="text-xs text-amber-500 mt-1">
                        {t('cashier.memberSection.points')}: {member.totalPoints}
                      </p>

                      {member.discounts && member.discounts.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          <Ticket className="h-3 w-3 inline mr-1" />
                          {member.discounts.length} discount(s)
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

      {/* No results message */}
      {!isLoading && !isDebouncing && query.trim().length >= 3 && searchResults.length === 0 && (
        <div className="text-xs text-muted-foreground flex items-center pt-0.5">
          <X className="h-3 w-3 mr-1" />
          {t('cashier.memberSearch.noMembersFound')}
        </div>
      )}

      {/* Minimum character hint */}
      {isTooShort && (
        <div className="text-xs text-muted-foreground flex items-center pt-0.5">
          {t('cashier.memberSearch.minCharacters')}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full h-7 mt-1"
        onClick={() => setShowCreateMemberDialog(true)}
      >
        <UserPlus className="h-3 w-3 mr-1" /> {t('cashier.memberSearch.newMember')}
      </Button>

      <CreateMemberDialog
        open={showCreateMemberDialog}
        onOpenChange={setShowCreateMemberDialog}
        onSuccess={handleMemberSelect}
      />
    </div>
  )
}

export default memo(MemberSearch)
