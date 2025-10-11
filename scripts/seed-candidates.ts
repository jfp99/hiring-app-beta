// scripts/seed-candidates.ts
/**
 * Seed demo candidates for testing
 * Run with: npx ts-node scripts/seed-candidates.ts
 */

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { CandidateStatus, ExperienceLevel, SkillLevel, AvailabilityStatus, ContractPreference } from '../src/app/types/candidates'

// Load environment variables
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB!

if (!MONGODB_URI || !MONGODB_DB) {
  console.error('❌ Missing MongoDB configuration in .env.local')
  process.exit(1)
}

async function seedCandidates() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('🔄 Connecting to MongoDB...')
    await client.connect()
    const db = client.db(MONGODB_DB)

    console.log('✅ Connected to MongoDB')

    // Get the super admin user to use as creator
    const adminUser = await db.collection('users').findOne({ role: 'super_admin' })

    if (!adminUser) {
      console.error('❌ No admin user found. Please run init-database.ts first')
      process.exit(1)
    }

    const creatorId = adminUser._id.toString()

    console.log('\n👥 Creating demo candidates...')

    const demoCandidates = [
      {
        firstName: 'Marie',
        lastName: 'Dubois',
        email: 'marie.dubois@example.com',
        phone: '+33 6 12 34 56 78',
        currentPosition: 'Développeuse Full Stack Senior',
        currentCompany: 'TechStartup Paris',
        experienceLevel: ExperienceLevel.SENIOR,
        totalExperience: 7,
        status: CandidateStatus.SCREENING,
        source: 'linkedin',
        skills: [
          { name: 'JavaScript', level: SkillLevel.EXPERT, yearsOfExperience: 7 },
          { name: 'React', level: SkillLevel.EXPERT, yearsOfExperience: 5 },
          { name: 'Node.js', level: SkillLevel.ADVANCED, yearsOfExperience: 6 },
          { name: 'TypeScript', level: SkillLevel.ADVANCED, yearsOfExperience: 4 },
          { name: 'MongoDB', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 3 }
        ],
        primarySkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB'],
        languages: [
          { language: 'Français', level: 'native' as const },
          { language: 'Anglais', level: 'professional' as const }
        ],
        workExperience: [
          {
            id: '1',
            company: 'TechStartup Paris',
            position: 'Senior Full Stack Developer',
            startDate: '2020-03-01',
            isCurrent: true,
            description: 'Lead development of SaaS platform serving 10,000+ users',
            technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
            location: 'Paris, France'
          },
          {
            id: '2',
            company: 'Digital Agency',
            position: 'Full Stack Developer',
            startDate: '2017-06-01',
            endDate: '2020-02-28',
            description: 'Built custom web applications for various clients',
            technologies: ['Vue.js', 'Express', 'PostgreSQL'],
            location: 'Lyon, France'
          }
        ],
        education: [
          {
            id: '1',
            institution: 'Université Paris-Saclay',
            degree: 'Master',
            field: 'Informatique',
            startDate: '2013-09-01',
            endDate: '2017-06-30',
            grade: 'Mention Bien',
            location: 'Paris, France'
          }
        ],
        desiredPosition: ['Lead Developer', 'Tech Lead', 'Engineering Manager'],
        contractPreference: [ContractPreference.CDI],
        availability: AvailabilityStatus.ONE_MONTH,
        willingToRelocate: true,
        remoteWorkPreference: 'hybrid' as const,
        salaryExpectation: {
          min: 55000,
          max: 70000,
          currency: 'EUR',
          frequency: 'yearly' as const,
          negotiable: true
        },
        linkedinUrl: 'https://linkedin.com/in/mariedubois',
        githubUrl: 'https://github.com/mariedubois',
        interviews: [],
        applicationIds: [],
        notes: [
          {
            id: '1',
            authorId: creatorId,
            authorName: 'Super Admin',
            content: 'Excellent profil technique. Très bonne communication lors du premier contact.',
            createdAt: new Date().toISOString(),
            isPrivate: false,
            tags: ['technical', 'communication']
          }
        ],
        activities: [
          {
            id: '1',
            type: 'profile_updated' as const,
            description: 'Candidate profile created',
            userId: creatorId,
            userName: 'Super Admin',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            type: 'status_change' as const,
            description: 'Status changed from new to contacted',
            userId: creatorId,
            userName: 'Super Admin',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            type: 'status_change' as const,
            description: 'Status changed from contacted to screening',
            userId: creatorId,
            userName: 'Super Admin',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        tags: ['javascript', 'react', 'senior', 'paris'],
        overallRating: 4.5,
        technicalRating: 5,
        culturalFitRating: 4,
        communicationRating: 4.5,
        createdBy: creatorId,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastContactedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        gdprConsent: true,
        marketingConsent: true,
        isActive: true,
        isArchived: false
      },
      {
        firstName: 'Thomas',
        lastName: 'Martin',
        email: 'thomas.martin@example.com',
        phone: '+33 7 23 45 67 89',
        currentPosition: 'Data Scientist',
        currentCompany: 'AI Research Lab',
        experienceLevel: ExperienceLevel.MID,
        totalExperience: 4,
        status: CandidateStatus.INTERVIEW_SCHEDULED,
        source: 'website',
        skills: [
          { name: 'Python', level: SkillLevel.EXPERT, yearsOfExperience: 4 },
          { name: 'Machine Learning', level: SkillLevel.ADVANCED, yearsOfExperience: 3 },
          { name: 'TensorFlow', level: SkillLevel.ADVANCED, yearsOfExperience: 2 },
          { name: 'SQL', level: SkillLevel.ADVANCED, yearsOfExperience: 4 }
        ],
        primarySkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
        languages: [
          { language: 'Français', level: 'native' as const },
          { language: 'Anglais', level: 'fluent' as const }
        ],
        workExperience: [
          {
            id: '1',
            company: 'AI Research Lab',
            position: 'Data Scientist',
            startDate: '2021-01-01',
            isCurrent: true,
            description: 'Developing ML models for predictive analytics',
            technologies: ['Python', 'TensorFlow', 'Pandas', 'Scikit-learn']
          }
        ],
        education: [
          {
            id: '1',
            institution: 'École Polytechnique',
            degree: 'Master',
            field: 'Data Science & AI',
            startDate: '2017-09-01',
            endDate: '2020-06-30'
          }
        ],
        contractPreference: [ContractPreference.CDI, ContractPreference.FREELANCE],
        availability: AvailabilityStatus.TWO_WEEKS,
        willingToRelocate: false,
        remoteWorkPreference: 'remote' as const,
        interviews: [],
        applicationIds: [],
        notes: [],
        activities: [
          {
            id: '1',
            type: 'profile_updated' as const,
            description: 'Candidate profile created',
            userId: creatorId,
            userName: 'Super Admin',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        tags: ['python', 'ml', 'data-science'],
        overallRating: 4,
        technicalRating: 4.5,
        createdBy: creatorId,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        gdprConsent: true,
        marketingConsent: false,
        isActive: true,
        isArchived: false
      },
      {
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.bernard@example.com',
        phone: '+33 6 98 76 54 32',
        currentPosition: 'UX/UI Designer',
        experienceLevel: ExperienceLevel.JUNIOR,
        totalExperience: 2,
        status: CandidateStatus.NEW,
        source: 'referral',
        skills: [
          { name: 'Figma', level: SkillLevel.ADVANCED, yearsOfExperience: 2 },
          { name: 'Adobe XD', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 2 },
          { name: 'User Research', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 1 }
        ],
        primarySkills: ['Figma', 'Adobe XD', 'User Research'],
        languages: [
          { language: 'Français', level: 'native' as const },
          { language: 'Anglais', level: 'intermediate' as const }
        ],
        workExperience: [],
        education: [
          {
            id: '1',
            institution: 'ENSAD Paris',
            degree: 'Bachelor',
            field: 'Design Interactif',
            startDate: '2019-09-01',
            endDate: '2022-06-30'
          }
        ],
        contractPreference: [ContractPreference.CDI, ContractPreference.CDD],
        availability: AvailabilityStatus.IMMEDIATE,
        willingToRelocate: true,
        remoteWorkPreference: 'flexible' as const,
        interviews: [],
        applicationIds: [],
        notes: [],
        activities: [
          {
            id: '1',
            type: 'profile_updated' as const,
            description: 'Candidate profile created',
            userId: creatorId,
            userName: 'Super Admin',
            timestamp: new Date().toISOString()
          }
        ],
        tags: ['design', 'ux', 'junior'],
        createdBy: creatorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        gdprConsent: true,
        marketingConsent: true,
        isActive: true,
        isArchived: false
      },
      {
        firstName: 'Alexandre',
        lastName: 'Leroy',
        email: 'alexandre.leroy@example.com',
        phone: '+33 7 11 22 33 44',
        currentPosition: 'DevOps Engineer',
        currentCompany: 'CloudTech Solutions',
        experienceLevel: ExperienceLevel.SENIOR,
        totalExperience: 8,
        status: CandidateStatus.OFFER_SENT,
        source: 'linkedin',
        skills: [
          { name: 'Docker', level: SkillLevel.EXPERT, yearsOfExperience: 6 },
          { name: 'Kubernetes', level: SkillLevel.EXPERT, yearsOfExperience: 5 },
          { name: 'AWS', level: SkillLevel.EXPERT, yearsOfExperience: 7 },
          { name: 'Terraform', level: SkillLevel.ADVANCED, yearsOfExperience: 4 },
          { name: 'CI/CD', level: SkillLevel.EXPERT, yearsOfExperience: 8 }
        ],
        primarySkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
        languages: [
          { language: 'Français', level: 'native' as const },
          { language: 'Anglais', level: 'fluent' as const }
        ],
        workExperience: [
          {
            id: '1',
            company: 'CloudTech Solutions',
            position: 'Senior DevOps Engineer',
            startDate: '2018-01-01',
            isCurrent: true,
            description: 'Managing cloud infrastructure for enterprise clients',
            technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform']
          }
        ],
        education: [
          {
            id: '1',
            institution: 'INSA Lyon',
            degree: 'Diplôme d\'Ingénieur',
            field: 'Informatique',
            startDate: '2011-09-01',
            endDate: '2016-06-30'
          }
        ],
        contractPreference: [ContractPreference.CDI],
        availability: AvailabilityStatus.TWO_MONTHS,
        willingToRelocate: false,
        remoteWorkPreference: 'remote' as const,
        salaryExpectation: {
          min: 65000,
          max: 80000,
          currency: 'EUR',
          frequency: 'yearly' as const,
          negotiable: true
        },
        interviews: [],
        applicationIds: [],
        notes: [
          {
            id: '1',
            authorId: creatorId,
            authorName: 'Super Admin',
            content: 'Excellent profil DevOps. Offre envoyée à 70K€.',
            createdAt: new Date().toISOString(),
            isPrivate: true,
            tags: ['offer', 'salary']
          }
        ],
        activities: [
          {
            id: '1',
            type: 'status_change' as const,
            description: 'Status changed to offer_sent',
            userId: creatorId,
            userName: 'Super Admin',
            timestamp: new Date().toISOString()
          }
        ],
        tags: ['devops', 'aws', 'senior', 'hot-candidate'],
        overallRating: 5,
        technicalRating: 5,
        culturalFitRating: 4.5,
        communicationRating: 5,
        createdBy: creatorId,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastContactedAt: new Date().toISOString(),
        gdprConsent: true,
        marketingConsent: true,
        isActive: true,
        isArchived: false
      },
      {
        firstName: 'Julie',
        lastName: 'Petit',
        email: 'julie.petit@example.com',
        phone: '+33 6 55 44 33 22',
        currentPosition: 'Product Manager',
        currentCompany: 'Startup Innovante',
        experienceLevel: ExperienceLevel.MID,
        totalExperience: 5,
        status: CandidateStatus.CONTACTED,
        source: 'agency',
        skills: [
          { name: 'Product Management', level: SkillLevel.ADVANCED, yearsOfExperience: 5 },
          { name: 'Agile/Scrum', level: SkillLevel.ADVANCED, yearsOfExperience: 4 },
          { name: 'Data Analysis', level: SkillLevel.INTERMEDIATE, yearsOfExperience: 3 }
        ],
        primarySkills: ['Product Management', 'Agile/Scrum', 'Data Analysis'],
        languages: [
          { language: 'Français', level: 'native' as const },
          { language: 'Anglais', level: 'fluent' as const },
          { language: 'Espagnol', level: 'intermediate' as const }
        ],
        workExperience: [
          {
            id: '1',
            company: 'Startup Innovante',
            position: 'Product Manager',
            startDate: '2020-03-01',
            isCurrent: true,
            description: 'Led product development for mobile app with 100K+ users'
          }
        ],
        education: [
          {
            id: '1',
            institution: 'HEC Paris',
            degree: 'Master',
            field: 'Management & Innovation',
            startDate: '2016-09-01',
            endDate: '2019-06-30'
          }
        ],
        contractPreference: [ContractPreference.CDI],
        availability: AvailabilityStatus.NEGOTIABLE,
        willingToRelocate: true,
        remoteWorkPreference: 'hybrid' as const,
        interviews: [],
        applicationIds: [],
        notes: [],
        activities: [
          {
            id: '1',
            type: 'profile_updated' as const,
            description: 'Candidate profile created',
            userId: creatorId,
            userName: 'Super Admin',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        tags: ['product', 'management', 'agile'],
        overallRating: 4,
        createdBy: creatorId,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastContactedAt: new Date().toISOString(),
        gdprConsent: true,
        marketingConsent: false,
        isActive: true,
        isArchived: false
      }
    ]

    // Insert candidates
    const result = await db.collection('candidates').insertMany(demoCandidates)

    console.log(`✅ Created ${result.insertedCount} demo candidates:`)
    demoCandidates.forEach((candidate, idx) => {
      console.log(`   ${idx + 1}. ${candidate.firstName} ${candidate.lastName} - ${candidate.currentPosition} (${candidate.status})`)
    })

    console.log('\n🎉 Seeding completed successfully!')
    console.log('\n🚀 You can now view candidates at: http://localhost:3000/candidates')

  } catch (error) {
    console.error('❌ Error seeding candidates:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n👋 Database connection closed')
  }
}

// Run the seeding
seedCandidates()
