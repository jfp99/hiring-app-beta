// scripts/test-mongodb-templates-workflows.ts
/**
 * Test script to verify MongoDB data pulling for templates and workflows
 * Run with: npx tsx scripts/test-mongodb-templates-workflows.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { MongoClient, Db, ObjectId } from 'mongodb'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  data?: any
}

const results: TestResult[] = []

// Database connection
async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB

  if (!uri || !dbName) {
    throw new Error('MONGODB_URI and MONGODB_DB must be set in environment variables')
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  return { client, db }
}

// Test 1: Check workflows collection exists
async function testWorkflowsCollectionExists(db: Db): Promise<TestResult> {
  try {
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(col => col.name)

    if (collectionNames.includes('workflows')) {
      return {
        name: 'Workflows Collection Exists',
        status: 'PASS',
        message: 'workflows collection found in database'
      }
    } else {
      return {
        name: 'Workflows Collection Exists',
        status: 'WARN',
        message: 'workflows collection does not exist (will be created on first insert)'
      }
    }
  } catch (error) {
    return {
      name: 'Workflows Collection Exists',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 2: Fetch existing workflows
async function testFetchWorkflows(db: Db): Promise<TestResult> {
  try {
    const workflows = await db.collection('workflows')
      .find({})
      .sort({ priority: -1, createdAt: -1 })
      .toArray()

    return {
      name: 'Fetch Workflows',
      status: 'PASS',
      message: `Successfully fetched ${workflows.length} workflow(s)`,
      data: workflows.length > 0 ? workflows[0] : null
    }
  } catch (error) {
    return {
      name: 'Fetch Workflows',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 3: Create a test workflow
async function testCreateWorkflow(db: Db): Promise<TestResult> {
  try {
    const testWorkflow = {
      name: 'Test Workflow - Auto Welcome Email',
      description: 'Automatically send welcome email to new candidates',
      trigger: {
        type: 'candidate_created',
        conditions: []
      },
      actions: [
        {
          type: 'send_email',
          config: {
            templateId: 'welcome_template',
            subject: 'Welcome to Hi-ring!',
            body: 'Thank you for your interest!'
          }
        }
      ],
      isActive: false, // Keep inactive for testing
      priority: 1,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      schedule: null,
      maxExecutionsPerDay: 100,
      maxExecutionsPerCandidate: 1,
      testMode: true,
      createdBy: 'test-script',
      createdByName: 'Test Script',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('workflows').insertOne(testWorkflow)

    // Clean up: delete the test workflow
    await db.collection('workflows').deleteOne({ _id: result.insertedId })

    return {
      name: 'Create Workflow',
      status: 'PASS',
      message: `Successfully created and deleted test workflow (ID: ${result.insertedId})`,
      data: { insertedId: result.insertedId.toString() }
    }
  } catch (error) {
    return {
      name: 'Create Workflow',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 4: Check email_templates collection exists
async function testEmailTemplatesCollectionExists(db: Db): Promise<TestResult> {
  try {
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(col => col.name)

    if (collectionNames.includes('email_templates')) {
      return {
        name: 'Email Templates Collection Exists',
        status: 'PASS',
        message: 'email_templates collection found in database'
      }
    } else {
      return {
        name: 'Email Templates Collection Exists',
        status: 'WARN',
        message: 'email_templates collection does not exist (will be created on first insert)'
      }
    }
  } catch (error) {
    return {
      name: 'Email Templates Collection Exists',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 5: Fetch existing email templates
async function testFetchEmailTemplates(db: Db): Promise<TestResult> {
  try {
    const templates = await db.collection('email_templates')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return {
      name: 'Fetch Email Templates',
      status: 'PASS',
      message: `Successfully fetched ${templates.length} email template(s)`,
      data: templates.length > 0 ? templates[0] : null
    }
  } catch (error) {
    return {
      name: 'Fetch Email Templates',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 6: Create a test email template
async function testCreateEmailTemplate(db: Db): Promise<TestResult> {
  try {
    const testTemplate = {
      name: 'Test Template - Candidate Welcome',
      type: 'CANDIDATE_WELCOME',
      subject: 'Welcome {{candidateName}} to Hi-ring!',
      body: `
        <h1>Welcome {{candidateName}}!</h1>
        <p>Thank you for applying to {{positionTitle}}.</p>
        <p>We have received your application and will review it shortly.</p>
        <p>Best regards,<br>The Hi-ring Team</p>
      `,
      isActive: true,
      isDefault: false,
      variables: ['candidateName', 'positionTitle'],
      createdBy: 'test-script',
      createdByName: 'Test Script',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('email_templates').insertOne(testTemplate)

    // Clean up: delete the test template
    await db.collection('email_templates').deleteOne({ _id: result.insertedId })

    return {
      name: 'Create Email Template',
      status: 'PASS',
      message: `Successfully created and deleted test template (ID: ${result.insertedId})`,
      data: { insertedId: result.insertedId.toString() }
    }
  } catch (error) {
    return {
      name: 'Create Email Template',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 7: Query workflows with filters
async function testWorkflowsWithFilters(db: Db): Promise<TestResult> {
  try {
    // Test filter by isActive
    const activeWorkflows = await db.collection('workflows')
      .find({ isActive: true })
      .toArray()

    // Test filter by trigger type (if any exist)
    const candidateCreatedWorkflows = await db.collection('workflows')
      .find({ 'trigger.type': 'candidate_created' })
      .toArray()

    return {
      name: 'Query Workflows with Filters',
      status: 'PASS',
      message: `Found ${activeWorkflows.length} active workflow(s), ${candidateCreatedWorkflows.length} candidate_created workflow(s)`,
      data: {
        activeCount: activeWorkflows.length,
        candidateCreatedCount: candidateCreatedWorkflows.length
      }
    }
  } catch (error) {
    return {
      name: 'Query Workflows with Filters',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 8: Query email templates with filters
async function testEmailTemplatesWithFilters(db: Db): Promise<TestResult> {
  try {
    // Test filter by isActive
    const activeTemplates = await db.collection('email_templates')
      .find({ isActive: true })
      .toArray()

    // Test filter by isDefault
    const defaultTemplates = await db.collection('email_templates')
      .find({ isDefault: true })
      .toArray()

    return {
      name: 'Query Email Templates with Filters',
      status: 'PASS',
      message: `Found ${activeTemplates.length} active template(s), ${defaultTemplates.length} default template(s)`,
      data: {
        activeCount: activeTemplates.length,
        defaultCount: defaultTemplates.length
      }
    }
  } catch (error) {
    return {
      name: 'Query Email Templates with Filters',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 9: Check indexes on workflows collection
async function testWorkflowsIndexes(db: Db): Promise<TestResult> {
  try {
    const indexes = await db.collection('workflows').indexes()

    return {
      name: 'Workflows Collection Indexes',
      status: 'PASS',
      message: `Found ${indexes.length} index(es) on workflows collection`,
      data: indexes.map(idx => idx.name)
    }
  } catch (error) {
    return {
      name: 'Workflows Collection Indexes',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Test 10: Check indexes on email_templates collection
async function testEmailTemplatesIndexes(db: Db): Promise<TestResult> {
  try {
    const indexes = await db.collection('email_templates').indexes()

    return {
      name: 'Email Templates Collection Indexes',
      status: 'PASS',
      message: `Found ${indexes.length} index(es) on email_templates collection`,
      data: indexes.map(idx => idx.name)
    }
  } catch (error) {
    return {
      name: 'Email Templates Collection Indexes',
      status: 'FAIL',
      message: `Error: ${error}`
    }
  }
}

// Print results
function printResults() {
  console.log('\n' + '='.repeat(80))
  console.log('📊 MONGODB DATA PULLING TEST RESULTS')
  console.log('='.repeat(80) + '\n')

  let passCount = 0
  let failCount = 0
  let warnCount = 0

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} Test ${index + 1}: ${result.name}`)
    console.log(`   Status: ${result.status}`)
    console.log(`   Message: ${result.message}`)

    if (result.data) {
      console.log(`   Data: ${JSON.stringify(result.data, null, 2).split('\n').join('\n   ')}`)
    }
    console.log('')

    if (result.status === 'PASS') passCount++
    else if (result.status === 'FAIL') failCount++
    else if (result.status === 'WARN') warnCount++
  })

  console.log('='.repeat(80))
  console.log('📈 SUMMARY')
  console.log('='.repeat(80))
  console.log(`✅ Passed: ${passCount}`)
  console.log(`⚠️  Warnings: ${warnCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📊 Total: ${results.length}`)
  console.log('='.repeat(80) + '\n')
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting MongoDB data pulling tests...\n')

  try {
    const { client, db } = await connectToDatabase()
    console.log(`✅ Connected to MongoDB: ${db.databaseName}\n`)

    // Run all tests
    results.push(await testWorkflowsCollectionExists(db))
    results.push(await testFetchWorkflows(db))
    results.push(await testCreateWorkflow(db))
    results.push(await testWorkflowsWithFilters(db))
    results.push(await testWorkflowsIndexes(db))

    results.push(await testEmailTemplatesCollectionExists(db))
    results.push(await testFetchEmailTemplates(db))
    results.push(await testCreateEmailTemplate(db))
    results.push(await testEmailTemplatesWithFilters(db))
    results.push(await testEmailTemplatesIndexes(db))

    await client.close()
    console.log('✅ Database connection closed\n')

    // Print results
    printResults()

    // Exit with appropriate code
    const hasFailures = results.some(r => r.status === 'FAIL')
    process.exit(hasFailures ? 1 : 0)

  } catch (error) {
    console.error('\n❌ Fatal Error:', error)
    process.exit(1)
  }
}

// Run the tests
runTests()
