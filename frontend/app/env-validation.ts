

import { validateEnvVariables } from '@/frontend/lib/env'
try {
  validateEnvVariables()
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('\n Environment Variable Validation Failed:\n')
    console.error(error instanceof Error ? error.message : String(error))
    console.error('\nPlease check your .env.local file.\n')
  }
  throw error
}

