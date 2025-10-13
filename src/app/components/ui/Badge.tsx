import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center gap-1.5
      font-medium rounded-full
      transition-all duration-200
    `

    const variants = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
      error: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
      info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-300',
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
      secondary: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    }

    const dotColors = {
      default: 'bg-gray-500',
      success: 'bg-success-500',
      error: 'bg-error-500',
      warning: 'bg-warning-500',
      info: 'bg-info-500',
      primary: 'bg-primary-500',
      secondary: 'bg-accent-500',
    }

    return (
      <span
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {dot && (
          <span
            className={`w-2 h-2 rounded-full ${dotColors[variant]}`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
