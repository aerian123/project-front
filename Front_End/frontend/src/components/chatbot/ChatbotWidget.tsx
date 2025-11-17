import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChatMessengerInput } from './ChatMessengerInput'
import { ChatbotConversation } from './ChatbotConversation'
import styles from './ChatbotWidget.module.css'
import mascotFace from '../../img/logo_face.png'
import chatSparkle from '../../img/chat_sparkle.svg'

type ChatMessage = {
  id: string
  sender: 'user' | 'assistant'
  content: string
  tone?: 'default' | 'highlight'
  isStreaming?: boolean
}

type PersistedState = {
  open: boolean
  inputValue: string
  messages: ChatMessage[]
}

const STORAGE_KEY = 'chatbotWidgetState'
const API_ENDPOINT =
  import.meta.env.VITE_CHATBOT_ENDPOINT && import.meta.env.VITE_CHATBOT_ENDPOINT.trim().length > 0
    ? import.meta.env.VITE_CHATBOT_ENDPOINT.trim()
    : '/api/chatbot'

const generateSessionId = () => String(Date.now() % 1_000_000_000)

const sanitizeMessages = (raw: unknown): ChatMessage[] => {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null
      const sender = (entry as { sender?: unknown }).sender
      const content = (entry as { content?: unknown }).content
      const tone = (entry as { tone?: unknown }).tone
      const id = (entry as { id?: unknown }).id
      if ((sender !== 'user' && sender !== 'assistant') || typeof content !== 'string') {
        return null
      }
      const normalizedTone =
        tone === 'highlight' ? 'highlight' : tone === 'default' ? 'default' : undefined
      const normalizedId =
        typeof id === 'string' && id.trim().length > 0 ? id : `restored-${index}`
      return {
        id: normalizedId,
        sender,
        content,
        ...(normalizedTone ? { tone: normalizedTone } : {}),
      }
    })
    .filter((message): message is ChatMessage => Boolean(message))
}

