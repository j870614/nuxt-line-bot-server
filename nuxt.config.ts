// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  runtimeConfig: {
    // server-only
    LINE_ACCESS_TOKEN: '',
    LINE_CHANNEL_SECRET: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    public: {
      SUPABASE_URL: ''
    }
  }
})

