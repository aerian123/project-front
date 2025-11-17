import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { guidanceContent } from '../../data/serviceGuidance'
import {
  getServiceDetail,
  getCategoryById,
  getServicesByCategory,
} from '../../utils/guidanceSearch'
import ServiceDetailContent from '../../components/service/ServiceDetailContent'
import styles from '../../components/service/ServiceDetailContent.module.css'

export const ServiceDetailPage = () => {
  const navigate = useNavigate()
  const { serviceId = '' } = useParams<{ serviceId: string }>()

  const detail = useMemo(() => getServiceDetail(serviceId, guidanceContent), [serviceId])

  if (!detail) {
    return (
      <div className={styles.emptyState}>
        <h1>서비스 정보를 찾을 수 없습니다</h1>
        <p>선택한 서비스가 더 이상 제공되지 않거나 주소가 잘못되었습니다.</p>
        <button type="button" onClick={() => navigate(-1)} className={styles.backButton}>
          이전 페이지로 돌아가기
        </button>
      </div>
    )
  }

  const primaryCategory = detail.categories[0]
  const relatedCategory = primaryCategory
    ? getCategoryById(primaryCategory.id, guidanceContent)
    : null
  const relatedServices = relatedCategory
    ? getServicesByCategory(relatedCategory.id, guidanceContent).filter(
        (service) => service.id !== detail.id,
      )
    : []

  return (
    <ServiceDetailContent
      detail={detail}
      relatedCategory={relatedCategory}
      relatedServices={relatedServices}
    />
  )
}

export default ServiceDetailPage
