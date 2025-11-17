import { Link } from 'react-router-dom'
import type { Category, ServiceGuidance } from '../../types/guidance'
import { Grid } from '../../layout/Grid'
import { ServiceSummaryCard } from '../service/ServiceSummaryCard'
import styles from './CategoryGrid.module.css'

type CategoryGridProps = {
  categories: Category[]
  services: ServiceGuidance[]
  onSelectService?: (serviceId: string) => void
  selectedServiceId?: string | null
}

const getServicesForCategory = (category: Category, services: ServiceGuidance[]) =>
  services.filter((service) => category.serviceIds.includes(service.id))

export const CategoryGrid = ({
  categories,
  services,
  onSelectService,
  selectedServiceId,
}: CategoryGridProps) => (
  <Grid columns="three" gap="lg">
    {categories.map((category) => {
      const categoryServices = getServicesForCategory(category, services)
      const firstServiceId = categoryServices[0]?.id
      const isCategoryActive =
        selectedServiceId != null && category.serviceIds.includes(selectedServiceId)
      return (
        <article
          key={category.id}
          className={styles.card}
          style={{ borderTopColor: category.primaryColor ?? 'var(--color-primary-sky)' }}
        >
          <header className={styles.header}>
            <h3>{category.title}</h3>
            {category.description && <p>{category.description}</p>}
          </header>
          <div className={styles.services}>
            {categoryServices.map((service) => (
              <ServiceSummaryCard
                key={service.id}
                service={service}
                variant="compact"
                onSelect={onSelectService}
                isActive={selectedServiceId === service.id}
              />
            ))}
          </div>
          {categoryServices.length > 0 && (
            <footer className={styles.footer}>
              {onSelectService && firstServiceId ? (
                <button
                  type="button"
                  className={styles.viewAll}
                  onClick={() => {
                    const targetId =
                      isCategoryActive && selectedServiceId ? selectedServiceId : firstServiceId
                    if (targetId) onSelectService(targetId)
                  }}
                  aria-pressed={isCategoryActive}
                >
                  {isCategoryActive ? '열람 중 · 접기' : '대표 안내 펼치기'}
                </button>
              ) : (
                <Link to={`/services/${categoryServices[0].id}`} className={styles.viewAll}>
                  전체 안내 보기
                </Link>
              )}
            </footer>
          )}
        </article>
      )
    })}
  </Grid>
)

export default CategoryGrid
