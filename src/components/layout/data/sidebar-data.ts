import { IconCreditCard, IconReceipt2, IconUsersGroup } from '@tabler/icons-react'
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
      plan: 'sidebar:stores.plan'
    }
  ],
  navGroups: [
    {
      title: 'sidebar:navGroups.title',
      items: [
        {
          title: 'sidebar:navGroups.items.cashier',
          url: '/',
          icon: IconCreditCard
        },
        {
          title: 'sidebar:navGroups.items.transactions',
          url: '/transactions',
          icon: IconReceipt2
        },
        {
          title: 'sidebar:navGroups.items.members',
          url: '/member',
          icon: IconUsersGroup
        }
      ]
    }
  ]
}
