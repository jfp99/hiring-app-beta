// scripts/create-indexes.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

/**
 * Create Database Indexes for Hi-Ring Platform
 *
 * This script creates all necessary indexes as specified in CLAUDE.md
 * Run with: npm run db:indexes or tsx scripts/create-indexes.ts
 *
 * CRITICAL: Indexes are essential for query performance at scale
 */

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB as string

if (!MONGODB_URI || !MONGODB_DB) {
  console.error('❌ Missing MONGODB_URI or MONGODB_DB environment variables')
  process.exit(1)
}

async function createIndexes() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('📊 Connecting to MongoDB...')
    await client.connect()
    const db = client.db(MONGODB_DB)

    console.log('✅ Connected to database:', MONGODB_DB)
    console.log('')

    // =========================================================================
    // CANDIDATES COLLECTION
    // =========================================================================
    console.log('📝 Creating indexes for CANDIDATES collection...')

    const candidates = db.collection('candidates')

    // 1. Unique email index (prevent duplicates)
    await candidates.createIndex(
      { email: 1 },
      { unique: true, name: 'email_unique' }
    )
    console.log('  ✓ email (unique)')

    // 2. Status + createdAt compound index (for pipeline queries)
    await candidates.createIndex(
      { status: 1, createdAt: -1 },
      { name: 'status_createdAt' }
    )
    console.log('  ✓ status + createdAt (compound)')

    // 3. Text search index (firstName, lastName, email)
    await candidates.createIndex(
      {
        firstName: 'text',
        lastName: 'text',
        email: 'text',
        currentPosition: 'text',
        currentCompany: 'text'
      },
      { name: 'text_search' }
    )
    console.log('  ✓ text search (firstName, lastName, email, position, company)')

    // 4. Skills array index (for skill-based queries)
    await candidates.createIndex(
      { 'skills.name': 1 },
      { name: 'skills_name' }
    )
    console.log('  ✓ skills.name')

    // 5. AssignedTo index (for recruiter dashboard)
    await candidates.createIndex(
      { assignedTo: 1 },
      { name: 'assignedTo' }
    )
    console.log('  ✓ assignedTo')

    // 6. Tags array index (for tag filtering)
    await candidates.createIndex(
      { tags: 1 },
      { name: 'tags' }
    )
    console.log('  ✓ tags')

    // 7. Overall rating index (for sorting by rating)
    await candidates.createIndex(
      { overallRating: 1 },
      { name: 'overallRating' }
    )
    console.log('  ✓ overallRating')

    // 8. Experience level index
    await candidates.createIndex(
      { experienceLevel: 1 },
      { name: 'experienceLevel' }
    )
    console.log('  ✓ experienceLevel')

    // 9. Active/Archived status index
    await candidates.createIndex(
      { isActive: 1, isArchived: 1 },
      { name: 'active_archived' }
    )
    console.log('  ✓ isActive + isArchived')

    // 10. Application status (dual status system)
    await candidates.createIndex(
      { appStatus: 1 },
      { name: 'appStatus' }
    )
    console.log('  ✓ appStatus')

    // =========================================================================
    // INTERVIEWS COLLECTION
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for INTERVIEWS collection...')

    const interviews = db.collection('interviews')

    // 1. Candidate ID + Scheduled Date (for candidate interview history)
    await interviews.createIndex(
      { candidateId: 1, scheduledDate: -1 },
      { name: 'candidateId_scheduledDate' }
    )
    console.log('  ✓ candidateId + scheduledDate (compound)')

    // 2. Interviewers array index (for interviewer dashboard)
    await interviews.createIndex(
      { interviewers: 1 },
      { name: 'interviewers' }
    )
    console.log('  ✓ interviewers')

    // 3. Status index (for filtering by status)
    await interviews.createIndex(
      { status: 1 },
      { name: 'status' }
    )
    console.log('  ✓ status')

    // 4. Scheduled date index (for calendar views)
    await interviews.createIndex(
      { scheduledDate: 1 },
      { name: 'scheduledDate' }
    )
    console.log('  ✓ scheduledDate')

    // =========================================================================
    // TASKS COLLECTION
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for TASKS collection...')

    const tasks = db.collection('tasks')

    // 1. Candidate ID index
    await tasks.createIndex(
      { candidateId: 1 },
      { name: 'candidateId' }
    )
    console.log('  ✓ candidateId')

    // 2. Assigned to + Status + Due date (for user task dashboard)
    await tasks.createIndex(
      { assignedTo: 1, status: 1, dueDate: 1 },
      { name: 'assignedTo_status_dueDate' }
    )
    console.log('  ✓ assignedTo + status + dueDate (compound)')

    // 3. Due date index (for overdue tasks)
    await tasks.createIndex(
      { dueDate: 1 },
      { name: 'dueDate' }
    )
    console.log('  ✓ dueDate')

    // =========================================================================
    // COMMENTS COLLECTION
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for COMMENTS collection...')

    const comments = db.collection('comments')

    // 1. Candidate ID + Created At (for candidate comment thread)
    await comments.createIndex(
      { candidateId: 1, createdAt: -1 },
      { name: 'candidateId_createdAt' }
    )
    console.log('  ✓ candidateId + createdAt (compound)')

    // 2. User ID index (for user activity)
    await comments.createIndex(
      { userId: 1 },
      { name: 'userId' }
    )
    console.log('  ✓ userId')

    // 3. Parent ID index (for threaded comments)
    await comments.createIndex(
      { parentId: 1 },
      { name: 'parentId' }
    )
    console.log('  ✓ parentId')

    // =========================================================================
    // NOTIFICATIONS COLLECTION
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for NOTIFICATIONS collection...')

    const notifications = db.collection('notifications')

    // 1. User ID + isRead + Created At (for user notification inbox)
    await notifications.createIndex(
      { userId: 1, isRead: 1, createdAt: -1 },
      { name: 'userId_isRead_createdAt' }
    )
    console.log('  ✓ userId + isRead + createdAt (compound)')

    // 2. Related ID index (for notification source)
    await notifications.createIndex(
      { relatedId: 1 },
      { name: 'relatedId' }
    )
    console.log('  ✓ relatedId')

    // =========================================================================
    // USERS COLLECTION
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for USERS collection...')

    const users = db.collection('users')

    // 1. Unique email index (prevent duplicate users)
    await users.createIndex(
      { email: 1 },
      { unique: true, name: 'email_unique' }
    )
    console.log('  ✓ email (unique)')

    // 2. Role index (for RBAC queries)
    await users.createIndex(
      { role: 1 },
      { name: 'role' }
    )
    console.log('  ✓ role')

    // 3. Active status index
    await users.createIndex(
      { isActive: 1 },
      { name: 'isActive' }
    )
    console.log('  ✓ isActive')

    // =========================================================================
    // WORKFLOWS COLLECTION
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for WORKFLOWS collection...')

    const workflows = db.collection('workflows')

    // 1. Active status index
    await workflows.createIndex(
      { isActive: 1 },
      { name: 'isActive' }
    )
    console.log('  ✓ isActive')

    // 2. Trigger type index
    await workflows.createIndex(
      { 'trigger.event': 1 },
      { name: 'trigger_event' }
    )
    console.log('  ✓ trigger.event')

    // =========================================================================
    // DOCUMENTS COLLECTION
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for DOCUMENTS collection...')

    const documents = db.collection('documents')

    // 1. Entity type + Entity ID (for document retrieval)
    await documents.createIndex(
      { entityType: 1, entityId: 1 },
      { name: 'entityType_entityId' }
    )
    console.log('  ✓ entityType + entityId (compound)')

    // 2. Uploaded by index
    await documents.createIndex(
      { uploadedBy: 1 },
      { name: 'uploadedBy' }
    )
    console.log('  ✓ uploadedBy')

    // 3. Type index
    await documents.createIndex(
      { type: 1 },
      { name: 'type' }
    )
    console.log('  ✓ type')

    // =========================================================================
    // ACTIVITIES COLLECTION
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for ACTIVITIES collection...')

    const activities = db.collection('activities')

    // 1. User ID + Timestamp (for activity logs)
    await activities.createIndex(
      { userId: 1, timestamp: -1 },
      { name: 'userId_timestamp' }
    )
    console.log('  ✓ userId + timestamp (compound)')

    // 2. Type index (for filtering by activity type)
    await activities.createIndex(
      { type: 1 },
      { name: 'type' }
    )
    console.log('  ✓ type')

    // 3. Candidate ID index
    await activities.createIndex(
      { candidateId: 1 },
      { name: 'candidateId' }
    )
    console.log('  ✓ candidateId')

    // =========================================================================
    // OFFRES COLLECTION (Job Postings)
    // =========================================================================
    console.log('')
    console.log('📝 Creating indexes for OFFRES collection...')

    const offres = db.collection('offres')

    // 1. Status index (only active jobs displayed publicly)
    await offres.createIndex(
      { statut: 1 },
      { name: 'statut' }
    )
    console.log('  ✓ statut')

    // 2. Category index
    await offres.createIndex(
      { categorie: 1 },
      { name: 'categorie' }
    )
    console.log('  ✓ categorie')

    // 3. Date publication index
    await offres.createIndex(
      { datePublication: -1 },
      { name: 'datePublication' }
    )
    console.log('  ✓ datePublication')

    // 4. Text search index
    await offres.createIndex(
      {
        titre: 'text',
        description: 'text',
        entreprise: 'text',
        lieu: 'text'
      },
      { name: 'text_search' }
    )
    console.log('  ✓ text search (titre, description, entreprise, lieu)')

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log('')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('✅ All indexes created successfully!')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('')
    console.log('📊 Index Summary:')
    console.log('  • candidates:     10 indexes')
    console.log('  • interviews:     4 indexes')
    console.log('  • tasks:          3 indexes')
    console.log('  • comments:       3 indexes')
    console.log('  • notifications:  2 indexes')
    console.log('  • users:          3 indexes')
    console.log('  • workflows:      2 indexes')
    console.log('  • documents:      3 indexes')
    console.log('  • activities:     3 indexes')
    console.log('  • offres:         4 indexes')
    console.log('  ─────────────────────────────')
    console.log('  TOTAL:            37 indexes')
    console.log('')
    console.log('🚀 Your database is now optimized for production!')

  } catch (error) {
    console.error('')
    console.error('❌ Error creating indexes:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('')
    console.log('🔌 Database connection closed')
  }
}

// Run the script
createIndexes().catch(console.error)
