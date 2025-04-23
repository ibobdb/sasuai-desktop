import { useState, useRef, useEffect } from 'react'
import { Search, Loader2, UserPlus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/config/api'
import { CreateMemberDialog } from './create-member-dialog'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

export type Member = {
  id: string
  name: string
  phone: string
  email: string | null
  tierId: string | null
  totalPoints: number
  totalPointsEarned: number
  joinDate: string
  tier: { name?: string; level?: string } | null
  cardId?: string | null
}

type MemberResponse = {
  data: {
    members: Member[]
    totalCount: number
    totalPages: number
    currentPage: number
  }
  success: boolean
}

type MemberSectionProps = {
  onMemberSelect?: (member: Member | null) => void
  subtotal?: number
}

export function MemberSection({ onMemberSelect, subtotal = 0 }: MemberSectionProps) {
  const [query, setQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showCreateMemberDialog, setShowCreateMemberDialog] = useState(false)
  const { token } = useAuthStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Calculate points to earn (moved from index.tsx)
  const pointsToEarn = selectedMember ? Math.floor(subtotal / 1000) : 0

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchMembers(query)
      } else if (query.trim() === '') {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const searchMembers = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)

    try {
      const response = (await window.api.fetchApi(
        `${API_ENDPOINTS.MEMBERS.BASE}?search=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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
    if (onMemberSelect) {
      onMemberSelect(member)
    }
  }

  const clearMember = () => {
    setSelectedMember(null)
    if (onMemberSelect) {
      onMemberSelect(null)
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
    inputRef.current?.focus()
  }

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
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border">
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedMember.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{selectedMember.name}</p>
                <Badge variant={selectedMember.tier?.name ? 'default' : 'outline'} className="ml-2">
                  {selectedMember.tier?.name || 'Regular'}
                </Badge>
              </div>

              <div className="flex justify-between items-center mt-1">
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

              {/* Points to earn display */}
              {subtotal > 0 && (
                <div className="mt-2 text-xs border-t pt-2 text-muted-foreground">
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Points to earn:</span>
                    <span>{pointsToEarn}</span>
                  </div>
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
                if (e.key === 'Enter' && query.trim() !== '') {
                  searchMembers(query)
                }
              }}
              onFocus={handleInputFocus}
              disabled={isLoading}
              className="pr-8"
            />

            {query && !isLoading && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-8 top-0 h-full w-8"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            <Button
              size="icon"
              className="absolute right-0 top-0 h-full rounded-l-none"
              onClick={() => searchMembers(query)}
              disabled={query.trim() === '' || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>

            {/* Search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <Card
                className="absolute z-50 w-[100%] left-0 right-0 mt-1 max-h-64 overflow-auto"
                ref={resultsRef}
              >
                <ul className="py-1 divide-y divide-border">
                  {searchResults.map((member) => (
                    <li
                      key={member.id}
                      className="px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleMemberSelect(member)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <div className="text-xs text-muted-foreground">
                            <span>Phone: {member.phone}</span>
                            {member.cardId && (
                              <span className="ml-2">Card ID: {member.cardId}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={member.tier?.name ? 'default' : 'outline'}
                            className="ml-2"
                          >
                            {member.tier?.name || 'Regular'}
                          </Badge>
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

          {/* Move these outside the relative div */}
          {/* Loading state */}
          {isLoading && query.trim() !== '' && (
            <div className="text-sm text-muted-foreground">Searching members...</div>
          )}

          {/* No results message */}
          {!isLoading && query.trim().length >= 2 && searchResults.length === 0 && (
            <div className="text-sm text-muted-foreground">No members found</div>
          )}

          <div className="flex items-center justify-between gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowCreateMemberDialog(true)}
            >
              <UserPlus className="h-3 w-3 mr-1" /> New Member
            </Button>
          </div>
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
