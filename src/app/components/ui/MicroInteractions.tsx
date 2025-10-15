'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React, { useState, useEffect } from 'react'

// Ripple effect for buttons and clickable elements
export const RippleEffect = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([])

  const createRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now()

    setRipples((prev) => [...prev, { x, y, size, id }])

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
    }, 600)
  }

  return (
    <div className={`relative overflow-hidden ${className}`} onMouseDown={createRipple}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 dark:bg-white/20 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </div>
  )
}

// Success checkmark animation
export const SuccessCheck = ({ show }: { show: boolean }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full"
        >
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.path
              d="M3 8L6 11L13 4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Pulse notification badge
export const PulseBadge = ({ count, className = '' }: { count: number; className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      {count > 0 && (
        <>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        </>
      )}
    </div>
  )
}

// Hover card lift effect
export const HoverLift = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

// Input focus glow effect
export const FocusGlow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isFocused && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-accent-500/20 to-primary-500/20 blur-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      <div
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {children}
      </div>
    </div>
  )
}

// Loading dots animation
export const LoadingDots = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            y: ['0%', '-50%', '0%'],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  )
}

// Tooltip with fade animation
export const AnimatedTooltip = ({
  children,
  content,
  className = '',
}: {
  children: React.ReactNode
  content: string
  className?: string
}) => {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded whitespace-nowrap pointer-events-none z-50 ${className}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="w-2 h-2 bg-gray-800 dark:bg-gray-200 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Shake animation for errors
export const ShakeError = ({ children, shake }: { children: React.ReactNode; shake: boolean }) => {
  return (
    <motion.div
      animate={
        shake
          ? {
              x: [0, -4, 4, -4, 4, 0],
              transition: { duration: 0.4 },
            }
          : {}
      }
    >
      {children}
    </motion.div>
  )
}

// Add ripple animation to globals.css
export const rippleStyles = `
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.6s ease-out;
}
`