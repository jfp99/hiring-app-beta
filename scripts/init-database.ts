// scripts/init-database.ts
/**
 * Database initialization script
 * Run with: npx ts-node scripts/init-database.ts
 */

import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import { UserRole } from '../src/app/types/auth'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB!

if (!MONGODB_URI || !MONGODB_DB) {
  console.error('❌ Missing MongoDB configuration in .env.local')
  process.exit(1)
}

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('🔄 Connecting to MongoDB...')
    await client.connect()
    const db = client.db(MONGODB_DB)

    console.log('✅ Connected to MongoDB')
    console.log('📦 Database:', MONGODB_DB)

    // Create collections with validation schemas
    console.log('\n📚 Creating collections...')

    // 1. Users Collection
    try {
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'firstName', 'lastName', 'role', 'isActive'],
            properties: {
              email: {
                bsonType: 'string',
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
              },
              password: { bsonType: 'string' },
              firstName: { bsonType: 'string' },
              lastName: { bsonType: 'string' },
              role: {
                enum: Object.values(UserRole)
              },
              isActive: { bsonType: 'bool' },
              emailVerified: { bsonType: 'bool' },
              companyId: { bsonType: 'string' },
              permissions: {
                bsonType: 'array',
                items: { bsonType: 'string' }
              }
            }
          }
        }
      })
      console.log('✅ Created users collection')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 48) {
        console.log('ℹ️  Users collection already exists')
      } else {
        throw error
      }
    }

    // 2. Companies Collection
    try {
      await db.createCollection('companies', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'industry', 'status'],
            properties: {
              name: { bsonType: 'string' },
              industry: { bsonType: 'string' },
              website: { bsonType: 'string' },
              size: {
                enum: ['1-10', '11-50', '51-200', '201-500', '500+']
              },
              status: {
                enum: ['active', 'inactive', 'prospect']
              }
            }
          }
        }
      })
      console.log('✅ Created companies collection')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 48) {
        console.log('ℹ️  Companies collection already exists')
      } else {
        throw error
      }
    }

    // 3. Candidates Collection (Enhanced)
    try {
      await db.createCollection('candidates', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'firstName', 'lastName'],
            properties: {
              email: {
                bsonType: 'string',
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
              },
              firstName: { bsonType: 'string' },
              lastName: { bsonType: 'string' },
              phone: { bsonType: 'string' },
              status: {
                enum: ['new', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'on-hold']
              },
              rating: {
                bsonType: 'int',
                minimum: 1,
                maximum: 5
              }
            }
          }
        }
      })
      console.log('✅ Created candidates collection')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 48) {
        console.log('ℹ️  Candidates collection already exists')
      } else {
        throw error
      }
    }

    // 4. Applications Collection
    try {
      await db.createCollection('applications')
      console.log('✅ Created applications collection')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 48) {
        console.log('ℹ️  Applications collection already exists')
      } else {
        throw error
      }
    }

    // 5. Documents Collection
    try {
      await db.createCollection('documents')
      console.log('✅ Created documents collection')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 48) {
        console.log('ℹ️  Documents collection already exists')
      } else {
        throw error
      }
    }

    // 6. Activities Collection (for audit logs)
    try {
      await db.createCollection('activities')
      console.log('✅ Created activities collection')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 48) {
        console.log('ℹ️  Activities collection already exists')
      } else {
        throw error
      }
    }

    // Create indexes
    console.log('\n📑 Creating indexes...')

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ role: 1 })
    await db.collection('users').createIndex({ companyId: 1 })
    await db.collection('users').createIndex({ createdAt: -1 })
    console.log('✅ Created users indexes')

    // Companies indexes
    await db.collection('companies').createIndex({ name: 1 })
    await db.collection('companies').createIndex({ status: 1 })
    await db.collection('companies').createIndex({ createdAt: -1 })
    console.log('✅ Created companies indexes')

    // Candidates indexes
    await db.collection('candidates').createIndex({ email: 1 }, { unique: true })
    await db.collection('candidates').createIndex({ status: 1 })
    await db.collection('candidates').createIndex({ rating: -1 })
    await db.collection('candidates').createIndex({ createdAt: -1 })
    await db.collection('candidates').createIndex({
      firstName: 'text',
      lastName: 'text',
      email: 'text',
      skills: 'text'
    })
    console.log('✅ Created candidates indexes')

    // Jobs indexes (update existing)
    await db.collection('offres').createIndex({ statut: 1 })
    await db.collection('offres').createIndex({ entreprise: 1 })
    await db.collection('offres').createIndex({ datePublication: -1 })
    await db.collection('offres').createIndex({
      titre: 'text',
      description: 'text',
      competences: 'text'
    })
    console.log('✅ Created jobs indexes')

    // Applications indexes
    await db.collection('applications').createIndex({ candidateId: 1 })
    await db.collection('applications').createIndex({ jobId: 1 })
    await db.collection('applications').createIndex({ status: 1 })
    await db.collection('applications').createIndex({ createdAt: -1 })
    console.log('✅ Created applications indexes')

    // Create default super admin
    console.log('\n👤 Creating default users...')

    const users = await db.collection('users').find({}).toArray()

    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin123!@#', 12)

      // Create super admin
      const superAdmin = {
        email: 'admin@hi-ring.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        emailVerified: true,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await db.collection('users').insertOne(superAdmin)
      console.log('✅ Created super admin user')
      console.log('   📧 Email: admin@hi-ring.com')
      console.log('   🔑 Password: Admin123!@#')

      // Create demo recruiter
      const recruiter = {
        email: 'recruiter@hi-ring.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'Recruiter',
        role: UserRole.RECRUITER,
        isActive: true,
        emailVerified: true,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await db.collection('users').insertOne(recruiter)
      console.log('✅ Created demo recruiter')
      console.log('   📧 Email: recruiter@hi-ring.com')
      console.log('   🔑 Password: Admin123!@#')

      // Create demo company
      const company = {
        name: 'TechCorp Demo',
        industry: 'Technology',
        website: 'https://techcorp-demo.com',
        size: '51-200',
        status: 'active',
        description: 'A demo technology company for testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const companyResult = await db.collection('companies').insertOne(company)
      console.log('✅ Created demo company: TechCorp Demo')

      // Create demo client user
      const client = {
        email: 'client@techcorp.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Client',
        role: UserRole.CLIENT,
        companyId: companyResult.insertedId.toString(),
        isActive: true,
        emailVerified: true,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await db.collection('users').insertOne(client)
      console.log('✅ Created demo client')
      console.log('   📧 Email: client@techcorp.com')
      console.log('   🔑 Password: Admin123!@#')
    } else {
      console.log('ℹ️  Users already exist, skipping seed data')
    }

    // Update existing collections
    console.log('\n🔄 Migrating existing data...')

    // Add status field to existing job offers if not present
    await db.collection('offres').updateMany(
      { statut: { $exists: false } },
      { $set: { statut: 'active' } }
    )
    console.log('✅ Updated job offers with status field')

    // Add type field to existing contacts if not present
    await db.collection('contacts').updateMany(
      { type: { $exists: false } },
      { $set: { type: 'candidat' } }
    )
    console.log('✅ Updated contacts with type field')

    console.log('\n🎉 Database initialization completed successfully!')
    console.log('\n📝 Summary:')
    console.log('   - Collections created/verified')
    console.log('   - Indexes created')
    console.log('   - Default users created')
    console.log('   - Existing data migrated')

    console.log('\n⚠️  IMPORTANT: Please change all default passwords immediately!')
    console.log('\n🚀 You can now start the application with: npm run dev')

  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n👋 Database connection closed')
  }
}

// Run the initialization
initializeDatabase()