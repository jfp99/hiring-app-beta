// scripts/fix-validation.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB!

async function fixValidation() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(MONGODB_DB)

    await db.command({ collMod: 'candidates', validator: {} })
    console.log('✅ Removed validation from candidates collection')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

fixValidation()
