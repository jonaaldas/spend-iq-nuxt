export type Root = Root2[]

export interface Root2 {
  accounts: Account[]
  added: Added[]
  has_more: boolean
  modified: any[]
  next_cursor: string
  removed: any[]
  request_id: string
  transactions_update_status: string
}

export interface Account {
  account_id: string
  balances: Balances
  mask: string
  name: string
  official_name: string
  persistent_account_id?: string
  subtype: string
  type: string
}

export interface Balances {
  available?: number
  current: number
  iso_currency_code: string
  limit?: number
  unofficial_currency_code: any
}

export interface Added {
  account_id: string
  account_owner: any
  amount: number
  authorized_date?: string
  authorized_datetime: any
  category: string[]
  category_id: string
  check_number: any
  counterparties: Counterparty[]
  date: string
  datetime: any
  iso_currency_code: string
  location: Location
  logo_url?: string
  merchant_entity_id?: string
  merchant_name?: string
  name: string
  payment_channel: string
  payment_meta: PaymentMeta
  pending: boolean
  pending_transaction_id: any
  personal_finance_category: PersonalFinanceCategory
  personal_finance_category_icon_url: string
  transaction_code: any
  transaction_id: string
  transaction_type: string
  unofficial_currency_code: any
  website?: string
}

export interface Counterparty {
  confidence_level: string
  entity_id?: string
  logo_url?: string
  name: string
  phone_number: any
  type: string
  website?: string
}

export interface Location {
  address: any
  city: any
  country: any
  lat: any
  lon: any
  postal_code: any
  region: any
  store_number?: string
}

export interface PaymentMeta {
  by_order_of: any
  payee: any
  payer: any
  payment_method: any
  payment_processor: any
  ppd_id: any
  reason: any
  reference_number: any
}

export interface PersonalFinanceCategory {
  confidence_level: string
  detailed: string
  primary: string
}
