import { useId } from 'react'
import type { FormEvent } from 'react'
import styles from './ChatMessengerInput.module.css'

type ChatMessengerInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  suggestion: string
}

// NOTE: 챗봇 입력창 컴포넌트
// 사용자가 질문을 입력하고 전송할 수 있는 간단한 폼 입니다.
export const ChatMessengerInput = ({
  value,
  onChange,
  onSubmit,
  suggestion,
}: ChatMessengerInputProps) => {
  const inputId = useId()
  const helperId = `${inputId}-helper`

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // 엔터를 눌러도 form submit이 발생하는데, 공백만 있는 입력은 전송하지 않도록 합니다.
    onSubmit(value.trim())
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* 화면읽기 지원을 위해 label과 helper를 명확히 연결해 둡니다. */}
      <label className={styles.label} htmlFor={inputId}>
        어떤 민원을 도와드릴까요?
      </label>
      <div className={styles.field}>
        <input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="예: 내 생애 최초 주택 자금 대출"
          aria-describedby={helperId}
        />
        <button type="submit" className={styles.submit}>
          전송
        </button>
      </div>
      <p id={helperId} className={styles.helper}>
        {suggestion}
      </p>
    </form>
  )
}

export default ChatMessengerInput
