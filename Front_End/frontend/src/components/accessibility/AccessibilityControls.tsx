import { useState } from 'react'
import { useAccessibility } from '../../layout/AccessibilityContext'
import styles from './AccessibilityControls.module.css'

const textScaleLabels: Record<'standard' | 'large' | 'extra', string> = {
  standard: '보통',
  large: '크게',
  extra: '매우 크게',
}

export const AccessibilityControls = () => {
  const { textScale, setTextScale, highContrast, toggleHighContrast, playAudioSummary } =
    useAccessibility()
  const [summaryRequested, setSummaryRequested] = useState(false)

  const handleAudioSummary = () => {
    playAudioSummary('이 페이지는 공공복지 민원 안내를 제공하며, 챗봇과 카테고리별 서비스를 통해 서류 준비를 도와줍니다.')
    setSummaryRequested(true)
  }

  return (
    <section className={styles.controls} aria-label="접근성 도구">
      <div className={styles.group} role="group" aria-label="글자 크기 조절">
        {(['standard', 'large', 'extra'] as const).map((scale) => (
          <button
            key={scale}
            type="button"
            className={`${styles.controlButton} ${textScale === scale ? styles.active : ''}`}
            onClick={() => setTextScale(scale)}
            aria-pressed={textScale === scale}
          >
            {textScaleLabels[scale]}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`${styles.controlButton} ${highContrast ? styles.active : ''}`}
        onClick={toggleHighContrast}
        aria-pressed={highContrast}
      >
        고대비
      </button>
      <button
        type="button"
        className={styles.controlButton}
        onClick={handleAudioSummary}
        aria-pressed={summaryRequested}
      >
        음성 요약
      </button>
    </section>
  )
}

export default AccessibilityControls
