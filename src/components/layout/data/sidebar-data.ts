import { IconCreditCard, IconReceipt2 } from '@tabler/icons-react'
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
      logo: 'https://res.cloudinary.com/samunu/image/upload/f_auto/q_auto/v1745953012/icon_z07a9i.png',
      plan: 'Store Management'
    }
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Cashier',
          url: '/',
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
