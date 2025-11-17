import { useCallback, useState } from 'react'
import { ChatbotInput } from '../../components/chatbot/ChatbotInput'
import { ChatbotGuidance } from '../../components/chatbot/ChatbotGuidance'
import { LeftNavRail } from '../../components/navigation/LeftNavRail'
import { buildGuidanceSearchSuggestion } from '../../utils/guidanceSearch'
import { searchFallbackCivilPetitions } from '../../data/civilPetitions'
import type { CivilPetition } from '../../types/civilPetition'
import styles from './HomePage.module.css'

const CIVIL_PETITIONS_ENDPOINT = (() => {
  const origin = import.meta.env.VITE_BACKEND_ORIGIN?.trim()
  if (origin && origin.length > 0) {
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin
    return `${normalizedOrigin}/api/civil-petitions`
  }
  return '/api/civil-petitions'
})()

type ChatbotStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error'

export const HomePage = () => {
  // 랜딩 화면에서도 즉시 안내가 보이도록 챗봇 위젯과 동일한 상태를 가집니다.
  // 상태 구조를 바꾸면 ChatbotWidget.tsx와 동기화 로직이 달라질 수 있으니 함께 수정하세요.
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ChatbotStatus>('idle')
  const [results, setResults] = useState<CivilPetition[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const useFallbackResults = useCallback(
    (keyword: string) => {
      const fallback = searchFallbackCivilPetitions(keyword)
      if (fallback.length > 0) {
        setResults(fallback)
        setStatus('success')
        setErrorMessage(null)
        return true
      }
      return false
    },
    [],
  )

  const handleSearch = useCallback(
    async (input: string) => {
      const trimmed = input.trim()
      if (!trimmed) {
        setStatus('idle')
        setResults([])
        setErrorMessage(null)
        return
      }

      setStatus('loading')
      setErrorMessage(null)

      try {
        const params = new URLSearchParams({ q: trimmed })
        const response = await fetch(`${CIVIL_PETITIONS_ENDPOINT}?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as CivilPetition[]

        if (!Array.isArray(data) || data.length === 0) {
          if (!useFallbackResults(trimmed)) {
            setResults([])
            setStatus('not-found')
          }
          return
        }

        setResults(data)
        setStatus('success')
      } catch (error) {
        console.error(error)
        const handledByFallback = useFallbackResults(trimmed)
        if (!handledByFallback) {
          setResults([])
          setStatus('error')
          setErrorMessage('민원 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
        }
      }
    },
    [useFallbackResults],
  )

  const handleReset = useCallback(() => {
    setQuery('')
    setStatus('idle')
    setResults([])
    setErrorMessage(null)
  }, [])

  return (
    <div className={styles.page}>
      {/* 좌측 네비게이션과 본문을 2열로 묶어 데스크톱에서 섹션 이동을 돕습니다. */}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <LeftNavRail />
          </div>
        </aside>
        <div className={styles.sectionStack}>
          {/* 히어로 영역: 서비스 소개와 챗봇 섹션으로 이동하는 링크를 제공합니다.
              텍스트나 강조 색상을 바꾸려면 HomePage.module.css와 함께 조정하세요. */}
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <p className={styles.sectionLabel}>공공복지 안내</p>
              <h1 className={styles.heading}>
                민원 서류 준비 도와 줄게요
              </h1>
              <p className={styles.description}>
                까다로운 민원 준비도 한번에!
              </p>
              <div className={styles.heroActions}>
                <a className={styles.cta} href="\#chatbot">
                  검색창에 민원 검색해보기
                </a>
                <span className={styles.heroHelper}>평균 10초 내 응답 · 실시간 서류 체킹</span>
              </div>
            </div>
            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.heroGlow}></div>
              <div className={styles.heroPreview}>
                <span className={styles.heroBadge}>실시간 예시</span>
                <h3>국민주택채권 감면 안내</h3>
                <p>필요 서류 3건 · 예상 처리 5분</p>
                <ul>
                  <li>주민등록 등본 (온라인 발급)</li>
                  <li>소득금액증명원 첨부</li>
                  <li>신분증 스캔본 업로드</li>
                </ul>
                <div className={styles.heroPreviewFooter}>
                </div>
              </div>
            </div>
          </section>


          {/* 챗봇 구간: 페이지 이동 없이 민원 안내 흐름을 체험할 수 있습니다.
              이곳의 배치를 변경하면 챗봇 위젯과 내용이 중복되지 않도록 주의하세요. */}
          <section
            id="chatbot"
            data-section
            data-title="챗봇 안내"
            className={styles.chatbotShell}
            style={{ scrollMarginTop: '80px' }}
          >
            <h2>검색으로 민원 안내 받기</h2>
            <p className={styles.helperText}>
              상황과 사유를 입력하면 단계별로 안내해드립니다.
            </p>
            <ChatbotInput
              value={query}
              onChange={setQuery}
              onSubmit={(value) => {
                setQuery(value)
                handleSearch(value)
              }}
              suggestion={buildGuidanceSearchSuggestion(query)}
            />
            <ChatbotGuidance
              status={status}
              query={query}
              results={results}
              errorMessage={errorMessage}
              onReset={handleReset}
            />
          </section>
          
        </div>
      </div>
    </div>
  )
}

export default HomePage
