import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function fixAdminStatus() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    console.log('🔧 Connecting to MongoDB...')
    await client.connect()

    const database = client.db(process.env.MONGODB_DB || 'recrutement-app')
    const usersCollection = database.collection('users')

    // Update admin account to be active
    const result = await usersCollection.updateOne(
      { email: 'admin@hi-ring.com' },
      {
        $set: {
          status: 'active',
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (result.modifiedCount > 0) {
      console.log('✅ Admin account activated successfully!')
    } else {
      console.log('ℹ️ Admin account not found or already active')

      // Let's check if the account exists
      const admin = await usersCollection.findOne({ email: 'admin@hi-ring.com' })
      if (admin) {
        console.log('Current admin status:', admin.status)
      } else {
        console.log('Admin account not found. You may need to run the seed script.')
      }
    }

    // Also update any other users to be active (for testing)
    const updateAll = await usersCollection.updateMany(
      { status: { $ne: 'active' } },
      { $set: { status: 'active' } }
    )

    if (updateAll.modifiedCount > 0) {
      console.log(`✅ Activated ${updateAll.modifiedCount} other users`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('✨ Done!')
  }
}

fixAdminStatus()