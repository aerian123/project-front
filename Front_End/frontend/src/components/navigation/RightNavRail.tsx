import { useEffect, useRef, useState } from 'react'
import styles from './RightNavRail.module.css'

type SectionInfo = { el: HTMLElement; title: string }

export const RightNavRail = () => {
  const [sections, setSections] = useState<SectionInfo[]>([])
  const [active, setActive] = useState(0)
  const nodesRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
    nodesRef.current = nodes
    const mapped = nodes.map((el, i) => ({
      el,
      title: el.getAttribute('data-title') || el.id || `섹션 ${i + 1}`,
    }))
    setSections(mapped)

    const handleScroll = () => {
      const headerHVar = getComputedStyle(document.documentElement).getPropertyValue('--header-h')
      const headerH = parseInt(headerHVar || '0', 10) || 0
      const offset = headerH + 8
      let idx = 0
      for (let i = 0; i < nodesRef.current.length; i++) {
        const rect = nodesRef.current[i].getBoundingClientRect()
        if (rect.top - offset <= 1) idx = i
      }
      setActive(idx)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  const canUp = active > 0
  const canDown = active < Math.max(0, sections.length - 1)

  const onSelect = (idx: number) => {
    const target = sections[idx]?.el
    setActive(idx)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
  }

  const onUp = () => {
    const idx = Math.max(0, active - 1)
    setActive(idx)
    const target = sections[idx]?.el
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
  }
  const onDown = () => {
    const idx = Math.min(sections.length - 1, active + 1)
    setActive(idx)
    const target = sections[idx]?.el
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
  }

  if (sections.length === 0) return null

  return (
    <nav className={styles.rail} aria-label="섹션 내비게이션">
      <div className={styles.panel}>
        <div className={styles.header}>목차</div>
        <div className={styles.list} role="tablist" aria-orientation="vertical">
          {sections.map((s, i) => (
            <button
              key={s.title + i}
              type="button"
              className={styles.item}
              role="tab"
              aria-selected={i === active}
              aria-label={`${s.title} 이동`}
              onClick={() => onSelect(i)}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className={styles.footer}>
          <button className={styles.arrow} onClick={onUp} disabled={!canUp} aria-label="이전 섹션으로 이동">위로</button>
          <button className={styles.arrow} onClick={onDown} disabled={!canDown} aria-label="다음 섹션으로 이동">아래로</button>
        </div>
      </div>
    </nav>
  )
}

export default RightNavRail
