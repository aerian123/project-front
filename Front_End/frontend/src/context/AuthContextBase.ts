import { createContext } from 'react'

export type UserProfile = {
  memberId?: string
  name: string
  phone: string
  role?: 'master' | 'member'
}

export type AuthContextValue = {
  user: UserProfile | null
  registeredProfile: UserProfile | null
  register: (profile: UserProfile) => void
  login: (profile: UserProfile) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
