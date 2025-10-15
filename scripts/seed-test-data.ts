// scripts/seed-test-data.ts
// Comprehensive test data seeding for CRM features

import { MongoClient, ObjectId } from 'mongodb'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  console.error('   Please check your .env.local file')
  process.exit(1)
}

if (!MONGODB_DB) {
  console.error('❌ MONGODB_DB not found in environment variables')
  console.error('   Please check your .env.local file')
  process.exit(1)
}

interface TestActivity {
  id: string
  type: string
  description: string
  userId: string
  userName: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface TestInterview {
  id: string
  scheduledDate: string
  duration: number
  type: string
  location: string
  meetingLink: string
  status: string
  interviewers: string[]
  notes: string
  feedback?: unknown[]
  createdAt: string
  updatedAt: string
}

interface TestDocument {
  id: string
  name: string
  type: string
  url: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

interface TestCandidate {
  firstName: string
  lastName: string
  email: string
  phone: string
  currentPosition: string
  appliedPosition: string
  location: string
  experience: string
  stage: string
  status: string
  skills: string[]
  education: string
  linkedin?: string
  portfolio?: string
  expectedSalary?: string
  availability?: string
  source: string
  createdAt: Date
  updatedAt: Date
  activities: TestActivity[]
  interviews: TestInterview[]
  documents: TestDocument[]
  notes: string
}

const stages = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']
const statuses = ['active', 'inactive']
const positions = [
  'Développeur Full Stack',
  'Développeur Frontend',
  'Développeur Backend',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'HR Manager'
]

const skills = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Java', 'AWS',
  'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'GraphQL',
  'REST API', 'Machine Learning', 'Data Analysis', 'Leadership',
  'Communication', 'Problem Solving', 'Agile', 'Scrum'
]

const locations = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux',
  'Nantes', 'Lille', 'Remote', 'Hybrid - Paris', 'Nice'
]

const sources = [
  'LinkedIn', 'Indeed', 'Monster', 'Référence interne',
  'Site Web', 'Job Fair', 'Candidature directe', 'Glassdoor'
]

// Generate random date within last N days
function randomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

