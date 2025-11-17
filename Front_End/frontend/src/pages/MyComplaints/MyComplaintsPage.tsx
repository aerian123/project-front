import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CASES_STORAGE_KEY,
  CASES_UPDATED_EVENT,
  loadCases,
  type MyCaseEntry,
  completeCase as completeCaseEntry,
} from '../../utils/caseTracker'
import {
  CHECKLIST_STORAGE_PREFIX,
  DOCUMENT_CHECKLIST_EVENT,
  readChecklist,
  toggleChecklistEntry,
} from '../../utils/documentChecklist'
import { guidanceContent } from '../../data/serviceGuidance'
import { getServiceDetail } from '../../utils/guidanceSearch'
import styles from './MyComplaintsPage.module.css'

const filters = [
  { id: 'all', label: '전체' },
  { id: 'processing', label: '진행 중' },
  { id: 'completed', label: '완료' },
]

const MyComplaintsPage = () => {
  const [activeFilter, setActiveFilter] = useState(filters[0].id)
  const [cases, setCases] = useState<MyCaseEntry[]>(() => loadCases())
  const [, setChecklistVersion] = useState(0)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncCases = () => setCases(loadCases())
    const handleCaseStorage = (event: StorageEvent) => {
      if (event.key === CASES_STORAGE_KEY) syncCases()
      if (event.key?.startsWith(CHECKLIST_STORAGE_PREFIX)) {
        setChecklistVersion((prev) => prev + 1)
      }
    }

    const handleChecklistEvent = () => setChecklistVersion((prev) => prev + 1)

    window.addEventListener(CASES_UPDATED_EVENT, syncCases as EventListener)
    window.addEventListener('storage', handleCaseStorage)
    window.addEventListener(DOCUMENT_CHECKLIST_EVENT, handleChecklistEvent)

    return () => {
      window.removeEventListener(CASES_UPDATED_EVENT, syncCases as EventListener)
      window.removeEventListener('storage', handleCaseStorage)
      window.removeEventListener(DOCUMENT_CHECKLIST_EVENT, handleChecklistEvent)
    }
  }, [])

  const stats = useMemo(
    () => ({
      total: cases.length,
      processing: cases.filter((entry) => entry.status === 'in-progress').length,
      completed: cases.filter((entry) => entry.status === 'completed').length,
    }),
    [cases],
  )

  const handleFilterChange = (filterId: string) => setActiveFilter(filterId)

  const navigate = useNavigate()

  const filteredCases = useMemo(() => {
    if (activeFilter === 'processing') {
      return cases.filter((entry) => entry.status === 'in-progress')
    }
    if (activeFilter === 'completed') {
      return cases.filter((entry) => entry.status === 'completed')
    }
    return cases
  }, [activeFilter, cases])

  const groupedCases = useMemo(() => {
    return filteredCases.reduce<Record<'in-progress' | 'completed', MyCaseEntry[]>>(
      (acc, entry) => {
        acc[entry.status]?.push(entry)
        return acc
      },
      { 'in-progress': [], completed: [] },
    )
  }, [filteredCases])

  useEffect(() => {
    const validIds = new Set(filteredCases.map((entry) => entry.serviceId))
    setExpandedCards((prev) => {
      const next = new Set(
        Array.from(prev).filter((serviceId) => validIds.has(serviceId)),
      )
      return next
    })
  }, [filteredCases])

  const formatDate = (iso?: string) => {
    if (!iso) return '기록 없음'
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso))
    } catch {
      return iso
    }
  }

  const emptyMessage =
    activeFilter === 'completed'
      ? '완료된 민원이 아직 없습니다.'
      : activeFilter === 'processing'
        ? '진행 중인 민원이 없습니다. 진행하기 버튼을 눌러 민원을 추가해 보세요.'
        : '등록된 민원이 아직 없습니다.'

  const getChecklistForService = (serviceId: string) =>
    readChecklist(serviceId)

  const handleToggleDocument = (
    entry: MyCaseEntry,
    documentId: string,
    requiredDocs: string[],
  ) => {
    const next = toggleChecklistEntry(entry.serviceId, documentId)
    if (entry.status === 'in-progress' && requiredDocs.every((docId) => next.has(docId))) {
      completeCaseEntry(entry.serviceId)
    }
    setChecklistVersion((prev) => prev + 1)
  }

  const toggleCard = (serviceId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(serviceId)) {
        next.delete(serviceId)
      } else {
        next.add(serviceId)
      }
      return next
    })
  }

  const groupOrder: Array<'in-progress' | 'completed'> = ['in-progress', 'completed']
  const groupLabels: Record<'in-progress' | 'completed', string> = {
    'in-progress': '진행 중',
    completed: '완료',
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>나의 민원 현황</h1>
          <p>진행 중인 민원과 완료된 민원 기록을 모아 한눈에 확인할 수 있습니다.</p>
        </div>
        <div className={styles.overview}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>전체 민원</p>
            <p className={styles.statValue}>{stats.total}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>진행 중</p>
            <p className={styles.statValue}>{stats.processing}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>완료</p>
            <p className={styles.statValue}>{stats.completed}</p>
          </div>
        </div>

        
        <div className={styles.quickActions}>
          <button type="button" className={styles.primaryButton} onClick={()=>navigate('/')}>
            새 민원 접수 시작하기
          </button>
        </div>
      </header>

      <div className={styles.filterRow}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`${styles.filterButton} ${
              activeFilter === filter.id ? styles.filterButtonActive : ''
            }`}
            onClick={() => handleFilterChange(filter.id)}
          >
            {filter.label}
            <span>
              {filter.id === 'all'
                ? ` (${stats.total})`
                : filter.id === 'processing'
                  ? ` (${stats.processing})`
                  : ` (${stats.completed})`}
            </span>
          </button>
        ))}
      </div>

      <section className={styles.list}>
        {filteredCases.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>{emptyMessage}</strong>
            <span>필요한 서류 안내에서 진행하기를 눌러 민원을 추가할 수 있습니다.</span>
          </div>
        ) : (
          groupOrder.map((status) => {
            const entries = groupedCases[status]
            if (entries.length === 0) return null
            return (
              <div key={status} className={styles.groupSection}>
                <div className={styles.groupHeader}>
                  <h2>
                    {groupLabels[status]}
                    <span className={styles.groupCount}>{entries.length}</span>
                  </h2>
                </div>
                <div className={styles.groupList}>
                  {entries.map((entry) => {
                    const detail = getServiceDetail(entry.serviceId, guidanceContent)
                    const checklist = getChecklistForService(entry.serviceId)
                    const requiredDocs = detail?.documentChecklist ?? []
                    const checklistDetails = detail?.documentChecklistDetails ?? []
                    const allDocsComplete =
                      requiredDocs.length > 0 &&
                      requiredDocs.every((docId) => checklist.has(docId))
                    const expanded = expandedCards.has(entry.serviceId)
                    const panelId = `case-panel-${entry.serviceId}`

                    return (
                      <article
                        key={entry.serviceId}
                        className={`${styles.card} ${expanded ? styles.cardExpanded : ''}`}
                      >
                        <button
                          type="button"
                          className={styles.cardToggle}
                          onClick={() => toggleCard(entry.serviceId)}
                          aria-expanded={expanded}
                          aria-controls={panelId}
                        >
                          <div className={styles.cardSummary}>
                            <span
                              className={`${styles.badge} ${
                                entry.status === 'in-progress'
                                  ? styles.badgeProcessing
                                  : styles.badgeCompleted
                              }`}
                            >
                              {entry.status === 'in-progress' ? '진행 중' : '완료'}
                            </span>
                            <div>
                              <p className={styles.cardTitle}>{entry.title}</p>
                              {entry.summary && <p className={styles.cardMeta}>{entry.summary}</p>}
                            </div>
                          </div>
                          <span className={styles.toggleHint}>{expanded ? '접기' : '자세히'}</span>
                        </button>
                        {expanded && (
                          <div className={styles.cardBody} id={panelId}>
                            <ul className={styles.timeline}>
                              <li className={styles.timelineItem}>
                                <span
                                  className={`${styles.timelineMarker} ${styles.timelineActive}`}
                                />
                                <div className={styles.timelineContent}>
                                  <strong>진행 시작</strong>
                                  <span>{formatDate(entry.startedAt)}</span>
                                </div>
                              </li>
                              <li className={styles.timelineItem}>
                                <span
                                  className={`${styles.timelineMarker} ${
                                    entry.status === 'completed' ? styles.timelineActive : ''
                                  }`}
                                />
                                <div className={styles.timelineContent}>
                                  <strong>완료</strong>
                                  <span>
                                    {entry.status === 'completed'
                                      ? formatDate(entry.completedAt)
                                      : '아직 완료되지 않았습니다.'}
                                  </span>
                                </div>
                              </li>
                            </ul>

                            {checklistDetails.length > 0 && (
                              <div className={styles.checklistCard}>
                                <h3>서류 체크리스트</h3>
                                <ul className={styles.checklistList}>
                                  {checklistDetails.map((doc) => {
                                    const completed = checklist.has(doc.id)
                                    const labelClass = completed
                                      ? `${styles.checklistLabel} ${styles.checklistTextDone}`
                                      : styles.checklistLabel
                                    const metaClass = completed
                                      ? `${styles.checklistMeta} ${styles.checklistTextDone}`
                                      : styles.checklistMeta
                                    const checkboxId = `${entry.serviceId}-${doc.id}`

                                    return (
                                      <li
                                        key={doc.id}
                                        className={`${styles.checklistItem} ${
                                          completed ? styles.checklistItemDone : ''
                                        }`}
                                      >
                                        <label className={labelClass} htmlFor={checkboxId}>
                                          <input
                                            id={checkboxId}
                                            type="checkbox"
                                            checked={completed}
                                            disabled={entry.status === 'completed'}
                                            onChange={() =>
                                              handleToggleDocument(entry, doc.id, requiredDocs)
                                            }
                                          />
                                          <span>{doc.name}</span>
                                        </label>
                                        <p className={metaClass}>{doc.issuingAuthority}</p>
                                      </li>
                                    )
                                  })}
                                </ul>
                                {entry.status === 'in-progress' && allDocsComplete && (
                                  <p className={styles.checklistNotice}>
                                    필수 서류를 모두 체크했습니다. 자동으로 완료 탭으로 이동했습니다.
                                  </p>
                                )}
                              </div>
                            )}

                            <div className={styles.cardActions}>
                              <Link to={`/services/${entry.serviceId}`} className={styles.linkButton}>
                                {entry.status === 'completed' ? '상세 내역 보기' : '계속 진행하기'}
                              </Link>
                              <button
                                type="button"
                                className={styles.outlineButton}
                                onClick={() => navigate(`/services/${entry.serviceId}/checklist`)}
                              >
                                {entry.status === 'completed' ? '서류 다시 확인' : '서류 체크리스트 열기'}
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}

export default MyComplaintsPage
