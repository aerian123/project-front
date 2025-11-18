import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import styles from './Header.module.css'
import logo from '../img/logo_face.png'

export const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isMaster = user?.role === 'master' || user?.name === 'master'

  // 인증 플로우가 끝난 사용자는 로그아웃 시 홈으로 안내합니다.
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.branding} aria-label="공공복지 도우미 홈으로 이동">
          <img src={logo} alt="공공복지 도우미 로고" className={styles.logo} />
          <div>
            <p className={styles.siteName}>공공복지 도우미</p>
            <p className={styles.tagline}>두리와 함께해요</p>
          </div>
        </Link>
        <nav aria-label="주요 메뉴" className={styles.nav} />
        <div className={styles.authControls}>
          {user ? (
            <>
              <span className={styles.welcome} aria-live="polite">
                {user.name}님
              </span>
              {isMaster && (
                <Link to="/admin/members" className={styles.adminButton}>
                  전체 회원 조회
                </Link>
              )}
              <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.authButton}>
                로그인
              </Link>
              <Link to="/signup" className={`${styles.authButton} ${styles.authPrimary}`}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
