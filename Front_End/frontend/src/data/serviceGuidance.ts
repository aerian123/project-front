import type {
  Category,
  DocumentRequirement,
  GuidanceContent,
  ServiceGuidance,
  SupportChannel,
} from '../types/guidance'

const documentRequirements: DocumentRequirement[] = [
  {
    id: 'resident-registration-card',
    name: '주민등록증 · 주민등록등본',
    issuingAuthority: '주민센터 / 정부24',
    availableFormats: ['download', 'in-person'],
    downloadUrl: 'https://www.gov.kr',
    preparationNotes: '세대주 여부와 전입일 확인 필수 · 공동인증서 로그인 필요',
  },
  {
    id: 'income-certificate',
    name: '소득금액증명서',
    issuingAuthority: '국세청 홈택스',
    availableFormats: ['download', 'in-person'],
    downloadUrl: 'https://hometax.go.kr',
    preparationNotes: '최근 과세연도 기준 · 근로소득원천징수영수증으로 대체 가능',
  },
  {
    id: 'home-ownership-proof',
    name: '무주택 확인서(세대구성원)',
    issuingAuthority: '주민센터 · 인터넷 등기소',
    availableFormats: ['download', 'in-person'],
    preparationNotes:
      '주택보유 여부 조회용. 정부24, 등기소(e-Form) 또는 주민센터 방문 발급',
  },
  {
    id: 'sales-contract',
    name: '주택 매매계약서 사본',
    issuingAuthority: '공인중개사 / 매도인',
    availableFormats: ['copy'],
    preparationNotes: '계약금 영수증 포함. 전자계약은 PDF 출력분 제출',
  },
  {
    id: 'lease-contract',
    name: '임대차 계약서 및 확정일자 증빙',
    issuingAuthority: '공인중개사 / 임대인',
    availableFormats: ['copy'],
    preparationNotes: '전입신고 및 확정일자 스티커가 보이도록 스캔',
  },
  {
    id: 'bank-account',
    name: '본인 명의 통장 사본',
    issuingAuthority: '은행',
    availableFormats: ['copy'],
    preparationNotes: '월세 지원금·대출 실행 계좌로 사용',
  },
]

const supportChannels: SupportChannel[] = [
  {
    id: 'hf-call-center',
    type: 'call-center',
    name: '주택도시기금 고객센터',
    contact: '1566-9009',
    hours: '평일 09:00-18:00',
    notes: '대출 자격, 금리, 한도 상담 (ARS 2-1-1)',
  },
  {
    id: 'hf-bank-branch',
    type: 'office',
    name: '주택도시기금 취급은행 창구',
    address: '전국 우리/국민/농협/IBK/신한은행 지점',
    hours: '은행 영업시간 (09:00-16:00)',
    contact: '해당 지점 대표번호',
    notes: '번호표 마감 30분 전에 방문 권장',
  },
  {
    id: 'gj-youth-policy',
    type: 'call-center',
    name: '광주광역시 청년정책관실',
    contact: '062-613-2723',
    hours: '평일 09:00-18:00',
    notes: '사업 공고, 예산 잔여분, 서류 보완 문의',
  },
  {
    id: 'gj-youth-center',
    type: 'office',
    name: '광주 청년센터 the숲',
    address: '광주광역시 동구 금남로 245, 전일빌딩245 9층',
    hours: '화-토 10:00-19:00',
    contact: '062-225-1318',
    appointmentRequired: true,
    notes: '현장 접수 및 서류 스캔 지원. 방문 예약 필수',
  },
  {
    id: 'gj-portal',
    type: 'online-portal',
    name: '광주광역시 청년정책 통합포털',
    contact: 'https://www.gwangju.go.kr/youth',
    notes: '회원가입 후 간편·공동 인증으로 월세 지원 신청 가능',
  },
]

const categories: Category[] = [
  {
    id: 'housing-finance',
    title: '내 집 마련 금융',
    description: '무주택 세대의 첫 주택 구입 자금 지원',
    icon: 'home',
    primaryColor: '#6C8CFF',
    serviceIds: ['first-home-loan'],
  },
  {
    id: 'youth-housing',
    title: '광주 청년 주거',
    description: '광주광역시 거주 청년을 위한 주거비 경감',
    icon: 'apartment',
    primaryColor: '#4FB783',
    serviceIds: ['gwangju-youth-rent'],
  },
]

