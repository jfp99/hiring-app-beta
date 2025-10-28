// src/app/components/ResumeUploader.tsx
'use client'

import { useState, useEffect } from 'react'
import ParsingProgress, { ParsingStage } from './ParsingProgress'
import ApiUsageBanner from './ApiUsageBanner'
import { FileText, Image, CheckCircle, AlertCircle } from 'lucide-react'

interface ParsedData {
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

interface ResumeUploaderProps {
  onParsed: (data: ParsedData) => void
  className?: string
}

export default function ResumeUploader({ onParsed, className = '' }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsingStage, setParsingStage] = useState<ParsingStage>('upload')
  const [parsingProgress, setParsingProgress] = useState(0)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  // Generate file preview for images
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
      setError('')
      setParsedData(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      // Validate file size (max 10MB)
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setFile(droppedFile)
      setError('')
      setParsedData(null)
    }
  }

  const simulateProgressStages = () => {
    // Stage 1: Upload (0-20%)
    setParsingStage('upload')
    setParsingProgress(0)

    setTimeout(() => {
      setParsingProgress(20)
      setParsingStage('extraction')
    }, 500)

    // Stage 2: Text Extraction (20-40%)
    setTimeout(() => {
      setParsingProgress(40)
      setParsingStage('parsing')
    }, 1500)

    // Stage 3: Data Parsing (40-70%)
    setTimeout(() => {
      setParsingProgress(70)
      setParsingStage('ai-analysis')
    }, 3000)

    // Stage 4: AI Analysis (70-90%)
    setTimeout(() => {
      setParsingProgress(90)
      setParsingStage('validation')
    }, 5000)

    // Stage 5: Validation (90-100%)
    setTimeout(() => {
      setParsingProgress(100)
    }, 6000)
  }

  const handleParse = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setParsing(true)
    setError('')
    setParsingProgress(0)
    setParsingStage('upload')

    // Start progress simulation
    simulateProgressStages()

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/candidates/parse-resume', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'analyse du CV')
      }

      // Ensure we're at 100% before showing results
      setParsingProgress(100)

      // Small delay to show completion
      setTimeout(() => {
        setParsedData(result.data)
        onParsed(result.data)
      }, 500)
    } catch (err: any) {
      console.error('Parse error:', err)
      setError(err.message)
    } finally {
      setParsing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setParsedData(null)
    setError('')
  }

  const getFileIcon = () => {
    if (!file) return null
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  return (
    <div className={`${className}`}>
      {/* API Usage Banner */}
      <ApiUsageBanner />

      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-primary-600 dark:text-accent-500 mb-4">
          Importer un CV
        </h3>

        {!parsedData ? (
          <>
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? 'border-accent-500 bg-orange-50 dark:bg-orange-950'
                : 'border-gray-300 dark:border-gray-600 hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {file ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-primary-600 dark:text-accent-500 mb-3">
                  Fichier sélectionné:
                </p>

                {/* File Preview */}
                {filePreview && (
                  <div className="mb-4">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-xs max-h-48 mx-auto rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md"
                    />
                  </div>
                )}

                {/* File Info Card */}
                <div className="inline-flex items-center gap-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-left">
                  <div className="text-primary-600 dark:text-accent-500">
                    {getFileIcon()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}
                    </p>
                  </div>
                  <div className="ml-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Glissez-déposez votre CV ici ou
                </p>
              </div>
            )}

            <label className="inline-block">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.pages,.webp,.jpg,.jpeg,.png,.gif,.bmp"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 rounded-lg hover:bg-primary-700 dark:hover:bg-accent-600 transition-all shadow-md hover:shadow-lg">
                <span className="text-xl">{file ? '🔄' : '📤'}</span>
                <span className="font-medium">{file ? 'Changer de fichier' : 'Sélectionner un fichier'}</span>
              </span>
            </label>

            <div className="text-xs text-gray-600 dark:text-gray-400 mt-4 space-y-2">
              <p className="font-semibold text-center">Formats acceptés (max 10 MB):</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <span className="bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">📄 PDF, DOC, DOCX, TXT, RTF, ODT</span>
                <span className="bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded">🖼️ WEBP, JPG, PNG, GIF, BMP</span>
              </div>
            </div>
          </div>

          {/* Parse Button */}
          {file && !parsing && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleParse}
                className="flex-1 bg-accent-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-accent-600 hover:shadow-lg transition-all"
              >
                Analyser le CV
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Parsing Progress */}
          {parsing && (
            <div className="mt-4">
              <ParsingProgress
                currentStage={parsingStage}
                progress={parsingProgress}
                estimatedTimeRemaining={Math.max(0, 7 - Math.floor(parsingProgress / 15))}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Error parsing CV
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Parsed Data Preview */}
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-bold text-green-800 dark:text-green-200">CV analysé avec succès!</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Les informations extraites ont été pré-remplies dans le formulaire ci-dessous.
            </p>
          </div>

          {/* Preview Data */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Personal Info */}
            {(parsedData.firstName || parsedData.lastName || parsedData.email) && (
              <div className="border-l-4 border-accent-500 pl-4">
                <h4 className="font-bold text-primary-600 dark:text-accent-500 mb-2">Informations personnelles</h4>
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {parsedData.firstName && (
                    <p>
                      <span className="font-medium">Prénom:</span> {parsedData.firstName}
                    </p>
                  )}
                  {parsedData.lastName && (
                    <p>
                      <span className="font-medium">Nom:</span> {parsedData.lastName}
                    </p>
                  )}
                  {parsedData.email && (
                    <p>
                      <span className="font-medium">Email:</span> {parsedData.email}
                    </p>
                  )}
                  {parsedData.phone && (
                    <p>
                      <span className="font-medium">Téléphone:</span> {parsedData.phone}
                    </p>
                  )}
                  {parsedData.linkedIn && (
                    <p>
                      <span className="font-medium">LinkedIn:</span>{' '}
                      <a
                        href={parsedData.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {parsedData.linkedIn}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {parsedData.primarySkills && parsedData.primarySkills.length > 0 && (
              <div className="border-l-4 border-primary-600 dark:border-accent-500 pl-4">
                <h4 className="font-bold text-primary-600 dark:text-accent-500 mb-2">
                  Compétences ({parsedData.primarySkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.primarySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {parsedData.workExperience && parsedData.workExperience.length > 0 && (
              <div className="border-l-4 border-purple-500 dark:border-purple-400 pl-4">
                <h4 className="font-bold text-primary-600 dark:text-accent-500 mb-2">
                  Expérience professionnelle ({parsedData.workExperience.length})
                </h4>
                <div className="space-y-3">
                  {parsedData.workExperience.map((exp, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{exp.position || 'Poste non spécifié'}</p>
                      <p className="text-gray-600 dark:text-gray-400">{exp.company || 'Entreprise non spécifiée'}</p>
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {exp.startDate} - {exp.endDate || 'Présent'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {parsedData.education && parsedData.education.length > 0 && (
              <div className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
                <h4 className="font-bold text-primary-600 dark:text-accent-500 mb-2">
                  Formation ({parsedData.education.length})
                </h4>
                <div className="space-y-3">
                  {parsedData.education.map((edu, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{edu.degree || 'Diplôme non spécifié'}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {edu.institution || 'Institution non spécifiée'}
                      </p>
                      {edu.graduationYear && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">{edu.graduationYear}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Importer un autre CV
            </button>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
