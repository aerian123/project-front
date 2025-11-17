import { Link } from 'react-router-dom'
import type { CivilPetition } from '../../types/civilPetition'
import styles from './ChatbotGuidance.module.css'

type GuidanceStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error'

type ChatbotGuidanceProps = {
  status: GuidanceStatus
  query: string
  results: CivilPetition[]
  errorMessage?: string | null
  onReset: () => void
}

// NOTE: 메인 화면에 정적으로 노출되는 챗봇 안내 카드 컴포넌트입니다.
// 실시간 대화 느낌이 필요한 위젯(우측 하단)과는 별도로 유지합니다.
export const ChatbotGuidance = ({
  status,
  query,
  results,
  errorMessage,
  onReset,
}: ChatbotGuidanceProps) => {
  const renderList = (items: string[], emptyMessage: string) => {
    if (!items || items.length === 0) {
      return <p className={styles.textBlock}>{emptyMessage}</p>
    }

    return (
      <ol className={styles.stepList}>
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className={styles.stepListItem}>
            <span className={styles.stepBadge}>{index + 1}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    )
  }

  if (status === 'idle') {
    return (
      <div className={styles.placeholder}>
        {/* 아직 검색하지 않은 상태: 예시 질문을 제공해서 방향을 제시합니다. */}
        <p>궁금한 민원을 입력하면 맞춤 안내를 보여드릴게요.</p>
        <ul>
          <li>“내 생애 최초 주택 자금 대출 조건”</li>
          <li>“광주 청년 월세 지원 기간”</li>
          <li>“주택도시기금 서류 체크”</li>
        </ul>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className={styles.empty}>
        {/* 검색 결과가 없을 때는 메시지와 재검색 버튼만 깔끔하게 보여줍니다. */}
        <h3>해당 민원 정보를 찾을 수 없습니다</h3>
        <p>
          <strong>{query}</strong>와(과) 비슷한 공공복지 민원 정보를 찾을 수 없었습니다. 다른 표현으로
          다시 검색해 보시겠어요?
        </p>
        <button type="button" onClick={onReset} className={styles.resetButton}>
          다른 민원 검색하기
        </button>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className={`${styles.placeholder} ${styles.loading}`}>
        <p>민원 데이터를 불러오는 중입니다...</p>
        <p className={styles.helperText}>잠시만 기다려 주세요.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={styles.empty}>
        <h3>민원 정보를 가져오지 못했습니다</h3>
        <p>{errorMessage ?? '일시적인 오류가 발생했습니다. 다시 시도해 주세요.'}</p>
        <button type="button" onClick={onReset} className={styles.resetButton}>
          다시 시도하기
        </button>
      </div>
    )
  }

  if (results.length === 0) return null

  return (
    <div className={styles.result}>
      <header className={styles.header}>
        <div>
          <p className={styles.lead}>검색된 민원 {results.length}건</p>
          <h2>{query ? `"${query}" 검색 결과` : '민원 검색 결과'}</h2>
        </div>
        <button type="button" onClick={onReset} className={styles.resetButton}>
          다른 민원 찾기
        </button>
      </header>
      <section className={styles.cardList}>
        {results.map((petition) => (
          <article key={petition.infoId} className={styles.petitionCard}>
            <div className={styles.cardHeader}>
              <h3>{petition.cpName}</h3>
              <p className={styles.cardSummary}>{petition.simple}</p>
            </div>
            <div className={styles.cardBody}>
              <h4>상세 안내</h4>
              {renderList(petition.descriptions, '상세 안내 정보가 없습니다.')}
            </div>
            <div className={styles.channelGrid}>
              <div>
                <h4>온라인 신청</h4>
                {renderList(petition.onlineSteps, '온라인 신청 정보가 없습니다.')}
              </div>
              <div>
                <h4>방문 신청</h4>
                {renderList(petition.offlineSteps, '방문 신청 정보가 없습니다.')}
              </div>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardMeta}>
                <span>온라인 {petition.onlineSteps.length}단계</span>
                <span aria-hidden="true">·</span>
                <span>방문 {petition.offlineSteps.length}단계</span>
              </div>
              <Link
                to={`/services/${petition.infoId}/checklist`}
                className={styles.checklistButton}
                state={{ petition }}
              >
                필수 서류 체크리스트
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default ChatbotGuidance
