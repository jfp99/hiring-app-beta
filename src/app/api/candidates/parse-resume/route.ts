// src/app/api/candidates/parse-resume/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'

interface ParsedResumeData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  primarySkills: string[]
  secondarySkills: string[]
  workExperience: Array<{
    company: string
    position: string
    startDate?: string
    endDate?: string
    description?: string
  }>
  education: Array<{
    institution: string
    degree: string
    field?: string
    graduationYear?: string
  }>
  summary?: string
  linkedIn?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Check file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    let text = ''

    // Parse PDF
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const pdfParseModule = await import('pdf-parse') as any
      const pdfParse = pdfParseModule.default || pdfParseModule
      const buffer = Buffer.from(await file.arrayBuffer())
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
    }
    // Parse DOCX
    else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      const mammoth = await import('mammoth')
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }
    // Parse TXT and MD (Markdown)
    else if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      text = await file.text()
    }
    // Parse RTF (basic extraction)
    else if (fileType === 'application/rtf' || fileName.endsWith('.rtf')) {
      const buffer = Buffer.from(await file.arrayBuffer())
      text = buffer.toString('utf-8')
        .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
        .replace(/[{}]/g, '') // Remove braces
        .trim()
    }
    // Parse ODT (OpenDocument)
    else if (fileType === 'application/vnd.oasis.opendocument.text' || fileName.endsWith('.odt')) {
      const mammoth = await import('mammoth')
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }
    // Handle image formats (WEBP, JPG, PNG, etc.)
    else if (
      fileType.startsWith('image/') ||
      fileName.match(/\.(webp|jpg|jpeg|png|gif|bmp)$/i)
    ) {
      // For image-based resumes, we would need OCR (Tesseract.js)
      // For now, return a helpful message with basic file info
      return NextResponse.json({
        success: true,
        data: {
          primarySkills: [],
          secondarySkills: [],
          workExperience: [],
          education: [],
          summary: 'CV au format image détecté. L\'analyse automatique des images nécessite un traitement OCR. Veuillez remplir les informations manuellement.'
        },
        message: 'Image détectée - Remplissage manuel requis',
        requiresOCR: true
      })
    } else {
      return NextResponse.json(
        { error: 'Format de fichier non supporté. Utilisez PDF, DOCX, TXT, MD, RTF, ODT ou images (WEBP, JPG, PNG).' },
        { status: 400 }
      )
    }

    // Parse the extracted text
    const parsedData = parseResumeText(text)

    return NextResponse.json({
      success: true,
      data: parsedData,
      rawText: text.substring(0, 1000) // Return first 1000 chars for debugging
    })
  } catch (error: unknown) {
    console.error('Error parsing resume:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du CV: ' + (error instanceof Error ? error.message : 'Erreur inconnue') },
      { status: 500 }
    )
  }
}

