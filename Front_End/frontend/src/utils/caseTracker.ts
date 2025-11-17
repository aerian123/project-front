import type { ServiceGuidanceDetail } from '../types/guidance'

export type CaseStatus = 'in-progress' | 'completed'
export type CaseTrackerStatus = CaseStatus | 'idle'

export interface MyCaseEntry {
  serviceId: string
  title: string
  summary?: string
  status: CaseStatus
  startedAt: string
  completedAt?: string
}

export const CASES_STORAGE_KEY = 'cloudBridge:cases'
export const CASES_UPDATED_EVENT = 'cloudBridge:cases:updated'

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const parseCases = (raw: string | null): MyCaseEntry[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as MyCaseEntry[]
    if (Array.isArray(parsed)) return parsed
  } catch {
    // ignore parse errors and fall through
  }
  return []
}

const readCases = (): MyCaseEntry[] => {
  if (!isBrowser()) return []
  const raw = window.localStorage.getItem(CASES_STORAGE_KEY)
  return parseCases(raw)
}

const writeCases = (cases: MyCaseEntry[]) => {
  if (!isBrowser()) return
  window.localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases))
  window.dispatchEvent(new CustomEvent(CASES_UPDATED_EVENT))
}

export const loadCases = (): MyCaseEntry[] => readCases()

export const getCaseByServiceId = (serviceId: string): MyCaseEntry | null => {
  return readCases().find((entry) => entry.serviceId === serviceId) ?? null
}

export const upsertCase = (detail: ServiceGuidanceDetail): MyCaseEntry | null => {
  if (!isBrowser()) return null
  const cases = readCases()
  const now = new Date().toISOString()
  const existing = cases.find((entry) => entry.serviceId === detail.id)

  if (existing) {
    existing.status = 'in-progress'
    existing.completedAt = undefined
    if (!existing.startedAt) existing.startedAt = now
  } else {
    cases.push({
      serviceId: detail.id,
      title: detail.title,
      summary: detail.summary,
      status: 'in-progress',
      startedAt: now,
    })
  }

  writeCases(cases)
  return cases.find((entry) => entry.serviceId === detail.id) ?? null
}

export const completeCase = (serviceId: string): MyCaseEntry | null => {
  if (!isBrowser()) return null
  const cases = readCases()
  const entry = cases.find((item) => item.serviceId === serviceId)
  if (!entry) return null

  entry.status = 'completed'
  entry.completedAt = new Date().toISOString()
  writeCases(cases)
  return entry
}
