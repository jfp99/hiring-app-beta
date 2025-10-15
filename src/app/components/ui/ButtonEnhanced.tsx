'use client'

import React, { useState } from 'react'
import { Button, ButtonProps } from './Button'
import { RippleEffect, SuccessCheck } from './MicroInteractions'

interface EnhancedButtonProps extends ButtonProps {
  showSuccess?: boolean
  ripple?: boolean
}

/**
 * Enhanced Button with micro-interactions
 *
 * Usage examples:
 *
 * // Basic button with ripple effect
 * <ButtonEnhanced ripple>Click Me</ButtonEnhanced>
 *
 * // Button with success animation after action
 * const [success, setSuccess] = useState(false)
 *
 * const handleClick = async () => {
 *   await doSomething()
 *   setSuccess(true)
 *   setTimeout(() => setSuccess(false), 2000)
 * }
 *
 * <ButtonEnhanced onClick={handleClick} showSuccess={success}>
 *   Submit
 * </ButtonEnhanced>
 */
export const ButtonEnhanced: React.FC<EnhancedButtonProps> = ({
  children,
  showSuccess = false,
  ripple = true,
  className = '',
  disabled = false,
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)
    }
    props.onClick?.(e)
  }

  const buttonContent = (
    <Button
      {...props}
      className={`
        ${className}
        ${isClicked ? 'scale-95' : ''}
        transition-transform duration-200
        relative
      `}
      disabled={disabled}
      onClick={handleClick}
    >
      <span className={`inline-flex items-center gap-2 ${showSuccess ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {children}
      </span>
      {showSuccess && (
        <span className="absolute inset-0 flex items-center justify-center">
          <SuccessCheck show={true} />
        </span>
      )}
    </Button>
  )

  if (ripple && !disabled) {
    return <RippleEffect>{buttonContent}</RippleEffect>
  }

  return buttonContent
}

// Export a set of pre-configured buttons with micro-interactions
export const InteractiveButton = {
  Primary: (props: EnhancedButtonProps) => (
    <ButtonEnhanced variant="primary" ripple {...props} />
  ),
  Secondary: (props: EnhancedButtonProps) => (
    <ButtonEnhanced variant="secondary" ripple {...props} />
  ),
  Danger: (props: EnhancedButtonProps) => (
    <ButtonEnhanced variant="danger" ripple {...props} />
  ),
  Success: (props: EnhancedButtonProps) => (
    <ButtonEnhanced variant="success" ripple {...props} />
  ),
}