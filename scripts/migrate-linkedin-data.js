/**
 * LinkedIn Data Migration Script
 *
 * This script migrates existing candidates to support the new LinkedIn integration:
 * 1. Converts existing linkedinUrl field to new linkedinData structure
 * 2. Adds LinkedIn fields to candidates that don't have them
 * 3. Validates and cleans up LinkedIn URLs
 *
 * Run with: node scripts/migrate-linkedin-data.js
 */

const { MongoClient } = require('mongodb');

// MongoDB connection details - Update these for your environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'hiring';

// LinkedIn URL validation regex
const LINKEDIN_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;

// Migration statistics
let stats = {
  totalCandidates: 0,
  migratedWithUrl: 0,
  migratedWithoutUrl: 0,
  invalidUrls: 0,
  errors: 0,
  skipped: 0
};

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    return { client, db: client.db(DATABASE_NAME) };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

function isValidLinkedInUrl(url) {
  if (!url) return false;
  return LINKEDIN_URL_REGEX.test(url);
}

function cleanLinkedInUrl(url) {
  if (!url) return null;

  // Trim whitespace
  url = url.trim();

  // Ensure https protocol
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  // Add protocol if missing
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  // Ensure trailing slash
  if (!url.endsWith('/') && !url.includes('?')) {
    url += '/';
  }

  return url;
}

async function migrateCandidates(db) {
  const collection = db.collection('candidates');

  // Find all candidates
  const candidates = await collection.find({}).toArray();
  stats.totalCandidates = candidates.length;

  console.log(`\n📊 Found ${stats.totalCandidates} candidates to process\n`);

  for (const candidate of candidates) {
    try {
      // Skip if already has linkedinData
      if (candidate.linkedinData && typeof candidate.linkedinData === 'object') {
        console.log(`⏭️  Skipping ${candidate.firstName} ${candidate.lastName} - Already migrated`);
        stats.skipped++;
        continue;
      }

      // Prepare update object
      const updateObj = {};

      // Check if candidate has old linkedinUrl field
      if (candidate.linkedinUrl) {
        const cleanedUrl = cleanLinkedInUrl(candidate.linkedinUrl);

        if (isValidLinkedInUrl(cleanedUrl)) {
          // Valid URL - migrate to new structure
          updateObj.linkedinData = {
            url: cleanedUrl,
            previewData: null,
            verification: {
              isVerified: false,
              verifiedBy: null,
              verifiedByName: null,
              verifiedAt: null,
              quickChecks: {
                nameMatches: false,
                roleAccurate: false,
                experienceVerified: false,
                educationVerified: false
              }
            },
            notes: '',
            verificationHistory: []
          };

          // Keep the old URL for backward compatibility
          updateObj.linkedinUrl = cleanedUrl;

          console.log(`✅ Migrating ${candidate.firstName} ${candidate.lastName} with LinkedIn URL`);
          stats.migratedWithUrl++;
        } else {
          // Invalid URL - log and create empty structure
          console.log(`⚠️  Invalid LinkedIn URL for ${candidate.firstName} ${candidate.lastName}: ${candidate.linkedinUrl}`);
          stats.invalidUrls++;

          updateObj.linkedinData = {
            url: null,
            previewData: null,
            verification: null,
            notes: `Original invalid URL: ${candidate.linkedinUrl}`,
            verificationHistory: []
          };
        }
      } else {
        // No LinkedIn URL - create empty structure
        updateObj.linkedinData = {
          url: null,
          previewData: null,
          verification: null,
          notes: null,
          verificationHistory: []
        };

        console.log(`➕ Adding LinkedIn structure to ${candidate.firstName} ${candidate.lastName}`);
        stats.migratedWithoutUrl++;
      }

      // Update the candidate
      await collection.updateOne(
        { _id: candidate._id },
        { $set: updateObj }
      );

    } catch (error) {
      console.error(`❌ Error migrating candidate ${candidate._id}:`, error);
      stats.errors++;
    }
  }
}

async function createIndexes(db) {
  console.log('\n🔨 Creating indexes...');

  const collection = db.collection('candidates');

  try {
    // Create index on LinkedIn URL for faster lookups
    await collection.createIndex({ 'linkedinData.url': 1 });
    console.log('✅ Created index on linkedinData.url');

    // Create index on verification status
    await collection.createIndex({ 'linkedinData.verification.isVerified': 1 });
    console.log('✅ Created index on linkedinData.verification.isVerified');

  } catch (error) {
    console.error('⚠️  Error creating indexes:', error);
  }
}

async function validateMigration(db) {
  console.log('\n🔍 Validating migration...');

  const collection = db.collection('candidates');

  // Check candidates with new structure
  const withLinkedInData = await collection.countDocuments({
    linkedinData: { $exists: true }
  });

  // Check candidates with verified LinkedIn
  const verified = await collection.countDocuments({
    'linkedinData.verification.isVerified': true
  });

  // Check candidates with LinkedIn URL
  const withUrl = await collection.countDocuments({
    'linkedinData.url': { $ne: null }
  });

  console.log(`\n📈 Validation Results:`);
  console.log(`   - Candidates with linkedinData: ${withLinkedInData}`);
  console.log(`   - Candidates with LinkedIn URL: ${withUrl}`);
  console.log(`   - Verified LinkedIn profiles: ${verified}`);
}

async function main() {
  console.log('🚀 LinkedIn Data Migration Script');
  console.log('='.repeat(40));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔗 Database: ${DATABASE_NAME}`);

  const { client, db } = await connectToDatabase();

  try {
    // Backup reminder
    console.log('\n⚠️  IMPORTANT: Make sure you have backed up your database before running this migration!\n');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Run migration
    await migrateCandidates(db);

    // Create indexes
    await createIndexes(db);

    // Validate
    await validateMigration(db);

    // Print summary
    console.log('\n' + '='.'='.repeat(40));
    console.log('📊 Migration Summary:');
    console.log(`   Total candidates: ${stats.totalCandidates}`);
    console.log(`   ✅ Migrated with URL: ${stats.migratedWithUrl}`);
    console.log(`   ➕ Migrated without URL: ${stats.migratedWithoutUrl}`);
    console.log(`   ⏭️  Already migrated: ${stats.skipped}`);
    console.log(`   ⚠️  Invalid URLs: ${stats.invalidUrls}`);
    console.log(`   ❌ Errors: ${stats.errors}`);

    const successRate = ((stats.migratedWithUrl + stats.migratedWithoutUrl) / stats.totalCandidates * 100).toFixed(2);
    console.log(`\n   Success Rate: ${successRate}%`);

    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Database connection closed');
  }
}

// Rollback function (in case something goes wrong)
async function rollback(db) {
  console.log('\n⚠️  Rolling back migration...');

  const collection = db.collection('candidates');

  try {
    // Remove linkedinData field from all documents
    await collection.updateMany(
      {},
      { $unset: { linkedinData: '' } }
    );

    console.log('✅ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
  }
}

// Command line arguments
if (process.argv[2] === '--rollback') {
  connectToDatabase().then(async ({ client, db }) => {
    await rollback(db);
    await client.close();
  });
} else {
  main().catch(console.error);
}