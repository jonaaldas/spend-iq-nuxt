import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// auth tables
export const user = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  t => ({
    emailIndex: index('email_index').on(t.email),
  })
)

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  t => ({
    userIdIndex: index('idx_sessions_userId').on(t.userId),
    expiresAtIndex: index('idx_sessions_token').on(t.token),
    sessionTokenIndex: index('idx_sessions_userId_token').on(t.userId, t.token),
  })
)

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  t => ({
    userIdIndex: index('account_user_id_idx').on(t.userId),
  })
)

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  t => ({
    identifierIndex: index('idx_verifications_identifier').on(t.identifier),
  })
)

// app tables
export const plaidItems = sqliteTable('plaid_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  itemId: text('item_id').notNull(),
  accessToken: text('access_token').notNull(),
  institutionId: text('institution_id').notNull(),
  institutionName: text('institution_name').notNull(),
  dateConnected: text('date_connected').notNull(),
  accounts: text('accounts').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export type PlaidItem = typeof plaidItems.$inferSelect
