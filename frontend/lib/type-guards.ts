


export function isIOSPWA(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  return (
    'navigator' in window &&
    'standalone' in window.navigator &&
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}


export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }
  
  const date = new Date(value)
  return !isNaN(date.getTime())
}


export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}


export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}


export function isValidInteger(value: unknown): value is number {
  return isValidNumber(value) && Number.isInteger(value)
}


export function isValidEmailFormat(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

