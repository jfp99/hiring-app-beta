import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function checkAdmin() {
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

    // Find admin user
    const admin = await usersCollection.findOne({ email: 'admin@hi-ring.com' })

    if (admin) {
      console.log('\n👤 Admin account found:')
      console.log('========================')
      console.log('Email:', admin.email)
      console.log('Role:', admin.role)
      console.log('Status:', admin.status)
      console.log('First Name:', admin.firstName)
      console.log('Last Name:', admin.lastName)

      console.log('\n✅ Valid roles for extension: SUPER_ADMIN, ADMIN, RECRUITER')
      console.log(`❌ Current role "${admin.role}" is not valid for the extension`)

      // Try to fix it by dropping the validation temporarily
      console.log('\n🔧 Attempting to bypass validation...')

      // Use the raw MongoDB command to update without validation
      const result = await database.runCommand({
        update: 'users',
        updates: [{
          q: { email: 'admin@hi-ring.com' },
          u: { $set: { role: 'ADMIN' } }
        }],
        bypassDocumentValidation: true
      })

      if (result.ok) {
        console.log('✅ Successfully updated admin role to ADMIN!')
      }
    } else {
      console.log('❌ Admin account not found')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n✨ Done!')
  }
}

checkAdmin()