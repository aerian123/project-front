import { useId } from 'react'
import type { FormEvent } from 'react'
import styles from './ChatbotInput.module.css'

type ChatbotInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  suggestion: string
}

export const ChatbotInput = ({ value, onChange, onSubmit, suggestion }: ChatbotInputProps) => {
  const inputId = useId()
  const helperId = `${inputId}-helper`

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(value.trim())
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
          검색하기
        </button>
      </div>
      <p id={helperId} className={styles.helper}>
        {suggestion}
      </p>
    </form>
  )
}

export default ChatbotInput
