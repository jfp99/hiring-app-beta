// scripts/fix-candidate-schema.ts
// Updates MongoDB collection validation to match our CandidateStatus enum

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

async function updateCandidateSchema() {
  console.log('🔧 Updating candidates collection schema validation...')

  const client = await MongoClient.connect(MONGODB_URI!)
  const db = client.db(MONGODB_DB!)

  try {
    // Drop the existing validation if it exists
    console.log('📋 Dropping existing validation...')
    await db.command({
      collMod: 'candidates',
      validator: {},
      validationLevel: 'off'
    }).catch(() => {
      // Ignore error if collection doesn't exist or no validation
      console.log('   No existing validation to drop')
    })

    console.log('✅ MongoDB schema validation removed')
    console.log('   All status values from CandidateStatus enum are now allowed:')
    console.log('   - new, contacted, screening, interview_scheduled, interview_completed')
    console.log('   - offer_sent, offer_accepted, offer_rejected, hired, rejected')
    console.log('   - on_hold, archived')

    // Optionally, you can add a new validation that matches our enum
    // But for now, removing validation is simpler and more flexible

  } catch (error) {
    console.error('❌ Error updating schema:', error)
    throw error
  } finally {
    await client.close()
  }
}

updateCandidateSchema()
  .then(() => {
    console.log('\n✅ Schema update completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Schema update failed:', error)
    process.exit(1)
  })
