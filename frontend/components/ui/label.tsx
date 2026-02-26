import * as React from 'react'
import { cn } from '@/frontend/lib/utils'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'mb-1 inline-flex text-sm font-medium',
          className
        )}
        style={{
          color: 'var(--color-text-dark)',
          fontFamily: 'var(--font-primary)',
          ...style,
        }}
        {...props}
      />
    )
  }
)

Label.displayName = 'Label'

export { Label }

