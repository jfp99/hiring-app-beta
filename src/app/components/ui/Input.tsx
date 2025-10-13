import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      success,
      leftIcon,
      rightIcon,
      disabled,
      required,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-error-500 dark:text-error-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full px-4 py-2.5
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || error || success ? 'pr-10' : ''}
              border rounded-lg
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-offset-1
              disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-600 disabled:cursor-not-allowed
              hover:border-gray-400 dark:hover:border-gray-500
              focus:scale-[1.01]
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              ${
                error
                  ? 'border-error-300 dark:border-error-600 focus:border-error-500 dark:focus:border-error-400 focus:ring-error-500 dark:focus:ring-error-400 focus:shadow-lg focus:shadow-error-500/20 dark:focus:shadow-error-400/20'
                  : success
                  ? 'border-success-300 dark:border-success-600 focus:border-success-500 dark:focus:border-success-400 focus:ring-success-500 dark:focus:ring-success-400 focus:shadow-lg focus:shadow-success-500/20 dark:focus:shadow-success-400/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-accent-500 dark:focus:border-accent-400 focus:ring-accent-500 dark:focus:ring-accent-400 focus:shadow-lg focus:shadow-accent-500/20 dark:focus:shadow-accent-400/20'
              }
              ${className}
            `}
            {...props}
          />

          {(rightIcon || error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle className="w-5 h-5 text-error-500" />
              ) : success ? (
                <CheckCircle2 className="w-5 h-5 text-success-500" />
              ) : (
                <span className="text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {helpText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
