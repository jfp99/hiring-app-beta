import React from 'react'
import { Skeleton } from './Skeleton'

export const PipelineSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700"
        >
          {/* Avatar/Icon placeholder */}
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            className="mx-auto"
          />

          {/* Title/Name */}
          <Skeleton
            variant="text"
            width="100%"
            height={16}
          />

          {/* Subtitle/Role */}
          <Skeleton
            variant="text"
            width="75%"
            height={12}
            className="mx-auto"
          />

          {/* Tags/Badges */}
          <div className="flex gap-2 justify-center">
            <Skeleton
              variant="rectangular"
              width={60}
              height={24}
              className="rounded-full"
            />
            <Skeleton
              variant="rectangular"
              width={60}
              height={24}
              className="rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Kanban Board Skeleton
export const KanbanSkeleton = () => {
  const columns = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED']

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {columns.map((column) => (
        <div
          key={column}
          className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4"
        >
          {/* Column header */}
          <div className="mb-4 flex items-center justify-between">
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="circular" width={24} height={24} />
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="circular" width={20} height={20} />
                </div>
                <Skeleton variant="text" width="40%" height={12} />
                <div className="flex gap-2 pt-2">
                  <Skeleton variant="rectangular" width={50} height={20} className="rounded-full" />
                  <Skeleton variant="rectangular" width={50} height={20} className="rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Single Pipeline Card Skeleton
export const PipelineCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2">
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={80} height={12} />
        </div>
      </div>
      <Skeleton variant="rectangular" width={100} height={32} className="rounded-lg" />
    </div>

    <div className="flex gap-2">
      <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
      <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
      <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
    </div>

    <Skeleton variant="rectangular" width="100%" height={60} className="rounded-lg" />
  </div>
)