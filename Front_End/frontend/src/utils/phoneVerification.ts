// 휴대전화 패턴은 010/011 등으로 시작하는 국내 형식만 허용합니다.
const KOREAN_PHONE_PATTERN = /^01[016789]\d{7,8}$/

// 입력된 휴대전화에서 숫자만 남겨 일관된 비교가 가능하도록 합니다.
export const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '')

// 국내 휴대전화 번호인지 검사합니다. 숫자만 남긴 값으로 정규식을 확인합니다.
export const isValidPhoneNumber = (value: string) => KOREAN_PHONE_PATTERN.test(normalizePhoneNumber(value))
