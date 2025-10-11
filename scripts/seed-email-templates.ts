// scripts/seed-email-templates.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { DEFAULT_TEMPLATES } from '../src/app/types/emails'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB!

async function seedEmailTemplates() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✓ Connected to MongoDB')

    const db = client.db(MONGODB_DB)

    // Check if templates already exist
    const existingCount = await db.collection('email_templates').countDocuments()

    if (existingCount > 0) {
      console.log(`ℹ Found ${existingCount} existing templates`)
      console.log('⚠ Skipping seed to avoid duplicates')
      console.log('💡 To re-seed, first delete existing templates from the database')
      return
    }

    // Prepare templates with complete data
    const templates = DEFAULT_TEMPLATES.map(template => ({
      ...template,
      createdBy: 'system',
      createdByName: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))

    // Insert templates
    const result = await db.collection('email_templates').insertMany(templates)

    console.log(`\n✅ Successfully seeded ${result.insertedCount} email templates:\n`)

    templates.forEach((template, idx) => {
      console.log(`${idx + 1}. ${template.name} (${template.type})`)
    })

    console.log('\n✓ Email templates are ready to use!')
  } catch (error) {
    console.error('❌ Error seeding email templates:', error)
  } finally {
    await client.close()
    console.log('\n✓ Database connection closed')
  }
}

seedEmailTemplates()
