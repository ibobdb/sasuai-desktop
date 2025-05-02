import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export function ProfileDropdown() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('You have been logged out')
      navigate({ to: '/sign-in' })
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  if (!user) return null

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full hover:bg-accent/80 hover:scale-105 transition-transform duration-200 group"
        >
          <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="hover:bg-accent">{user.name}</AvatarFallback>
          </Avatar>
          {!isOpen && (
            <span
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 
                pointer-events-none select-none
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 delay-300 whitespace-nowrap"
            >
              {user.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-3 hover:bg-accent/50 rounded-t-lg transition-colors">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/5 hover:text-destructive rounded-b-lg transition-colors duration-200 px-3 py-2"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
