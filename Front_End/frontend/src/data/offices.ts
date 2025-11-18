export type OfficeRecord = {
  id: string
  name: string
  category: 'welfare' | 'civil' | 'employment'
  regionCode: string
  address: string
  phone?: string
  openingHours?: string
  notes?: string
  latitude: number
  longitude: number
}

export const MOCK_OFFICES: OfficeRecord[] = [
  {
    id: 'dong-welfare-center',
    name: '동구 복지센터',
    category: 'welfare',
    regionCode: 'gwangju-dong',
    address: '광주광역시 동구 중앙로 196',
    phone: '062-123-4567',
    openingHours: '평일 09:00~18:00',
    notes: '복지 상담 및 긴급 지원',
    latitude: 35.1462,
    longitude: 126.9238,
  },
  {
    id: 'seo-civil-office',
    name: '서구 민원실',
    category: 'civil',
    regionCode: 'gwangju-seo',
    address: '광주광역시 서구 내방로 111',
    phone: '062-765-4321',
    openingHours: '평일 09:00~18:00',
    notes: '민원 서류 발급 전담',
    latitude: 35.1525,
    longitude: 126.8915,
  },
  {
    id: 'nam-employment-center',
    name: '남구 고용복지센터',
    category: 'employment',
    regionCode: 'gwangju-nam',
    address: '광주광역시 남구 서문대로 638',
    phone: '062-987-6543',
    openingHours: '평일 09:00~18:00',
    notes: '구직상담 및 복지 연계',
    latitude: 35.1296,
    longitude: 126.903,
  },
  {
    id: 'buk-welfare-center',
    name: '북구 복지지원과',
    category: 'welfare',
    regionCode: 'gwangju-buk',
    address: '광주광역시 북구 우치로 77',
    phone: '062-222-1212',
    openingHours: '평일 09:00~18:00',
    latitude: 35.175,
    longitude: 126.9124,
  },
  {
    id: 'gwangsan-employment',
    name: '광산구 일자리센터',
    category: 'employment',
    regionCode: 'gwangju-gwangsan',
    address: '광주광역시 광산구 광산로29번길 15',
    phone: '062-333-4545',
    openingHours: '평일 09:00~18:00',
    latitude: 35.1398,
    longitude: 126.7935,
  },
  {
    id: 'gwangju-hall',
    name: '광주광역시청 민원실',
    category: 'civil',
    regionCode: 'gwangju-seo',
    address: '광주광역시 서구 내방로 111',
    phone: '062-613-3114',
    openingHours: '평일 09:00~18:00',
    notes: '시청 본청 민원 접수',
    latitude: 35.1601,
    longitude: 126.8514,
  },
  {
    id: 'gwangju-support-center',
    name: '광주 복지지원센터',
    category: 'welfare',
    regionCode: 'gwangju-dong',
    address: '광주광역시 동구 백서로 200',
    phone: '062-512-0000',
    openingHours: '평일 09:00~18:00',
    notes: '복지 통합 상담',
    latitude: 35.141,
    longitude: 126.929,
  },
]
