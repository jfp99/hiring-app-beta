// app/api/offres/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { logger } from '@/app/lib/logger'
import mammoth from 'mammoth'

// Section heading patterns (French)
const SECTION_PATTERNS = {
  description: /(?:description|contexte|pr[eé]sentation|le\s+poste|position\s+dans|mission\s+principale)/i,
  responsabilites: /(?:responsabilit[eé]s?|missions?|t[aâ]ches?|activit[eé]s?|vos\s+missions)/i,
  qualifications: /(?:profil|qualifications?|comp[eé]tences?|formation|exp[eé]rience|pr[eé]-?requis|vous\s+[eê]tes|vous\s+avez)/i,
  avantages: /(?:avantages?|pourquoi\s+nous|ce\s+que\s+(?:nous|l'?on)|b[eé]n[eé]fices?|on\s+vous\s+offre|ce\s+qu'?on\s+(?:aime|propose))/i,
  salaire: /(?:salaire|r[eé]mun[eé]ration|package|compensation)/i,
  competences: /(?:comp[eé]tences?\s+techniques?|environnement\s+technique|stack\s+technique|technologies?)/i,
}

// Salary extraction patterns
const SALARY_PATTERNS = [
  /(\d{2,3})\s*k\s*[-–]\s*(\d{2,3})\s*k/i,
  /(\d{2,3})\s*\d{3}\s*[-–]\s*(\d{2,3})\s*\d{3}\s*€/i,
  /de\s+(\d{2,3})\s*k\s+[àa]\s+(\d{2,3})\s*k/i,
  /entre\s+(\d{2,3})\s*\d{3}\s+et\s+(\d{2,3})\s*\d{3}/i,
  /salaire\s*:?\s*(\d{2,3})\s*k/i,
  /(\d{2,3})\s*k(?!\w)/i,
]

// Contract type detection
function detectContractType(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('cdi')) return 'CDI'
  if (lower.includes('cdd')) return 'CDD'
  if (lower.includes('freelance') || lower.includes('indépendant')) return 'Freelance'
  if (lower.includes('stage')) return 'Stage'
  if (lower.includes('alternance')) return 'Alternance'
  return 'CDI'
}

// Extract salary from text
function extractSalary(text: string): string {
  const lower = text.toLowerCase()
  for (const pattern of SALARY_PATTERNS) {
    const match = lower.match(pattern)
    if (match) {
      return match[2] ? `${match[1]}k - ${match[2]}k` : `${match[1]}k`
    }
  }
  return ''
}

// Extract skills from text
function extractSkills(text: string): string {
  const skillKeywords = [
    'Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP', 'DevOps',
    'Terraform', 'Ansible', 'CI/CD', 'Jenkins', 'GitLab CI', 'GitHub Actions',
    'Git', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Go', 'Rust',
    'C++', 'C#', '.NET', 'Ruby', 'PHP', 'Scala', 'Kotlin',
    'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte',
    'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI',
    'Spring Boot', 'Laravel', 'Rails',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'Kafka', 'RabbitMQ', 'GraphQL', 'REST', 'gRPC',
    'Linux', 'Nginx', 'Prometheus', 'Grafana', 'Datadog',
    'Agile', 'Scrum', 'Kanban', 'Microservices',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'Tableau', 'Power BI', 'SQL', 'Big Data', 'Hadoop', 'Spark',
    'SAP', 'Salesforce', 'JIRA',
    'HTML', 'CSS', 'Tailwind', 'SASS',
    'Jest', 'Cypress', 'Selenium', 'Playwright',
  ]

  const lower = text.toLowerCase()
  const found = new Set<string>()
  for (const skill of skillKeywords) {
    if (lower.includes(skill.toLowerCase())) {
      found.add(skill)
    }
  }
  return Array.from(found).join(', ')
}

// Split text into sections based on heading patterns
function parseSections(text: string): Record<string, string> {
  const lines = text.split('\n')
  const sections: Record<string, string> = {}
  let currentSection = 'description'
  let currentContent: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      currentContent.push('')
      continue
    }

    // Check if this line is a section heading
    let foundSection: string | null = null
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(trimmed) && trimmed.length < 100) {
        foundSection = section
        break
      }
    }

    if (foundSection) {
      // Save current section
      if (currentContent.length > 0) {
        const content = currentContent.join('\n').trim()
        if (content && (!sections[currentSection] || sections[currentSection].length < content.length)) {
          sections[currentSection] = content
        }
      }
      currentSection = foundSection
      currentContent = []
    } else {
      currentContent.push(trimmed)
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    const content = currentContent.join('\n').trim()
    if (content && (!sections[currentSection] || sections[currentSection].length < content.length)) {
      sections[currentSection] = content
    }
  }

  return sections
}