// Generate realistic candidate data
function generateCandidate(index: number): TestCandidate {
  const firstNames = [
    'Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Emma',
    'Thomas', 'Julie', 'Nicolas', 'Léa', 'Alexandre', 'Chloé',
    'Antoine', 'Camille', 'Julien', 'Sarah', 'Maxime', 'Laura'
  ]

  const lastNames = [
    'Dupont', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert',
    'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon',
    'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand'
  ]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`

  const stage = stages[Math.floor(Math.random() * stages.length)]
  const status = stage === 'hired' || stage === 'rejected' ? 'inactive' : 'active'

  const appliedPosition = positions[Math.floor(Math.random() * positions.length)]
  const createdAt = randomDate(180) // Last 6 months

  // Generate activities based on stage
  const activities: TestActivity[] = []

  activities.push({
    id: new Date(createdAt).getTime().toString(),
    type: 'profile_created',
    description: 'Candidature reçue',
    userId: 'system',
    userName: 'Système',
    timestamp: createdAt.toISOString(),
    metadata: {
      source: sources[Math.floor(Math.random() * sources.length)]
    }
  })

  // Add stage progression activities
  if (stage !== 'applied') {
    const screeningDate = new Date(createdAt)
    screeningDate.setDate(screeningDate.getDate() + Math.floor(Math.random() * 3) + 1)

    activities.push({
      id: screeningDate.getTime().toString(),
      type: 'stage_changed',
      description: 'Passé en présélection',
      userId: 'admin@hi-ring.com',
      userName: 'Admin',
      timestamp: screeningDate.toISOString(),
      metadata: {
        oldStage: 'applied',
        newStage: 'screening'
      }
    })
  }

  if (['interview', 'offer', 'hired'].includes(stage)) {
    const interviewDate = new Date(createdAt)
    interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 7) + 3)

    activities.push({
      id: interviewDate.getTime().toString(),
      type: 'stage_changed',
      description: 'Entretien planifié',
      userId: 'admin@hi-ring.com',
      userName: 'Admin',
      timestamp: interviewDate.toISOString(),
      metadata: {
        oldStage: 'screening',
        newStage: 'interview'
      }
    })
  }

  // Generate interviews if appropriate
  const interviews: TestInterview[] = []
  if (['interview', 'offer', 'hired'].includes(stage)) {
    const interviewDate = new Date(createdAt)
    interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 10) + 5)

    interviews.push({
      id: new Date(interviewDate).getTime().toString(),
      scheduledDate: interviewDate.toISOString(),
      duration: 60,
      type: Math.random() > 0.5 ? 'video' : 'in_person',
      location: Math.random() > 0.5 ? 'Bureau Paris' : '',
      meetingLink: Math.random() > 0.5 ? 'https://meet.google.com/abc-defg-hij' : '',
      status: stage === 'interview' ? 'scheduled' : 'completed',
      interviewers: ['admin@hi-ring.com'],
      notes: 'Entretien technique approfondi',
      feedback: stage !== 'interview' ? [{
        interviewerId: 'admin@hi-ring.com',
        interviewerName: 'Admin',
        submittedAt: new Date(interviewDate).toISOString(),
        recommendation: Math.random() > 0.3 ? 'hire' : 'maybe',
        summary: 'Bon candidat avec des compétences solides',
        ratings: {
          technical: Math.floor(Math.random() * 2) + 3,
          communication: Math.floor(Math.random() * 2) + 4,
          problemSolving: Math.floor(Math.random() * 2) + 3,
          cultureFit: Math.floor(Math.random() * 2) + 4,
          motivation: Math.floor(Math.random() * 2) + 4,
          teamwork: Math.floor(Math.random() * 2) + 4
        },
        strengths: ['Bonnes compétences techniques', 'Expérience pertinente'],
        weaknesses: ['Peut améliorer la communication'],
        areasForImprovement: ['Tests unitaires'],
        wouldHireAgain: true,
        confidenceLevel: 4
      }] : [],
      createdAt: interviewDate.toISOString(),
      updatedAt: interviewDate.toISOString()
    })
  }

  // Generate documents
  const documents: TestDocument[] = []
  documents.push({
    id: new Date().getTime().toString(),
    name: `CV_${firstName}_${lastName}.pdf`,
    type: 'resume',
    url: `/uploads/resumes/${firstName}_${lastName}_${index}.pdf`,
    size: Math.floor(Math.random() * 500000) + 100000,
    uploadedAt: createdAt.toISOString(),
    uploadedBy: 'system'
  })

  return {
    firstName,
    lastName,
    email,
    phone: `+33 6 ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
    currentPosition: positions[Math.floor(Math.random() * positions.length)],
    appliedPosition,
    location: locations[Math.floor(Math.random() * locations.length)],
    experience: `${Math.floor(Math.random() * 10) + 1} ans`,
    stage,
    status,
    skills: skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3),
    education: 'Master en Informatique',
    linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    portfolio: Math.random() > 0.5 ? `https://portfolio-${firstName.toLowerCase()}.com` : undefined,
    expectedSalary: `${Math.floor(Math.random() * 30) + 40}K€`,
    availability: Math.random() > 0.5 ? 'Immédiate' : '1 mois de préavis',
    source: sources[Math.floor(Math.random() * sources.length)],
    createdAt,
    updatedAt: new Date(),
    activities,
    interviews,
    documents,
    notes: 'Profil intéressant avec bonnes références'
  }
}

