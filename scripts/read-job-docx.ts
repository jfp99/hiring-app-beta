// scripts/read-job-docx.ts
/**
 * Quick script to read a Word document and see its structure
 * Run with: npx tsx scripts/read-job-docx.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import mammoth from 'mammoth'

async function readWordDocument() {
  try {
    // Read the first job document
    const docPath = path.join(__dirname, '../docs/annonces/Responsable commercial IT - AIX.docx')

    console.log('📖 Reading:', docPath)

    const buffer = fs.readFileSync(docPath)
    const result = await mammoth.extractRawText({ buffer })

    console.log('\n📄 Content:')
    console.log('='.repeat(80))
    console.log(result.value)
    console.log('='.repeat(80))
    console.log(`\n📊 Length: ${result.value.length} characters`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

readWordDocument()
