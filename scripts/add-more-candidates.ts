// Add more demo candidates for testing bulk operations
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { CandidateStatus, ExperienceLevel, SkillLevel, AvailabilityStatus, ContractPreference } from '../src/app/types/candidates'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB!

const firstNames = ['Lucas', 'Emma', 'Hugo', 'Léa', 'Louis', 'Chloé', 'Gabriel', 'Sarah', 'Arthur', 'Manon', 'Raphaël', 'Clara', 'Paul', 'Zoé', 'Victor', 'Camille', 'Jules', 'Inès', 'Adam', 'Jade']
const lastNames = ['Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'Roux', 'Fournier', 'Girard', 'Bonnet', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre', 'Mercier', 'Blanc', 'Guerin']

const positions = ['Développeur Full Stack', 'Développeur Frontend', 'Développeur Backend', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'QA Engineer', 'Scrum Master', 'Tech Lead']

const companies = ['TechCorp', 'Digital Agency', 'Innovation Lab', 'Startup Hub', 'Cloud Solutions', 'AI Research', 'Mobile First', 'DataPro', 'WebFactory', 'CodeCraft']

const skills = ['React', 'Node.js', 'TypeScript', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Vue.js', 'Angular', 'GraphQL', 'REST API', 'Git']

const statuses = [
  CandidateStatus.NEW,
  CandidateStatus.CONTACTED,
  CandidateStatus.SCREENING,
  CandidateStatus.INTERVIEW_SCHEDULED,
  CandidateStatus.INTERVIEW_COMPLETED,
  CandidateStatus.OFFER_SENT,
  CandidateStatus.REJECTED
]

const experienceLevels = [ExperienceLevel.JUNIOR, ExperienceLevel.MID, ExperienceLevel.SENIOR]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function randomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

async function addCandidates() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('🔄 Connecting to MongoDB...')
    await client.connect()
    const db = client.db(MONGODB_DB)

    const adminUser = await db.collection('users').findOne({ role: 'super_admin' })
    const creatorId = adminUser?._id.toString() || 'system'

    // Get existing emails to avoid duplicates
    const existingCandidates = await db.collection('candidates').find({}, { projection: { email: 1 } }).toArray()
    const existingEmails = new Set(existingCandidates.map((c) => (c as { email: string }).email))

    console.log(`📊 Existing candidates: ${existingEmails.size}`)
    console.log('\n👥 Creating 20 additional demo candidates...\n')

    const newCandidates = []

    for (let i = 0; i < 20; i++) {
      const firstName = randomItem(firstNames)
      const lastName = randomItem(lastNames)
      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`

      // Ensure unique email
      let counter = 1
      while (existingEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@example.com`
        counter++
      }
      existingEmails.add(email)

      const status = randomItem(statuses)
      const experienceLevel = randomItem(experienceLevels)
      const createdAt = randomDate(90)

      const candidateSkills = randomItems(skills, Math.floor(Math.random() * 4) + 3).map(skill => ({
        name: skill,
        level: randomItem([SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED, SkillLevel.EXPERT]),
        yearsOfExperience: Math.floor(Math.random() * 6) + 1
      }))

      const candidate = {
        firstName,
        lastName,
        email,
        phone: `+33 6 ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
        currentPosition: randomItem(positions),
        currentCompany: randomItem(companies),
        experienceLevel,
        totalExperience: Math.floor(Math.random() * 10) + 1,
        status,
        source: randomItem(['linkedin', 'indeed', 'website', 'referral']),
        skills: candidateSkills,
        primarySkills: candidateSkills.slice(0, 3).map(s => s.name),
        languages: [
          { language: 'Français', level: 'native' as const },
          { language: 'Anglais', level: randomItem(['professional' as const, 'fluent' as const, 'intermediate' as const]) }
        ],
        workExperience: [{
          id: '1',
          company: randomItem(companies),
          position: randomItem(positions),
          startDate: randomDate(1000).toISOString(),
          isCurrent: Math.random() > 0.5,
          description: 'Développement de solutions innovantes',
          technologies: randomItems(skills, 3)
        }],
        education: [{
          id: '1',
          institution: 'Université ' + randomItem(['Paris', 'Lyon', 'Toulouse', 'Lille']),
          degree: randomItem(['Bachelor', 'Master']),
          field: 'Informatique',
          startDate: '2015-09-01',
          endDate: '2018-06-30'
        }],
        desiredPosition: [randomItem(positions)],
        contractPreference: [randomItem([ContractPreference.CDI, ContractPreference.CDD, ContractPreference.FREELANCE])],
        availability: randomItem([AvailabilityStatus.IMMEDIATE, AvailabilityStatus.TWO_WEEKS, AvailabilityStatus.ONE_MONTH]),
        willingToRelocate: Math.random() > 0.5,
        remoteWorkPreference: randomItem(['remote' as const, 'hybrid' as const, 'onsite' as const, 'flexible' as const]),
        salaryExpectation: {
          min: 35000 + Math.floor(Math.random() * 20000),
          max: 50000 + Math.floor(Math.random() * 30000),
          currency: 'EUR',
          frequency: 'yearly' as const,
          negotiable: true
        },
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        interviews: [],
        applicationIds: [],
        notes: [],
        activities: [{
          id: '1',
          type: 'profile_updated' as const,
          description: 'Candidate profile created',
          userId: creatorId,
          userName: 'Admin',
          timestamp: createdAt.toISOString()
        }],
        tags: randomItems(['javascript', 'python', 'react', 'senior', 'junior', 'remote', 'paris'], 2),
        overallRating: Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 3 : undefined,
        technicalRating: Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 3 : undefined,
        createdBy: creatorId,
        createdAt: createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
        lastContactedAt: status !== CandidateStatus.NEW ? randomDate(30).toISOString() : undefined,
        gdprConsent: true,
        marketingConsent: Math.random() > 0.5,
        isActive: status !== CandidateStatus.REJECTED,
        isArchived: false
      }

      newCandidates.push(candidate)
      console.log(`   ${i + 1}. ${candidate.firstName} ${candidate.lastName} - ${candidate.currentPosition} (${candidate.status})`)
    }

    const result = await db.collection('candidates').insertMany(newCandidates)
    console.log(`\n✅ Successfully added ${result.insertedCount} new candidates`)

    const totalCount = await db.collection('candidates').countDocuments()
    console.log(`📊 Total candidates in database: ${totalCount}`)

    console.log('\n🎉 Done! You can now test with more candidates at: http://localhost:3005/candidates')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

addCandidates()