function parseResumeText(text: string): ParsedResumeData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  const result: ParsedResumeData = {
    primarySkills: [],
    secondarySkills: [],
    workExperience: [],
    education: []
  }

  // Extract email
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g
  const emailMatches = text.match(emailRegex)
  if (emailMatches && emailMatches.length > 0) {
    result.email = emailMatches[0]
  }

  // Extract phone (French formats)
  const phoneRegex = /(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}/g
  const phoneMatches = text.match(phoneRegex)
  if (phoneMatches && phoneMatches.length > 0) {
    result.phone = phoneMatches[0].replace(/[\s.-]/g, '')
  }

  // Extract LinkedIn
  const linkedInRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi
  const linkedInMatches = text.match(linkedInRegex)
  if (linkedInMatches && linkedInMatches.length > 0) {
    result.linkedIn = linkedInMatches[0]
  }

  // Extract name (usually at the top, before email)
  // Look for lines with 2-3 words that look like names
  const nameRegex = /^([A-ZÉÈÊÀÂ][a-zéèêàâôûù]+(?:\s+[A-ZÉÈÊÀÂ][a-zéèêàâôûù]+){1,2})$/
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const match = lines[i].match(nameRegex)
    if (match) {
      const nameParts = match[1].split(/\s+/)
      if (nameParts.length >= 2) {
        result.firstName = nameParts[0]
        result.lastName = nameParts.slice(1).join(' ')
        break
      }
    }
  }

  // Extract skills
  const skillKeywords = [
    'compétences', 'skills', 'technologies', 'langages', 'outils',
    'expertise', 'technical skills', 'soft skills'
  ]

  const commonSkills = [
    // Programming languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust',
    'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash',
    // Web technologies
    'HTML', 'CSS', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'Nuxt.js',
    'jQuery', 'Bootstrap', 'Tailwind', 'Sass', 'LESS', 'Webpack', 'Vite',
    // Databases
    'MongoDB', 'MySQL', 'PostgreSQL', 'Oracle', 'SQL Server', 'Redis', 'Elasticsearch',
    'DynamoDB', 'Firebase', 'Cassandra', 'Neo4j',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
    'Terraform', 'Ansible', 'CircleCI', 'Travis CI',
    // Tools & Frameworks
    'Git', 'Linux', 'Agile', 'Scrum', 'Jira', 'Confluence', 'Slack', 'REST API', 'GraphQL',
    'Microservices', 'TDD', 'CI/CD', 'DevOps',
    // Data & AI
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas',
    'NumPy', 'Data Analysis', 'Big Data', 'Apache Spark', 'Hadoop',
    // Mobile
    'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin',
    // Other
    'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'Adobe XD', 'InVision',
    'UX Design', 'UI Design', 'Product Management', 'Project Management'
  ]

  // Find skills in text
  const textLower = text.toLowerCase()
  for (const skill of commonSkills) {
    const skillLower = skill.toLowerCase()
    // Escape special regex characters
    const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i')
    if (regex.test(textLower)) {
      result.primarySkills.push(skill)
    }
  }

  // Extract work experience
  const experienceKeywords = [
    'expérience professionnelle', 'experience', 'expérience', 'parcours professionnel',
    'work experience', 'employment history', 'career history'
  ]

  let inExperienceSection = false
  let inEducationSection = false
  let currentExperience: any = null
  let currentEducation: any = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase()

    // Detect section headers
    if (experienceKeywords.some(kw => lineLower.includes(kw))) {
      inExperienceSection = true
      inEducationSection = false
      continue
    }

    if (lineLower.includes('formation') || lineLower.includes('education') ||
        lineLower.includes('études') || lineLower.includes('diplôme')) {
      inEducationSection = true
      inExperienceSection = false
      continue
    }

    // Parse experience entries
    if (inExperienceSection) {
      // Date patterns: "2020-2023", "Jan 2020 - Present", "2020 - Présent"
      const datePattern = /(\d{4})\s*[-–]\s*(\d{4}|présent|present|aujourd'hui|actuel)/i
      const dateMatch = line.match(datePattern)

      if (dateMatch) {
        // Save previous experience
        if (currentExperience && currentExperience.position) {
          result.workExperience.push(currentExperience)
        }

        // Start new experience
        currentExperience = {
          company: '',
          position: '',
          startDate: dateMatch[1],
          endDate: dateMatch[2].toLowerCase().includes('present') ||
                   dateMatch[2].toLowerCase().includes('présent') ||
                   dateMatch[2].toLowerCase().includes('actuel') ?
                   'Présent' : dateMatch[2]
        }
      } else if (currentExperience && !currentExperience.position && line.length > 5) {
        // This might be the position
        currentExperience.position = line
      } else if (currentExperience && !currentExperience.company && line.length > 3) {
        // This might be the company
        currentExperience.company = line
      } else if (currentExperience && line.length > 10) {
        // Add to description
        if (!currentExperience.description) {
          currentExperience.description = line
        }
      }
    }

    // Parse education entries
    if (inEducationSection) {
      const yearPattern = /(\d{4})/
      const yearMatch = line.match(yearPattern)

      if (yearMatch) {
        // Save previous education
        if (currentEducation && currentEducation.degree) {
          result.education.push(currentEducation)
        }

        // Start new education
        currentEducation = {
          institution: '',
          degree: '',
          graduationYear: yearMatch[1]
        }
      } else if (currentEducation && !currentEducation.degree && line.length > 5) {
        // This might be the degree
        currentEducation.degree = line
      } else if (currentEducation && !currentEducation.institution && line.length > 3) {
        // This might be the institution
        currentEducation.institution = line
      }
    }
  }

  // Save last entries
  if (currentExperience && currentExperience.position) {
    result.workExperience.push(currentExperience)
  }
  if (currentEducation && currentEducation.degree) {
    result.education.push(currentEducation)
  }

  // Extract summary (usually first paragraph after name)
  const summaryKeywords = ['profil', 'summary', 'résumé', 'about', 'à propos']
  const summaryLines: string[] = []
  let inSummary = false

  for (const line of lines) {
    if (summaryKeywords.some(kw => line.toLowerCase().includes(kw))) {
      inSummary = true
      continue
    }
    if (inSummary) {
      if (line.length > 50) {
        summaryLines.push(line)
      }
      if (summaryLines.length >= 3) break
    }
  }

  if (summaryLines.length > 0) {
    result.summary = summaryLines.join(' ')
  }

  return result
}
