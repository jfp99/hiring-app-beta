import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function createTestUser() {
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

    // Create a test user with known password
    const email = 'test@hi-ring.com'
    const password = 'Test123!'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Remove existing test user if exists
    await usersCollection.deleteOne({ email })

    // Create new test user with all required fields
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      role: 'RECRUITER',
      status: 'active',
      department: 'HR',
      phoneNumber: '+1234567890',
      avatar: null,
      lastLogin: new Date().toISOString(),
      isVerified: true,
      twoFactorEnabled: false,
      permissions: ['create_candidates', 'view_candidates', 'edit_candidates'],
      notificationPreferences: {
        email: true,
        sms: false,
        push: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('🆔 User ID:', result.insertedId.toString())

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('✨ Done!')
  }
}

createTestUser()