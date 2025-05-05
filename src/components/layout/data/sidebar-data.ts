import { IconCreditCard, IconReceipt2, IconUsersGroup } from '@tabler/icons-react'
import { type SidebarData } from '../types'
import logo from '../../../../resources/public/logo.png?asset'

export const sidebarData: SidebarData = {
  user: {
    name: 'sasuai',
    email: 'admin@sasuai.com',
    avatar: '/avatars/shadcn.jpg'
  },
  stores: [
    {
      name: 'Sasuai Store',
      logo: logo,
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
