// Quick test to check database and create sample candidates
import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB!

async function quickTest() {
  console.log('🔍 Checking database...')

  const client = await MongoClient.connect(MONGODB_URI)
  const db = client.db(MONGODB_DB)

  try {
    // Check collections
    const collections = await db.listCollections().toArray()
    console.log('\n📚 Collections:', collections.map(c => c.name).join(', '))

    // Check candidates
    const candidatesCount = await db.collection('candidates').countDocuments()
    console.log(`\n👥 Candidates in database: ${candidatesCount}`)

    if (candidatesCount > 0) {
      const sample = await db.collection('candidates').findOne({})
      console.log('\n📋 Sample candidate structure:')
      console.log(JSON.stringify(sample, null, 2).slice(0, 500) + '...')
    }

    // Check email templates
    const templatesCount = await db.collection('email_templates').countDocuments()
    console.log(`\n📧 Email templates: ${templatesCount}`)

    // Check interviews collection
    const interviewsCount = await db.collection('interviews')?.countDocuments() || 0
    console.log(`\n📅 Interviews: ${interviewsCount}`)

    console.log('\n✅ Database check complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

quickTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
