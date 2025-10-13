# 🚀 Quick Start - Resume Upload Testing

## 📦 Ready-to-Use Test Files

You now have **6 test resume files** ready to test the upload functionality:

### 1️⃣ Full-Featured Resumes (French)
- ✅ `test-resume.md` - Markdown format (complete resume)
- ✅ `test-resume.txt` - Plain text format
- ✅ `test-resume.rtf` - Rich Text Format

### 2️⃣ Minimal Resume (French)
- ✅ `test-resume-minimal.txt` - Basic information only (edge case testing)

### 3️⃣ English Resume
- ✅ `test-resume-english.txt` - Full resume in English (bilingual testing)

### 4️⃣ Conversion Scripts
- 🔄 `convert.sh` - Linux/Mac conversion script
- 🔄 `convert.bat` - Windows conversion script

## ⚡ Quick Test (No Conversion Needed)

### Test Right Now:
1. Open http://localhost:3000/candidates/new
2. Drag and drop **test-resume.txt** or **test-resume.rtf**
3. Click "Analyser le CV"
4. Check if form fields are populated

### Expected Results:
```
✅ Name: Sophie Martin
✅ Email: sophie.martin@example.com
✅ Phone: +33 6 12 34 56 78
✅ Skills: 25+ detected (React, Node.js, AWS, Docker, etc.)
✅ Experience: 3 positions
✅ Education: 2 degrees
```

## 🔧 Convert to More Formats (Optional)

If you want PDF, DOCX, or ODT files:

### Windows:
```bash
# Install Pandoc first
choco install pandoc

# Run conversion
convert.bat
```

### Mac/Linux:
```bash
# Install Pandoc first
brew install pandoc    # Mac
# OR
sudo apt-get install pandoc    # Linux

# Run conversion
./convert.sh
```

## 📝 Testing Checklist

- [ ] Test with TXT file
- [ ] Test with RTF file
- [ ] Test with MD file
- [ ] Test minimal resume (edge case)
- [ ] Test English resume (bilingual)
- [ ] Convert to PDF and test
- [ ] Convert to DOCX and test
- [ ] Take screenshot, save as JPG, test image handling

## 🎯 What to Verify

### Personal Info
- [ ] First name extracted correctly
- [ ] Last name extracted correctly
- [ ] Email detected and formatted
- [ ] Phone number captured
- [ ] LinkedIn URL found

### Skills
- [ ] At least 70% of skills detected
- [ ] No duplicate skills
- [ ] Skills are in correct format

### Experience
- [ ] Company names extracted
- [ ] Position titles found
- [ ] Dates parsed (YYYY format)
- [ ] Experience ordered correctly

### Education
- [ ] Degree/diploma name captured
- [ ] Institution name found
- [ ] Graduation year parsed

## 🐛 Known Limitations

- **Images**: Will show OCR required message (expected behavior)
- **Unusual formats**: May require manual correction
- **Mixed languages**: Parser handles French and English keywords
- **Date formats**: Best results with YYYY or YYYY-YYYY format

## ✅ Success = 70%+ Data Extracted

The parser aims for 70%+ accuracy. Manual editing is always available for corrections.

## 📖 Full Documentation

See `README.md` for detailed testing instructions and troubleshooting.
