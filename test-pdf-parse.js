// Test PDF parsing with pdf2json
const PDFParser = require('pdf2json');
const fs = require('fs');

const pdfPath = process.argv[2] || './docs/CV - Jolan MATHIEU.pdf';

console.log('📄 Testing PDF parsing for:', pdfPath);
console.log('-------------------------------------------\n');

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => {
  console.error('❌ Error:', errData.parserError);
});

pdfParser.on('pdfParser_dataReady', pdfData => {
  try {
    console.log('✅ PDF parsed successfully!');
    console.log('Number of pages:', pdfData.Pages?.length || 0);
    console.log('\n--- Extracting Text ---\n');

    const textParts = [];

    if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
      pdfData.Pages.forEach((page, pageIndex) => {
        console.log(`\n=== PAGE ${pageIndex + 1} ===`);

        if (page.Texts && Array.isArray(page.Texts)) {
          page.Texts.forEach(text => {
            if (text.R && Array.isArray(text.R)) {
              text.R.forEach(textRun => {
                if (textRun.T) {
                  const decodedText = decodeURIComponent(textRun.T);
                  textParts.push(decodedText);
                  console.log(decodedText);
                }
              });
            }
          });
        }
      });
    }

    const fullText = textParts.join(' ');

    console.log('\n\n--- FULL TEXT (first 500 chars) ---');
    console.log(fullText.substring(0, 500));

    console.log('\n\n--- STATISTICS ---');
    console.log('Total characters extracted:', fullText.length);
    console.log('Total text segments:', textParts.length);

    // Try to extract key information
    console.log('\n\n--- EXTRACTED DATA ---');

    // Email
    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w+/);
    console.log('Email:', emailMatch ? emailMatch[0] : 'Not found');

    // Phone
    const phoneMatch = fullText.match(/(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}/);
    console.log('Phone:', phoneMatch ? phoneMatch[0] : 'Not found');

    // LinkedIn - try with cleaned text and extended regex
    const linkedInRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-\u00C0-\u017F]+(?:[\/-][\w\-\u00C0-\u017F]+)*/gi;
    let linkedInMatch = fullText.match(linkedInRegex);
    if (!linkedInMatch) {
      const cleanedText = fullText.replace(/\s+-\s+/g, '-').replace(/\s+/g, '');
      linkedInMatch = cleanedText.match(linkedInRegex);
    }
    console.log('LinkedIn:', linkedInMatch ? linkedInMatch[0] : 'Not found');

    // Look for name (typically at the beginning)
    const words = fullText.split(/\s+/).slice(0, 10);
    console.log('\nFirst 10 words:', words);

    // Test name extraction with improved regex
    const nameRegex = /^([A-ZÉÈÊÀÂÏÎ][A-ZÉÈÊÀÂÏÎa-zéèêàâïîôûù]+(?:\s+[A-ZÉÈÊÀÂÏÎ][A-ZÉÈÊÀÂÏÎa-zéèêàâïîôûù]+){1,2})$/;
    const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const excludedKeywords = /^(contact|telephone|adresse|email|reseaux|phone|address|langues|languages|competence|principales|leadership|management|gestion|projet|formation|experience|diplome|certification)/i;

    console.log('\n--- NAME EXTRACTION TEST ---');

    // First try to find name in combined text (for PDF where name might be split)
    const firstWords = fullText.split(/\s+/).slice(0, 50);
    let nameFound = false;

    for (let i = 0; i < firstWords.length - 1; i++) {
      const potentialName = `${firstWords[i]} ${firstWords[i + 1]}`;
      const match = potentialName.match(nameRegex);
      const isExcluded = excludedKeywords.test(potentialName);

      if (match && !isExcluded) {
        const nameParts = match[1].split(/\s+/);
        if (nameParts.length >= 2) {
          console.log('Found name (from combined text):', nameParts);
          console.log('First name:', nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase());
          console.log('Last name:', nameParts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' '));
          nameFound = true;
          break;
        }
      }
    }

    // If not found, try line by line
    if (!nameFound) {
      for (let i = 0; i < Math.min(30, lines.length); i++) {
        const line = lines[i];
        const match = line.match(nameRegex);
        const isExcluded = excludedKeywords.test(line);

        if (match && !isExcluded && line.length < 50) {
          const nameParts = match[1].split(/\s+/);
          if (nameParts.length >= 2) {
            console.log('Found name (from line):', nameParts);
            console.log('First name:', nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase());
            console.log('Last name:', nameParts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' '));
            nameFound = true;
            break;
          }
        }
      }
    }

    if (!nameFound) {
      console.log('Name not found with current logic');
    }

    // Test skills extraction
    console.log('\n--- SKILLS EXTRACTION TEST ---');
    const crm_skills = ['CRM', 'SAP', 'Salesforce', 'Odoo', 'Quadratus', 'Marketing', 'Project Management', 'Gestion de projet', 'Commerce'];
    const foundSkills = [];
    const textLower = fullText.toLowerCase();

    for (const skill of crm_skills) {
      const skillLower = skill.toLowerCase();
      const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(textLower)) {
        foundSkills.push(skill);
      }
    }
    console.log('Found CRM-related skills:', foundSkills);

    // Test experience extraction
    console.log('\n--- EXPERIENCE EXTRACTION TEST ---');
    const experiencePattern = /(septembre|janvier|février|mars|avril|mai|juin|juillet|août|octobre|novembre|décembre)\s+(\d{4})\s+(?:à|[-–])\s+(aujourd'hui|\d{4})/i;
    const experienceLines = fullText.split('\n').filter(line => experiencePattern.test(line));
    console.log('Found experience date lines:');
    experienceLines.forEach((line, i) => {
      console.log(`  ${i + 1}. ${line.substring(0, 100)}...`);
    });

  } catch (err) {
    console.error('❌ Parsing error:', err);
  }
});

// Load and parse the PDF
const buffer = fs.readFileSync(pdfPath);
pdfParser.parseBuffer(buffer);
