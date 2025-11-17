import { createContext } from 'react'

export type UserProfile = {
  name: string
  phone: string
}

export type AuthContextValue = {
  user: UserProfile | null
  registeredProfile: UserProfile | null
  register: (profile: UserProfile) => void
  login: (profile: UserProfile) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