// Convert plain text section to HTML
function textToHtml(text: string): string {
  if (!text) return ''

  // Split into lines
  const lines = text.split('\n').filter(l => l.trim())

  // Check if it looks like a list (lines starting with - or * or numbers)
  const listPattern = /^[\-\*\u2022\u2013\u2014]\s+|^\d+[\.\)]\s+/
  const isListContent = lines.filter(l => listPattern.test(l.trim())).length > lines.length * 0.5

  if (isListContent) {
    const items = lines.map(l => {
      const cleaned = l.trim().replace(listPattern, '').trim()
      return cleaned ? `<li>${cleaned}</li>` : ''
    }).filter(Boolean)
    return `<ul>${items.join('')}</ul>`
  }

  // Otherwise, treat as paragraphs
  return lines.map(l => `<p>${l.trim()}</p>`).join('')
}

export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    const filename = file.name.toLowerCase()
    const isDocx = filename.endsWith('.docx')
    const isPdf = filename.endsWith('.pdf')

    if (!isDocx && !isPdf) {
      return NextResponse.json(
        { success: false, error: 'Only .docx and .pdf files are supported' },
        { status: 400 }
      )
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 10MB)' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let rawText = ''
    let htmlContent = ''

    if (isDocx) {
      // Extract both HTML and raw text from Word document
      const [htmlResult, textResult] = await Promise.all([
        mammoth.convertToHtml({ buffer }),
        mammoth.extractRawText({ buffer }),
      ])
      htmlContent = htmlResult.value || ''
      rawText = textResult.value || ''
    } else {
      // PDF extraction using pdf2json
      try {
        const PDFParser = (await import('pdf2json')).default
        rawText = await new Promise<string>((resolve, reject) => {
          const parser = new PDFParser()
          parser.on('pdfParser_dataReady', (pdfData: { Pages?: Array<{ Texts?: Array<{ R?: Array<{ T?: string }> }> }> }) => {
            const text = (pdfData.Pages || [])
              .map(page =>
                (page.Texts || [])
                  .map(t => (t.R || []).map(r => decodeURIComponent(r.T || '')).join(''))
                  .join(' ')
              )
              .join('\n')
            resolve(text)
          })
          parser.on('pdfParser_dataError', (err: unknown) => reject(err))
          parser.parseBuffer(buffer)
        })
      } catch (pdfError) {
        logger.warn('PDF parsing failed, trying as text', {
          error: pdfError instanceof Error ? pdfError.message : 'Unknown'
        })
        rawText = buffer.toString('utf-8')
      }
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Could not extract text from file' },
        { status: 400 }
      )
    }

    // Parse sections from raw text
    const sections = parseSections(rawText)

    // Build the parsed result
    const result: Record<string, string> = {
      titre: '',
      description: sections.description || '',
      descriptionHtml: isDocx && htmlContent
        ? htmlContent.split(/<h[1-6]/i)[0] || ''
        : textToHtml(sections.description || ''),
      responsabilitesHtml: textToHtml(sections.responsabilites || ''),
      qualificationsHtml: textToHtml(sections.qualifications || ''),
      avantagesHtml: textToHtml(sections.avantages || ''),
      competences: sections.competences || extractSkills(rawText),
      salaire: extractSalary(rawText),
      typeContrat: detectContractType(rawText),
    }

    // Try to extract title from filename
    const nameWithoutExt = file.name.replace(/\.(docx|pdf)$/i, '')
    const lastDash = nameWithoutExt.lastIndexOf(' - ')
    if (lastDash > 0) {
      result.titre = nameWithoutExt.substring(0, lastDash).trim()
      result.lieu = nameWithoutExt.substring(lastDash + 3).trim()
    } else {
      result.titre = nameWithoutExt.trim()
    }

    logger.info('File imported successfully', {
      filename: file.name,
      size: file.size,
      type: isDocx ? 'docx' : 'pdf',
      sectionsFound: Object.keys(sections).length,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: `File "${file.name}" parsed successfully`,
    })
  } catch (error) {
    logger.error('File import failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error as Error)
    return NextResponse.json(
      { success: false, error: 'Failed to parse file' },
      { status: 500 }
    )
  }
}
