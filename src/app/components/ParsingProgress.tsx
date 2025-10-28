// src/app/components/ParsingProgress.tsx
'use client'

import { useEffect, useState } from 'react'
import { FileText, FileSearch, Brain, CheckCircle2, Upload } from 'lucide-react'

export type ParsingStage = 'upload' | 'extraction' | 'parsing' | 'ai-analysis' | 'validation' | 'complete'

interface ParsingProgressProps {
  currentStage: ParsingStage
  progress: number // 0-100
  estimatedTimeRemaining?: number // in seconds
}

interface StageInfo {
  id: ParsingStage
  label: string
  icon: React.ElementType
  description: string
  progressRange: [number, number] // [start, end] percentage
}

const stages: StageInfo[] = [
  {
    id: 'upload',
    label: 'Upload',
    icon: Upload,
    description: 'Uploading file to server',
    progressRange: [0, 20]
  },
  {
    id: 'extraction',
    label: 'Text Extraction',
    icon: FileText,
    description: 'Extracting text from document',
    progressRange: [20, 40]
  },
  {
    id: 'parsing',
    label: 'Data Parsing',
    icon: FileSearch,
    description: 'Identifying key information',
    progressRange: [40, 70]
  },
  {
    id: 'ai-analysis',
    label: 'AI Analysis',
    icon: Brain,
    description: 'Analyzing and structuring data',
    progressRange: [70, 90]
  },
  {
    id: 'validation',
    label: 'Validation',
    icon: CheckCircle2,
    description: 'Validating extracted data',
    progressRange: [90, 100]
  }
]

export default function ParsingProgress({
  currentStage,
  progress,
  estimatedTimeRemaining
}: ParsingProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  // Smooth progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < progress) {
          return Math.min(prev + 1, progress)
        }
        return prev
      })
    }, 30)

    return () => clearInterval(interval)
  }, [progress])

  const currentStageIndex = stages.findIndex((s) => s.id === currentStage)

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-primary-600 dark:border-accent-500 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-primary-600 dark:text-accent-500">
            Analyzing CV...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {stages[currentStageIndex]?.description || 'Processing'}
          </p>
        </div>
        {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Estimated time</p>
            <p className="text-lg font-bold text-primary-600 dark:text-accent-500">
              {formatTime(estimatedTimeRemaining)}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-bold text-primary-600 dark:text-accent-500">
            {displayProgress}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${displayProgress}%` }}
          >
            <div className="h-full w-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isComplete = index < currentStageIndex
          const isCurrent = index === currentStageIndex
          const isPending = index > currentStageIndex

          const Icon = stage.icon

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isCurrent
                  ? 'bg-primary-50 dark:bg-primary-950 border-2 border-primary-600 dark:border-accent-500'
                  : isComplete
                  ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-primary-600 dark:bg-accent-500 text-white animate-pulse'
                    : isComplete
                    ? 'bg-green-600 dark:bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce' : ''}`} />
                )}
              </div>

              {/* Label and Description */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm ${
                    isCurrent
                      ? 'text-primary-600 dark:text-accent-500'
                      : isComplete
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {stage.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex-shrink-0">
                {isComplete && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Complete
                  </span>
                )}
                {isCurrent && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary-600 dark:bg-accent-500 rounded-full animate-ping" />
                    <span className="text-xs font-medium text-primary-600 dark:text-accent-500">
                      Processing
                    </span>
                  </div>
                )}
                {isPending && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Pending
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 Tip: For best results, ensure your CV is in PDF format and includes clear section headings.
        </p>
      </div>
    </div>
  )
}
