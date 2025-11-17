export type SupportChannelType = 'office' | 'call-center' | 'online-portal'

export type DocumentFormat = 'download' | 'in-person' | 'copy'

export interface DocumentRequirement {
  id: string
  name: string
  issuingAuthority: string
  purpose?: string
  availableFormats: DocumentFormat[]
  downloadUrl?: string
  fee?: string
  validityPeriod?: string
  preparationNotes?: string
}

export interface SupportChannel {
  id: string
  type: SupportChannelType
  name: string
  address?: string
  hours?: string
  contact: string
  appointmentRequired?: boolean
  notes?: string
}

export interface StepBlock {
  title: string
  description: string
  requiredDocuments?: string[]
  estimatedTime?: string
}

export interface CategoryRef {
  id: string
  displayLabel?: string
}

export interface Category {
  id: string
  title: string
  description?: string
  icon?: string
  primaryColor?: string
  serviceIds: string[]
}

export interface ServiceGuidance {
  id: string
  title: string
  summary: string
  categories: CategoryRef[]
  eligibilityHighlights: string[]
  onlineSteps: StepBlock[]
  offlineSteps: StepBlock[]
  documentChecklist: string[]
  supportChannels: string[]
  lastReviewed?: string
  notes?: string
}

export interface ServiceGuidanceDetail extends ServiceGuidance {
  documentChecklistDetails: DocumentRequirement[]
  supportChannelDetails: SupportChannel[]
}

export interface GuidanceContent {
  categories: Category[]
  documents: DocumentRequirement[]
  services: ServiceGuidance[]
  supportChannels: SupportChannel[]
}