// 레이아웃 레벨에 고정돼 새로고침이나 새 탭에서도 이어지는 챗봇 위젯입니다.
// 트리거 버튼 디자인을 바꾸려면 하단 JSX의 <button> 부분을, 로직을 바꾸려면 아래 상태 훅들을 편집하세요.
export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const dialogRef = useRef<HTMLElement | null>(null)
  const skipPersistRef = useRef(false)
  const sessionRef = useRef<string>(generateSessionId())
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [isOpen])

  // 저장된 스냅샷을 불러오고 다른 탭과 동기화합니다.
  // 저장 구조를 바꾸려면 PersistedState 타입과 이 함수의 JSON 처리 로직을 함께 수정해야 합니다.
  const applyPersistedState = useCallback((raw: string | null) => {
    skipPersistRef.current = true
    try {
      const parsed = raw ? (JSON.parse(raw) as Partial<PersistedState> | null) : null
      const nextOpen = Boolean(parsed?.open)
      const nextInputValue =
        parsed && typeof parsed.inputValue === 'string' ? parsed.inputValue : ''
      const nextMessages = sanitizeMessages(parsed?.messages)

      setIsOpen(nextOpen)
      setInputValue(nextInputValue)
      setMessages(nextMessages)
      setIsStreaming(false)
    } catch {
      setIsOpen(false)
      setInputValue('')
      setMessages([])
      setIsStreaming(false)
    } finally {
      setTimeout(() => {
        skipPersistRef.current = false
      }, 0)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) applyPersistedState(raw)
    } catch {
      // ignore persistence errors
    }
  }, [applyPersistedState])

  // 다른 탭에서 localStorage가 바뀌면 같은 상태로 맞춰줍니다.
  // 동기화가 불필요하면 이 useEffect를 제거하고 localStorage 이벤트 리스너를 삭제하세요.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      applyPersistedState(event.newValue)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [applyPersistedState])

  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setMessages([])
    setInputValue('')
    setIsStreaming(false)
    sessionRef.current = generateSessionId()
  }, [])

  const streamChat = useCallback(
    async (rawInput: string) => {
      const question = rawInput.trim()
      if (!question) return

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        content: question,
      }

      const assistantId = `assistant-${Date.now()}`

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, sender: 'assistant', content: '', isStreaming: true },
      ])
      setInputValue('')
      setIsStreaming(true)

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            session_id: sessionRef.current,
            input_text: question,
          }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        let assistantText = ''
        let streamEnded = false

        const extractPayload = (line: string) => {
          const trimmedLine = line.trimStart()
          if (trimmedLine.startsWith('data:')) {
            const rawPayload = trimmedLine.slice(5)
            return rawPayload.startsWith(' ') ? rawPayload.slice(1) : rawPayload
          }
          return line.trim().length > 0 ? line : null
        }

        const appendPayload = (payload: string, appendNewline: boolean) => {
          assistantText += appendNewline ? `${payload}\n` : payload
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: assistantText, isStreaming: true }
                : message,
            ),
          )
        }

        const processBuffer = () => {
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const payload = extractPayload(line)
            if (payload === null) continue
            const normalizedPayload = payload.trim()
            if (!normalizedPayload) continue
            if (normalizedPayload === '[STREAM_END]') {
              streamEnded = true
              continue
            }
            appendPayload(payload, true)
          }
        }

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          processBuffer()
          if (streamEnded) break
        }

        buffer += decoder.decode()
        processBuffer()
        const remainder = buffer.replace(/[\r\n]+$/, '')
        const remainderPayload = remainder ? extractPayload(remainder) : null
        if (remainderPayload) {
          const normalizedPayload = remainderPayload.trim()
          if (!normalizedPayload) {
            // ignore empty chunks
          } else if (normalizedPayload === '[STREAM_END]') {
            streamEnded = true
          } else {
            assistantText += remainderPayload
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId
                  ? { ...message, content: assistantText, isStreaming: false }
                  : message,
              ),
            )
          }
        }
        buffer = ''

        const trimmedAssistantText = assistantText.trim().length > 0 ? assistantText.trimEnd() : ''
        const finalText =
          trimmedAssistantText.length > 0
            ? trimmedAssistantText
            : '응답이 비어있어요. 다른 질문을 시도해 주세요.'

        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? { ...message, content: finalText, isStreaming: false }
              : message,
          ),
        )
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setMessages((prev) => prev.filter((message) => message.id !== assistantId))
          return
        }

        const fallback = '챗봇 응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? { ...message, content: fallback, tone: 'highlight', isStreaming: false }
              : message,
          ),
        )
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [],
  )

  // 스냅샷을 적용 중인 경우를 제외하고 사용자의 최근 동작을 저장합니다.
  // 저장 주기를 세밀하게 제어하려면 의존성 배열에서 필요한 값만 남겨두거나 throttle을 적용하면 됩니다.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (skipPersistRef.current) return
    const payload: PersistedState = {
      open: isOpen,
      inputValue,
      messages: messages.map(({ id, sender, content, tone }) => ({
        id,
        sender,
        content,
        ...(tone ? { tone } : {}),
      })),
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore persistence errors
    }
  }, [isOpen, inputValue, messages])

  useEffect(() => {
    if (!isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const triggerClassName = isOpen ? `${styles.trigger} ${styles.triggerHidden}` : styles.trigger

  if (typeof document === 'undefined') return null

  const helperText =
    messages.length === 0
      ? '궁금한 내용을 입력해 주세요. 예: 주민등록 등본 발급 방법'
      : 'Shift+Enter로 줄바꿈 할 수 있어요.'

  return createPortal(
    <>
      {/* 모든 페이지 우측 하단에 노출되는 마스코트 트리거 버튼입니다.
          위치를 바꾸려면 ChatbotWidget.module.css의 .trigger를 수정하세요. */}
      <button
        type="button"
        className={triggerClassName}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span className="visually-hidden">챗봇 열기</span>
        <span className={styles.triggerContent}>
          {/* 마스코트 위에 겹치는 말풍선으로 “대기 중” 느낌을 강조한다. */}
          <span className={styles.speechBubble} aria-hidden="true">
            <img src={chatSparkle} alt="" aria-hidden="true" />
            <span className={styles.speechText}>궁금한게 있으면 저를 눌러주세요</span>
          </span>
          <img className={styles.mascot} src={mascotFace} alt="" aria-hidden="true" />
        </span>
      </button>
      {isOpen && (
        <section
          ref={(node) => {
            dialogRef.current = node
          }}
          tabIndex={-1}
          role="dialog"
          aria-label="공공복지 챗봇 대화창"
          className={styles.window}
        >
          {/* 상단 바에서는 챗봇 정보와 접근성용 닫기 버튼을 제공합니다.
              타이틀 혹은 버튼 텍스트를 변경하려면 이 영역을 직접 수정하면 됩니다. */}
          <header className={styles.header}>
            <div>
              <p className={styles.lead}>공공복지 챗봇</p>
              <h2 className={styles.title}>민원 서류 준비 도우미</h2>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              닫기
            </button>
          </header>
          <div className={styles.content}>
            <div className={styles.responseArea}>
              <ChatbotConversation
                onReset={handleReset}
                messages={messages}
                isStreaming={isStreaming}
              />
            </div>
            <div className={styles.inputArea}>
              <ChatMessengerInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={(value) => {
                  void streamChat(value)
                }}
                suggestion={helperText}
              />
            </div>
          </div>
        </section>
      )}
    </>,
    document.body,
  )
}

export default ChatbotWidget
