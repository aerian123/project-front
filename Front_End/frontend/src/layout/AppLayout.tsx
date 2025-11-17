import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import styles from './AppLayout.module.css'
import { Footer } from './Footer'
import { Header } from './Header'
import { AccessibilityContext } from './AccessibilityContext'
import type { TextScale } from './AccessibilityContext'
// 접근성 컨트롤 UI 제거
import { ChatbotWidget } from '../components/chatbot/ChatbotWidget'

const fontSizeMap: Record<TextScale, string> = {
  standard: '16px',
  large: '18px',
  extra: '20px',
}

export const AppLayout = () => {
  const [textScale, setTextScale] = useState<TextScale>('standard')
  const [highContrast, setHighContrast] = useState(false)

  // 글자 크기 설정이 바뀌면 html 루트 폰트를 다시 계산합니다.
  // 다른 폰트 크기를 추가하고 싶다면 fontSizeMap에 값을 넣고 아래 설정 로직을 그대로 사용하면 됩니다.
  useEffect(() => {
    document.documentElement.style.fontSize = fontSizeMap[textScale]
    const baseRem =
      textScale === 'standard' ? '1rem' : textScale === 'large' ? '1.125rem' : '1.25rem'
    document.documentElement.style.setProperty('--font-size-base', baseRem)
  }, [textScale])

  // 고대비 모드를 켜고 끌 때 body 클래스 값을 토글합니다.
  // 색 테마를 확장하려면 body.classList.toggle 부분에서 조건을 늘려주세요.
  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast)
  }, [highContrast])

  const playAudioSummary = (text: string) => {
    if (typeof window === 'undefined') return
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }

  const accessibilityValue = useMemo(
    () => ({
      textScale,
      setTextScale,
      highContrast,
      toggleHighContrast: () => setHighContrast((prev) => !prev),
      playAudioSummary,
    }),
    [textScale, highContrast],
  )

  // 헤더 높이를 저장해 상단 고정 섹션 바의 오프셋을 맞춥니다.
  // 고정 요소가 늘어나면 '--header-h' 변수를 활용해 다른 컴포넌트에서도 간격을 조정할 수 있습니다.
  useEffect(() => {
    const header = document.querySelector('#site-header, header') as HTMLElement | null
    const setHeaderH = () => {
      if (!header) return
      const h = Math.round(header.getBoundingClientRect().height)
      if (h) document.documentElement.style.setProperty('--header-h', `${h}px`)
    }
    setHeaderH()
    const ro = new ResizeObserver(setHeaderH)
    if (header) ro.observe(header)
    return () => ro.disconnect()
  }, [])

  return (
    <AccessibilityContext.Provider value={accessibilityValue}>
      <div className={styles.appShell}>
        <a className="visually-hidden" href="#main-content">
          메인 콘텐츠로 바로가기
        </a>
        <Header />
        {/* 섹션 이동 탭 등 공용 퀵 액션을 담는 고정 바입니다.
            새 위젯을 붙이고 싶다면 이 div 내부에 컴포넌트를 추가하세요. */}

        <main id="main-content" className={styles.main}>
          <div className={styles.contentRegion}>
            <Outlet />
          </div>
        </main>
        <Footer />
        {/* 챗봇 위젯은 레이아웃에 두어 라우트 이동에도 유지되도록 합니다.
            버튼 위치나 동작을 바꾸려면 ChatbotWidget.tsx를 수정하세요. */}
        <ChatbotWidget />
      </div>
    </AccessibilityContext.Provider>
  )
}

export default AppLayout
