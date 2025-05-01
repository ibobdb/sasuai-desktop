import { createFileRoute } from '@tanstack/react-router'
import Members from '@/features/member'

export const Route = createFileRoute('/_authenticated/member')({
  component: Members
})
