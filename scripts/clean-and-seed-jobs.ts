// scripts/clean-and-seed-jobs.ts
/**
 * Script to clean test data and seed professional job listings
 * Run with: npx tsx scripts/clean-and-seed-jobs.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { MongoClient, Db } from 'mongodb'

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

// Test data patterns to identify and remove
const testPatterns = [
  /^dqwdqd/i,
  /^wqdqwqwd/i,
  /^sssda/i,
  /^test/i,
  /^qwerty/i,
  /^asdf/i,
  /lorem ipsum/i,
  /^qqq/i,
  /^aaa/i,
  /^xxx/i
]

// Professional job listings to add
const professionalJobs = [
  {
    titre: 'Développeur Full Stack Senior',
    entreprise: 'TechCorp France',
    lieu: 'Paris, France (Hybride)',
    typeContrat: 'CDI',
    salaire: '55k - 70k €/an',
    description: `Nous recherchons un Développeur Full Stack Senior passionné pour rejoindre notre équipe de développement produit.

**Missions principales:**
- Concevoir et développer des fonctionnalités web performantes
- Participer à l'architecture technique de nos applications
- Collaborer avec les équipes produit et design
- Mentorer les développeurs juniors
- Assurer la qualité du code via code reviews

**Environnement technique:**
- Frontend: React, Next.js, TypeScript, Tailwind CSS
- Backend: Node.js, Express, GraphQL
- Base de données: MongoDB, PostgreSQL
- DevOps: Docker, Kubernetes, CI/CD (GitHub Actions)
- Cloud: AWS / Azure

**Ce que nous offrons:**
- Salaire compétitif et participation
- Télétravail flexible (2-3 jours/semaine)
- Budget formation (5000€/an)
- Matériel de qualité (MacBook Pro, écrans)
- Mutuelle premium prise en charge à 100%
- RTT et congés (30 jours/an)
- Ambiance startup en croissance`,
    competences: 'React, Next.js, TypeScript, Node.js, MongoDB, PostgreSQL, Docker, AWS, Agile',
    emailContact: 'recrutement@techcorp.fr',
    categorie: 'Développement',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Product Manager - SaaS B2B',
    entreprise: 'SaaSify',
    lieu: 'Lyon, France',
    typeContrat: 'CDI',
    salaire: '50k - 65k €/an',
    description: `SaaSify recherche un Product Manager expérimenté pour piloter l'évolution de notre plateforme SaaS destinée aux PME.

**Responsabilités:**
- Définir la roadmap produit en collaboration avec les stakeholders
- Recueillir et analyser les besoins utilisateurs
- Rédiger les spécifications fonctionnelles détaillées
- Prioriser le backlog avec l'équipe de développement
- Suivre les KPIs et l'adoption des nouvelles fonctionnalités
- Coordonner les tests utilisateurs et le déploiement

**Profil recherché:**
- 3-5 ans d'expérience en Product Management
- Expérience sur des produits SaaS B2B
- Excellente compréhension des méthodologies Agile/Scrum
- Capacité à traduire les besoins business en user stories
- Forte orientation données et analytics
- Excellentes compétences en communication

**Avantages:**
- Équipe produit de 15 personnes passionnées
- Autonomie et responsabilités
- Formation continue
- Événements d'équipe réguliers`,
    competences: 'Product Management, SaaS, Agile, Scrum, Analytics, UX/UI, Roadmap, Stakeholder Management',
    emailContact: 'jobs@saasify.io',
    categorie: 'Product',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'UX/UI Designer Senior',
    entreprise: 'DesignStudio',
    lieu: 'Remote (France)',
    typeContrat: 'CDI',
    salaire: '45k - 60k €/an',
    description: `DesignStudio cherche un UX/UI Designer Senior pour concevoir des expériences utilisateur exceptionnelles pour nos clients.

**Missions:**
- Conduire des recherches utilisateurs (interviews, tests, surveys)
- Créer des personas, user flows et customer journeys
- Designer des wireframes, maquettes et prototypes interactifs
- Développer et maintenir le design system
- Collaborer étroitement avec les équipes produit et dev
- Présenter et défendre vos choix de design

**Compétences requises:**
- 4+ ans d'expérience en UX/UI design
- Maîtrise de Figma (obligatoire)
- Connaissance d'Adobe Creative Suite
- Expérience en design system et atomic design
- Portfolio démontrant votre processus de design
- Sensibilité aux principes d'accessibilité (WCAG)

**Environnement:**
- Full remote avec équipe distribuée
- Outils modernes (Figma, Notion, Slack)
- Budget matériel (2000€)
- 100% télétravail`,
    competences: 'UX Design, UI Design, Figma, Adobe XD, Design System, Prototypage, User Research, Accessibilité',
    emailContact: 'careers@designstudio.fr',
    categorie: 'Design',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Data Engineer',
    entreprise: 'DataFlow Analytics',
    lieu: 'Toulouse, France',
    typeContrat: 'CDI',
    salaire: '50k - 68k €/an',
    description: `DataFlow Analytics recherche un Data Engineer pour construire et maintenir notre infrastructure de données.

**Vos missions:**
- Concevoir et développer des pipelines de données scalables
- Optimiser les performances des bases de données
- Implémenter des solutions ETL/ELT robustes
- Assurer la qualité et la gouvernance des données
- Collaborer avec les Data Scientists et Analysts
- Mettre en place des solutions de monitoring

**Stack technique:**
- Python, SQL, Spark
- Airflow pour l'orchestration
- PostgreSQL, MongoDB, Redis
- Cloud: GCP (BigQuery, Dataflow)
- Docker, Kubernetes
- Git, CI/CD

**Profil:**
- 3+ ans en Data Engineering
- Excellente maîtrise de Python et SQL
- Expérience avec des volumes de données importants
- Connaissance des architectures de données modernes
- Esprit d'équipe et pédagogie

**Avantages:**
- Projets techniques challengeants
- Stack technologique moderne
- Formation continue
- Télétravail partiel`,
    competences: 'Python, SQL, Spark, Airflow, ETL, BigQuery, Data Pipeline, PostgreSQL, MongoDB, GCP',
    emailContact: 'talent@dataflow.fr',
    categorie: 'Data',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'DevOps Engineer',
    entreprise: 'CloudOps Solutions',
    lieu: 'Nantes, France (Hybride)',
    typeContrat: 'CDI',
    salaire: '48k - 65k €/an',
    description: `CloudOps Solutions recherche un DevOps Engineer pour accompagner nos clients dans leur transformation cloud.

**Responsabilités:**
- Automatiser les déploiements (CI/CD)
- Gérer l'infrastructure as code (Terraform, Ansible)
- Administrer les environnements cloud (AWS, Azure)
- Implémenter le monitoring et l'observabilité
- Optimiser les coûts cloud
- Assurer la sécurité des infrastructures
- Former les équipes aux pratiques DevOps

**Compétences techniques:**
- Maîtrise de Kubernetes et Docker
- Expérience avec AWS et/ou Azure
- Infrastructure as Code (Terraform, Ansible)
- CI/CD (Jenkins, GitLab CI, GitHub Actions)
- Scripting (Bash, Python)
- Monitoring (Prometheus, Grafana, ELK)

**Ce que nous proposons:**
- Clients variés et projets stimulants
- Certifications prises en charge (AWS, Azure, Kubernetes)
- Télétravail flexible (3 jours/semaine)
- Prime de participation
- Comité d'entreprise`,
    competences: 'DevOps, Kubernetes, Docker, AWS, Azure, Terraform, CI/CD, Ansible, Monitoring, Python',
    emailContact: 'recrutement@cloudops.fr',
    categorie: 'DevOps',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Développeur Mobile React Native',
    entreprise: 'MobileFirst',
    lieu: 'Bordeaux, France',
    typeContrat: 'CDI',
    salaire: '42k - 55k €/an',
    description: `MobileFirst développe des applications mobiles innovantes pour des clients prestigieux. Nous cherchons un développeur React Native passionné.

**Missions principales:**
- Développer des applications mobiles cross-platform
- Assurer la qualité et les performances des apps
- Intégrer des APIs REST et GraphQL
- Collaborer avec les équipes design et backend
- Participer aux choix techniques
- Maintenir et faire évoluer les apps existantes

**Stack:**
- React Native, TypeScript, Redux
- Navigation (React Navigation)
- APIs: REST, GraphQL (Apollo)
- Tests: Jest, Detox
- CI/CD: Fastlane, App Center
- Notifications push, deep linking

**Profil recherché:**
- 2-4 ans d'expérience en développement mobile
- Solide expérience React Native
- Maîtrise de TypeScript
- Expérience de publication sur stores (iOS/Android)
- Connaissance des best practices mobile
- Portfolio d'applications publiées

**Avantages:**
- Projets variés et innovants
- Équipe technique de haut niveau
- Formation et veille technologique
- Télétravail ponctuel`,
    competences: 'React Native, TypeScript, Redux, GraphQL, REST API, iOS, Android, Jest, Git, Agile',
    emailContact: 'jobs@mobilefirst.io',
    categorie: 'Développement Mobile',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Business Analyst',
    entreprise: 'ConsultCorp',
    lieu: 'Paris La Défense, France',
    typeContrat: 'CDI',
    salaire: '40k - 52k €/an',
    description: `ConsultCorp, cabinet de conseil en transformation digitale, recherche un Business Analyst pour accompagner ses clients grands comptes.

**Vos missions:**
- Recueillir et analyser les besoins métiers
- Rédiger les cahiers des charges fonctionnels
- Modéliser les processus métiers (BPMN)
- Animer des ateliers avec les parties prenantes
- Assurer le lien entre métier et équipes IT
- Suivre la réalisation et les tests
- Former les utilisateurs finaux

**Profil:**
- Formation Bac+5 en école de commerce ou d'ingénieur
- 2-3 ans d'expérience en analyse métier
- Excellentes capacités d'analyse et de synthèse
- Maîtrise des outils de modélisation (UML, BPMN)
- Connaissance des méthodologies Agile
- Excellente communication écrite et orale
- Anglais professionnel

**Nous offrons:**
- Missions chez des clients prestigieux
- Plan de formation personnalisé
- Évolution rapide vers des postes de consultant senior
- Véhicule de fonction ou remboursement transport
- Primes sur objectifs`,
    competences: 'Business Analysis, BPMN, UML, Agile, Cahier des charges, Analyse métier, Process, Stakeholder',
    emailContact: 'rh@consultcorp.fr',
    categorie: 'Consulting',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Chef de Projet Digital',
    entreprise: 'Digital Agency',
    lieu: 'Lille, France',
    typeContrat: 'CDI',
    salaire: '38k - 50k €/an',
    description: `Digital Agency, agence web en pleine croissance, recherche un Chef de Projet Digital pour piloter nos projets web et mobile.

**Responsabilités:**
- Gérer les projets de A à Z (planning, budget, qualité)
- Être l'interlocuteur principal des clients
- Coordonner les équipes techniques, design et marketing
- Rédiger les spécifications fonctionnelles
- Suivre l'avancement avec méthodologie Agile
- Assurer la recette et le déploiement
- Garantir la satisfaction client

**Profil recherché:**
- 3-5 ans en gestion de projets digitaux
- Expérience en agence web ou ESN
- Maîtrise des méthodologies Agile/Scrum
- Connaissance du développement web
- Excellentes capacités organisationnelles
- Sens du service client développé
- Certification PMP ou PRINCE2 (un plus)

**Environnement:**
- Équipe jeune et dynamique (25 personnes)
- Clients variés (startup, PME, grands groupes)
- Projets innovants et challengeants
- Ambiance conviviale
- Événements d'équipe réguliers`,
    competences: 'Gestion de projet, Agile, Scrum, Web, Mobile, Client Management, Planning, Budget, Méthodologie',
    emailContact: 'contact@digitalagency.fr',
    categorie: 'Gestion de projet',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'Architecte Cloud AWS',
    entreprise: 'CloudExperts',
    lieu: 'Remote (France)',
    typeContrat: 'CDI',
    salaire: '60k - 80k €/an',
    description: `CloudExperts, partenaire AWS Premier, recherche un Architecte Cloud pour accompagner nos clients dans leur migration et optimisation cloud.

**Missions:**
- Concevoir des architectures cloud scalables et sécurisées
- Accompagner les clients dans leur stratégie cloud
- Réaliser des audits d'architecture existante
- Définir les best practices et standards
- Former les équipes techniques
- Piloter les migrations cloud complexes
- Optimiser les coûts et performances

**Compétences requises:**
- 5+ ans en architecture IT dont 3+ sur AWS
- Certifications AWS (Solutions Architect Professional)
- Expertise en compute (EC2, ECS, Lambda)
- Maîtrise réseau et sécurité AWS
- Infrastructure as Code (Terraform, CloudFormation)
- Expérience en microservices et conteneurs
- Connaissance des frameworks de sécurité (ISO 27001)

**Avantages:**
- Full remote avec possibilité de coworking
- Certifications AWS financées
- Participation conférences (AWS re:Invent)
- Salaire très attractif
- Intéressement et participation
- Matériel haut de gamme`,
    competences: 'AWS, Architecture Cloud, Terraform, Lambda, ECS, Kubernetes, CloudFormation, Sécurité, Network',
    emailContact: 'careers@cloudexperts.fr',
    categorie: 'Architecture',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    titre: 'QA Engineer / Testeur Automatisation',
    entreprise: 'QualityFirst',
    lieu: 'Rennes, France (Hybride)',
    typeContrat: 'CDI',
    salaire: '38k - 50k €/an',
    description: `QualityFirst recherche un QA Engineer pour renforcer notre équipe qualité et développer notre stratégie de tests automatisés.

**Vos missions:**
- Concevoir et développer des tests automatisés
- Mettre en place des frameworks de tests (E2E, API, unitaires)
- Intégrer les tests dans la CI/CD
- Réaliser des tests manuels exploratoires
- Identifier et documenter les bugs
- Participer à l'amélioration des processus qualité
- Former les développeurs aux bonnes pratiques de test

**Stack de test:**
- Playwright / Cypress pour les tests E2E
- Jest / Mocha pour les tests unitaires
- Postman / REST Assured pour les API
- CI/CD: Jenkins, GitHub Actions
- Gestion: Jira, TestRail

**Profil:**
- 2-4 ans en QA / automatisation de tests
- Maîtrise de JavaScript/TypeScript
- Expérience avec Playwright, Cypress ou Selenium
- Connaissance des APIs REST
- Sensibilité à la qualité logicielle
- Esprit analytique et rigueur

**Avantages:**
- Environnement Agile moderne
- Formation continue sur les outils de test
- Télétravail flexible (2 jours/semaine)
- Équipe passionnée par la qualité`,
    competences: 'QA, Test Automation, Playwright, Cypress, Jest, API Testing, CI/CD, JavaScript, TypeScript, Agile',
    emailContact: 'jobs@qualityfirst.fr',
    categorie: 'Qualité',
    statut: 'active',
    datePublication: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

async function cleanTestData(db: Db): Promise<number> {
  console.log('🧹 Starting test data cleanup...')

  const offresCollection = db.collection('offres')

  // Find test jobs
  const testJobs = await offresCollection.find({
    $or: testPatterns.map(pattern => ({ titre: { $regex: pattern } }))
  }).toArray()

  if (testJobs.length === 0) {
    console.log('✅ No test data found to clean')
    return 0
  }

  console.log(`Found ${testJobs.length} test jobs to remove:`)
  testJobs.forEach(job => {
    console.log(`  - "${job.titre}" (${job.entreprise})`)
  })

  // Delete test jobs
  const result = await offresCollection.deleteMany({
    $or: testPatterns.map(pattern => ({ titre: { $regex: pattern } }))
  })

  console.log(`✅ Removed ${result.deletedCount} test jobs`)
  return result.deletedCount
}

async function seedProfessionalJobs(db: Db): Promise<number> {
  console.log('\n🌱 Seeding professional job listings...')

  const offresCollection = db.collection('offres')

  // Check if professional jobs already exist
  const existingJobs = await offresCollection.find({
    titre: { $in: professionalJobs.map(job => job.titre) }
  }).toArray()

  if (existingJobs.length > 0) {
    console.log(`⚠️  ${existingJobs.length} professional jobs already exist. Skipping seed.`)
    return 0
  }

  // Insert professional jobs
  const result = await offresCollection.insertMany(professionalJobs)

  console.log(`✅ Added ${result.insertedCount} professional job listings:`)
  professionalJobs.forEach(job => {
    console.log(`  - ${job.titre} at ${job.entreprise} (${job.lieu})`)
  })

  return result.insertedCount
}

async function main() {
  console.log('🚀 Starting database cleanup and seed process...\n')

  try {
    const { client, db } = await connectToDatabase()

    console.log('✅ Connected to MongoDB')
    console.log(`📊 Database: ${db.databaseName}\n`)

    // Step 1: Clean test data
    const deletedCount = await cleanTestData(db)

    // Step 2: Seed professional jobs
    const seededCount = await seedProfessionalJobs(db)

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Test jobs removed: ${deletedCount}`)
    console.log(`✅ Professional jobs added: ${seededCount}`)
    console.log('='.repeat(50))

    await client.close()
    console.log('\n✅ Database connection closed')
    console.log('🎉 Process completed successfully!')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
main()
