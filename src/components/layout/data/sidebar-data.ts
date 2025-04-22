import { IconLayoutDashboard, IconCashBanknote } from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'sasuai',
    email: 'admin@sasuai.com',
    avatar: '/avatars/shadcn.jpg'
  },
  stores: [
    {
      name: 'Sasuai Store',
      logo: Command,
      plan: 'Store Management'
    }
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard
        },

        {
          title: 'Cashier',
          url: '/cashier',
          icon: IconCashBanknote
        }
      ]
    }
  ]
}
