// scripts/populate-test-data.ts
// Run with: npx tsx src/scripts/populate-test-data.ts

import { config } from 'dotenv'
import { resolve } from 'path'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'recrutement-app'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

console.log('🔗 Using MongoDB URI from .env.local')
console.log('🗄️  Target database:', MONGODB_DB)

// Sample data
const sampleCandidates = [
  {
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    currentPosition: 'Senior Developer',
    currentCompany: 'Tech Corp',
    experienceLevel: 'senior',
    primarySkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    secondarySkills: ['MongoDB', 'PostgreSQL', 'Docker'],
    status: 'new',
    overallRating: 4.5
  },
  {
    firstName: 'Thomas',
    lastName: 'Martin',
    email: 'thomas.martin@example.com',
    phone: '+33 6 23 45 67 89',
    currentPosition: 'Full Stack Developer',
    currentCompany: 'StartupXYZ',
    experienceLevel: 'mid',
    primarySkills: ['Python', 'Django', 'React', 'PostgreSQL'],
    secondarySkills: ['AWS', 'Docker', 'Redis'],
    status: 'new',
    overallRating: 4.2
  },
  {
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@example.com',
    phone: '+33 6 34 56 78 90',
    currentPosition: 'Product Designer',
    currentCompany: 'Design Studio',
    experienceLevel: 'mid',
    primarySkills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
    secondarySkills: ['Adobe XD', 'Illustrator', 'After Effects'],
    status: 'new',
    overallRating: 4.7
  },
  {
    firstName: 'Lucas',
    lastName: 'Petit',
    email: 'lucas.petit@example.com',
    phone: '+33 6 45 67 89 01',
    currentPosition: 'Junior Developer',
    currentCompany: null,
    experienceLevel: 'junior',
    primarySkills: ['JavaScript', 'HTML', 'CSS', 'Git'],
    secondarySkills: ['React', 'Node.js'],
    status: 'new',
    overallRating: 3.8
  },
  {
    firstName: 'Emma',
    lastName: 'Leroy',
    email: 'emma.leroy@example.com',
    phone: '+33 6 56 78 90 12',
    currentPosition: 'DevOps Engineer',
    currentCompany: 'CloudTech',
    experienceLevel: 'senior',
    primarySkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform'],
    secondarySkills: ['Jenkins', 'GitLab CI', 'Monitoring'],
    status: 'new',
    overallRating: 4.6
  },
  {
    firstName: 'Antoine',
    lastName: 'Dubois',
    email: 'antoine.dubois@example.com',
    phone: '+33 6 67 89 01 23',
    currentPosition: 'Data Scientist',
    currentCompany: 'DataCorp',
    experienceLevel: 'mid',
    primarySkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    secondarySkills: ['R', 'Spark', 'Tableau'],
    status: 'new',
    overallRating: 4.4
  },
  {
    firstName: 'Camille',
    lastName: 'Robert',
    email: 'camille.robert@example.com',
    phone: '+33 6 78 90 12 34',
    currentPosition: 'Project Manager',
    currentCompany: 'AgileTeam',
    experienceLevel: 'senior',
    primarySkills: ['Scrum', 'Agile', 'JIRA', 'Stakeholder Management'],
    secondarySkills: ['Confluence', 'Risk Management', 'Budget Planning'],
    status: 'new',
    overallRating: 4.3
  },
  {
    firstName: 'Hugo',
    lastName: 'Moreau',
    email: 'hugo.moreau@example.com',
    phone: '+33 6 89 01 23 45',
    currentPosition: 'Mobile Developer',
    currentCompany: 'MobileFirst',
    experienceLevel: 'mid',
    primarySkills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
    secondarySkills: ['GraphQL', 'Redux', 'Jest'],
    status: 'new',
    overallRating: 4.1
  },
  {
    firstName: 'Léa',
    lastName: 'Simon',
    email: 'lea.simon@example.com',
    phone: '+33 6 90 12 34 56',
    currentPosition: 'QA Engineer',
    currentCompany: 'QualityTech',
    experienceLevel: 'mid',
    primarySkills: ['Test Automation', 'Selenium', 'Cypress', 'Jest'],
    secondarySkills: ['Postman', 'Performance Testing', 'CI/CD'],
    status: 'new',
    overallRating: 4.0
  },
  {
    firstName: 'Nathan',
    lastName: 'Laurent',
    email: 'nathan.laurent@example.com',
    phone: '+33 6 01 23 45 67',
    currentPosition: 'Security Engineer',
    currentCompany: 'SecureTech',
    experienceLevel: 'senior',
    primarySkills: ['Cybersecurity', 'Penetration Testing', 'SIEM', 'Compliance'],
    secondarySkills: ['Firewall', 'IDS/IPS', 'Security Audits'],
    status: 'new',
    overallRating: 4.8
  }
]