const services: ServiceGuidance[] = [
  {
    id: 'first-home-loan',
    title: '내 생애 최초 주택 자금 대출',
    summary:
      '주택도시기금이 무주택 세대주의 첫 주택 구입 자금을 연 1.55~3.10%의 고정·혼합 금리로 지원합니다.',
    categories: [{ id: 'housing-finance', displayLabel: '주택 금융' }],
    eligibilityHighlights: [
      '만 19세 이상 무주택 세대주 (혼인 예정자 포함)',
      '부부합산 연소득 1억 3천만원 이하 (신혼·다자녀 1억 5천만원 이하)',
      '구입 주택 전용면적 85㎡ 이하(비수도권 100㎡), 분양·매입가 6억원 이하',
      '기금e든든 사전 자격진단 통과 및 최근 3개월 연체·체납 이력 없음',
    ],
    onlineSteps: [
      {
        title: '기금e든든 회원가입 및 자격진단',
        description:
          '공동/간편 인증으로 로그인 후 “내 생애 최초” 상품을 선택하고 세대 정보와 소득, 주택 정보를 입력해 자격을 확인합니다.',
        requiredDocuments: ['resident-registration-card', 'income-certificate'],
      },
      {
        title: '대출조건 입력과 한도 계산',
        description:
          '구입 주택가격, 필요한 대출금, 상환방식(원리금균등 등)을 입력하면 예상 금리와 한도를 확인할 수 있습니다.',
      },
      {
        title: '전자서류 첨부 및 사전승인 신청',
        description:
          '무주택 확인서, 매매계약서, 통장 사본 등을 스캔하여 업로드하고 희망 취급은행을 지정해 심사를 요청합니다.',
        requiredDocuments: ['home-ownership-proof', 'sales-contract', 'bank-account'],
      },
    ],
    offlineSteps: [
      {
        title: '취급은행 창구 방문',
        description:
          '우리/국민/농협/IBK 등 기금 취급은행에서 원본 서류를 제출하고 담보·보증 절차를 안내받습니다.',
        requiredDocuments: [
          'resident-registration-card',
          'income-certificate',
          'home-ownership-proof',
          'sales-contract',
        ],
        estimatedTime: '30~40분',
      },
      {
        title: '대출 승인 및 실행',
        description:
          '심사 승인 후 잔금일에 맞춰 대출 실행 요청서를 작성하면 지정 계좌로 자금이 입금됩니다.',
        requiredDocuments: ['bank-account'],
      },
    ],
    documentChecklist: [
      'resident-registration-card',
      'income-certificate',
      'home-ownership-proof',
      'sales-contract',
      'bank-account',
    ],
    supportChannels: ['hf-call-center', 'hf-bank-branch'],
    lastReviewed: '2025-01-10',
    notes:
      '최대 4억원, LTV 80% 이내, 10·20·30년 만기 선택. 기금 예산 소진 시 조기 마감될 수 있으므로 사전예약 제출 권장.',
  },
  {
    id: 'gwangju-youth-rent',
    title: '광주광역시 청년 월세 지원',
    summary:
      '광주광역시가 청년 1인 가구의 주거비 부담을 줄이기 위해 월 최대 15만원을 최장 12개월까지 현금 지원합니다.',
    categories: [{ id: 'youth-housing', displayLabel: '청년 주거' }],
    eligibilityHighlights: [
      '신청일 기준 만 19~39세 광주광역시 거주자 (전입 1년 이상)',
      '보증금 1억 5천만원 이하 · 월세 70만원 이하 주택(전용 85㎡ 이하) 거주',
      '가구 소득이 기준중위소득 150% 이하이며 무주택자',
      '국가/지자체 청년 주거비 중복 지원을 받지 않은 자',
    ],
    onlineSteps: [
      {
        title: '청년정책 통합포털 로그인',
        description:
          '광주 청년정책 포털에서 회원가입 후 공동/간편 인증으로 로그인하여 월세 지원 공고를 확인합니다.',
        requiredDocuments: ['resident-registration-card'],
      },
      {
        title: '전자신청서 작성 및 서류 업로드',
        description:
          '임대차 계약서, 소득증빙, 통장 사본을 업로드하고 지원 기간(최대 12개월)을 선택합니다.',
        requiredDocuments: ['lease-contract', 'income-certificate', 'bank-account'],
      },
      {
        title: '심사 결과 확인 및 계좌 등록',
        description:
          '보완 요청 시 추가 서류를 제출하고, 최종 선정 후 월세 지원금을 받을 계좌 정보를 확정합니다.',
        requiredDocuments: ['bank-account'],
      },
    ],
    offlineSteps: [
      {
        title: '거주지 구청 청년정책팀 방문 접수',
        description:
          '온라인 신청이 어려운 경우 신분증과 임대차 계약서를 지참해 구청에서 현장 접수를 진행합니다.',
        requiredDocuments: ['resident-registration-card', 'lease-contract', 'bank-account'],
        estimatedTime: '20분 내외 (대기 제외)',
      },
      {
        title: '현장 확인 및 약정 체결',
        description:
          '필요 시 거주 사실 조사 후 지원 약정서를 작성하며, 이후 매월 말일 전 지원금이 입금됩니다.',
      },
    ],
    documentChecklist: ['resident-registration-card', 'lease-contract', 'income-certificate', 'bank-account'],
    supportChannels: ['gj-portal', 'gj-youth-policy', 'gj-youth-center'],
    lastReviewed: '2025-01-10',
    notes:
      '장애인·저소득 청년은 가점 부여. 지원 기간 중 타 지역 전출 또는 전세 전환 시 잔여 기간 지원이 중단됩니다.',
  },
]

export const guidanceContent: GuidanceContent = {
  categories,
  documents: documentRequirements,
  services,
  supportChannels,
}

export const getServiceById = (id: string) =>
  services.find((service) => service.id === id) ?? null

export const getDocumentById = (id: string) =>
  documentRequirements.find((doc) => doc.id === id) ?? null

export const getSupportChannelById = (id: string) =>
  supportChannels.find((channel) => channel.id === id) ?? null
