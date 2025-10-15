'use client'

import { useTheme } from '../contexts/ThemeContext'

export default function TestTheme() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Theme Test Page
        </h1>

        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-800 dark:text-gray-200 mb-4">
            Current theme: <span className="font-bold text-orange-500">{theme}</span>
          </p>

          <button
            onClick={toggleTheme}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Toggle Theme (current: {theme})
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Card Example
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              This card should change colors in dark mode.
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Different Background
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Another example with different background color.
            </p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
          <h2 className="text-2xl font-bold mb-2">
            Fixed Gradient (No Dark Mode)
          </h2>
          <p>
            This section maintains its colors regardless of theme, like hero sections.
          </p>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            Error style example
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
            Success style example
          </div>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
            Warning style example
          </div>
        </div>
      </div>
    </div>
  )
}