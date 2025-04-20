import { h } from 'vue'
import type { VNode, VNodeArrayChildren } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { createColumnHelper } from '@tanstack/vue-table'
import { ArrowUpDown, ChevronDown } from 'lucide-vue-next'
import { Button } from '~~/components/ui/button'
interface Location {
  address?: string
  city?: string
  region?: string
  postal_code?: string
  country?: string
}

interface PaymentMeta {
  [key: string]: string | undefined
}

interface Counterparty {
  name: string
  type?: string
}

export interface Payment {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
  account_id: string
  account_owner: string
  authorized_date: string
  authorized_datetime: string
  category: string[]
  category_id: string
  check_number: string
  counterparties: Counterparty[]
  date: string
  datetime: string
  iso_currency_code: string
  location: Location | null
  logo_url: string
  merchant_entity_id: string
  merchant_name: string
  name: string
  payment_channel: string
  payment_meta: PaymentMeta | null
  pending: boolean
  pending_transaction_id: string
  personal_finance_category: string | null
  personal_finance_category_icon_url: string
  transaction_code: string
  transaction_id: string
  transaction_type: string
  unofficial_currency_code: string
  website: string
  institution_name: string
  account_name: string
}

export const payments: Payment[] = [
  {
    id: '728ed52f',
    amount: 100,
    status: 'pending',
    email: 'm@example.com',
    account_id: '12345',
    account_owner: 'John Doe',
    authorized_date: '2024-04-01',
    authorized_datetime: '2024-04-01T10:00:00',
    category: ['Food', 'Dining'],
    category_id: '1',
    check_number: '123456',
    counterparties: [],
    date: '2024-04-01',
    datetime: '2024-04-01T10:00:00',
    iso_currency_code: 'USD',
    location: null,
    logo_url: 'https://example.com/logo.png',
    merchant_entity_id: '1',
    merchant_name: 'Starbucks',
    name: 'Starbucks Coffee',
    payment_channel: 'Credit Card',
    payment_meta: null,
    pending: true,
    pending_transaction_id: '728ed52f',
    personal_finance_category: null,
    personal_finance_category_icon_url: '',
    transaction_code: '1234567890',
    transaction_id: '728ed52f',
    transaction_type: 'Credit',
    unofficial_currency_code: '',
    website: 'https://www.starbucks.com',
    institution_name: 'Bank of America',
    account_name: 'Checking',
  },
]

const columnHelper = createColumnHelper<Payment>()

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'merchant_name',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Merchant', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        row.getValue('logo_url')
          ? h('img', {
              src: row.getValue('logo_url'),
              class: 'w-4 h-4 rounded-full',
              alt: row.getValue('merchant_name'),
            })
          : null,
        h('div', { class: 'flex flex-col' }, [
          h(
            'span',
            { class: 'font-medium' },
            row.getValue('merchant_name') || row.getValue('name')
          ),
          row.getValue('website')
            ? h(
                'a',
                {
                  href: row.getValue('website'),
                  class: 'text-xs text-muted-foreground hover:underline',
                  target: '_blank',
                },
                'Visit website'
              )
            : null,
        ]),
      ]),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Amount', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency:
          row.getValue('iso_currency_code') || row.getValue('unofficial_currency_code') || 'USD',
      }).format(amount)

      return h(
        'div',
        {
          class: `text-right font-medium ${amount < 0 ? 'text-red-500' : 'text-green-500'}`,
        },
        formatted
      )
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Date & Time', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) => {
      const dateStr = (row.getValue('datetime') || row.getValue('date')) as string
      if (!dateStr) return null

      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return null

        return h('div', { class: 'flex flex-col w-[100px]' }, [
          h(
            'span',
            { class: 'font-medium' },
            new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }).format(date)
          ),
          dateStr === row.getValue('datetime')
            ? h(
                'span',
                { class: 'text-xs text-muted-foreground' },
                new Intl.DateTimeFormat('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                }).format(date)
              )
            : null,
        ])
      } catch (error) {
        console.error('Error formatting date:', error)
        return h('div', { class: 'text-muted-foreground' }, ['Invalid date'])
      }
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Category', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) => {
      const categories = row.getValue('category') as string[]
      const personalFinanceCategory = row.getValue('personal_finance_category') as string | null
      const iconUrl = row.getValue('personal_finance_category_icon_url') as string

      return h('div', { class: 'space-y-1 w-[300px]' }, [
        h(
          'div',
          { class: 'flex flex-wrap gap-1' },
          categories?.map(cat =>
            h(
              'span',
              { class: 'px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground' },
              cat
            )
          ) || []
        ),
        personalFinanceCategory
          ? h('div', { class: 'flex items-center gap-1' }, [
              iconUrl
                ? h('img', {
                    src: iconUrl,
                    class: 'w-3 h-3',
                    alt: '',
                  })
                : null,
              h('span', { class: 'text-xs text-muted-foreground' }, [personalFinanceCategory]),
            ])
          : null,
      ])
    },
  },
  {
    accessorKey: 'pending',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Status', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) => {
      const pending = row.getValue('pending') as boolean
      const pendingId = row.getValue('pending_transaction_id') as string

      return h('div', { class: 'space-y-1' }, [
        h(
          'div',
          {
            class: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              pending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`,
          },
          [pending ? 'Pending' : 'Completed']
        ),
        pendingId
          ? h('div', { class: 'text-xs text-muted-foreground' }, [`ID: ${pendingId}`])
          : null,
      ])
    },
  },
  {
    accessorKey: 'counterparties',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Counterparties', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) => {
      const counterparties = row.getValue('counterparties') as Counterparty[]
      if (!counterparties?.length) return null

      const elements: VNodeArrayChildren = counterparties.map(party =>
        h(
          'span',
          {
            class: 'px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground',
          },
          [party.name]
        )
      )

      return h('div', { class: 'flex flex-wrap gap-1' }, elements)
    },
  },
  {
    accessorKey: 'institution_name',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Institution', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) => {
      const institutionName = row.getValue('institution_name') as string
      return h('div', { class: 'text-xs text-muted-foreground' }, [institutionName])
    },
  },
]
