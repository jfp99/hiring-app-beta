// src/app/api/candidates/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/mongodb'
import { CandidateStatus } from '@/app/types/candidates'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, candidateIds, data } = body

    if (!action || !candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Required: action, candidateIds (array)' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const candidatesCollection = db.collection('candidates')

    let result
    const timestamp = new Date().toISOString()
    const userId = (session.user as any)?.id || session.user?.email || 'unknown'
    const userName = session.user?.name || session.user?.email || 'unknown' || 'Unknown'

    switch (action) {
      case 'change_status': {
        const { status } = data
        if (!status || !Object.values(CandidateStatus).includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status provided' },
            { status: 400 }
          )
        }

        // Update status for all selected candidates
        result = await candidatesCollection.updateMany(
          { id: { $in: candidateIds } },
          {
            $set: {
              status,
              updatedAt: timestamp
            },
            $push: {
              activities: {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                type: 'status_change',
                description: `Statut changé vers ${status} (action groupée)`,
                userId,
                userName,
                timestamp,
                metadata: {
                  oldStatus: null, // We don't track old status in bulk operations
                  newStatus: status,
                  bulkAction: true
                }
              }
            } as any
          }
        )

        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} candidat(s) mis à jour`,
          modifiedCount: result.modifiedCount
        })
      }

      case 'add_tags': {
        const { tags } = data
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
          return NextResponse.json(
            { error: 'No tags provided' },
            { status: 400 }
          )
        }

        // Add tags to all selected candidates (avoiding duplicates)
        result = await candidatesCollection.updateMany(
          { id: { $in: candidateIds } },
          {
            $addToSet: { tags: { $each: tags } },
            $set: { updatedAt: timestamp }
          }
        )

        // Add activity for each candidate
        for (const candidateId of candidateIds) {
          await candidatesCollection.updateOne(
            { id: candidateId },
            {
              $push: {
                activities: {
                  id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                  type: 'profile_updated',
                  description: `Tags ajoutés: ${tags.join(', ')} (action groupée)`,
                  userId,
                  userName,
                  timestamp,
                  metadata: {
                    tagsAdded: tags,
                    bulkAction: true
                  }
                }
              } as any
            }
          )
        }

        return NextResponse.json({
          success: true,
          message: `Tags ajoutés à ${result.modifiedCount} candidat(s)`,
          modifiedCount: result.modifiedCount
        })
      }

      case 'archive': {
        // Archive candidates (set isArchived to true, isActive to false)
        result = await candidatesCollection.updateMany(
          { id: { $in: candidateIds } },
          {
            $set: {
              isArchived: true,
              isActive: false,
              archivedAt: timestamp,
              archivedBy: userId,
              updatedAt: timestamp
            },
            $push: {
              activities: {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                type: 'profile_updated',
                description: 'Candidat archivé (action groupée)',
                userId,
                userName,
                timestamp,
                metadata: {
                  bulkAction: true
                }
              }
            } as any
          }
        )

        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} candidat(s) archivé(s)`,
          modifiedCount: result.modifiedCount
        })
      }

      case 'delete': {
        // Soft delete: mark as deleted but keep in database
        result = await candidatesCollection.updateMany(
          { id: { $in: candidateIds } },
          {
            $set: {
              isDeleted: true,
              isActive: false,
              deletedAt: timestamp,
              deletedBy: userId,
              updatedAt: timestamp
            }
          }
        )

        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} candidat(s) supprimé(s)`,
          modifiedCount: result.modifiedCount
        })
      }

      case 'unarchive': {
        // Unarchive candidates
        result = await candidatesCollection.updateMany(
          { id: { $in: candidateIds } },
          {
            $set: {
              isArchived: false,
              isActive: true,
              updatedAt: timestamp
            },
            $unset: {
              archivedAt: '',
              archivedBy: ''
            },
            $push: {
              activities: {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                type: 'profile_updated',
                description: 'Candidat désarchivé (action groupée)',
                userId,
                userName,
                timestamp,
                metadata: {
                  bulkAction: true
                }
              }
            } as any
          }
        )

        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} candidat(s) désarchivé(s)`,
          modifiedCount: result.modifiedCount
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: unknown) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'Erreur inconnue') || 'Internal server error' },
      { status: 500 }
    )
  }
}
