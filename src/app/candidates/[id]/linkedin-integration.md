'use client'

// LINKEDIN INTEGRATION FOR CANDIDATE PROFILE PAGE
// This file contains the code to integrate into the main candidate profile page

import { LinkedInData } from '@/app/types/linkedin'
import LinkedInSection from '@/app/components/candidates/LinkedInSection'
import { toast } from 'sonner'

// =============================================================================
// STEP 1: Add these imports to the top of your page.tsx file
// =============================================================================
/*
import { LinkedInData } from '@/app/types/linkedin'
import LinkedInSection from '@/app/components/candidates/LinkedInSection'
*/

// =============================================================================
// STEP 2: Add this handler function inside your CandidateProfilePage component
// =============================================================================
export const handleLinkedInUpdate = async (candidateId: string, linkedinData: Partial<LinkedInData>) => {
  try {
    const response = await fetch(`/api/candidates/${candidateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedinData })
    })

    if (!response.ok) {
      throw new Error('Failed to update LinkedIn data')
    }

    // Optionally refresh candidate data
    // await fetchCandidate()

    return true
  } catch (error) {
    console.error('Error updating LinkedIn data:', error)
    throw error
  }
}

// =============================================================================
// STEP 3: Add this JSX to your overview tab (after Personal Info section)
// =============================================================================
export const LinkedInSectionJSX = ({ candidate, candidateId }: { candidate: any, candidateId: string }) => (
  <>
    {/* LinkedIn Profile Section */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <LinkedInSection
        candidateId={candidateId}
        candidateName={`${candidate.firstName} ${candidate.lastName}`}
        linkedinData={candidate.linkedinData}
        onUpdate={async (data) => {
          try {
            const response = await fetch(`/api/candidates/${candidateId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ linkedinData: { ...candidate.linkedinData, ...data } })
            })

            if (!response.ok) {
              throw new Error('Failed to update LinkedIn data')
            }

            // Call your fetchCandidate() function here to refresh the data
            // fetchCandidate()

            toast.success('LinkedIn data updated successfully')
          } catch (error) {
            console.error('Error updating LinkedIn data:', error)
            toast.error('Failed to update LinkedIn data')
          }
        }}
      />
    </div>
  </>
)

// =============================================================================
// COMPLETE INTEGRATION EXAMPLE
// =============================================================================
/*

Here's where to add the LinkedIn section in your page structure:

{activeTab === 'overview' && (
  <>
    {/* Personal Info */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Informations Personnelles</h2>
      // ... existing personal info content
    </div>

    {/* ADD LINKEDIN SECTION HERE */}
    {/* LinkedIn Profile */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <LinkedInSection
        candidateId={candidateId}
        candidateName={`${candidate.firstName} ${candidate.lastName}`}
        linkedinData={candidate.linkedinData}
        onUpdate={async (data) => {
          try {
            const response = await fetch(`/api/candidates/${candidateId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                linkedinData: { ...candidate.linkedinData, ...data }
              })
            })

            if (!response.ok) {
              throw new Error('Failed to update LinkedIn data')
            }

            await fetchCandidate()
            toast.success('LinkedIn profile updated successfully')
          } catch (error) {
            console.error('Error updating LinkedIn data:', error)
            toast.error('Failed to update LinkedIn profile')
          }
        }}
      />
    </div>

    {/* Skills */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Compétences</h2>
      // ... existing skills content
    </div>

    // ... rest of the overview tab sections
  </>
)}

*/

// =============================================================================
// MANUAL INTEGRATION STEPS
// =============================================================================
/*
1. Open src/app/candidates/[id]/page.tsx
2. Add the imports from STEP 1 at the top
3. Find the overview tab section (search for: activeTab === 'overview')
4. Add the LinkedIn section JSX after the Personal Info section
5. Make sure the toast import from 'sonner' is already present
6. Save and test the integration

The LinkedIn section will automatically:
- Display LinkedIn URL input field
- Fetch and display LinkedIn profile preview
- Allow verification of profile information
- Save notes about the profile
- Track verification history
- Update the database automatically
*/