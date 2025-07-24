import { useState, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Loader2, UserPlus, X, Ticket } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { CreateMemberDialog } from './create-member-dialog'
import { Member, MemberSearchProps } from '@/types/cashier'
import { getTierBadgeVariant } from '@/features/member/components/member-columns'
import { useMemberSearch as useMemberSearchHook } from '../hooks/use-member-search'

export function MemberSearch({ onMemberSelect }: MemberSearchProps) {
  const { t } = useTranslation(['cashier'])
  const [showCreateMemberDialog, setShowCreateMemberDialog] = useState(false)

  const handleMemberSelect = useCallback(
    (member: Member) => {
      if (member.isBanned) {
        toast.error(t('cashier.memberSearch.memberBanned'), {
          description: t('cashier.memberSearch.memberBannedDescription')
        })
        return
      }

      onMemberSelect(member)
    },
    [onMemberSelect, t]
  )

  const memberSearchConfig = {
    onMemberSelect: handleMemberSelect
  }

  const memberSearch = useMemberSearchHook(memberSearchConfig)

  const {
    query,
    setQuery,
    results: searchResults,
    showResults,
    isLoading,
    isDebouncing,
    isTooShort,
    handleSelect,
    handleManualSearch,
    clearSearch,
    handleInputFocus,
    focusedIndex,
    listItemsRef,
    handleKeyDown,
    handleItemMouseEnter,
    inputRef,
    resultsRef
  } = memberSearch

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
        {showResults && (
          <Card
            className="absolute z-50 w-full left-0 right-0 mt-1 max-h-64 overflow-auto shadow-lg"
            ref={resultsRef}
          >
            <div className="p-2">
              {isLoading || isDebouncing ? (
                // Simple spinner loading state
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('cashier.memberSearch.searching')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('cashier.memberSearch.searchingDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
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
                      onClick={() => !member.isBanned && handleSelect(member)}
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
                            <span>{t('cashier.memberSearch.phone', { phone: member.phone })}</span>
                            {member.cardId && (
                              <span className="block sm:inline sm:ml-2">
                                {t('cashier.memberSearch.cardId', { cardId: member.cardId })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="sm:text-right mt-2 sm:mt-0">
                          <div className="flex sm:justify-end">
                            <Badge
                              className={`capitalize ${getTierBadgeVariant(member.tier?.name)}`}
                            >
                              {member.tier?.name || t('member.tiers.regular')}
                            </Badge>
                          </div>
                          <p className="text-xs text-amber-500 mt-1">
                            {t('cashier.memberSection.points', { points: member.totalPoints })}
                          </p>

                          {member.discounts && member.discounts.length > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              <Ticket className="h-3 w-3 inline mr-1" />
                              {t('cashier.memberSearch.discounts', {
                                count: member.discounts.length
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : query.trim().length >= 3 && !isLoading && !isDebouncing ? (
                <div className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <X className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-muted-foreground">
                        {t('cashier.memberSearch.noMembersFound')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('cashier.memberSearch.noResults', { query: query.trim() })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        )}
      </div>

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
