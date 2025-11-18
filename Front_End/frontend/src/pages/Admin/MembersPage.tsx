import { useEffect, useState } from 'react'
import styles from './MembersPage.module.css'
import { useAuth } from '../../context/useAuth'
import { getJson } from '../../utils/api'
import { MOCK_MEMBERS } from '../../data/mockMembers'

type Member = {
  memberId: string
  name: string
  phone: string
  role?: 'master' | 'member'
}

const MembersPage = () => {
  const { user } = useAuth()
  const isMaster = user?.role === 'master' || user?.name === 'master'
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !isMaster) return
    setIsLoading(true)
    getJson<Member[]>('/api/members')
      .then((data) => {
        setMembers(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to load members', err)
        setError('서버에서 회원 정보를 불러오지 못했습니다. 예시 데이터로 대체합니다.')
        setMembers(MOCK_MEMBERS)
      })
      .finally(() => setIsLoading(false))
  }, [user])

  if (!user) {
    return (
      <div className={styles.page}>
        <p className={styles.message}>로그인 후 이용할 수 있습니다.</p>
      </div>
    )
  }

  if (!isMaster) {
    return (
      <div className={styles.page}>
        <p className={styles.message}>마스터 계정만 접근할 수 있는 페이지입니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>회원 목록</h1>
          <p>등록된 모든 회원 정보를 조회할 수 있습니다.</p>
        </div>
      </header>

      {isLoading ? (
        <p className={styles.message}>불러오는 중...</p>
      ) : error ? (
        <p className={`${styles.message} ${styles.error}`}>{error}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">이름</th>
              <th scope="col">휴대전화</th>
              <th scope="col">권한</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={4}>등록된 회원이 없습니다.</td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.memberId}>
                  <td>{member.name}</td>
                  <td>{member.phone}</td>
                  <td>{member.role ?? 'member'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default MembersPage
