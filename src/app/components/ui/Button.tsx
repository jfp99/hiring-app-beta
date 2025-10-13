import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-95
      relative overflow-hidden
      group
    `

    const variants = {
      primary: `
        bg-primary-500 text-white
        dark:bg-primary-600 dark:text-white
        hover:bg-primary-600 dark:hover:bg-primary-500
        hover:shadow-xl hover:shadow-primary-500/30 dark:hover:shadow-primary-400/20 hover:-translate-y-0.5
        focus:ring-primary-500 dark:focus:ring-primary-400
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
        before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
      `,
      secondary: `
        bg-accent-500 text-primary-900
        dark:bg-accent-600 dark:text-white
        hover:bg-accent-600 dark:hover:bg-accent-500
        hover:shadow-xl hover:shadow-accent-500/30 dark:hover:shadow-accent-400/20 hover:-translate-y-0.5
        focus:ring-accent-500 dark:focus:ring-accent-400
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
        before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
      `,
      tertiary: `
        bg-white text-primary-700 border-2 border-gray-300
        dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600
        hover:bg-gray-50 dark:hover:bg-gray-700
        hover:border-primary-500 dark:hover:border-primary-400
        hover:shadow-lg hover:-translate-y-0.5
        focus:ring-primary-500 dark:focus:ring-primary-400
      `,
      destructive: `
        bg-error-500 text-white
        dark:bg-error-600 dark:text-white
        hover:bg-error-600 dark:hover:bg-error-500
        hover:shadow-xl hover:shadow-error-500/30 dark:hover:shadow-error-400/20 hover:-translate-y-0.5
        focus:ring-error-500 dark:focus:ring-error-400
      `,
      ghost: `
        bg-transparent text-primary-700
        dark:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105
        focus:ring-primary-500 dark:focus:ring-primary-400
      `,
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Chargement...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
