import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function fixAdminRole() {
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

    // Update admin role to SUPER_ADMIN
    const result = await usersCollection.updateOne(
      { email: 'admin@hi-ring.com' },
      {
        $set: {
          role: 'SUPER_ADMIN',
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (result.modifiedCount > 0) {
      console.log('✅ Admin role updated to SUPER_ADMIN!')
    } else {
      console.log('ℹ️ Admin account not found or already has correct role')

      // Let's check the current role
      const admin = await usersCollection.findOne({ email: 'admin@hi-ring.com' })
      if (admin) {
        console.log('Current admin role:', admin.role)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('✨ Done!')
  }
}

fixAdminRole()