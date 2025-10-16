import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function verifyAndFixAdmin() {
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
      console.log('\n👤 Current Admin Account:')
      console.log('========================')
      console.log('Email:', admin.email)
      console.log('Role:', admin.role)
      console.log('Status:', admin.status)
      console.log('isActive:', admin.isActive)
      console.log('First Name:', admin.firstName)
      console.log('Last Name:', admin.lastName)

      // Test current password
      const testPassword = 'Admin123!@#'
      console.log('\n🔐 Testing password: Admin123!@#')

      const isValid = await bcrypt.compare(testPassword, admin.password)
      console.log('Password valid:', isValid ? '✅ YES' : '❌ NO')

      if (!isValid) {
        console.log('\n🔧 Updating admin password to: Admin123!@#')

        // Hash the new password
        const hashedPassword = await bcrypt.hash(testPassword, 12)

        // Update the admin user (keep existing role)
        const result = await usersCollection.updateOne(
          { email: 'admin@hi-ring.com' },
          {
            $set: {
              password: hashedPassword,
              isActive: true,
              updatedAt: new Date().toISOString()
            }
          }
        )

        if (result.modifiedCount > 0) {
          console.log('✅ Admin password updated successfully!')

          // Verify the update
          const updatedAdmin = await usersCollection.findOne({ email: 'admin@hi-ring.com' })
          if (updatedAdmin) {
            const testAgain = await bcrypt.compare(testPassword, updatedAdmin.password)
            console.log('✅ Verification: Password now works:', testAgain ? 'YES' : 'NO')
          }
        } else {
          console.log('⚠️ No changes made')
        }
      } else {
        console.log('✅ Admin password is already correct!')
      }
    } else {
      console.log('❌ Admin account not found')
      console.log('\n🔧 Creating new admin account...')

      const hashedPassword = await bcrypt.hash('Admin123!@#', 12)

      const result = await usersCollection.insertOne({
        email: 'admin@hi-ring.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      if (result.insertedId) {
        console.log('✅ Admin account created successfully!')
        console.log('   Email: admin@hi-ring.com')
        console.log('   Password: Admin123!@#')
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n✨ Done!')
  }
}

verifyAndFixAdmin()
