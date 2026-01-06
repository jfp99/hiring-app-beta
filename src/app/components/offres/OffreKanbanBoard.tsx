// src/app/components/offres/OffreKanbanBoard.tsx
'use client'

import { useState, useCallback } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import {
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  GripVertical
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { OffreEnhanced, OffreStatut, KanbanColumn } from '@/app/types/offres'
import { STATUT_CONFIG } from '@/app/types/offres'

interface OffreKanbanBoardProps {
  offres: OffreEnhanced[]
  onStatusChange: (offreId: string, newStatus: OffreStatut) => Promise<void>
  onEdit: (offre: OffreEnhanced) => void
  onDuplicate: (offre: OffreEnhanced) => void
  onDelete: (offre: OffreEnhanced) => void
  onView: (offre: OffreEnhanced) => void
  isLoading?: boolean
}

const STATUT_ICONS: Record<OffreStatut, React.ElementType> = {
  draft: FileText,
  review: Eye,
  scheduled: Clock,
  active: CheckCircle,
  expired: AlertCircle,
  archived: Archive
}

const COLUMN_ORDER: OffreStatut[] = ['draft', 'review', 'scheduled', 'active', 'expired', 'archived']

// Kanban card for a single offer
function OffreKanbanCard({
  offre,
  index,
  onEdit,
  onDuplicate,
  onDelete,
  onView
}: {
  offre: OffreEnhanced
  index: number
  onEdit: (offre: OffreEnhanced) => void
  onDuplicate: (offre: OffreEnhanced) => void
  onDelete: (offre: OffreEnhanced) => void
  onView: (offre: OffreEnhanced) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <Draggable draggableId={offre.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white dark:bg-gray-800 rounded-lg border shadow-sm transition-all ${
            snapshot.isDragging
              ? 'border-primary-500 shadow-lg rotate-2'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
          }`}
        >
          {/* Card header with drag handle */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <div
              {...provided.dragHandleProps}
              className="p-1 -ml-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Category badge */}
            {offre.categorie && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                {offre.categorie}
              </span>
            )}

            {/* Actions menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <button
                      onClick={() => {
                        onView(offre)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Voir
                    </button>
                    <button
                      onClick={() => {
                        onEdit(offre)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate(offre)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                      Dupliquer
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        onDelete(offre)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card content */}
          <div
            className="p-3 cursor-pointer"
            onClick={() => onEdit(offre)}
          >
            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
              {offre.titre}
            </h4>

            <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">{offre.entreprise}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{offre.lieu}</span>
              </div>
              {offre.scheduling?.scheduledPublishDate && offre.statut === 'scheduled' && (
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {format(new Date(offre.scheduling.scheduledPublishDate), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              )}
              {offre.scheduling?.expirationDate && offre.statut === 'active' && (
                <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    Expire le {format(new Date(offre.scheduling.expirationDate), 'dd MMM', { locale: fr })}
                  </span>
                </div>
              )}
            </div>

            {/* Contract type badge */}
            <div className="mt-3">
              <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                {offre.typeContrat}
              </span>
            </div>
          </div>

          {/* Card footer with date */}
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(offre.createdAt), 'dd/MM/yyyy', { locale: fr })}
            </span>
            {offre.analytics && (
              <span>{offre.analytics.views} vues</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

// Kanban column
function KanbanColumnComponent({
  column,
  onEdit,
  onDuplicate,
  onDelete,
  onView
}: {
  column: KanbanColumn
  onEdit: (offre: OffreEnhanced) => void
  onDuplicate: (offre: OffreEnhanced) => void
  onDelete: (offre: OffreEnhanced) => void
  onView: (offre: OffreEnhanced) => void
}) {
  const config = STATUT_CONFIG[column.id]
  const Icon = STATUT_ICONS[column.id]

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      {/* Column header */}
      <div className={`px-3 py-2 rounded-t-xl border-b-2 ${config.bgColor} border-current`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`font-medium text-sm ${config.color}`}>
              {config.label}
            </span>
          </div>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${config.bgColor} ${config.color}`}>
            {column.count}
          </span>
        </div>
      </div>

      {/* Column content */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)] transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            }`}
          >
            {column.offers.map((offre, index) => (
              <OffreKanbanCard
                key={offre.id}
                offre={offre}
                index={index}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
            {provided.placeholder}

            {column.offers.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24 text-sm text-gray-400 dark:text-gray-500">
                Aucune offre
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default function OffreKanbanBoard({
  offres,
  onStatusChange,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  isLoading
}: OffreKanbanBoardProps) {
  const [isDragging, setIsDragging] = useState(false)

  // Group offers by status into columns
  const columns: KanbanColumn[] = COLUMN_ORDER.map((status) => {
    const config = STATUT_CONFIG[status]
    const columnOffers = offres.filter((o) => o.statut === status)

    return {
      id: status,
      title: config.label,
      color: config.color,
      icon: status,
      offers: columnOffers,
      count: columnOffers.length
    }
  })

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      setIsDragging(false)

      const { destination, source, draggableId } = result

      // Dropped outside a droppable area
      if (!destination) return

      // Dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return
      }

      // Get the new status from the destination column
      const newStatus = destination.droppableId as OffreStatut

      // Call the status change handler
      await onStatusChange(draggableId, newStatus)
    },
    [onStatusChange]
  )

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMN_ORDER.map((status) => (
          <div
            key={status}
            className="w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-pulse"
          >
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
            <div className="p-2 space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>

      {/* Drag indicator */}
      {isDragging && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary-600 text-white text-sm rounded-full shadow-lg z-50">
          D\u00e9posez dans une colonne pour changer le statut
        </div>
      )}
    </DragDropContext>
  )
}

// Stats bar for Kanban view
export function KanbanStats({ offres }: { offres: OffreEnhanced[] }) {
  const stats = COLUMN_ORDER.map((status) => {
    const count = offres.filter((o) => o.statut === status).length
    const config = STATUT_CONFIG[status]
    const Icon = STATUT_ICONS[status]

    return { status, count, config, Icon }
  })

  const total = offres.length

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
      <div className="flex items-center gap-2 pr-4 border-r border-gray-200 dark:border-gray-700">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
        <span className="text-sm text-gray-500">offres</span>
      </div>

      {stats.map(({ status, count, config, Icon }) => (
        <div
          key={status}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: `${config.bgColor}` }}
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-medium ${config.color}`}>
            {count}
          </span>
        </div>
      ))}
    </div>
  )
}
