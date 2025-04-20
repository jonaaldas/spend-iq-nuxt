import { drizzle } from 'drizzle-orm/libsql'

export const db = drizzle({
  connection: {
    url: 'libsql://spend-iq-dev-jonaaldas.turso.io',
    authToken:
      'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDA3NzkxMTYsImlkIjoiYTQxOTY2ZmMtMzM3OC00NDkzLThhZTEtMDRkODlmNDIyMTI5In0.dsqBRKjJ33qSfBWOH9N2-uTC4azl-txGi9PgrM5_Ov3sXL2vmlvtFPpxYHQZSwNrfjaCLhSIyKvyZdrSYXK7CA',
    // url: process.env.NUXT_TURSO_CONNECTION_URL as string,
    // authToken: process.env.NUXT_TURSO_AUTH_TOKEN as string,
  },
})
