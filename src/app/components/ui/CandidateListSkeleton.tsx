import React from 'react'
import { Skeleton } from './Skeleton'

// Full-width list skeleton for candidate listings
export const CandidateListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between">
            {/* Left section with avatar and info */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Skeleton
                variant="circular"
                width={64}
                height={64}
                className="flex-shrink-0"
              />

              {/* Candidate info */}
              <div className="space-y-3">
                {/* Name */}
                <Skeleton variant="text" width={180} height={20} />

                {/* Title/Position */}
                <Skeleton variant="text" width={140} height={16} />

                {/* Contact info */}
                <div className="flex items-center gap-4">
                  <Skeleton variant="text" width={120} height={14} />
                  <Skeleton variant="text" width={100} height={14} />
                </div>

                {/* Skills/Tags */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
                  <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
                  <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
                </div>
              </div>
            </div>

            {/* Right section with actions */}
            <div className="flex flex-col items-end gap-3">
              {/* Status badge */}
              <Skeleton variant="rectangular" width={100} height={28} className="rounded-full" />

              {/* Rating stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} variant="circular" width={20} height={20} />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
                <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
                <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Compact card skeleton for grid layouts
export const CandidateCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
    {/* Header with avatar */}
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="70%" height={16} />
        <Skeleton variant="text" width="50%" height={14} />
      </div>
    </div>

    {/* Contact info */}
    <div className="space-y-2">
      <Skeleton variant="text" width="80%" height={12} />
      <Skeleton variant="text" width="60%" height={12} />
    </div>

    {/* Skills */}
    <div className="flex flex-wrap gap-2">
      <Skeleton variant="rectangular" width={50} height={20} className="rounded-full" />
      <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
      <Skeleton variant="rectangular" width={55} height={20} className="rounded-full" />
    </div>

    {/* Footer with status and actions */}
    <div className="pt-4 border-t dark:border-gray-700 flex items-center justify-between">
      <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={28} height={28} className="rounded-lg" />
        <Skeleton variant="rectangular" width={28} height={28} className="rounded-lg" />
      </div>
    </div>
  </div>
)

// Table row skeleton for candidate tables
export const CandidateTableSkeleton = ({ rows = 10 }: { rows?: number }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
    {/* Table header */}
    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-1">
          <Skeleton variant="text" width={30} height={14} />
        </div>
        <div className="col-span-3">
          <Skeleton variant="text" width={80} height={14} />
        </div>
        <div className="col-span-2">
          <Skeleton variant="text" width={60} height={14} />
        </div>
        <div className="col-span-2">
          <Skeleton variant="text" width={70} height={14} />
        </div>
        <div className="col-span-2">
          <Skeleton variant="text" width={50} height={14} />
        </div>
        <div className="col-span-2">
          <Skeleton variant="text" width={60} height={14} />
        </div>
      </div>
    </div>

    {/* Table body */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Checkbox */}
            <div className="col-span-1">
              <Skeleton variant="rectangular" width={20} height={20} className="rounded" />
            </div>

            {/* Name with avatar */}
            <div className="col-span-3 flex items-center gap-3">
              <Skeleton variant="circular" width={36} height={36} />
              <div className="space-y-1 flex-1">
                <Skeleton variant="text" width="80%" height={14} />
                <Skeleton variant="text" width="60%" height={12} />
              </div>
            </div>

            {/* Position */}
            <div className="col-span-2">
              <Skeleton variant="text" width="70%" height={14} />
            </div>

            {/* Status */}
            <div className="col-span-2">
              <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
            </div>

            {/* Rating */}
            <div className="col-span-2 flex gap-1">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} variant="circular" width={16} height={16} />
              ))}
            </div>

            {/* Actions */}
            <div className="col-span-2 flex gap-2 justify-end">
              <Skeleton variant="rectangular" width={28} height={28} className="rounded-lg" />
              <Skeleton variant="rectangular" width={28} height={28} className="rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)