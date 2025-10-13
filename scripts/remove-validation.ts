// scripts/remove-validation.ts
// Forcefully remove MongoDB validation from candidates collection

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

async function removeValidation() {
  console.log('🔧 Forcefully removing candidates collection validation...')

  const client = await MongoClient.connect(MONGODB_URI!)
  const db = client.db(MONGODB_DB!)

  try {
    // First, check current validation
    const collections = await db.listCollections({ name: 'candidates' }).toArray()
    console.log('📋 Current collection info:', JSON.stringify(collections, null, 2))

    // Remove validation using collMod with empty validator
    console.log('\n🗑️ Removing validation...')
    const result = await db.command({
      collMod: 'candidates',
      validator: {},
      validationLevel: 'off',
      validationAction: 'warn'
    })

    console.log('✅ Validation removal result:', result)

    // Verify it was removed
    const updatedCollections = await db.listCollections({ name: 'candidates' }).toArray()
    console.log('\n📋 Updated collection info:', JSON.stringify(updatedCollections, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await client.close()
  }
}

removeValidation()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error)
    process.exit(1)
  })
