const CHECKLIST_PREFIX = 'document-checklist:'
export const DOCUMENT_CHECKLIST_EVENT = 'cloudBridge:document-checklist:updated'

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const dispatchChecklistEvent = (serviceId: string) => {
  if (!isBrowser()) return
  window.dispatchEvent(
    new CustomEvent(DOCUMENT_CHECKLIST_EVENT, {
      detail: { serviceId },
    }),
  )
}

const getChecklistKey = (serviceId: string) => `${CHECKLIST_PREFIX}${serviceId}`

export const readChecklist = (serviceId: string): Set<string> => {
  if (!isBrowser()) return new Set()
  const raw = window.localStorage.getItem(getChecklistKey(serviceId))
  if (!raw) return new Set()
  try {
    const parsed = JSON.parse(raw) as string[]
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((item): item is string => typeof item === 'string'))
    }
  } catch {
    // ignore parse errors
  }
  return new Set()
}

export const writeChecklist = (serviceId: string, values: Iterable<string>) => {
  if (!isBrowser()) return
  const payload = JSON.stringify(Array.from(new Set(values)))
  window.localStorage.setItem(getChecklistKey(serviceId), payload)
  dispatchChecklistEvent(serviceId)
}

export const toggleChecklistEntry = (serviceId: string, documentId: string): Set<string> => {
  const current = readChecklist(serviceId)
  if (current.has(documentId)) {
    current.delete(documentId)
  } else {
    current.add(documentId)
  }
  writeChecklist(serviceId, current)
  return current
}

export const clearChecklist = (serviceId: string) => {
  if (!isBrowser()) return
  window.localStorage.removeItem(getChecklistKey(serviceId))
  dispatchChecklistEvent(serviceId)
}

export const isChecklistComplete = (serviceId: string, requiredDocs: string[]): boolean => {
  const current = readChecklist(serviceId)
  return requiredDocs.every((docId) => current.has(docId))
}

export const CHECKLIST_STORAGE_PREFIX = CHECKLIST_PREFIX
