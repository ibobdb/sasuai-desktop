import { useState } from 'react'
import { Search, Loader2, UserPlus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/config/api'
import { CreateMemberDialog } from './create-member-dialog'

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
}

export function MemberSection({ onMemberSelect }: MemberSectionProps) {
  const [query, setQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showMemberSearch, setShowMemberSearch] = useState(false)
  const [showCreateMemberDialog, setShowCreateMemberDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useAuthStore()

  const handleSearch = async () => {
    if (!query.trim()) return

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
        const exactMatch = response.data.members.find(
          (m) => m.phone === query || m.name.toLowerCase() === query.toLowerCase()
        )
        const member = exactMatch || response.data.members[0]

        handleMemberSelect(member)
      } else {
        toast.error('No member found', {
          description: 'Please try a different name or phone number'
        })
      }
    } catch (error) {
      console.error('Failed to search for member:', error)
      toast.error('Failed to search for member', {
        description: 'Please try again later'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member)
    setShowMemberSearch(false)
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
                <p className="text-xs text-muted-foreground">{selectedMember.phone}</p>
                <div className="flex items-center text-xs">
                  <span className="font-medium text-amber-500">{selectedMember.totalPoints}</span>
                  <span className="text-muted-foreground ml-1">points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : showMemberSearch ? (
        <div className="space-y-2">
          <div className="relative">
            <Input
              placeholder="Search by phone or name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
              className="pr-8"
              autoFocus
            />
            {query && !isLoading && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-8 top-0 h-full w-8"
                onClick={() => setQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {isLoading ? (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Button
                size="icon"
                className="absolute right-0 top-0 h-full rounded-l-none"
                onClick={handleSearch}
                disabled={query.trim() === ''}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowMemberSearch(false)}
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setShowMemberSearch(false)
                setShowCreateMemberDialog(true)
              }}
            >
              <UserPlus className="h-3 w-3 mr-1" /> New Member
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowMemberSearch(true)}
          >
            <Search className="h-4 w-4 mr-2" /> Find Member
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowCreateMemberDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" /> New Member
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
