// src/app/components/AddCandidatesToProcessModal.test.tsx
import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddCandidatesToProcessModal from './AddCandidatesToProcessModal'
import { Candidate } from '../types/candidates'
import { Process } from '../types/process'

// Mock fetch
global.fetch = vi.fn()

const mockOnCandidatesAdded = vi.fn()

const mockProcess: Process = {
  _id: 'process-1',
  id: 'PROC-001',
  title: 'Senior Developer',
  client: 'Tech Corp',
  status: 'active',
  stages: [
    { name: 'Screening', type: 'screening', candidates: [] },
    { name: 'Interview', type: 'interview', candidates: [] },
    { name: 'Offer', type: 'offer', candidates: [] }
  ]
}

const mockCandidates: Partial<Candidate>[] = [
  {
    id: '1',
    _id: '1',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isActive: true,
    isArchived: false,
    currentProcessId: null,
    processIds: [], // Not in any process
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    _id: '2',
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    isActive: true,
    isArchived: false,
    currentProcessId: 'other-process',
    processIds: ['PROC-001'], // Already in the process we're adding to
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    _id: '3',
    name: 'Bob Wilson',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob@example.com',
    isActive: true,
    isArchived: true, // Archived candidate
    currentProcessId: null,
    processIds: [],
    createdAt: new Date().toISOString()
  }
]

describe('AddCandidatesToProcessModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as Mock).mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should render the modal when open', async () => {
    // Mock fetch response before rendering
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [],
        totalPages: 0,
        currentPage: 1,
        totalCandidates: 0
      })
    })

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={vi.fn()}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Add Candidates to Senior Developer')).toBeInTheDocument()
    })
  })

  it('should not render when closed', () => {
    render(
      <AddCandidatesToProcessModal
        isOpen={false}
        onClose={vi.fn()}
        process={mockProcess}
        onCandidatesAdded={mockOnCandidatesAdded}
      />
    )

    expect(screen.queryByText('Add Candidates to Senior Developer')).not.toBeInTheDocument()
  })

  it('should fetch candidates on mount', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: mockCandidates,
        totalPages: 1,
        currentPage: 1,
        totalCandidates: mockCandidates.length
      })
    })

    render(
      <AddCandidatesToProcessModal
        isOpen={true}
        onClose={vi.fn()}
        process={mockProcess}
        onCandidatesAdded={mockOnCandidatesAdded}
      />
    )

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/candidates?isActive=true&isArchived=false&limit=100')
    })
  })

  it('should handle paginated API response correctly', async () => {
    const paginatedResponse = {
      candidates: [mockCandidates[0], mockCandidates[1]],
      totalPages: 1,
      currentPage: 1,
      totalCandidates: 2
    }

    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse
    })

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={vi.fn()}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    await waitFor(() => {
      // Should show only non-archived candidates
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument() // Archived
    })
  })

  it('should filter candidates based on showOnlyAvailable toggle', async () => {
    // Mock for initial load
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: mockCandidates,
        totalPages: 1,
        currentPage: 1,
        totalCandidates: mockCandidates.length
      })
    })
    // Mock for reload after toggle
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: mockCandidates.filter(c => !c.processIds?.includes(mockProcess.id!)),
        totalPages: 1,
        currentPage: 1,
        totalCandidates: 2
      })
    })

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={vi.fn()}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // Toggle to show only available candidates
    const checkbox = screen.getByRole('checkbox')

    await act(async () => {
      fireEvent.click(checkbox)
    })

    // Wait for the second fetch to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      // Jane Smith should not be shown as she has a different processId
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  it('should handle search filtering', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: mockCandidates,
        totalPages: 1,
        currentPage: 1,
        totalCandidates: mockCandidates.length
      })
    })

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={vi.fn()}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search by name, email, position, skills or tags.../i)

    await act(async () => {
      await userEvent.type(searchInput, 'jane')
    })

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  }, 10000)

  it('should handle adding candidates to process', async () => {
    ;(global.fetch as Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: mockCandidates,
          totalPages: 1,
          currentPage: 1,
          totalCandidates: mockCandidates.length
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

    const onCloseMock = vi.fn()

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={onCloseMock}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Select a candidate
    const candidate = screen.getByText('John Doe').closest('div')
    if (candidate) {
      await act(async () => {
        fireEvent.click(candidate)
      })
    }

    // Click add button
    const addButton = screen.getByText(/add.*candidate/i)
    await act(async () => {
      fireEvent.click(addButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/processes/process-1/candidates',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateIds: ['1'],
            stage: 'Screening'
          })
        })
      )
    })

    await waitFor(() => {
      expect(mockOnCandidatesAdded).toHaveBeenCalled()
      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  it('should show loading state while fetching', async () => {
    let resolvePromise: any
    ;(global.fetch as Mock).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      })
    )

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={vi.fn()}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    // Check for loading spinner - it's a div with animate-spin class
    const loadingElement = document.querySelector('.animate-spin')
    expect(loadingElement).toBeInTheDocument()

    // Resolve the promise
    await act(async () => {
      resolvePromise({
        ok: true,
        json: async () => ({
          candidates: [],
          totalPages: 1,
          currentPage: 1,
          totalCandidates: 0
        })
      })
    })

    await waitFor(() => {
      expect(screen.getByText('No candidates found')).toBeInTheDocument()
    })
  }, 10000)

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    ;(global.fetch as Mock).mockRejectedValueOnce(new Error('API Error'))

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={vi.fn()}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    await waitFor(() => {
      expect(screen.getByText('No candidates found')).toBeInTheDocument()
    })

    consoleErrorSpy.mockRestore()
  }, 10000)

  it('should handle empty response correctly', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [],
        totalPages: 0,
        currentPage: 1,
        totalCandidates: 0
      })
    })

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={vi.fn()}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    await waitFor(() => {
      expect(screen.getByText('No candidates found')).toBeInTheDocument()
    })
  }, 10000)

  it('should disable add button when no candidates are selected', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: mockCandidates,
        totalPages: 1,
        currentPage: 1,
        totalCandidates: mockCandidates.length
      })
    })

    await act(async () => {
      render(
        <AddCandidatesToProcessModal
          isOpen={true}
          onClose={vi.fn()}
          process={mockProcess}
          onCandidatesAdded={mockOnCandidatesAdded}
        />
      )
    })

    await waitFor(() => {
      const addButton = screen.getByText(/add.*candidate/i).closest('button')
      expect(addButton).toBeDisabled()
    })
  }, 10000)
})