import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function resetAdminPassword() {
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

    // Reset admin password to a known value
    const email = 'admin@hi-ring.com'
    const newPassword = 'Test123456'
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update admin password
    const result = await usersCollection.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          status: 'active',
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (result.modifiedCount > 0) {
      console.log('✅ Admin password reset successfully!')
      console.log('📧 Email:', email)
      console.log('🔑 New Password:', newPassword)
      console.log('\nYou can now use these credentials to login to the browser extension:')
      console.log('  Email: admin@hi-ring.com')
      console.log('  Password: Test123456')
    } else {
      console.log('❌ Admin account not found!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('✨ Done!')
  }
}

resetAdminPassword()