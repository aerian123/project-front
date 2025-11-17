import { Link, useLocation } from 'react-router-dom'
import styles from './LeftNavRail.module.css'

// 고정 주요 메뉴 목록입니다. 이 배열만 수정하면 좌측 메뉴 구성이 변경됩니다.
const shortcutLinks = [
  { id: 'my-complaints', title: '나의 민원', to: '/my-complaints' },
  { id: 'nearby-offices', title: '가까운 관공서 찾기', to: '/nearby-offices' },
]

export const LeftNavRail = () => {
  const location = useLocation()

  if (shortcutLinks.length === 0) return null

  return (
    <nav className={styles.sidebar} aria-label="주요 메뉴">
      <h2 className={styles.title}>주요 메뉴</h2>
      <div className={styles.list}>
        {shortcutLinks.map((item) => {
          const isActive = location.pathname === item.to
          const linkClass = isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          return (
            <Link key={item.id} to={item.to} className={linkClass}>
              {item.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default LeftNavRail
