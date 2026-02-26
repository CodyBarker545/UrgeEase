

export function validateEnvVariables() {
  if (process.env.NODE_ENV === 'development') {
    console.info(
      '[env] Supabase env validation disabled – running in frontend-only mock mode.'
    )
  }
}

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
}

export function getSupabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
}


