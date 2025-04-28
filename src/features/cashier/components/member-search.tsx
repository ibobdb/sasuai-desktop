import { useState, useRef, useCallback } from 'react'
import { Search, Loader2, UserPlus, X, Ticket } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/config/api'
import { CreateMemberDialog } from './create-member-dialog'
import { Member, MemberResponse } from '@/types/cashier'
import { useDebounce } from '@/hooks/use-debounce'
import { useClickOutside } from '@/hooks/use-click-outside'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'

interface MemberSearchProps {
  onMemberSelect: (member: Member | null) => void
}

export function MemberSearch({ onMemberSelect }: MemberSearchProps) {
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

  // Define member select handler before it's used
  const handleMemberSelect = useCallback(
    (member: Member) => {
      setShowResults(false)
      setQuery('')
      setLastSearchedQuery('')
      onMemberSelect(member)
    },
    [onMemberSelect, setQuery, setLastSearchedQuery]
  )

  // Define manual search handler before it's used
  const handleManualSearch = useCallback(() => {
    if (query.trim().length >= 3 && query !== lastSearchedQuery) {
      searchMembers(query)
      setLastSearchedQuery(query)
    }
  }, [query, lastSearchedQuery])

  // Define searchMembers before it's used
  const searchMembers = useCallback(
    async (searchQuery: string) => {
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
    },
    [handleMemberSelect]
  )

  // Now use the useKeyboardNavigation hook
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
    setSearchResults([])
    setShowResults(false)
    setLastSearchedQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Search member ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
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
              {searchResults.map((member, index) => (
                <li
                  key={member.id}
                  ref={(el) => {
                    listItemsRef.current[index] = el
                  }}
                  className={`px-3 py-2 transition-colors cursor-pointer ${
                    index === focusedIndex ? 'bg-accent' : 'hover:bg-accent'
                  }`}
                  onClick={() => handleMemberSelect(member)}
                  onMouseEnter={() => handleItemMouseEnter(index)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span>Phone: {member.phone}</span>
                        {member.cardId && (
                          <span className="block sm:inline sm:ml-2">Card ID: {member.cardId}</span>
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
                      <p className="text-xs text-amber-500 mt-1">Points: {member.totalPoints}</p>

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
      {!isLoading && !isDebouncing && query.trim().length >= 3 && searchResults.length === 0 && (
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

      <CreateMemberDialog
        open={showCreateMemberDialog}
        onOpenChange={setShowCreateMemberDialog}
        onSuccess={handleMemberSelect}
      />
    </div>
  )
}
