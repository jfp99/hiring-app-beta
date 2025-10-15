import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
  hover?: boolean
  clickable?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hover = false,
      clickable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      bg-white dark:bg-gray-800 rounded-lg
      transition-all duration-300 ease-out
      group
      relative
      overflow-hidden
    `

    const variants = {
      default: 'shadow-sm hover:shadow-md dark:shadow-gray-900/30',
      bordered: 'border border-gray-200 dark:border-gray-700 hover:border-accent-300 dark:hover:border-accent-600',
      elevated: 'shadow-lg hover:shadow-2xl dark:shadow-gray-900/50',
    }

    const hoverStyles = hover
      ? 'hover:shadow-2xl hover:shadow-accent-500/10 dark:hover:shadow-accent-400/20 hover:scale-[1.02] hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent-500/5 dark:before:from-accent-400/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:rounded-lg before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-2 after:ring-accent-500/0 hover:after:ring-accent-500/20 dark:hover:after:ring-accent-400/30 after:transition-all after:duration-300'
      : ''

    const clickableStyles = clickable
      ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-accent-400 dark:focus:ring-offset-gray-900 active:scale-[0.98]'
      : ''

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${hoverStyles}
          ${clickableStyles}
          ${className}
        `}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 ${className}`} {...props}>
    {children}
  </div>
)

export const CardContent = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
)

export const CardFooter = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg ${className}`} {...props}>
    {children}
  </div>
)
