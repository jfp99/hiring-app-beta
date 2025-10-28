// src/app/api/candidates/parse-resume/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/mongodb'

// Force this route to use Node.js runtime instead of Edge
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
      try {
        // Use pdf2json for PDF parsing
        const PDFParser = require('pdf2json')

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Validate buffer
        if (!buffer || buffer.length === 0) {
          throw new Error('Le fichier PDF est vide')
        }

        // Create parser and parse PDF
        text = await new Promise((resolve, reject) => {
          const pdfParser = new PDFParser()

          pdfParser.on('pdfParser_dataError', (errData: any) => {
            reject(new Error(errData.parserError))
          })

          pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            try {
              // Extract text from all pages
              const textParts: string[] = []

              if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
                pdfData.Pages.forEach((page: any) => {
                  if (page.Texts && Array.isArray(page.Texts)) {
                    page.Texts.forEach((text: any) => {
                      if (text.R && Array.isArray(text.R)) {
                        text.R.forEach((textRun: any) => {
                          if (textRun.T) {
                            // Decode URI component to get actual text
                            const decodedText = decodeURIComponent(textRun.T)
                            textParts.push(decodedText)
                          }
                        })
                      }
                    })
                  }
                })
              }

              resolve(textParts.join(' '))
            } catch (parseErr) {
              reject(parseErr)
            }
          })

          // Parse the buffer
          pdfParser.parseBuffer(buffer)
        })

        // Check if text was extracted
        if (!text || text.trim().length === 0) {
          return NextResponse.json({
            success: true,
            data: {
              primarySkills: [],
              secondarySkills: [],
              workExperience: [],
              education: [],
              summary: 'PDF détecté mais aucun texte extrait. Il peut s\'agir d\'un PDF basé sur des images. Veuillez remplir les informations manuellement.'
            },
            message: 'PDF sans texte détecté - Remplissage manuel requis',
            requiresManualEntry: true
          })
        }

        console.log('✅ PDF parsed successfully, extracted', text.length, 'characters')

      } catch (pdfError: any) {
        console.error('❌ PDF parsing error:', pdfError)

        return NextResponse.json({
          error: `Erreur lors de l'analyse du PDF: ${pdfError.message || 'Format PDF non supporté'}. Veuillez essayer un autre format (DOCX, TXT) ou remplir manuellement.`
        }, { status: 400 })
      }
    }
    // Parse DOCX
    else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      try {
        const mammoth = await import('mammoth')
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await mammoth.extractRawText({ buffer })
        text = result.value || ''
      } catch (docxError: any) {
        console.error('DOCX parsing error:', docxError)
        return NextResponse.json({
          error: `Erreur lors de l'analyse du DOCX: ${docxError.message}. Veuillez essayer un autre format.`
        }, { status: 400 })
      }
    }
    // Parse TXT and MD (Markdown)
    else if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      try {
        text = await file.text()
      } catch (txtError: any) {
        console.error('TXT parsing error:', txtError)
        return NextResponse.json({
          error: `Erreur lors de la lecture du fichier texte: ${txtError.message}`
        }, { status: 400 })
      }
    }
    // Parse RTF (basic extraction)
    else if (fileType === 'application/rtf' || fileName.endsWith('.rtf')) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        text = buffer.toString('utf-8')
          .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
          .replace(/[{}]/g, '') // Remove braces
          .trim()
      } catch (rtfError: any) {
        console.error('RTF parsing error:', rtfError)
        return NextResponse.json({
          error: `Erreur lors de l'analyse du RTF: ${rtfError.message}`
        }, { status: 400 })
      }
    }
    // Parse ODT (OpenDocument)
    else if (fileType === 'application/vnd.oasis.opendocument.text' || fileName.endsWith('.odt')) {
      try {
        const mammoth = await import('mammoth')
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await mammoth.extractRawText({ buffer })
        text = result.value || ''
      } catch (odtError: any) {
        console.error('ODT parsing error:', odtError)
        return NextResponse.json({
          error: `Erreur lors de l'analyse du ODT: ${odtError.message}`
        }, { status: 400 })
      }
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

    // Validate that we have some text to parse
    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          primarySkills: [],
          secondarySkills: [],
          workExperience: [],
          education: [],
          summary: 'Aucun texte détecté dans le fichier. Veuillez vérifier le format du fichier ou remplir les informations manuellement.'
        },
        message: 'Aucun texte extrait - Remplissage manuel requis',
        requiresManualEntry: true
      })
    }

    // Track API usage
    try {
      const { db } = await connectToDatabase()
      const usageCollection = db.collection('api_usage')
      await usageCollection.insertOne({
        endpoint: '/api/candidates/parse-resume',
        user: session.user?.email || 'unknown',
        timestamp: new Date(),
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
        success: true
      })
    } catch (usageError) {
      // Log but don't fail the request if usage tracking fails
      console.error('Error tracking API usage:', usageError)
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

  // Extract LinkedIn - handle both clean URLs and URLs with spaces/hyphens
  // Extended regex to capture more characters in LinkedIn usernames
  const linkedInRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-\u00C0-\u017F]+(?:[\/-][\w\-\u00C0-\u017F]+)*/gi
  let linkedInMatches = text.match(linkedInRegex)

  // If not found, try to reconstruct from fragmented text
  if (!linkedInMatches || linkedInMatches.length === 0) {
    // Remove spaces and hyphens from text and try again
    const cleanedText = text.replace(/\s+-\s+/g, '-').replace(/\s+/g, '')
    linkedInMatches = cleanedText.match(linkedInRegex)
  }

  if (linkedInMatches && linkedInMatches.length > 0) {
    result.linkedIn = linkedInMatches[0]
    // Ensure it starts with https://
    if (!result.linkedIn.startsWith('http')) {
      result.linkedIn = 'https://' + result.linkedIn
    }
  }

  // Extract name (usually at the top, before email)
  // Look for lines with 2-3 words that look like names
  // Updated regex to handle all uppercase names and special characters
  const nameRegex = /^([A-ZÉÈÊÀÂÏÎ][A-ZÉÈÊÀÂÏÎa-zéèêàâïîôûù]+(?:\s+[A-ZÉÈÊÀÂÏÎa-zéèêàâïîôûù]+)*(?:\s+[A-ZÉÈÊÀÂÏÎ][A-ZÉÈÊÀÂÏÎa-zéèêàâïîôûù]+){1,2})$/

  // Excluded keywords to avoid false positives
  const excludedKeywords = /^(contact|telephone|adresse|email|reseaux|phone|address|langues|languages|competence|principales|leadership|management|gestion|projet|formation|experience|diplome|certification|français|anglais|espagnol)/i

  // First try to find name in combined text (for PDF where name might be split)
  const firstWords = text.split(/\s+/).slice(0, 50) // Check more words
  for (let i = 0; i < firstWords.length - 2; i++) {
    // Try 2-word combination
    const twoWordName = `${firstWords[i]} ${firstWords[i + 1]}`
    const twoWordMatch = twoWordName.match(nameRegex)
    const isTwoWordExcluded = excludedKeywords.test(twoWordName)

    if (twoWordMatch && !isTwoWordExcluded) {
      const nameParts = twoWordMatch[1].split(/\s+/)
      if (nameParts.length >= 2) {
        result.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase()
        result.lastName = nameParts.slice(1).map(part =>
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ')
        break
      }
    }

    // Try 4-word combination (for names with accents split like "Ha ï them KAROUI")
    if (i < firstWords.length - 4) {
      // Check if it follows pattern: Word + accent + word + WORD
      const word1 = firstWords[i]
      const word2 = firstWords[i + 1]
      const word3 = firstWords[i + 2]
      const word4 = firstWords[i + 3]

      // Check if second word is a single accented character
      if (word2.length <= 2 && /[éèêàâïîôûù]/i.test(word2)) {
        // Check if last word is capitalized (likely last name)
        if (word4 && /^[A-Z]{2,}/.test(word4)) {
          const combinedFirstName = `${word1}${word2}${word3}`
          const fullName = `${combinedFirstName} ${word4}`
          const isExcluded = excludedKeywords.test(fullName) || excludedKeywords.test(word1)

          if (!isExcluded && word1.length > 2 && word3.length > 2) {
            result.firstName = combinedFirstName.charAt(0).toUpperCase() + combinedFirstName.slice(1).toLowerCase()
            result.lastName = word4.charAt(0).toUpperCase() + word4.slice(1).toLowerCase()
            break
          }
        }
      }
    }
  }

  // If not found in combined text, try line by line with more lines
  if (!result.firstName) {
    for (let i = 0; i < Math.min(30, lines.length); i++) {
      const line = lines[i]
      const match = line.match(nameRegex)
      const isExcluded = excludedKeywords.test(line)

      if (match && !isExcluded && line.length < 50) {
        const nameParts = match[1].split(/\s+/).filter(part => part.length > 2) // Filter out single chars
        if (nameParts.length >= 2) {
          result.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase()
          result.lastName = nameParts.slice(1).map(part =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          ).join(' ')
          break
        }
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
    // CRM & Business Systems
    'CRM', 'ERP', 'SAP', 'Salesforce', 'Odoo', 'Quadratus', 'HubSpot', 'Zoho',
    'Marketing', 'Project Management', 'Gestion de projet', 'Commerce',
    // Design & Product
    'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'Adobe XD', 'InVision',
    'UX Design', 'UI Design', 'Product Management'
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
      // Date patterns: "2020-2023", "Jan 2020 - Present", "2020 - Présent", "Septembre 2019 à Aujourd'hui"
      const datePattern1 = /(\d{4})\s*[-–]\s*(\d{4}|présent|present|aujourd'hui|actuel)/i
      const datePattern2 = /(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\s+(?:à|[-–])\s+(?:(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})|(présent|present|aujourd'hui|actuel))/i

      let dateMatch = line.match(datePattern1)
      let isMonthFormat = false

      if (!dateMatch) {
        dateMatch = line.match(datePattern2)
        isMonthFormat = true
      }

      if (dateMatch) {
        // Save previous experience
        if (currentExperience && currentExperience.position) {
          result.workExperience.push(currentExperience)
        }

        // Start new experience
        let startDate, endDate

        if (isMonthFormat) {
          startDate = dateMatch[2] // Year from month format
          endDate = dateMatch[4] || (dateMatch[5] ? 'Présent' : dateMatch[3])
        } else {
          startDate = dateMatch[1]
          endDate = dateMatch[2].toLowerCase().includes('present') ||
                   dateMatch[2].toLowerCase().includes('présent') ||
                   dateMatch[2].toLowerCase().includes('actuel') ||
                   dateMatch[2].toLowerCase().includes('aujourd\'hui') ?
                   'Présent' : dateMatch[2]
        }

        currentExperience = {
          company: '',
          position: '',
          startDate: startDate,
          endDate: endDate
        }

        // Try to extract position and company from the same line
        // Format: "POSITION | COMPANY | TYPE"
        const parts = line.split('|').map(p => p.trim())
        if (parts.length >= 2) {
          // First part after date might be position
          const positionPart = parts.find(p => !datePattern1.test(p) && !datePattern2.test(p))
          if (positionPart) {
            currentExperience.position = positionPart
            // Next part is likely company
            const companyIndex = parts.indexOf(positionPart) + 1
            if (companyIndex < parts.length) {
              currentExperience.company = parts[companyIndex]
            }
          }
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
      // Look for year patterns, including ranges like "2014 - 2016"
      const yearPattern = /(\d{4})(?:\s*[-–]\s*(\d{4}))?/
      const yearMatch = line.match(yearPattern)

      if (yearMatch) {
        // Save previous education
        if (currentEducation && currentEducation.degree) {
          result.education.push(currentEducation)
        }

        // Start new education
        const year = yearMatch[2] || yearMatch[1] // Use end year if range, otherwise single year
        currentEducation = {
          institution: '',
          degree: '',
          graduationYear: year
        }

        // Try to extract degree and institution from the same line
        // Format: "YEAR - DEGREE - INSTITUTION"
        const parts = line.split(/[-–]/).map(p => p.trim()).filter(p => !yearPattern.test(p))
        if (parts.length >= 1) {
          currentEducation.degree = parts[0]
          if (parts.length >= 2) {
            currentEducation.institution = parts[1]
          }
        }
      } else if (currentEducation && !currentEducation.degree && line.length > 5) {
        // This might be the degree
        currentEducation.degree = line
      } else if (currentEducation && !currentEducation.institution && line.length > 3) {
        // This might be the institution
        currentEducation.institution = line
      } else if (currentEducation && currentEducation.degree && line.length > 5) {
        // This might be additional info (field of study, specialization)
        if (!currentEducation.field) {
          currentEducation.field = line
        }
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