// Generate email templates
function generateEmailTemplates() {
  return [
    {
      name: 'Invitation Entretien - Standard',
      type: 'interview_invitation',
      subject: 'Invitation à un entretien - {{position}}',
      body: `Bonjour {{firstName}},

Nous avons le plaisir de vous inviter à un entretien pour le poste de {{position}} chez {{companyName}}.

Détails de l'entretien :
- Date : {{interviewDate}}
- Heure : {{interviewTime}}
- Lieu : {{interviewLocation}}
- Lien visio : {{interviewLink}}

Veuillez confirmer votre présence en répondant à cet email.

Cordialement,
{{recruiterName}}
{{companyName}}`,
      isActive: true,
      isDefault: true,
      variables: ['firstName', 'position', 'companyName', 'interviewDate', 'interviewTime', 'interviewLocation', 'interviewLink', 'recruiterName'],
      createdBy: 'admin@hi-ring.com',
      createdByName: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    },
    {
      name: 'Offre d\'Emploi',
      type: 'offer_letter',
      subject: 'Offre d\'emploi - {{position}} chez {{companyName}}',
      body: `Bonjour {{firstName}},

Nous sommes ravis de vous proposer le poste de {{position}} chez {{companyName}}.

Détails de l'offre :
- Poste : {{position}}
- Salaire : {{salary}}
- Date de début : {{startDate}}
- Localisation : {{location}}

Cette offre est valable jusqu'au {{offerExpiryDate}}.

Nous sommes impatients de vous accueillir dans notre équipe !

Cordialement,
{{recruiterName}}
{{recruiterEmail}}`,
      isActive: true,
      isDefault: false,
      variables: ['firstName', 'position', 'companyName', 'salary', 'startDate', 'recruiterName', 'recruiterEmail'],
      createdBy: 'admin@hi-ring.com',
      createdByName: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    },
    {
      name: 'Refus Poli',
      type: 'rejection_soft',
      subject: 'Mise à jour sur votre candidature',
      body: `Bonjour {{firstName}},

Merci pour votre intérêt pour le poste de {{position}} chez {{companyName}}.

Après un examen attentif de votre candidature, nous avons décidé de poursuivre avec d'autres candidats dont le profil correspond davantage aux besoins actuels du poste.

Nous avons été impressionnés par votre parcours et conservons votre CV dans notre base de données pour de futures opportunités.

Nous vous souhaitons bonne chance dans votre recherche.

Cordialement,
{{recruiterName}}
{{companyName}}`,
      isActive: true,
      isDefault: false,
      variables: ['firstName', 'position', 'companyName', 'recruiterName'],
      createdBy: 'admin@hi-ring.com',
      createdByName: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    }
  ]
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  const client = await MongoClient.connect(MONGODB_URI!)
  const db = client.db(MONGODB_DB!)

  try {
    // Clear existing test data (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing data...')
    // await db.collection('candidates').deleteMany({})
    // await db.collection('email_templates').deleteMany({})

    // Generate and insert candidates
    console.log('👥 Generating 100 test candidates...')
    const candidates = []
    for (let i = 0; i < 100; i++) {
      candidates.push(generateCandidate(i))
    }

    const candidateResult = await db.collection('candidates').insertMany(candidates)
    console.log(`✅ Inserted ${candidateResult.insertedCount} candidates`)

    // Insert email templates
    console.log('📧 Creating email templates...')
    const templates = generateEmailTemplates()
    const templateResult = await db.collection('email_templates').insertMany(templates)
    console.log(`✅ Inserted ${templateResult.insertedCount} email templates`)

    // Generate email logs for some candidates
    console.log('📬 Generating email logs...')
    const emailLogs = []
    const sampleCandidates = candidates.slice(0, 20)

    for (const candidate of sampleCandidates) {
      emailLogs.push({
        candidateId: candidate.email, // Will be updated with actual ID
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: candidate.email,
        templateId: new ObjectId().toString(),
        templateName: 'Invitation Entretien - Standard',
        subject: `Invitation à un entretien - ${candidate.appliedPosition}`,
        body: 'Test email body',
        sentBy: 'admin@hi-ring.com',
        sentByName: 'Admin',
        sentAt: randomDate(60).toISOString(),
        status: 'sent',
        ccEmails: [],
        messageId: `msg-${new Date().getTime()}-${Math.random()}`
      })
    }

    if (emailLogs.length > 0) {
      const logsResult = await db.collection('email_logs').insertMany(emailLogs)
      console.log(`✅ Inserted ${logsResult.insertedCount} email logs`)
    }

    // Print summary
    console.log('\n📊 Seeding Summary:')
    console.log('='.repeat(50))

    const stageCount = await db.collection('candidates').aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]).toArray()

    console.log('\n📈 Candidates by Stage:')
    for (const stage of stageCount) {
      console.log(`  ${stage._id}: ${stage.count}`)
    }

    const activeCount = await db.collection('candidates').countDocuments({ status: 'active' })
    const inactiveCount = await db.collection('candidates').countDocuments({ status: 'inactive' })

    console.log('\n🎯 Candidates by Status:')
    console.log(`  Active: ${activeCount}`)
    console.log(`  Inactive: ${inactiveCount}`)

    const withInterviews = await db.collection('candidates').countDocuments({
      'interviews.0': { $exists: true }
    })

    console.log('\n📅 Interview Statistics:')
    console.log(`  Candidates with interviews: ${withInterviews}`)

    console.log('\n✅ Database seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await client.close()
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log('\n🎉 All done! You can now test the CRM features with realistic data.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to seed database:', error)
    process.exit(1)
  })
