// src/app/types/savedFilters.ts

import { CandidateStatus, ExperienceLevel } from './candidates'

export interface SavedFilter {
  id: string
  name: string
  createdAt: string
  view: 'list' | 'pipeline' // which view the filter is for

  // Common filters
  searchTerm?: string

  // List view specific filters
  statusFilter?: CandidateStatus[]
  experienceFilter?: ExperienceLevel[]
  skillsFilter?: string

  // Pipeline view specific filters
  selectedTags?: string[]
}

export const STORAGE_KEY = 'hi-ring-saved-filters'

// Utility functions for managing saved filters in localStorage
export class SavedFiltersManager {
  static getAll(): SavedFilter[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      return JSON.parse(stored) as SavedFilter[]
    } catch (error) {
      console.error('Error reading saved filters:', error)
      return []
    }
  }

  static save(filter: Omit<SavedFilter, 'id' | 'createdAt'>): SavedFilter {
    const filters = this.getAll()

    const newFilter: SavedFilter = {
      ...filter,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    }

    filters.push(newFilter)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
      return newFilter
    } catch (error) {
      console.error('Error saving filter:', error)
      throw new Error('Failed to save filter')
    }
  }

  static delete(filterId: string): void {
    const filters = this.getAll()
    const updated = filters.filter(f => f.id !== filterId)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Error deleting filter:', error)
      throw new Error('Failed to delete filter')
    }
  }

  static update(filterId: string, updates: Partial<Omit<SavedFilter, 'id' | 'createdAt'>>): SavedFilter | null {
    const filters = this.getAll()
    const index = filters.findIndex(f => f.id === filterId)

    if (index === -1) return null

    const updated = {
      ...filters[index],
      ...updates
    }

    filters[index] = updated

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
      return updated
    } catch (error) {
      console.error('Error updating filter:', error)
      throw new Error('Failed to update filter')
    }
  }

  static getByView(view: 'list' | 'pipeline'): SavedFilter[] {
    return this.getAll().filter(f => f.view === view)
  }

  static count(): number {
    return this.getAll().length
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing filters:', error)
    }
  }
}
