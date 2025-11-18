import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type UserProfile } from './AuthContextBase'
import { refreshCases, resetCaseStore } from '../utils/caseTracker'

const REGISTER_KEY = 'cloudBridgeRegisteredUser'
const SESSION_KEY = 'cloudBridgeSessionUser'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [registeredProfile, setRegisteredProfile] = useState<UserProfile | null>(null)

  // 초기에 저장된 회원 정보를 동기화해 페이지 새로고침에도 로그인 상태를 유지합니다.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const storedProfile = window.localStorage.getItem(REGISTER_KEY)
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile) as UserProfile
        if (!parsedProfile.role && parsedProfile.name === 'master') parsedProfile.role = 'master'
        if (parsedProfile?.name && parsedProfile?.phone) setRegisteredProfile(parsedProfile)
      }

      const storedSession = window.sessionStorage.getItem(SESSION_KEY)
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as UserProfile
        if (!parsedSession.role && parsedSession.name === 'master') parsedSession.role = 'master'
        if (parsedSession?.name && parsedSession?.phone) setUser(parsedSession)
      }
    } catch (error) {
      console.error('Failed to parse stored user profile', error)
    }
  }, [])

  useEffect(() => {
    if (!user?.memberId) {
      resetCaseStore()
      return
    }
    refreshCases(user.memberId).catch((error) => {
      console.error('나의 민원 데이터를 불러오지 못했습니다.', error)
    })
  }, [user?.memberId])

  // 등록된 정보와 로그인 세션을 각각 관리해 로그아웃 후에도 가입 정보는 유지합니다.
  const persistRegisteredProfile = useCallback((profile: UserProfile) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(REGISTER_KEY, JSON.stringify(profile))
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile))
  }, [])

  // 로그인 세션만 별도 보관해 로그아웃 시 세션 정보만 지웁니다.
  const persistSession = useCallback((profile: UserProfile | null) => {
    if (typeof window === 'undefined') return
    if (!profile) {
      window.sessionStorage.removeItem(SESSION_KEY)
      return
    }
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile))
  }, [])

  const register = useCallback(
    (profile: UserProfile) => {
      setRegisteredProfile(profile)
      setUser(profile)
      persistRegisteredProfile(profile)
    },
    [persistRegisteredProfile],
  )

  const login = useCallback(
    (profile: UserProfile) => {
      setUser(profile)
      persistSession(profile)
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    setUser(null)
    persistSession(null)
  }, [persistSession])

  const value = useMemo(
    () => ({
      user,
      registeredProfile,
      register,
      login,
      logout,
    }),
    [login, logout, register, registeredProfile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
