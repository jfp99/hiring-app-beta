# Test Resume Files for Upload Testing

This folder contains test resume files in various formats to test the resume parsing functionality.

## 📁 Available Test Files

### 1. **test-resume.md** (Markdown)
- Full-featured resume with all sections
- Easy to read and edit
- Can be converted to other formats

### 2. **test-resume.txt** (Plain Text)
- Simple text format
- No formatting, just plain content
- Tests basic text parsing

## 🔄 How to Convert to Other Formats

### Convert MD to PDF (using Pandoc)
If you have Pandoc installed:
```bash
pandoc test-resume.md -o test-resume.pdf
```

### Convert MD to DOCX
```bash
pandoc test-resume.md -o test-resume.docx
```

### Convert MD to ODT (OpenDocument)
```bash
pandoc test-resume.md -o test-resume.odt
```

### Convert MD to RTF
```bash
pandoc test-resume.md -o test-resume.rtf
```

### Install Pandoc
- **Windows**: `choco install pandoc` or download from https://pandoc.org/installing.html
- **Mac**: `brew install pandoc`
- **Linux**: `sudo apt-get install pandoc`

## 🧪 What to Test

### 1. Personal Information Extraction
The parser should extract:
- ✅ **Name**: Sophie Martin
- ✅ **Email**: sophie.martin@example.com
- ✅ **Phone**: +33 6 12 34 56 78
- ✅ **LinkedIn**: https://www.linkedin.com/in/sophie-martin

### 2. Skills Extraction
Should identify these skills (25+ skills total):
- **Languages**: JavaScript, TypeScript, Python, Java, HTML, CSS
- **Frameworks**: React, Next.js, Vue.js, Node.js, Express, Angular, Tailwind, Bootstrap
- **Databases**: MongoDB, PostgreSQL, MySQL, Redis, Firebase
- **Cloud/DevOps**: AWS, Docker, Kubernetes, Jenkins, GitLab CI, GitHub Actions, Terraform
- **Tools**: Git, Jira, Agile, Scrum, REST API, GraphQL, TDD, CI/CD, Microservices
- **Other**: UX Design, Figma, Photoshop, Machine Learning, TensorFlow

### 3. Work Experience Extraction
Should parse 3 work experiences:

**Experience 1:**
- Position: Lead Developer Full-Stack
- Company: TechCorp Solutions
- Dates: 2021 - Présent

**Experience 2:**
- Position: Développeuse Full-Stack
- Company: Innovation Labs
- Dates: 2019 - 2021

**Experience 3:**
- Position: Développeuse Junior
- Company: StartupHub
- Dates: 2018 - 2019

### 4. Education Extraction
Should parse 2 education entries:

**Education 1:**
- Degree: Master en Informatique - Génie Logiciel
- Institution: École Polytechnique
- Year: 2018

**Education 2:**
- Degree: Licence en Informatique
- Institution: Université Paris-Saclay
- Year: 2016

### 5. Summary/Profile Extraction
Should extract the profile text starting with:
"Développeuse Full-Stack passionnée avec 5 ans d'expérience..."

## 🎯 Testing Process

### Step 1: Test Each Format
1. Go to: http://localhost:3000/candidates/new
2. Click on "Importer un CV" section
3. Upload one of the test files
4. Click "Analyser le CV"
5. Verify the form is pre-filled with correct data

### Step 2: Verify Form Fields

After parsing, check these fields are populated:
- [ ] First Name: Sophie
- [ ] Last Name: Martin
- [ ] Email: sophie.martin@example.com
- [ ] Phone: +33 6 12 34 56 78
- [ ] LinkedIn: https://www.linkedin.com/in/sophie-martin
- [ ] Skills: At least 15+ skills detected
- [ ] Work Experience: 3 entries with company and position
- [ ] Education: 2 entries with degree and institution

### Step 3: Test Different Formats

Test with:
- [x] **.md** (Markdown) - Created
- [x] **.txt** (Plain Text) - Created
- [ ] **.pdf** (PDF) - Convert using Pandoc
- [ ] **.docx** (Word) - Convert using Pandoc
- [ ] **.rtf** (Rich Text) - Convert using Pandoc
- [ ] **.odt** (OpenDocument) - Convert using Pandoc
- [ ] **.jpg** or **.png** (Image) - Screenshot of the resume

### Step 4: Test Image Formats (Manual)

For image testing:
1. Take a screenshot of the resume
2. Save as .jpg, .png, or .webp
3. Upload the image
4. Should receive message: "CV au format image détecté. L'analyse automatique des images nécessite un traitement OCR."

## 🐛 Expected Behaviors

### ✅ Success Cases
- PDF/DOCX/TXT/MD/RTF/ODT files should parse automatically
- Personal info should populate form fields
- Skills should be detected and added to skills array
- Work experience and education should be structured

### ⚠️ Image Handling
- Image files (JPG, PNG, WEBP, GIF, BMP) should be detected
- Should display message about OCR requirement
- Should allow manual form filling
- Should NOT crash or throw errors

### ❌ Error Cases
- Files over 10MB should show size error
- Unsupported formats should show format error
- Corrupted files should show parsing error

## 📊 Success Criteria

A successful test means:
- ✅ All supported formats upload without errors
- ✅ At least 70% of information is correctly extracted
- ✅ Skills detection works for common tech skills
- ✅ Dates are properly parsed (YYYY format)
- ✅ Form is pre-filled and editable
- ✅ Images are handled gracefully with OCR message

## 🔧 Troubleshooting

### No data extracted?
- Check console logs for parsing errors
- Verify file format is supported
- Try converting to PDF and test again

### Wrong data extracted?
- Resume format might be unusual
- Manual editing is always available
- Parser is designed for standard CV formats

### File upload fails?
- Check file size (max 10MB)
- Verify file extension is in accepted list
- Check browser console for errors

## 📝 Notes

- The parser uses regex and keyword matching
- French and English keywords are supported
- Parser is optimized for tech resumes
- Manual correction is always possible after parsing
