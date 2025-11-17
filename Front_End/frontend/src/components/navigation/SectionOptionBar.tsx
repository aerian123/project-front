import { useEffect, useRef, useState } from 'react'
import styles from './SectionOptionBar.module.css'

type SectionInfo = { el: HTMLElement; title: string }

export const SectionOptionBar = () => {
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

  const focusSection = (el: HTMLElement | undefined) => {
    if (!el) return
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }

  const onClick = (idx: number) => {
    const target = sections[idx]?.el
    setActive(idx)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    focusSection(target)
  }

  if (sections.length === 0) return null

  return (
    <nav aria-label="섹션 선택 탭">
      <div className={styles.bar} role="tablist" aria-orientation="horizontal">
        {sections.map((s, i) => (
          <button
            key={s.title + i}
            type="button"
            className={styles.chip}
            role="tab"
            aria-selected={i === active}
            aria-label={`${s.title} 이동`}
            onClick={() => onClick(i)}
          >
            {s.title}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default SectionOptionBar
