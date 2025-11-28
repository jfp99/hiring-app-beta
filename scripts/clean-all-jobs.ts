// scripts/clean-all-jobs.ts
import { config } from 'dotenv'
import { resolve } from 'path'
import { MongoClient } from 'mongodb'

config({ path: resolve(__dirname, '../.env.local') })

async function main() {
  const uri = process.env.MONGODB_URI!
  const dbName = process.env.MONGODB_DB!
  const client = new MongoClient(uri)

  await client.connect()
  const db = client.db(dbName)

  const result = await db.collection('offres').deleteMany({})
  console.log(`🗑️  Deleted ${result.deletedCount} job offers`)

  await client.close()
}

main().catch(console.error)
