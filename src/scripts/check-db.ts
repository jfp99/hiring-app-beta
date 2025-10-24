// Quick script to check database contents
import { config } from 'dotenv'
import { resolve } from 'path'
import { MongoClient } from 'mongodb'

config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found')
  process.exit(1)
}

async function checkDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    console.log('🗄️  Connected to database:', db.databaseName)

    const total = await db.collection('candidates').countDocuments({})
    console.log('📊 Total candidates:', total)

    const active = await db.collection('candidates').countDocuments({ isActive: true })
    console.log('✅ Active candidates:', active)

    const archived = await db.collection('candidates').countDocuments({ isArchived: true })
    console.log('📦 Archived candidates:', archived)

    const withoutIsActive = await db.collection('candidates').countDocuments({ isActive: { $exists: false } })
    console.log('❓ Candidates without isActive field:', withoutIsActive)

    console.log('\n📋 All candidates:')
    const candidates = await db.collection('candidates').find({}).project({
      firstName: 1,
      lastName: 1,
      isActive: 1,
      isArchived: 1,
      status: 1
    }).toArray()

    candidates.forEach((c, i) => {
      console.log(`${i + 1}. ${c.firstName} ${c.lastName} - isActive: ${c.isActive}, isArchived: ${c.isArchived}, status: ${c.status}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

checkDatabase().catch(console.error)
