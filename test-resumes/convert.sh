#!/bin/bash

# Script to convert test-resume.md to multiple formats
# Requires Pandoc: https://pandoc.org/installing.html

echo "🔄 Converting test resume to multiple formats..."
echo ""

if ! command -v pandoc &> /dev/null; then
    echo "❌ Pandoc is not installed!"
    echo ""
    echo "📥 Install Pandoc:"
    echo "  Windows: choco install pandoc"
    echo "  Mac:     brew install pandoc"
    echo "  Linux:   sudo apt-get install pandoc"
    echo ""
    echo "Or download from: https://pandoc.org/installing.html"
    exit 1
fi

echo "✅ Pandoc found!"
echo ""

# Convert to PDF
echo "📄 Converting to PDF..."
pandoc test-resume.md -o test-resume.pdf \
    --pdf-engine=wkhtmltopdf \
    -V geometry:margin=1in \
    2>/dev/null || pandoc test-resume.md -o test-resume.pdf

# Convert to DOCX
echo "📝 Converting to DOCX..."
pandoc test-resume.md -o test-resume.docx

# Convert to ODT
echo "📋 Converting to ODT..."
pandoc test-resume.md -o test-resume.odt

echo ""
echo "✅ Conversion complete!"
echo ""
ls -lh *.pdf *.docx *.odt 2>/dev/null || echo "Check the files in the folder"
