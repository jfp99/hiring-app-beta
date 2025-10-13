// src/app/types/tags.ts
// Tag system for flexible categorization

export enum TagCategory {
  SKILL = 'skill',
  SOURCE = 'source',
  PRIORITY = 'priority',
  STATUS = 'status',
  CUSTOM = 'custom'
}

export enum TagColor {
  // Blues
  BLUE = 'blue',
  INDIGO = 'indigo',
  CYAN = 'cyan',

  // Greens
  GREEN = 'green',
  EMERALD = 'emerald',
  TEAL = 'teal',

  // Reds/Oranges
  RED = 'red',
  ORANGE = 'orange',
  AMBER = 'amber',

  // Purples/Pinks
  PURPLE = 'purple',
  PINK = 'pink',
  FUCHSIA = 'fuchsia',

  // Others
  YELLOW = 'yellow',
  GRAY = 'gray',
  SLATE = 'slate'
}

export interface Tag {
  name: string
  color: TagColor
  category: TagCategory
  description?: string
  count?: number // How many candidates have this tag
}

export interface TagDefinition {
  [key: string]: Tag
}

// Predefined tags for common use cases
export const PREDEFINED_TAGS: Tag[] = [
  // Skills
  { name: 'JavaScript', color: TagColor.YELLOW, category: TagCategory.SKILL },
  { name: 'React', color: TagColor.CYAN, category: TagCategory.SKILL },
  { name: 'Node.js', color: TagColor.GREEN, category: TagCategory.SKILL },
  { name: 'Python', color: TagColor.BLUE, category: TagCategory.SKILL },
  { name: 'TypeScript', color: TagColor.INDIGO, category: TagCategory.SKILL },
  { name: 'Java', color: TagColor.ORANGE, category: TagCategory.SKILL },
  { name: 'DevOps', color: TagColor.PURPLE, category: TagCategory.SKILL },
  { name: 'UX/UI', color: TagColor.PINK, category: TagCategory.SKILL },

  // Sources
  { name: 'LinkedIn', color: TagColor.BLUE, category: TagCategory.SOURCE },
  { name: 'Indeed', color: TagColor.INDIGO, category: TagCategory.SOURCE },
  { name: 'Referral', color: TagColor.GREEN, category: TagCategory.SOURCE },
  { name: 'Website', color: TagColor.CYAN, category: TagCategory.SOURCE },
  { name: 'Job Fair', color: TagColor.PURPLE, category: TagCategory.SOURCE },
  { name: 'Agency', color: TagColor.ORANGE, category: TagCategory.SOURCE },

  // Priority
  { name: 'Urgent', color: TagColor.RED, category: TagCategory.PRIORITY },
  { name: 'High Priority', color: TagColor.ORANGE, category: TagCategory.PRIORITY },
  { name: 'Top Candidate', color: TagColor.EMERALD, category: TagCategory.PRIORITY },
  { name: 'Fast Track', color: TagColor.AMBER, category: TagCategory.PRIORITY },

  // Status indicators
  { name: 'Hot Lead', color: TagColor.RED, category: TagCategory.STATUS },
  { name: 'Warm Lead', color: TagColor.ORANGE, category: TagCategory.STATUS },
  { name: 'Passive', color: TagColor.GRAY, category: TagCategory.STATUS },
  { name: 'Negotiating', color: TagColor.YELLOW, category: TagCategory.STATUS },
  { name: 'Ready to Start', color: TagColor.GREEN, category: TagCategory.STATUS },

  // Custom/Other
  { name: 'Remote Only', color: TagColor.TEAL, category: TagCategory.CUSTOM },
  { name: 'Visa Required', color: TagColor.SLATE, category: TagCategory.CUSTOM },
  { name: 'Relocation', color: TagColor.PURPLE, category: TagCategory.CUSTOM },
  { name: 'Part-Time', color: TagColor.PINK, category: TagCategory.CUSTOM },
  { name: 'Freelance', color: TagColor.FUCHSIA, category: TagCategory.CUSTOM },
]

// Tailwind color classes for tags
export const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  [TagColor.BLUE]: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
  [TagColor.INDIGO]: 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200',
  [TagColor.CYAN]: 'bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200',
  [TagColor.GREEN]: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
  [TagColor.EMERALD]: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200',
  [TagColor.TEAL]: 'bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200',
  [TagColor.RED]: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
  [TagColor.ORANGE]: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200',
  [TagColor.AMBER]: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
  [TagColor.PURPLE]: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
  [TagColor.PINK]: 'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200',
  [TagColor.FUCHSIA]: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 hover:bg-fuchsia-200',
  [TagColor.YELLOW]: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
  [TagColor.GRAY]: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200',
  [TagColor.SLATE]: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
}

export const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  [TagCategory.SKILL]: 'Compétence',
  [TagCategory.SOURCE]: 'Source',
  [TagCategory.PRIORITY]: 'Priorité',
  [TagCategory.STATUS]: 'Statut',
  [TagCategory.CUSTOM]: 'Personnalisé'
}

// Helper functions
export function getTagColor(tagName: string): TagColor {
  const predefined = PREDEFINED_TAGS.find(t => t.name.toLowerCase() === tagName.toLowerCase())
  return predefined?.color || TagColor.GRAY
}

export function getTagColorClass(tagName: string): string {
  const color = getTagColor(tagName)
  return TAG_COLOR_CLASSES[color]
}

export function getTagCategory(tagName: string): TagCategory {
  const predefined = PREDEFINED_TAGS.find(t => t.name.toLowerCase() === tagName.toLowerCase())
  return predefined?.category || TagCategory.CUSTOM
}

export function createCustomTag(name: string, color: TagColor = TagColor.GRAY): Tag {
  return {
    name,
    color,
    category: TagCategory.CUSTOM
  }
}
