import * as React from 'react'
import { cn } from '@/frontend/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md px-3 py-2 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          className
        )}
        style={{
          border: '2px solid rgba(227, 155, 99, 0.2)',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-dark)',
          fontFamily: 'var(--font-primary)',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)'
          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(227, 155, 99, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(227, 155, 99, 0.2)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }

