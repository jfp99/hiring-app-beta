@echo off
REM Script to convert test-resume.md to multiple formats
REM Requires Pandoc: https://pandoc.org/installing.html

echo Converting test resume to multiple formats...
echo.

where pandoc >nul 2>&1
if %errorlevel% neq 0 (
    echo Pandoc is not installed!
    echo.
    echo Install Pandoc:
    echo   Windows: choco install pandoc
    echo   Or download from: https://pandoc.org/installing.html
    echo.
    pause
    exit /b 1
)

echo Pandoc found!
echo.

echo Converting to PDF...
pandoc test-resume.md -o test-resume.pdf

echo Converting to DOCX...
pandoc test-resume.md -o test-resume.docx

echo Converting to ODT...
pandoc test-resume.md -o test-resume.odt

echo.
echo Conversion complete!
echo.
dir /b *.pdf *.docx *.odt 2>nul
echo.
pause
