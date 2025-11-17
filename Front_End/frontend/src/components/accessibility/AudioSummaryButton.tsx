import { useContext } from 'react'
import { AccessibilityContext } from '../../layout/AccessibilityContext'
import styles from './AudioSummaryButton.module.css'

type AudioSummaryButtonProps = {
  text: string
}

export const AudioSummaryButton = ({ text }: AudioSummaryButtonProps) => {
  const accessibility = useContext(AccessibilityContext)
  if (!accessibility) {
    return null
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => accessibility.playAudioSummary(text)}
    >
      음성 안내 듣기
    </button>
  )
}

export default AudioSummaryButton
