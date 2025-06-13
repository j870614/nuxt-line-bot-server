// server/api/debug/env.ts
import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    LINE_ACCESS_TOKEN: config.LINE_ACCESS_TOKEN ? '✅ 已讀取' : '❌ 未設定',
    LINE_CHANNEL_SECRET: config.LINE_CHANNEL_SECRET ? '✅ 已讀取' : '❌ 未設定',
    SUPABASE_URL: config.SUPABASE_URL ? '✅ 已讀取' : '❌ 未設定',
    SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已讀取' : '❌ 未設定'
  }
})
