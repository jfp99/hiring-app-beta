// app/admin/processes/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/app/components/AdminHeader'
import AdminGuard from '@/app/components/AdminGuard'
import { useApi } from '@/app/hooks/useApi'
import {
  ProcessType,
  CreateProcessDto,
  DEFAULT_PROCESS_STAGES,
  CUSTOM_WORKFLOW_TEMPLATES,
  ProcessStage
} from '@/app/types/process'
import { toast } from 'sonner'
import {
  ChevronLeft,
  Plus,
  Trash2,
  GripVertical,
  Building2,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Target,
  DollarSign
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

interface StageInput extends Omit<ProcessStage, 'candidateIds' | 'candidateCount'> {
  tempId: string
}

export default function NewProcessPage() {
  const router = useRouter()
  const { loading, callApi } = useApi()

  // Form state
  const [formData, setFormData] = useState<CreateProcessDto>({
    name: '',
    type: ProcessType.JOB_SPECIFIC,
    description: '',
    location: '',
    company: '',
    client: '',
    department: '',
    jobId: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    stages: DEFAULT_PROCESS_STAGES.map((s, i) => ({ ...s, tempId: `stage-${i}` })) as any,
    candidateIds: [],
    teamMemberIds: [],
    requiredSkills: [],
    experienceLevel: '',
    contractType: '',
    salaryRange: undefined,
    tags: [],
    priority: 'medium'
  })

  const [selectedTemplate, setSelectedTemplate] = useState<string>('default')
  const [newSkill, setNewSkill] = useState('')
  const [newTag, setNewTag] = useState('')

  // Handle form field changes
  const handleInputChange = (field: keyof CreateProcessDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle process type change
  const handleTypeChange = (type: ProcessType) => {
    setFormData(prev => ({
      ...prev,
      type,
      stages: type === ProcessType.JOB_SPECIFIC
        ? DEFAULT_PROCESS_STAGES.map((s, i) => ({ ...s, tempId: `stage-${i}` }))
        : prev.stages
    }))
  }

  // Handle template selection for custom workflows
  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey)
    if (templateKey !== 'custom' && templateKey !== 'default') {
      const template = CUSTOM_WORKFLOW_TEMPLATES[templateKey as keyof typeof CUSTOM_WORKFLOW_TEMPLATES]
      if (template) {
        setFormData(prev => ({
          ...prev,
          stages: template.map((s, i) => ({ ...s, tempId: `stage-${i}` })) as any
        }))
      }
    }
  }

  // Stage management
  const addStage = () => {
    const newStage: StageInput = {
      tempId: `stage-${Date.now()}`,
      id: `stage_${formData.stages?.length || 0}`,
      name: '',
      order: (formData.stages?.length || 0) + 1,
      color: '#6366f1',
      description: ''
    }
    setFormData(prev => ({
      ...prev,
      stages: [...(prev.stages || []), newStage]
    }))
  }

  const updateStage = (tempId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages?.map(stage =>
        (stage as any).tempId === tempId ? { ...stage, [field]: value } : stage
      )
    }))
  }

  const removeStage = (tempId: string) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages?.filter(stage => (stage as any).tempId !== tempId)
        .map((stage, index) => ({ ...stage, order: index + 1 }))
    }))
  }

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...(formData.stages || [])]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < newStages.length) {
      [newStages[index], newStages[newIndex]] = [newStages[newIndex], newStages[index]]
      newStages.forEach((stage, i) => {
        stage.order = i + 1
      })
      setFormData(prev => ({ ...prev, stages: newStages }))
    }
  }

  // Skills management
  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.filter(s => s !== skill)
    }))
  }

  // Tags management
  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }))
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.type) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Validate stages
    if (!formData.stages || formData.stages.length === 0) {
      toast.error('Au moins une étape est requise')
      return
    }

    const invalidStages = formData.stages.filter(stage => !stage.name)
    if (invalidStages.length > 0) {
      toast.error('Toutes les étapes doivent avoir un nom')
      return
    }

    try {
      // Clean up stage data (remove tempId)
      const cleanedData = {
        ...formData,
        stages: formData.stages?.map(({ ...stage }) => {
          const { tempId, ...cleanStage } = stage as any
          return cleanStage
        })
      }

      const result = await callApi('/processes', {
        method: 'POST',
        body: cleanedData
      })

      if (result?.process) {
        toast.success('Processus créé avec succès')
        router.push(`/admin/processes/${result.process.id}`)
      }
    } catch (err) {
      console.error('Error creating process:', err)
      toast.error('Erreur lors de la création du processus')
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200">
        <AdminHeader />

        {/* Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/processes"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  Créer un nouveau processus
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Informations de base
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Process Name */}
                <div className="md:col-span-2">
                  <Input
                    label="Nom du processus"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Développeur Full Stack - Paris Q1 2024"
                  />
                </div>

                {/* Process Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de processus
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTypeChange(ProcessType.JOB_SPECIFIC)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.type === ProcessType.JOB_SPECIFIC
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Briefcase className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">Poste spécifique</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange(ProcessType.CUSTOM_WORKFLOW)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.type === ProcessType.CUSTOM_WORKFLOW
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Target className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">Workflow personnalisé</span>
                    </button>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Décrivez le processus de recrutement..."
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Détails
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company */}
                <Input
                  label="Entreprise"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  leftIcon={<Building2 className="w-5 h-5" />}
                  placeholder="Ex: TechCorp"
                />

                {/* Client */}
                <Input
                  label="Client"
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  placeholder="Ex: Département RH"
                />

                {/* Location */}
                <Input
                  label="Localisation"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  leftIcon={<MapPin className="w-5 h-5" />}
                  placeholder="Ex: Paris, Remote"
                />

                {/* Department */}
                <Input
                  label="Département"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Ex: Engineering"
                />

                {/* Start Date */}
                <Input
                  type="date"
                  label="Date de début"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  leftIcon={<Calendar className="w-5 h-5" />}
                />

                {/* Deadline */}
                <Input
                  type="date"
                  label="Date limite"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  leftIcon={<Calendar className="w-5 h-5" />}
                />

                {/* Contract Type */}
                {formData.type === ProcessType.JOB_SPECIFIC && (
                  <>
                    <Input
                      label="Type de contrat"
                      value={formData.contractType}
                      onChange={(e) => handleInputChange('contractType', e.target.value)}
                      placeholder="Ex: CDI, CDD, Freelance"
                    />

                    {/* Experience Level */}
                    <Input
                      label="Niveau d'expérience"
                      value={formData.experienceLevel}
                      onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                      placeholder="Ex: Senior, Junior"
                    />
                  </>
                )}

                {/* Salary Range */}
                {formData.type === ProcessType.JOB_SPECIFIC && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fourchette salariale
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={formData.salaryRange?.min}
                        onChange={(e) => handleInputChange('salaryRange', {
                          ...formData.salaryRange,
                          min: parseInt(e.target.value),
                          currency: formData.salaryRange?.currency || 'EUR'
                        })}
                        leftIcon={<DollarSign className="w-5 h-5" />}
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={formData.salaryRange?.max}
                        onChange={(e) => handleInputChange('salaryRange', {
                          ...formData.salaryRange,
                          max: parseInt(e.target.value),
                          currency: formData.salaryRange?.currency || 'EUR'
                        })}
                      />
                      <select
                        value={formData.salaryRange?.currency || 'EUR'}
                        onChange={(e) => handleInputChange('salaryRange', {
                          ...formData.salaryRange,
                          currency: e.target.value
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stages */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Étapes du processus
                </h2>

                {formData.type === ProcessType.CUSTOM_WORKFLOW && (
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="default">Modèle par défaut</option>
                    <option value="talent_pool">Talent Pool</option>
                    <option value="internship">Stage</option>
                    <option value="executive_search">Executive Search</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                )}
              </div>

              <div className="space-y-3">
                {formData.stages?.map((stage, index) => (
                  <div
                    key={(stage as any).tempId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400" />

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        placeholder="Nom de l'étape"
                        value={stage.name}
                        onChange={(e) => updateStage((stage as any).tempId, 'name', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Description (optionnel)"
                        value={stage.description}
                        onChange={(e) => updateStage((stage as any).tempId, 'description', e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stage.color}
                          onChange={(e) => updateStage((stage as any).tempId, 'color', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          type="number"
                          placeholder="SLA (heures)"
                          value={stage.slaHours}
                          onChange={(e) => updateStage((stage as any).tempId, 'slaHours', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveStage(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStage(index, 'down')}
                        disabled={index === formData.stages!.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStage((stage as any).tempId)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={addStage}
                >
                  Ajouter une étape
                </Button>
              </div>
            </div>

            {/* Skills and Tags */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Compétences et Tags
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compétences requises
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter une compétence"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        onClick={addSkill}
                      >
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredSkills?.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter un tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        onClick={addTag}
                      >
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-gray-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-between">
              <Link href="/admin/processes">
                <Button type="button" variant="tertiary" size="lg">
                  Annuler
                </Button>
              </Link>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  disabled={loading}
                  isLoading={loading}
                >
                  Créer le processus
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminGuard>
  )
}