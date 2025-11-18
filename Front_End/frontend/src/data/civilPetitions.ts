import type { CivilPetition } from '../types/civilPetition'

export const fallbackCivilPetitions: CivilPetition[] = [
  {
    infoId: 'CP_001',
    cpName: '내 생애 최초 주택 자금 대출',
    simple: '생애 최초 주택 구입자를 위한 주택자금 대출 절차와 준비물 안내',
    descriptions: [
      '생애 최초 주택 구입 여부와 소득 요건을 확인합니다.',
      '국민주택채권 매입 감면 대상인지 심사합니다.',
      '대출 실행 전 추가 서류 제출 여부를 확정합니다.',
    ],
    onlineSteps: [
      '주택도시기금 홈페이지에 접속해 회원가입을 완료합니다.',
      '대출 자격심사 페이지에서 예비 자격심사를 진행하고 통과하면 대출 신청을 시작합니다.',
    ],
    offlineSteps: [
      '은행에서 걸려오는 연락을 받고 신청 내용에 대해 상담합니다.',
      '매매하려는 주택에 대한 매매계약서를 작성하고 공인중개사가 준비해 주는 서류를 확인합니다.',
      '은행 방문 전에 행정복지센터에서 제출할 서류를 준비합니다.',
      '회사에서 급여명세서 등 소득증명 자료를 함께 준비합니다.',
      '은행을 직접 방문해 대출 심사 관련 서류를 최종 제출하고 대출 진행을 확정합니다.',
      '1~2시간 이내에 대출 최종 승인 여부와 계좌 입금 여부를 확인합니다.',
    ],
  },
  {
    infoId: 'CP_002',
    cpName: '광주 청년 월세 한시 특별지원',
    simple: '광주광역시 거주 청년 대상 월세 지원 사업',
    descriptions: [
      '지원 대상 연령 및 소득 기준을 충족하는지 확인합니다.',
      '임대차 계약서와 주민등록상 주소지를 대조합니다.',
      '월세 지급 계좌 정보와 지원 기간을 확정합니다.',
    ],
    onlineSteps: [
      '광주광역시 복지포털에서 “월세 특별지원”을 선택합니다.',
      '공동인증서로 로그인 후 신청서를 작성합니다.',
      '임대차 계약서, 통장 사본, 소득자료를 PDF로 업로드합니다.',
    ],
    offlineSteps: [
      '관할 구청 청년정책과 방문',
      '원본 서류 검토 및 서명 후 접수증 수령',
    ],
  },
  {
    infoId: 'CP_003',
    cpName: '주민등록 등본 인터넷 발급',
    simple: '민원24/정부24를 통한 주민등록 등본 온라인 발급 방법',
    descriptions: [
      '정부24 계정을 생성하고 공동인증서를 등록합니다.',
      '수수료 결제 수단(카드, 휴대폰)을 준비합니다.',
    ],
    onlineSteps: [
      '정부24 접속 후 “주민등록표 등본” 민원을 검색합니다.',
      '신청정보 입력 및 발급 목적을 선택합니다.',
      '수수료 결제 후 PDF 또는 출력 형태로 등본을 발급합니다.',
    ],
    offlineSteps: [
      '거주지 주민센터 방문',
      '무인민원발급기 또는 민원 창구에서 신분증 제시 후 발급',
    ],
  },
]

export const searchFallbackCivilPetitions = (query: string) => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return fallbackCivilPetitions
  return fallbackCivilPetitions.filter((petition) => {
    const haystack = [
      petition.cpName,
      petition.simple,
      ...petition.descriptions,
      ...petition.onlineSteps,
      ...petition.offlineSteps,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalized)
  })
}
