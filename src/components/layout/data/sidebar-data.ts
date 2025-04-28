import { IconLayoutDashboard, IconCreditCard, IconReceipt2 } from '@tabler/icons-react'
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
      logo: '/resources/icon.png',
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
          icon: IconCreditCard
        },
        {
          title: 'Transactions',
          url: '/transactions',
          icon: IconReceipt2
        }
      ]
    }
  ]
}
