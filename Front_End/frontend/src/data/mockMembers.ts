export type MockMember = {
  memberId: string
  name: string
  phone: string
  role?: 'master' | 'member'
}

export const MOCK_MEMBERS: MockMember[] = [
  {
    memberId: '1',
    name: 'master',
    phone: '01000000000',
    role: 'master',
  },
  {
    memberId: '2',
    name: '홍길동',
    phone: '01012345678',
    role: 'member',
  },
  {
    memberId: '3',
    name: '김지원',
    phone: '01098765432',
    role: 'member',
  },
]
