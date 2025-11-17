import { Link } from 'react-router-dom'
import type { ServiceGuidance } from '../../types/guidance'
import styles from './ServiceSummaryCard.module.css'

type ServiceSummaryCardProps = {
  service: ServiceGuidance
  variant?: 'default' | 'compact'
  onSelect?: (serviceId: string) => void
  isActive?: boolean
}

export const ServiceSummaryCard = ({
  service,
  variant = 'default',
  onSelect,
  isActive = false,
}: ServiceSummaryCardProps) => {
  const handleSelect = () => {
    if (onSelect) onSelect(service.id)
  }

  const cardClassName = `${styles.card} ${styles[variant]}${isActive ? ` ${styles.active}` : ''}`
  const linkLabel = `${service.title} 상세 안내 보기`

  return (
    <article className={cardClassName}>
      <div>
        <h3 className={styles.title}>{service.title}</h3>
        <p className={styles.summary}>{service.summary}</p>
      </div>
      <ul className={styles.eligibility}>
        {service.eligibilityHighlights.slice(0, variant === 'compact' ? 2 : 3).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {onSelect ? (
        <button
          type="button"
          className={styles.link}
          aria-label={linkLabel}
          aria-pressed={isActive}
          onClick={handleSelect}
        >
          {isActive ? '열람 중 · 접기' : '상세 안내 펼치기'}
        </button>
      ) : (
        <Link to={`/services/${service.id}`} className={styles.link} aria-label={linkLabel}>
          상세 안내 보기
        </Link>
      )}
    </article>
  )
}

export default ServiceSummaryCard
