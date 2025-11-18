import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CASES_UPDATED_EVENT,
  loadCases,
  type MyCaseEntry,
  refreshCases,
  resetCaseStore,
  updateCaseProgress,
} from '../../utils/caseTracker'
import { guidanceContent } from '../../data/serviceGuidance'
import { getServiceDetail } from '../../utils/guidanceSearch'
import { getSequenceRows } from '../../data/serviceSequences'
import type { DocumentRequirement } from '../../types/guidance'
import styles from './MyComplaintsPage.module.css'
import { useAuth } from '../../context/useAuth'

const MyComplaintsPage = () => {
  const { user } = useAuth()
  const [cases, setCases] = useState<MyCaseEntry[]>(() => loadCases())
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => new Set())
  const [showArchive, setShowArchive] = useState(false)
  const [isLoadingCases, setIsLoadingCases] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncCases = () => setCases(loadCases())

    window.addEventListener(CASES_UPDATED_EVENT, syncCases as EventListener)
    syncCases()

    return () => {
      window.removeEventListener(CASES_UPDATED_EVENT, syncCases as EventListener)
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

  const navigate = useNavigate()

  const activeCases = useMemo(
    () => cases.filter((entry) => entry.status === 'in-progress'),
    [cases],
  )
  const archivedCases = useMemo(
    () => cases.filter((entry) => entry.status === 'completed'),
    [cases],
  )

  useEffect(() => {
    const validIds = new Set(cases.map((entry) => entry.serviceId))
    setExpandedCards((prev) => {
      const next = new Set(
        Array.from(prev).filter((serviceId) => validIds.has(serviceId)),
      )
      return next
    })
  }, [cases])

  useEffect(() => {
    if (archivedCases.length === 0) {
      setShowArchive(false)
    }
  }, [archivedCases.length])

  useEffect(() => {
    if (!user?.memberId) {
      resetCaseStore()
      setCases([])
      setExpandedCards(new Set())
      setShowArchive(false)
      setIsLoadingCases(false)
      return
    }

    let canceled = false
    setIsLoadingCases(true)
    refreshCases(user.memberId)
      .catch((error) => {
        console.error('나의 민원 불러오기 실패', error)
      })
      .finally(() => {
        if (!canceled) setIsLoadingCases(false)
      })

    return () => {
      canceled = true
    }
  }, [user])

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

  const emptyMessage = '진행 중인 민원이 없습니다. 진행하기 버튼을 눌러 민원을 추가해 보세요.'
  const archiveEmptyMessage = '완료된 민원이 아직 없습니다.'

  const buildSequenceChecklist = (serviceId: string): DocumentRequirement[] => {
    const rows = getSequenceRows(serviceId)
    if (rows.length === 0) return []
    return rows.flatMap((row) => {
      if (!row.checklist || row.checklist.length === 0) {
        return [
          {
            id: row.id,
            name: row.title ?? row.content,
            issuingAuthority: row.title ?? row.type,
            availableFormats: [],
            preparationNotes: row.content,
            purpose: row.type,
          },
        ]
      }
      return row.checklist.map((item, index) => ({
        id: `${row.id}-${index}`,
        name: item,
        issuingAuthority: row.title ?? row.type,
        availableFormats: [],
        preparationNotes: row.content,
        purpose: row.type,
      }))
    })
  }

  const getChecklistSet = (entry: MyCaseEntry) => new Set(entry.checklist ?? [])

  const handleToggleDocument = async (
    entry: MyCaseEntry,
    documentId: string,
    requiredDocs: string[],
  ) => {
    if (!user?.memberId) {
      navigate('/login')
      return
    }

    const nextChecklist = getChecklistSet(entry)
    if (nextChecklist.has(documentId)) {
      nextChecklist.delete(documentId)
    } else {
      nextChecklist.add(documentId)
    }

    const shouldComplete =
      entry.status === 'in-progress' && requiredDocs.every((docId) => nextChecklist.has(docId))

    try {
      const updated = await updateCaseProgress({
        memberId: user.memberId,
        serviceId: entry.serviceId,
        checklist: Array.from(nextChecklist),
        status: shouldComplete ? 'completed' : entry.status,
      })
      setCases((prev) =>
        prev.map((item) => (item.serviceId === updated.serviceId ? updated : item)),
      )
    } catch (error) {
      console.error('체크리스트 저장에 실패했습니다.', error)
    }
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

  const renderCaseCard = (entry: MyCaseEntry) => {
    const detail = getServiceDetail(entry.serviceId, guidanceContent)
    const checklist = getChecklistSet(entry)
    const fallbackChecklistDetails =
      detail?.documentChecklistDetails?.length
        ? []
        : buildSequenceChecklist(entry.serviceId)
    const checklistDetails =
      detail?.documentChecklistDetails?.length && detail.documentChecklistDetails.length > 0
        ? detail.documentChecklistDetails
        : fallbackChecklistDetails
    const requiredDocs =
      detail?.documentChecklist && detail.documentChecklist.length > 0
        ? detail.documentChecklist
        : fallbackChecklistDetails.map((doc) => doc.id)
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
                entry.status === 'in-progress' ? styles.badgeProcessing : styles.badgeCompleted
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
                <span className={`${styles.timelineMarker} ${styles.timelineActive}`} />
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
                    const typeTag = doc.purpose
                    const themeClass = typeTag ? getChecklistTheme(typeTag) : ''

                    return (
                      <li
                        key={doc.id}
                        className={`${styles.checklistItem} ${
                          completed ? styles.checklistItemDone : ''
                        }`}
                      >
                        {typeTag && (
                          <span className={`${styles.checklistTypeTag} ${themeClass}`}>
                            {typeTag}
                          </span>
                        )}
                        <label className={labelClass} htmlFor={checkboxId}>
                          <input
                            id={checkboxId}
                            type="checkbox"
                            checked={completed}
                            disabled={entry.status === 'completed'}
                            onChange={() => handleToggleDocument(entry, doc.id, requiredDocs)}
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
  }

  const getChecklistTheme = (type: string) => {
    if (type.includes('사전') || type.includes('준비')) return styles.typePrep
    if (type.includes('온라인')) return styles.typeOnline
    if (type.includes('심사') || type.includes('조사')) return styles.typeReview
    if (type.includes('접수') || type.includes('방문')) return styles.typeOffline
    if (type.includes('지급') || type.includes('대출')) return styles.typeExecute
    if (type.includes('사후')) return styles.typeFollow
    return ''
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
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            새 민원 접수 시작하기
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={archivedCases.length === 0 && !showArchive}
            onClick={() => setShowArchive((prev) => !prev)}
          >
            {showArchive ? '이전 민원 보관함 닫기' : `이전 민원 보관함 (${archivedCases.length})`}
          </button>
        </div>
      </header>

      {user ? (
        <section className={styles.list}>
          {isLoadingCases ? (
            <div className={styles.emptyState}>
              <strong>나의 민원을 불러오는 중입니다…</strong>
            </div>
          ) : activeCases.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>{emptyMessage}</strong>
              <span>필요한 서류 안내에서 진행하기를 눌러 민원을 추가할 수 있습니다.</span>
            </div>
          ) : (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <h2>
                  진행 중
                  <span className={styles.groupCount}>{activeCases.length}</span>
                </h2>
              </div>
              <div className={styles.groupList}>{activeCases.map(renderCaseCard)}</div>
            </div>
          )}
        </section>
      ) : (
        <section className={styles.list}>
          <div className={styles.emptyState}>
            <strong>로그인하면 나의 민원을 저장하고 관리할 수 있습니다.</strong>
            <span>아직 로그인하지 않으셨습니다. 로그인 후 민원을 추가해 주세요.</span>
            <div className={styles.emptyActions}>
              <Link to="/login" className={styles.primaryButton}>
                로그인 하러 가기
              </Link>
            </div>
          </div>
        </section>
      )}

      {showArchive && (
        <section className={styles.archivePanel}>
          <div className={styles.archiveHeader}>
            <h2>이전 민원 보관함</h2>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setShowArchive(false)}
            >
              닫기
            </button>
          </div>
          {archivedCases.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>{archiveEmptyMessage}</strong>
            </div>
          ) : (
            <div className={styles.groupList}>{archivedCases.map(renderCaseCard)}</div>
          )}
        </section>
      )}
    </div>
  )
}

export default MyComplaintsPage
