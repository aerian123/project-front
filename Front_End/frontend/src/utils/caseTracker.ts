import type { ServiceGuidanceDetail } from '../types/guidance'
import type { CivilPetition } from '../types/civilPetition'
import { getJson, postJson } from './api'
import { getServiceDetail } from './guidanceSearch'
import { guidanceContent } from '../data/serviceGuidance'
import { fallbackCivilPetitions } from '../data/civilPetitions'

export type CaseStatus = 'in-progress' | 'completed'
export type CaseTrackerStatus = CaseStatus | 'idle'

export interface MyCaseEntry {
  caseId: string
  memberId: string
  serviceId: string
  title: string
  summary?: string
  status: CaseStatus
  startedAt: string
  completedAt?: string
  checklist: string[]
}

export const CASES_UPDATED_EVENT = 'cloudBridge:cases:updated'

type MyCaseApiResponse = {
  caseId: string
  memberId: string
  cpInfoId: string
  status?: string | null
  checklist?: string | null
  startedAt?: string | null
  completedAt?: string | null
}

type CaseMetadata = {
  title?: string
  summary?: string
}

type CaseUpdateInput = {
  memberId: string
  serviceId: string
  status?: CaseStatus
  checklist?: string[]
  metadata?: CaseMetadata
}

let casesCache: MyCaseEntry[] = []

const isBrowser = () => typeof window !== 'undefined'

const dispatchUpdate = () => {
  if (!isBrowser()) return
  window.dispatchEvent(new CustomEvent(CASES_UPDATED_EVENT))
}

const parseChecklist = (raw?: string | null): string[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string')
    }
  } catch {
    // ignore parse errors
  }
  return []
}

const resolveMetadata = (serviceId: string, overrides?: CaseMetadata) => {
  const detail = getServiceDetail(serviceId, guidanceContent)
  if (detail) {
    return {
      title: overrides?.title ?? detail.title,
      summary: overrides?.summary ?? detail.summary,
    }
  }

  const fallback = fallbackCivilPetitions.find((petition) => petition.infoId === serviceId)
  if (fallback) {
    return {
      title: overrides?.title ?? fallback.cpName,
      summary: overrides?.summary ?? fallback.simple,
    }
  }

  return {
    title: overrides?.title ?? serviceId,
    summary: overrides?.summary,
  }
}

const mapResponseToEntry = (
  record: MyCaseApiResponse,
  overrides?: CaseMetadata,
): MyCaseEntry => {
  const metadata = resolveMetadata(record.cpInfoId, overrides)
  const startedAt = record.startedAt ?? new Date().toISOString()
  return {
    caseId: record.caseId,
    memberId: record.memberId,
    serviceId: record.cpInfoId,
    title: metadata.title ?? record.cpInfoId,
    summary: metadata.summary,
    status: record.status === 'completed' ? 'completed' : 'in-progress',
    startedAt,
    completedAt: record.completedAt ?? undefined,
    checklist: parseChecklist(record.checklist),
  }
}

const setCaseStore = (_memberId: string | null, entries: MyCaseEntry[]) => {
  casesCache = entries
  dispatchUpdate()
}

const applyResponse = (response: MyCaseApiResponse, metadata?: CaseMetadata) => {
  const nextEntry = mapResponseToEntry(response, metadata)
  const index = casesCache.findIndex((entry) => entry.caseId === nextEntry.caseId)
  if (index >= 0) {
    casesCache = [
      ...casesCache.slice(0, index),
      nextEntry,
      ...casesCache.slice(index + 1),
    ]
  } else {
    casesCache = [...casesCache, nextEntry]
  }
  dispatchUpdate()
  return nextEntry
}

const ensureMember = (memberId?: string | null) => {
  if (!memberId) {
    throw new Error('로그인이 필요합니다.')
  }
}

const persistCaseUpdate = async (input: CaseUpdateInput) => {
  ensureMember(input.memberId)
  const payload: Record<string, unknown> = {
    cpInfoId: input.serviceId,
  }
  if (input.status) {
    payload.status = input.status
  }
  if (input.checklist) {
    payload.checklist = JSON.stringify(input.checklist)
  }

  const response = await postJson<MyCaseApiResponse>(
    `/api/cases?memberId=${encodeURIComponent(input.memberId)}`,
    payload,
  )

  return applyResponse(response, input.metadata)
}

export const loadCases = (): MyCaseEntry[] => casesCache

export const resetCaseStore = () => {
  casesCache = []
  dispatchUpdate()
}

export const refreshCases = async (memberId?: string | null) => {
  if (!memberId) {
    resetCaseStore()
    return []
  }
  const response = await getJson<MyCaseApiResponse[]>('/api/cases', { memberId })
  const entries = response.map((record) => mapResponseToEntry(record))
  setCaseStore(memberId, entries)
  return entries
}

export const getCaseByServiceId = (serviceId: string): MyCaseEntry | null => {
  return casesCache.find((entry) => entry.serviceId === serviceId) ?? null
}

export const upsertCase = (detail: ServiceGuidanceDetail, memberId: string) =>
  persistCaseUpdate({
    memberId,
    serviceId: detail.id,
    status: 'in-progress',
    metadata: { title: detail.title, summary: detail.summary },
  })

export const upsertCivilCase = (petition: CivilPetition, memberId: string) =>
  persistCaseUpdate({
    memberId,
    serviceId: petition.infoId,
    status: 'in-progress',
    metadata: { title: petition.cpName, summary: petition.simple },
  })

export const completeCase = (serviceId: string, memberId: string) =>
  persistCaseUpdate({
    memberId,
    serviceId,
    status: 'completed',
  })

export const updateCaseProgress = (input: CaseUpdateInput) => persistCaseUpdate(input)
