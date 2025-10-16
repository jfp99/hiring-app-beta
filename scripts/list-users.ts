import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function listUsers() {
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

    // Find all users with valid roles
    const users = await usersCollection.find({
      role: { $in: ['SUPER_ADMIN', 'ADMIN', 'RECRUITER'] }
    }).toArray()

    console.log('\n📋 Users with valid roles for extension:')
    console.log('=========================================')

    users.forEach(user => {
      console.log(`\n👤 ${user.firstName} ${user.lastName}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.status}`)
    })

    if (users.length === 0) {
      console.log('No users found with valid roles')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n✨ Done!')
  }
}

listUsers()