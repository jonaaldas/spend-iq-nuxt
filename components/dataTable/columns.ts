import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

interface Payment {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

export const payments: Payment[] = [
  {
    id: '728ed52f',
    amount: 100,
    status: 'pending',
    email: 'm@example.com',
  },
  {
    id: '489e1d42',
    amount: 125,
    status: 'processing',
    email: 'example@gmail.com',
  },
]

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)

      return h('div', { class: 'text-right font-medium' }, formatted)
    },
  },
  {
    accessorKey: 'status',
    header: () => h('div', { class: 'text-right' }, 'Status'),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return h('div', { class: 'text-right font-medium' }, status)
    },
  },
  {
    accessorKey: 'email',
    header: () => h('div', { class: 'text-right' }, 'Email'),
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return h('div', { class: 'text-right font-medium' }, email)
    },
  },
]