const sampleProcesses = [
  {
    name: 'Senior Full Stack Developer - Paris',
    type: 'job_specific',
    company: 'Hi-Ring Tech',
    location: 'Paris, France',
    description: 'We are looking for an experienced Full Stack Developer to join our growing team.',
    status: 'active',
    priority: 'high',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB'],
    stages: [
      {
        id: 'stage-1',
        name: 'Application Received',
        description: 'New applications to review',
        order: 0,
        targetDuration: 2
      },
      {
        id: 'stage-2',
        name: 'Phone Screening',
        description: 'Initial phone screening with recruiter',
        order: 1,
        targetDuration: 5
      },
      {
        id: 'stage-3',
        name: 'Technical Interview',
        description: 'Technical interview with the team',
        order: 2,
        targetDuration: 7
      },
      {
        id: 'stage-4',
        name: 'Final Interview',
        description: 'Final interview with management',
        order: 3,
        targetDuration: 3
      },
      {
        id: 'stage-5',
        name: 'Offer',
        description: 'Offer extended',
        order: 4,
        targetDuration: 5
      }
    ]
  },
  {
    name: 'UI/UX Designer - Remote',
    type: 'job_specific',
    company: 'Hi-Ring Design',
    location: 'Remote',
    description: 'Looking for a creative UI/UX Designer to craft beautiful user experiences.',
    status: 'active',
    priority: 'medium',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    requiredSkills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
    stages: [
      {
        id: 'stage-1',
        name: 'Portfolio Review',
        description: 'Review candidate portfolio',
        order: 0,
        targetDuration: 3
      },
      {
        id: 'stage-2',
        name: 'Design Challenge',
        description: 'Take-home design challenge',
        order: 1,
        targetDuration: 7
      },
      {
        id: 'stage-3',
        name: 'Presentation',
        description: 'Present design challenge results',
        order: 2,
        targetDuration: 5
      },
      {
        id: 'stage-4',
        name: 'Team Interview',
        description: 'Meet the design team',
        order: 3,
        targetDuration: 5
      },
      {
        id: 'stage-5',
        name: 'Offer',
        description: 'Offer extended',
        order: 4,
        targetDuration: 3
      }
    ]
  },
  {
    name: 'DevOps Engineer - Lyon',
    type: 'job_specific',
    company: 'Hi-Ring Cloud',
    location: 'Lyon, France',
    description: 'Seeking an experienced DevOps Engineer to manage our cloud infrastructure.',
    status: 'active',
    priority: 'urgent',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    stages: [
      {
        id: 'stage-1',
        name: 'Initial Screening',
        description: 'Review applications and resumes',
        order: 0,
        targetDuration: 2
      },
      {
        id: 'stage-2',
        name: 'Technical Assessment',
        description: 'Complete technical assessment',
        order: 1,
        targetDuration: 5
      },
      {
        id: 'stage-3',
        name: 'Technical Interview',
        description: 'Deep dive technical discussion',
        order: 2,
        targetDuration: 7
      },
      {
        id: 'stage-4',
        name: 'Final Round',
        description: 'Meet with leadership team',
        order: 3,
        targetDuration: 3
      },
      {
        id: 'stage-5',
        name: 'Offer',
        description: 'Offer negotiation',
        order: 4,
        targetDuration: 5
      }
    ]
  },
  {
    name: 'Internship Program - Summer 2025',
    type: 'custom_workflow',
    company: 'Hi-Ring',
    location: 'Paris, France',
    description: 'Summer internship program for talented students and recent graduates.',
    status: 'active',
    priority: 'medium',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    requiredSkills: [],
    stages: [
      {
        id: 'stage-1',
        name: 'Application',
        description: 'Application submission',
        order: 0,
        targetDuration: 5
      },
      {
        id: 'stage-2',
        name: 'Screening',
        description: 'Initial screening',
        order: 1,
        targetDuration: 7
      },
      {
        id: 'stage-3',
        name: 'Interview',
        description: 'Team interview',
        order: 2,
        targetDuration: 5
      },
      {
        id: 'stage-4',
        name: 'Selection',
        description: 'Final selection',
        order: 3,
        targetDuration: 3
      }
    ]
  }
]

async function populateTestData() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db(MONGODB_DB)
    const candidatesCollection = db.collection('candidates')
    const processesCollection = db.collection('processes')

    // Clear existing test data (optional - comment out if you want to keep existing data)
    console.log('\n🗑️  Clearing existing test data...')
    await candidatesCollection.deleteMany({})
    await processesCollection.deleteMany({})

    // Insert candidates
    console.log('\n👥 Creating test candidates...')
    const candidatesWithIds = sampleCandidates.map(candidate => ({
      ...candidate,
      id: uuidv4(),
      isActive: true,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      notes: [],
      activities: [],
      interviews: [],
      assessments: [],
      quickScores: [],
      attachments: [],
      processIds: [],
      currentProcesses: []
    }))

    const candidatesResult = await candidatesCollection.insertMany(candidatesWithIds)
    console.log(`✅ Created ${candidatesResult.insertedCount} candidates`)

    // Insert processes
    console.log('\n🎯 Creating test processes...')
    const processesWithIds = sampleProcesses.map(process => ({
      ...process,
      id: uuidv4(),
      isArchived: false,
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'admin@hi-ring.fr',
      lastUpdated: new Date(),
      candidateIds: [],
      targetHires: process.type === 'job_specific' ? 1 : 5,
      budget: null,
      team: [],
      customFields: {}
    }))

    const processesResult = await processesCollection.insertMany(processesWithIds)
    console.log(`✅ Created ${processesResult.insertedCount} processes`)

    // Print summary
    console.log('\n📊 Summary:')
    console.log(`   Candidates: ${candidatesResult.insertedCount}`)
    console.log(`   Processes: ${processesResult.insertedCount}`)
    console.log('\n🎉 Test data population completed!')
    console.log('\n💡 You can now:')
    console.log('   1. Visit http://localhost:3000/admin to see the Candidates Hub')
    console.log('   2. Visit http://localhost:3000/admin/processes to see the Processes')
    console.log('   3. Assign candidates to processes')
    console.log('   4. Test the kanban board for each process')

  } catch (error) {
    console.error('❌ Error populating test data:', error)
    throw error
  } finally {
    await client.close()
    console.log('\n✅ Database connection closed')
  }
}

// Run the script
populateTestData().catch(console.error)