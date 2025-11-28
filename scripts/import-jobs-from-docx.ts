// scripts/import-jobs-from-docx.ts
/**
 * Script to import job offers from Word documents in docs/annonces/
 * Replaces test job offers with real ones from DOCX files
 *
 * Run with: npx tsx scripts/import-jobs-from-docx.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { MongoClient, Db } from 'mongodb'
import * as fs from 'fs'
import * as path from 'path'
import mammoth from 'mammoth'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

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

// Extract job info from filename
// Format: "Titre du poste - Lieu.docx"
function parseJobFilename(filename: string): { titre: string; lieu: string } {
  // Remove .docx extension
  const nameWithoutExt = filename.replace('.docx', '')

  // Split by last occurrence of ' - '
  const lastDashIndex = nameWithoutExt.lastIndexOf(' - ')

  if (lastDashIndex === -1) {
    // No dash found, use whole name as title
    return {
      titre: nameWithoutExt.trim(),
      lieu: 'France'
    }
  }

  const titre = nameWithoutExt.substring(0, lastDashIndex).trim()
  const lieu = nameWithoutExt.substring(lastDashIndex + 3).trim()

  return { titre, lieu }
}

// Extract salary from text (improved with multiple formats)
function extractSalary(text: string): string {
  const lowerText = text.toLowerCase()

  // Patterns to match salary formats
  const patterns = [
    // "45k - 55k", "45K-55K"
    /(\d{2,3})\s*k\s*[-–]\s*(\d{2,3})\s*k/i,
    // "45000 - 55000 €", "45 000€ - 55 000€"
    /(\d{2,3})\s*\d{3}\s*[-–]\s*(\d{2,3})\s*\d{3}\s*€/i,
    // "de 45k à 55k"
    /de\s+(\d{2,3})\s*k\s+à\s+(\d{2,3})\s*k/i,
    // "entre 45000 et 55000"
    /entre\s+(\d{2,3})\s*\d{3}\s+et\s+(\d{2,3})\s*\d{3}/i,
    // "salaire : 50k"
    /salaire\s*:?\s*(\d{2,3})\s*k/i,
    // Just "45k" or "50K"
    /(\d{2,3})\s*k(?!\w)/i
  ]

  for (const pattern of patterns) {
    const match = lowerText.match(pattern)
    if (match) {
      if (match[2]) {
        // Range found
        return `${match[1]}k - ${match[2]}k €/an`
      } else {
        // Single value
        return `${match[1]}k €/an`
      }
    }
  }

  return '' // No salary found
}

// Get company name - returns default company name
// Company names can be updated manually via the admin dashboard if needed
function getCompanyName(): string {
  return process.env.DEFAULT_COMPANY_NAME || 'Votre Entreprise'
}

// Extract description + mission section (combined for Tab 1)
// Includes: Position, Contexte, Mission principale
function extractDescriptionMission(text: string): string {
  let content = ''

  // Try to extract "Position dans l'organisation" section
  const positionMatch = text.match(/position\s+dans.*?organisation\s*:?\s*(.*?)(?=\n\s*(?:encadrement|missions?|responsabilit|$))/is)
  if (positionMatch && positionMatch[0]) {
    content += positionMatch[0].trim() + '\n\n'
  }

  // Try to extract "Missions principales" or "Mission principale"
  const missionMatch = text.match(/missions?\s+principales?\s*:?\s*(.*?)(?=\n\s*(?:responsabilit|compétence|profil|pourquoi|$))/is)
  if (missionMatch && missionMatch[0]) {
    content += missionMatch[0].trim() + '\n\n'
  }

  // If nothing found, try to get content before "Responsabilités" or "Profil"
  if (!content.trim()) {
    const beforeResponsMatch = text.match(/(.*?)(?=responsabilit|profil\s+recherché)/is)
    if (beforeResponsMatch && beforeResponsMatch[1]) {
      content = beforeResponsMatch[1].trim()
    }
  }

  // Clean up and return
  const cleaned = content.trim()
  return cleaned.length > 20 ? cleaned : 'Non spécifié dans l\'annonce'
}

// Extract responsibilities section from document
function extractResponsabilites(text: string): string {
  // Try to match the entire "Responsabilités" section with its title
  const responsMatch = text.match(/responsabilit(?:é|e)s?\s*(?:principale)?s?\s*:?\s*(.*?)(?=\n\s*(?:compétences?\s+techniques?|profil\s+recherché|pourquoi|$))/is)

  if (responsMatch && responsMatch[0]) {
    const content = responsMatch[0].trim()
    if (content.length > 20) {
      return content
    }
  }

  return 'Non spécifié dans l\'annonce'
}

// Helper function to extract entire profil section
function extractProfilSection(text: string): string {
  // Match entire "Profil recherché" section including the title
  const profilMatch = text.match(/profil\s+recherché\s*:?\s*(.*?)$/is)

  if (profilMatch && profilMatch[0]) {
    return profilMatch[0].trim()
  }

  return ''
}

// Extract "Formation :" sub-section from profil
function extractProfilFormation(text: string): string {
  const profilSection = extractProfilSection(text)
  if (!profilSection) return ''

  // Match "Formation :" section with its title
  const formationMatch = profilSection.match(/formation\s*:?\s*(.*?)(?=\n\s*(?:expérience|compétences?\s+techniques?|compétences?\s+comportementales?|$))/is)
  if (formationMatch && formationMatch[0]) {
    const content = formationMatch[0].trim()
    if (content.length > 5) {
      return content
    }
  }

  return ''
}

// Extract "Expérience :" sub-section from profil
function extractProfilExperience(text: string): string {
  const profilSection = extractProfilSection(text)
  if (!profilSection) return ''

  // Match "Expérience :" section with its title
  const experienceMatch = profilSection.match(/expérience\s*:?\s*(.*?)(?=\n\s*(?:compétences?\s+techniques?|compétences?\s+comportementales?|$))/is)
  if (experienceMatch && experienceMatch[0]) {
    const content = experienceMatch[0].trim()
    if (content.length > 5) {
      return content
    }
  }

  return ''
}

// Extract "Compétences techniques :" sub-section from profil
function extractProfilCompetencesTech(text: string): string {
  const profilSection = extractProfilSection(text)
  if (!profilSection) return ''

  // Match "Compétences techniques :" section with its title
  const techMatch = profilSection.match(/compétences?\s+techniques?\s*(?:requises?)?\s*:?\s*(.*?)(?=\n\s*(?:compétences?\s+comportementales?|$))/is)
  if (techMatch && techMatch[0]) {
    const content = techMatch[0].trim()
    if (content.length > 5) {
      return content
    }
  }

  return ''
}

// Extract "Compétences comportementales :" sub-section from profil
function extractProfilCompetencesComp(text: string): string {
  const profilSection = extractProfilSection(text)
  if (!profilSection) return ''

  // Match "Compétences comportementales :" section with its title
  const compMatch = profilSection.match(/compétences?\s+comportementales?\s*:?\s*(.*?)$/is)
  if (compMatch && compMatch[0]) {
    const content = compMatch[0].trim()
    if (content.length > 5) {
      return content
    }
  }

  return ''
}

// Extract complementary information that doesn't fit in other sections
// This captures info like "Encadrement", "Rattachement hiérarchique", etc.
function extractProfilInfosComplementaires(text: string): string {
  let infos = ''

  // Look for "Encadrement :" in the beginning of the document
  const encadrementMatch = text.match(/encadrement\s*:?\s*(.*?)(?=\n\s*(?:missions?|responsabilit|$))/is)
  if (encadrementMatch && encadrementMatch[0]) {
    infos += encadrementMatch[0].trim() + '\n\n'
  }

  // Look for any other standalone sections not captured
  // This is for information between "Profil recherché" and the sub-sections
  const profilSection = extractProfilSection(text)
  if (profilSection) {
    // Get text before "Formation:" or "Expérience:" or "Compétences"
    const beforeSubsectionsMatch = profilSection.match(/profil\s+recherché\s*:?\s*(.*?)(?=\n\s*(?:formation|expérience|compétences?)|$)/is)
    if (beforeSubsectionsMatch && beforeSubsectionsMatch[1]) {
      const content = beforeSubsectionsMatch[1].trim()
      // Only add if it's substantial and not just the title
      if (content.length > 20 && !content.match(/^profil\s+recherché/i)) {
        infos += content + '\n\n'
      }
    }
  }

  return infos.trim()
}

// Extract skills from text (enhanced with more keywords)
function extractSkills(text: string): string {
  const skillKeywords = [
    // Cloud & Infrastructure
    'Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP', 'Cloud', 'DevOps', 'SRE',
    'Terraform', 'Ansible', 'Puppet', 'Chef', 'CloudFormation', 'Pulumi',
    'OpenStack', 'VMware', 'Hyper-V', 'VirtualBox',

    // CI/CD & Version Control
    'CI/CD', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI',
    'ArgoCD', 'Tekton', 'Spinnaker', 'Bamboo', 'TeamCity',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',

    // Containers & Orchestration
    'Helm', 'Kustomize', 'Istio', 'Linkerd', 'Consul', 'Nomad',
    'Docker Swarm', 'Rancher', 'OpenShift', 'EKS', 'AKS', 'GKE',

    // Monitoring & Observability
    'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Dynatrace',
    'ELK', 'Elasticsearch', 'Logstash', 'Kibana', 'Splunk',
    'Loki', 'Jaeger', 'Zipkin', 'OpenTelemetry',

    // Programming Languages
    'Python', 'Java', 'JavaScript', 'TypeScript', 'Go', 'Golang',
    'C++', 'C#', '.NET', 'Ruby', 'PHP', 'Rust', 'Scala', 'Kotlin',
    'Swift', 'Objective-C', 'Perl', 'Shell', 'Bash', 'PowerShell',

    // Web & Frontend
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
    'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind', 'Bootstrap',
    'jQuery', 'Redux', 'MobX', 'Webpack', 'Vite', 'Babel',

    // Backend & Frameworks
    'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI',
    'Spring', 'Spring Boot', 'Hibernate', 'Laravel', 'Symfony',
    'Rails', 'ASP.NET', 'Gin', 'Echo', 'Fiber',

    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'MariaDB', 'Oracle',
    'SQL Server', 'SQLite', 'Redis', 'Memcached', 'Cassandra',
    'DynamoDB', 'CouchDB', 'Neo4j', 'InfluxDB', 'TimescaleDB',

    // Message Queues & Streaming
    'Kafka', 'RabbitMQ', 'ActiveMQ', 'Redis Pub/Sub', 'NATS',
    'Pulsar', 'AWS SQS', 'AWS SNS', 'Azure Service Bus',

    // Security
    'OAuth', 'JWT', 'SAML', 'LDAP', 'SSL/TLS', 'PKI',
    'WAF', 'IDS', 'IPS', 'SIEM', 'Vault', 'KeyCloak',
    'Falco', 'Trivy', 'Aqua', 'Snyk', 'SonarQube',

    // OS & Systems
    'Linux', 'Ubuntu', 'Debian', 'CentOS', 'RHEL', 'Alpine',
    'Windows Server', 'macOS', 'Unix', 'FreeBSD',

    // Networking
    'TCP/IP', 'HTTP/HTTPS', 'DNS', 'Load Balancing', 'Nginx',
    'Apache', 'HAProxy', 'Traefik', 'Envoy', 'VPN', 'VLAN',
    'BGP', 'OSPF', 'MPLS', 'SD-WAN',

    // Methodologies & Practices
    'Agile', 'Scrum', 'Kanban', 'Lean', 'DevOps', 'GitOps',
    'TDD', 'BDD', 'DDD', 'Microservices', 'Serverless',
    'REST', 'GraphQL', 'gRPC', 'SOAP', 'API',

    // ERP & Business Tools
    'CEGID', 'SAP', 'Oracle ERP', 'Microsoft Dynamics', 'Salesforce',
    'Workday', 'PeopleSoft', 'NetSuite', 'Odoo', 'Sage',

    // Data & Analytics
    'Big Data', 'Hadoop', 'Spark', 'Flink', 'Storm',
    'Tableau', 'Power BI', 'Looker', 'Metabase', 'Superset',
    'Airflow', 'Luigi', 'Prefect', 'dbt',

    // Machine Learning & AI
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'Scikit-learn', 'Keras', 'NLP', 'Computer Vision', 'MLOps',

    // Testing
    'Jest', 'Mocha', 'Chai', 'Pytest', 'JUnit', 'TestNG',
    'Selenium', 'Cypress', 'Playwright', 'Postman', 'JMeter',

    // Project Management & Business
    'JIRA', 'Confluence', 'Trello', 'Asana', 'Monday.com',
    'Business Intelligence', 'Management', 'Leadership', 'Coaching',
    'Commercial', 'Sales', 'Marketing', 'Product Management',

    // Security & Compliance
    'RBAC', 'GDPR', 'ISO 27001', 'SOC 2', 'HIPAA', 'PCI-DSS',
    'Penetration Testing', 'Vulnerability Assessment', 'OWASP'
  ]

  const foundSkills: string[] = []
  const lowerText = text.toLowerCase()

  // Use Set to avoid duplicates
  const skillSet = new Set<string>()

  for (const skill of skillKeywords) {
    if (lowerText.includes(skill.toLowerCase())) {
      skillSet.add(skill)
    }
  }

  return Array.from(skillSet).join(', ')
}

// Determine contract type from text
function detectContractType(text: string): string {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('cdi')) return 'CDI'
  if (lowerText.includes('cdd')) return 'CDD'
  if (lowerText.includes('freelance') || lowerText.includes('indépendant')) return 'Freelance'
  if (lowerText.includes('stage')) return 'Stage'
  if (lowerText.includes('alternance')) return 'Alternance'

  // Default to CDI if not specified
  return 'CDI'
}

// Determine category from title and text (improved with scoring)
function detectCategory(titre: string, text: string): string {
  const combined = (titre + ' ' + text).toLowerCase()

  // Category keywords with weights
  const categories = {
    'Développement': [
      'développeur', 'developer', 'dev', 'devops', 'sre', 'ingénieur',
      'kubernetes', 'docker', 'cloud', 'frontend', 'backend', 'fullstack',
      'full stack', 'react', 'node', 'java', 'python', 'javascript',
      'typescript', 'programmeur', 'coding', 'software engineer'
    ],
    'Management': [
      'manager', 'directeur', 'responsable', 'chef', 'lead', 'head of',
      'cto', 'cio', 'vp', 'product manager', 'project manager', 'scrum master',
      'business', 'commercial', 'sales', 'account manager', 'team lead'
    ],
    'Data': [
      'data', 'analyst', 'analytics', 'data scientist', 'data engineer',
      'bi', 'business intelligence', 'tableau', 'power bi', 'sql',
      'big data', 'hadoop', 'spark', 'ml', 'machine learning', 'ai'
    ],
    'Design': [
      'design', 'designer', 'ux', 'ui', 'graphique', 'illustrateur',
      'créatif', 'webdesign', 'product design', 'user experience',
      'interface', 'figma', 'sketch', 'adobe'
    ],
    'Infrastructure': [
      'infrastructure', 'system', 'réseau', 'network', 'sécurité',
      'security', 'admin', 'administrateur', 'ops', 'it ops', 'support'
    ],
    'Marketing': [
      'marketing', 'communication', 'digital marketing', 'seo', 'sem',
      'content', 'social media', 'brand', 'growth', 'acquisition'
    ],
    'RH': [
      'rh', 'ressources humaines', 'hr', 'recruteur', 'recruiter',
      'talent', 'recruitment', 'people', 'chargé de recrutement'
    ],
    'Finance': [
      'finance', 'comptable', 'comptabilité', 'accounting', 'controller',
      'audit', 'trésorier', 'financial', 'cfo'
    ],
    'Consulting': [
      'consultant', 'conseil', 'consulting', 'advisory', 'accompagnateur',
      'expert', 'specialist', 'architect', 'architecte'
    ],
    'Production': [
      'production', 'manufacturing', 'supply chain', 'logistique',
      'logistics', 'opérations', 'operations', 'industriel'
    ]
  }

  // Calculate scores for each category
  const scores: { [key: string]: number } = {}

  for (const [category, keywords] of Object.entries(categories)) {
    scores[category] = 0
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        // Give more weight to title matches
        if (titre.toLowerCase().includes(keyword)) {
          scores[category] += 3
        } else {
          scores[category] += 1
        }
      }
    }
  }

  // Find category with highest score
  let maxScore = 0
  let bestCategory = 'Technologie' // Default

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestCategory = category
    }
  }

  return bestCategory
}

// Read and parse all job documents
async function parseJobDocuments(docsDir: string): Promise<any[]> {
  const files = fs.readdirSync(docsDir)
  const docxFiles = files.filter(f => f.endsWith('.docx'))

  console.log(`\n📁 Found ${docxFiles.length} Word documents in ${docsDir}`)

  const jobs: any[] = []

  for (const filename of docxFiles) {
    try {
      console.log(`\n📖 Processing: ${filename}`)

      const filePath = path.join(docsDir, filename)
      const buffer = fs.readFileSync(filePath)

      // Extract text from Word document
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value || ''

      // Parse filename for title and location
      const { titre, lieu } = parseJobFilename(filename)

      // Extract structured sections from document
      const descriptionMission = extractDescriptionMission(text)
      const responsabilites = extractResponsabilites(text)
      const profilFormation = extractProfilFormation(text)
      const profilExperience = extractProfilExperience(text)
      const profilCompetencesTech = extractProfilCompetencesTech(text)
      const profilCompetencesComp = extractProfilCompetencesComp(text)
      const profilInfosComplementaires = extractProfilInfosComplementaires(text)

      // Extract other metadata
      const typeContrat = detectContractType(text)
      const categorie = detectCategory(titre, text)
      const salaire = extractSalary(text)
      const entreprise = getCompanyName() // Always Hi-ring by default

      // Create job object with new structure (3 tabs)
      const job = {
        titre,
        entreprise,
        lieu,
        typeContrat,
        salaire,
        descriptionMission,            // Tab 1: Description + Mission
        responsabilites,               // Tab 2: Responsabilités
        profilFormation,               // Tab 3: Profil - Formation
        profilExperience,              // Tab 3: Profil - Expérience
        profilCompetencesTech,         // Tab 3: Profil - Compétences techniques
        profilCompetencesComp,         // Tab 3: Profil - Compétences comportementales
        profilInfosComplementaires,    // Tab 3: Profil - Infos complémentaires
        emailContact: process.env.DEFAULT_CONTACT_EMAIL || 'contact@example.com',
        categorie,
        statut: 'active',
        datePublication: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      jobs.push(job)

      console.log(`✅ Parsed: ${titre}`)
      console.log(`   Company: ${entreprise}`)
      console.log(`   Location: ${lieu}`)
      console.log(`   Category: ${categorie}`)
      console.log(`   Contract: ${typeContrat}`)
      console.log(`   Salary: ${salaire || 'Non spécifié'}`)
      console.log(`   Description+Mission: ${descriptionMission.substring(0, 50)}...`)
      console.log(`   Responsabilités: ${responsabilites.substring(0, 50)}...`)
      console.log(`   Profil Formation: ${profilFormation.substring(0, 50)}...`)
      console.log(`   Profil Expérience: ${profilExperience.substring(0, 50)}...`)
      console.log(`   Profil Compétences Tech: ${profilCompetencesTech.substring(0, 50)}...`)
      console.log(`   Profil Compétences Comp: ${profilCompetencesComp.substring(0, 50)}...`)
      console.log(`   Profil Infos Complémentaires: ${profilInfosComplementaires.substring(0, 50)}...`)

    } catch (error) {
      console.error(`❌ Error parsing ${filename}:`, error)
    }
  }

  return jobs
}

// Test data patterns to identify and remove
const testPatterns = [
  /^test/i,
  /^qwerty/i,
  /^asdf/i,
  /lorem ipsum/i,
  /^qqq/i,
  /^aaa/i,
  /^xxx/i,
  /^dqwdqd/i,
  /^wqdqwqwd/i,
  /^sssda/i
]

// Main function
async function main() {
  console.log('🚀 Starting job import from Word documents...\n')

  let client: MongoClient | null = null

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...')
    const connection = await connectToDatabase()
    client = connection.client
    const db = connection.db
    console.log('✅ Connected to MongoDB\n')

    const offresCollection = db.collection('offres')

    // Step 1: Parse Word documents
    console.log('📋 STEP 1: Parsing Word documents')
    console.log('=' .repeat(60))
    const docsDir = path.join(__dirname, '../docs/annonces')
    const newJobs = await parseJobDocuments(docsDir)

    if (newJobs.length === 0) {
      console.log('\n⚠️  No jobs found to import')
      return
    }

    console.log(`\n✅ Successfully parsed ${newJobs.length} job offers\n`)

    // Step 2: Remove test job offers
    console.log('🗑️  STEP 2: Removing test job offers')
    console.log('='.repeat(60))

    const testQuery = {
      $or: testPatterns.map(pattern => ({
        $or: [
          { titre: pattern },
          { description: pattern }
        ]
      }))
    }

    const deleteResult = await offresCollection.deleteMany(testQuery)
    console.log(`✅ Removed ${deleteResult.deletedCount} test job offers\n`)

    // Step 3: Insert new job offers
    console.log('➕ STEP 3: Inserting new job offers')
    console.log('='.repeat(60))

    const insertResult = await offresCollection.insertMany(newJobs)
    console.log(`✅ Inserted ${insertResult.insertedCount} new job offers\n`)

    // Step 4: Display summary
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`Test jobs removed: ${deleteResult.deletedCount}`)
    console.log(`New jobs added: ${insertResult.insertedCount}`)
    console.log('\n📝 New job offers:')
    newJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.titre} - ${job.lieu}`)
    })

    console.log('\n✅ Job import completed successfully!')
    console.log('\n💡 You can now view the jobs at: http://localhost:3000/offres-emploi')

  } catch (error) {
    console.error('❌ Error during job import:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
      console.log('\n📡 Database connection closed')
    }
  }
}

// Run the script
main().catch(console.error)
