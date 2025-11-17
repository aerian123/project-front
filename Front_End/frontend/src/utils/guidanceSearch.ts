import type {
  GuidanceContent,
  ServiceGuidanceDetail,
  ServiceGuidance,
} from '../types/guidance'
import { guidanceContent } from '../data/serviceGuidance'

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const matchesQuery = (service: ServiceGuidance, rawQuery: string) => {
  const query = normalize(rawQuery)
  if (!query) return false

  const haystack = [
    service.title,
    service.summary,
    service.eligibilityHighlights.join(' '),
    service.onlineSteps.map((s) => `${s.title} ${s.description}`).join(' '),
    service.offlineSteps.map((s) => `${s.title} ${s.description}`).join(' '),
  ]

  return haystack.some((text) => normalize(text).includes(query))
}

export const searchServices = (query: string, content: GuidanceContent = guidanceContent) => {
  if (!query.trim()) {
    return content.services.slice(0, 3)
  }

  return content.services
    .filter((service) => matchesQuery(service, query))
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'))
}

export const getServiceDetail = (
  serviceId: string,
  content: GuidanceContent = guidanceContent,
): ServiceGuidanceDetail | null => {
  const base = content.services.find((service) => service.id === serviceId)
  if (!base) return null

  const documentChecklistDetails = base.documentChecklist
    .map((docId) => content.documents.find((doc) => doc.id === docId) ?? null)
    .filter((doc): doc is Exclude<typeof doc, null> => doc !== null)

  const supportChannelDetails = base.supportChannels
    .map((channelId) => content.supportChannels.find((channel) => channel.id === channelId) ?? null)
    .filter((channel): channel is Exclude<typeof channel, null> => channel !== null)

  return {
    ...base,
    documentChecklistDetails,
    supportChannelDetails,
  }
}

export const getServicesByCategory = (
  categoryId: string,
  content: GuidanceContent = guidanceContent,
) =>
  content.services.filter((service) =>
    service.categories.some((category) => category.id === categoryId),
  )

export const getCategoryById = (categoryId: string, content: GuidanceContent = guidanceContent) =>
  content.categories.find((category) => category.id === categoryId) ?? null

export const buildGuidanceSearchSuggestion = (query: string) =>
  query.trim()
    ? `'${query}' 관련 민원 안내를 찾았어요.`
    : '어떤 민원을 도와드릴까요? 예: 내 생애 최초 주택 자금 대출'
