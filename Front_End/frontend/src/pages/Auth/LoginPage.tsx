import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './AuthPage.module.css'
import { useAuth } from '../../context/useAuth'
import { isValidPhoneNumber, normalizePhoneNumber } from '../../utils/phoneVerification'
import { postJson } from '../../utils/api'

type Alert = { type: 'success' | 'error'; text: string }

export const LoginPage = () => {
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [inputCode, setInputCode] = useState('')
  const [alert, setAlert] = useState<Alert | null>(null)
  const [verified, setVerified] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [isRequestingCode, setRequestingCode] = useState(false)

  // 이미 로그인 상태라면 안내 메시지와 함께 홈으로 돌려보냅니다.
  useEffect(() => {
    if (!user) return
    setAlert({ type: 'success', text: `${user.name}님은 이미 로그인되어 있습니다.` })
    const timer = setTimeout(() => navigate('/'), 1000)
    return () => clearTimeout(timer)
  }, [navigate, user])

  // 이름이나 번호가 바뀔 때마다 인증 흐름을 다시 시작합니다.
  const resetVerificationState = () => {
    setIssuedCode(null)
    setInputCode('')
    setVerified(false)
  }

  const handleSendCode = async () => {
    const trimmedName = name.trim()
    const normalizedPhone = normalizePhoneNumber(phone)

    if (!trimmedName) {
      setAlert({ type: 'error', text: '이름을 입력해주세요.' })
      return
    }

    if (!isValidPhoneNumber(normalizedPhone)) {
      setAlert({ type: 'error', text: '휴대전화 번호를 정확히 입력해주세요.' })
      return
    }

    try {
      setRequestingCode(true)
      const response = await postJson<{ message: string; demoCode?: string }>(
        '/api/auth/phone/request',
        { name: trimmedName, phone: normalizedPhone },
      )
      setIssuedCode('requested')
      setInputCode('')
      setVerified(false)
      setAlert({
        type: 'success',
        text: `${response.message}${
          response.demoCode ? ` (시연용 코드: ${response.demoCode})` : ''
        }`,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '인증번호 발송 과정에서 문제가 발생했습니다.'
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
      await postJson<{ message: string }>('/api/auth/phone/verify', {
        phone: normalizePhoneNumber(phone),
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
    const trimmedName = name.trim()
    const normalizedPhone = normalizePhoneNumber(phone)

    if (!trimmedName) {
      setAlert({ type: 'error', text: '이름을 입력해주세요.' })
      return
    }

    if (!isValidPhoneNumber(normalizedPhone)) {
      setAlert({ type: 'error', text: '휴대전화 번호를 정확히 입력해주세요.' })
      return
    }

    if (!verified) {
      setAlert({ type: 'error', text: '휴대전화 인증을 완료해주세요.' })
      return
    }

    setSubmitting(true)
    try {
      const response = await postJson<{ memberId: string; name: string; phone: string; role?: 'master' | 'member' }>(
        '/api/auth/login',
        { name: trimmedName, phone: normalizedPhone },
      )
      const role = response.role ?? (response.name === 'master' ? 'master' : 'member')
      login({ memberId: response.memberId, name: response.name, phone: response.phone, role })
      setAlert({ type: 'success', text: `${response.name}님 환영합니다. 홈으로 이동합니다.` })
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '로그인 과정에서 문제가 발생했습니다. 다시 시도해주세요.'
      setAlert({ type: 'error', text: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.description}>
            가입 시 사용한 이름과 휴대전화 번호로 인증을 완료해주세요.
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
              onChange={(event) => {
                setName(event.target.value)
                resetVerificationState()
              }}
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
                setPhone(event.target.value)
                resetVerificationState()
              }}
              placeholder="예) 01012345678"
              autoComplete="tel-national"
            />
            <p className={styles.helper}>숫자만 입력해주세요. 인증번호는 시연용으로 안내됩니다.</p>
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
            로그인
          </button>
        </form>

        <p className={styles.linkRow}>
          아직 회원이 아니신가요?
          <Link to="/signup" className={styles.link}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
