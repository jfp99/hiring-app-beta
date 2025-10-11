// src/app/components/ResumeUploader.tsx
'use client'

import { useState } from 'react'

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
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
      setFile(droppedFile)
      setError('')
      setParsedData(null)
    }
  }

  const handleParse = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setParsing(true)
    setError('')

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

      setParsedData(result.data)
      onParsed(result.data)
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

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">
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
                ? 'border-[#ffaf50ff] bg-orange-50'
                : 'border-gray-300 hover:border-[#ffaf50ff] hover:bg-gray-50'
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
                <p className="text-sm font-medium text-[#3b5335ff] mb-2">
                  Fichier sélectionné:
                </p>
                <p className="text-sm text-gray-600">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Glissez-déposez votre CV ici ou
                </p>
              </div>
            )}

            <label className="inline-block">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#3b5335ff] text-white rounded-lg hover:bg-[#2a3d26ff] transition-colors">
                {file ? 'Changer de fichier' : 'Sélectionner un fichier'}
              </span>
            </label>

            <p className="text-xs text-gray-500 mt-4">
              Formats acceptés: PDF, DOCX, TXT (max 10 MB)
            </p>
          </div>

          {/* Parse Button */}
          {file && !parsing && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleParse}
                className="flex-1 bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
              >
                Analyser le CV
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Loading State */}
          {parsing && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffaf50ff] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Analyse du CV en cours...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Parsed Data Preview */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-bold text-green-800">CV analysé avec succès!</span>
            </div>
            <p className="text-sm text-green-700">
              Les informations extraites ont été pré-remplies dans le formulaire ci-dessous.
            </p>
          </div>

          {/* Preview Data */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Personal Info */}
            {(parsedData.firstName || parsedData.lastName || parsedData.email) && (
              <div className="border-l-4 border-[#ffaf50ff] pl-4">
                <h4 className="font-bold text-[#3b5335ff] mb-2">Informations personnelles</h4>
                <div className="space-y-1 text-sm">
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
              <div className="border-l-4 border-[#3b5335ff] pl-4">
                <h4 className="font-bold text-[#3b5335ff] mb-2">
                  Compétences ({parsedData.primarySkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.primarySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 bg-[#3b5335ff] text-white text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {parsedData.workExperience && parsedData.workExperience.length > 0 && (
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-bold text-[#3b5335ff] mb-2">
                  Expérience professionnelle ({parsedData.workExperience.length})
                </h4>
                <div className="space-y-3">
                  {parsedData.workExperience.map((exp, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium">{exp.position || 'Poste non spécifié'}</p>
                      <p className="text-gray-600">{exp.company || 'Entreprise non spécifiée'}</p>
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-xs text-gray-500">
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
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-[#3b5335ff] mb-2">
                  Formation ({parsedData.education.length})
                </h4>
                <div className="space-y-3">
                  {parsedData.education.map((edu, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium">{edu.degree || 'Diplôme non spécifié'}</p>
                      <p className="text-gray-600">
                        {edu.institution || 'Institution non spécifiée'}
                      </p>
                      {edu.graduationYear && (
                        <p className="text-xs text-gray-500">{edu.graduationYear}</p>
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
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              Importer un autre CV
            </button>
          </div>
        </>
      )}
    </div>
  )
}
