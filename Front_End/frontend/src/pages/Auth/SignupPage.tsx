import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './AuthPage.module.css'
import { useAuth } from '../../context/useAuth'
import { isValidPhoneNumber, normalizePhoneNumber } from '../../utils/phoneVerification'
import { postJson } from '../../utils/api'

type Alert = { type: 'success' | 'error'; text: string }

export const SignupPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [alert, setAlert] = useState<Alert | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)
  const [isRequestingCode, setRequestingCode] = useState(false)

  // 회원가입을 새로 시작하면 기존 인증 상태는 초기화합니다.
  const resetVerificationState = () => {
    setInputCode('')
    setIssuedCode(null)
    setVerified(false)
  }

  const handleSendCode = async () => {
    const normalizedPhone = normalizePhoneNumber(phone)
    if (!name.trim()) {
      setAlert({ type: 'error', text: '이름을 먼저 입력해주세요.' })
      return
    }
    if (!isValidPhoneNumber(normalizedPhone)) {
      setAlert({ type: 'error', text: '휴대전화 번호를 정확히 입력해주세요.' })
      return
    }

    try {
      setRequestingCode(true)
      // 백엔드(Spring Boot)에서 실제 문자 발송과 코드 저장을 담당합니다.
      const response = await postJson<{ message: string; demoCode?: string }>(
        '/api/auth/phone/request',
        { name: name.trim(), phone: normalizedPhone },
      )
      setIssuedCode('requested') // 코드 값 대신 요청만 했다는 상태를 저장합니다.
      setInputCode('')
      setVerified(false)
      setAlert({
        type: 'success',
        text: `${response.message}${
          response.demoCode ? ` (시연용 코드: ${response.demoCode})` : ''
        }`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '인증번호 발송에 실패했습니다.'
      setAlert({ type: 'error', text: message })
    } finally {
      setRequestingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!issuedCode) {
      setAlert({ type: 'error', text: '먼저 인증번호를 발송해주세요.' })
      return
    }

    try {
      const normalizedPhone = normalizePhoneNumber(phone)
      await postJson<{ message: string }>('/api/auth/phone/verify', {
        phone: normalizedPhone,
        code: inputCode.trim(),
      })
      setVerified(true)
      setAlert({ type: 'success', text: '휴대전화 인증이 완료되었습니다.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '인증번호가 일치하지 않습니다.'
      setVerified(false)
      setAlert({ type: 'error', text: message })
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setAlert({ type: 'error', text: '이름을 입력해주세요.' })
      return
    }

    const normalizedPhone = normalizePhoneNumber(phone)
    if (!isValidPhoneNumber(normalizedPhone)) {
      setAlert({ type: 'error', text: '휴대전화 번호를 정확히 입력해주세요.' })
      return
    }

    if (!verified) {
      setAlert({
        type: 'error',
        text: '휴대전화 인증을 완료해야 회원가입이 진행됩니다.',
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await postJson<{ memberId: string; name: string; phone: string; role?: 'master' | 'member' }>(
        '/api/auth/register',
        { name: name.trim(), phone: normalizedPhone },
      )
      const role = response.role ?? (response.name === 'master' ? 'master' : 'member')
      register({ name: response.name, phone: response.phone, role })
      setAlert({
        type: 'success',
        text: '회원가입이 완료되었습니다. 안내 화면으로 이동합니다.',
      })

      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '회원가입 중 문제가 발생했습니다. 다시 시도해주세요.'
      setAlert({ type: 'error', text: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header>
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.description}>
            이름과 휴대전화 인증으로 간편하게 회원가입을 진행합니다.
          </p>
        </header>

        {alert && (
          <p
            role="status"
            className={`${styles.message} ${
              alert.type === 'success' ? styles.messageSuccess : styles.messageError
            }`}
          >
            {alert.text}
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>이름</span>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름을 입력하세요"
              autoComplete="name"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>휴대전화 번호</span>
            <input
              className={styles.input}
              type="tel"
              value={phone}
              onChange={(event) => {
                const digitsOnly = event.target.value.replace(/\D/g, '')
                setPhone(digitsOnly)
                resetVerificationState()
              }}
              placeholder="예) 01012345678"
              autoComplete="tel-national"
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <p className={`${styles.helper} ${styles.helperNotice}`}>
              하이픈(-) 없이 숫자만 입력해 주세요. 예) <strong>01012345678</strong>
            </p>
          </label>

          <div className={styles.field}>
            <button
              type="button"
              className={styles.button}
              onClick={handleSendCode}
              disabled={isSubmitting || isRequestingCode}
            >
              인증번호 발송
            </button>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>인증번호</span>
            <input
              className={styles.input}
              type="text"
              value={inputCode}
              onChange={(event) => setInputCode(event.target.value)}
              placeholder="6자리 숫자 입력"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </label>

          <div className={styles.field}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleVerifyCode}
              disabled={isSubmitting}
            >
              인증번호 확인
            </button>
            {verified && (
              <span className={`${styles.helper} ${styles.codePreview}`}>인증 완료</span>
            )}
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting || !verified}>
            회원가입 완료
          </button>
        </form>

        <p className={styles.linkRow}>
          이미 가입하셨나요?
          <Link to="/login" className={styles.link}>
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
