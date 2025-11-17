import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './NearbyOfficesPage.module.css'
import {
  loadNaverMap,
  type NaverInfoWindowInstance,
  type NaverMapInstance,
  type NaverMarkerInstance,
} from '../../utils/naver'
import { getJson } from '../../utils/api'

type RegionOption = {
  id: string
  label: string
  center: { lat: number; lng: number }
}
type OfficeInfo = {
  id: string
  name: string
  category?: string | null
  regionCode?: RegionOption['id'] | null
  address: string
  phone?: string
  openingHours?: string
  notes?: string
  latitude: number
  longitude: number
}
const regions: RegionOption[] = [
  { id: 'gwangju-dong', label: '광주광역시 동구', center: { lat: 35.146, lng: 126.9235 } },
  { id: 'gwangju-seo', label: '광주광역시 서구', center: { lat: 35.1522, lng: 126.8912 } },
  { id: 'gwangju-nam', label: '광주광역시 남구', center: { lat: 35.1294, lng: 126.9027 } },
  { id: 'gwangju-buk', label: '광주광역시 북구', center: { lat: 35.1743, lng: 126.9121 } },
  { id: 'gwangju-gwangsan', label: '광주광역시 광산구', center: { lat: 35.1394, lng: 126.7931 } },
]

const NearbyOfficesPage = () => {
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<RegionOption['id']>(regions[0].id)
  const [offices, setOffices] = useState<OfficeInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const mapRef = useRef<NaverMapInstance | null>(null)
  const markersRef = useRef<NaverMarkerInstance[]>([])
  const officeMarkersRef = useRef<Record<string, NaverMarkerInstance>>({})
  const infoWindowRef = useRef<NaverInfoWindowInstance | null>(null)

  const filteredOffices = useMemo(
    () => offices.filter((office) => (office.regionCode ? office.regionCode === selectedRegion : true)),
    [offices, selectedRegion],
  )
  const selectedRegionInfo = regions.find((region) => region.id === selectedRegion) ?? regions[0]
  const buildInfoWindowContent = (office: OfficeInfo) => {
    const phoneLine = office.phone ? `<p>전화: ${office.phone}</p>` : ''
    const openingLine = office.openingHours ? `<p>운영: ${office.openingHours}</p>` : ''
    const notesLine = office.notes ? `<p>${office.notes}</p>` : ''
    return `
      <div class="nearby-info-window">
        <strong>${office.name}</strong>
        <p>${office.address}</p>
        ${phoneLine}
        ${openingLine}
        ${notesLine}
      </div>
    `.trim()
  }

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    setFetchError(null)
    getJson<OfficeInfo[]>('/api/offices', { regionId: selectedRegion })
      .then((data) => {
        if (ignore) return
        setOffices(data)
      })
      .catch((error) => {
        if (ignore) return
        console.error('관공서 목록을 불러오지 못했습니다.', error)
        setFetchError('관공서 정보를 불러오지 못했습니다.')
        setOffices([])
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [selectedRegion])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mapContainer = document.getElementById('nearby-map')
    if (!mapContainer) return

    let canceled = false

    loadNaverMap()
      .then(() => {
        if (canceled) return
        const container = document.getElementById('nearby-map')
        if (!container || !window.naver) return
        const center = new window.naver.maps.LatLng(regions[0].center.lat, regions[0].center.lng)
        mapRef.current = new window.naver.maps.Map(container, {
          center,
          zoom: 12,
        })
        infoWindowRef.current =
          infoWindowRef.current ??
          new window.naver.maps.InfoWindow({
            borderWidth: 0,
            backgroundColor: 'transparent',
          })
        setMapError(null)
      })
      .catch((error) => {
        console.error('네이버 지도 로드 실패', error)
        if (!canceled) {
          setMapError('지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
        }
      })

    return () => {
      canceled = true
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
      officeMarkersRef.current = {}
      infoWindowRef.current?.close()
      mapRef.current = null
      infoWindowRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!window.naver || !mapRef.current) return
    const naverMaps = window.naver.maps
    infoWindowRef.current =
      infoWindowRef.current ??
      new naverMaps.InfoWindow({
        borderWidth: 0,
        backgroundColor: 'transparent',
      })

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
    officeMarkersRef.current = {}
    infoWindowRef.current?.close()

    const regionCenter = new naverMaps.LatLng(selectedRegionInfo.center.lat, selectedRegionInfo.center.lng)

    const regionMarker = new naverMaps.Marker({
      map: mapRef.current,
      position: regionCenter,
      title: `${selectedRegionInfo.label}청`,
    })
    markersRef.current.push(regionMarker)

    if (filteredOffices.length === 0) {
      mapRef.current.setCenter(regionCenter)
      mapRef.current.setZoom(12)
      return
    }

    const bounds = new naverMaps.LatLngBounds(regionCenter, regionCenter)
    let hasExtended = false
    filteredOffices.forEach((office) => {
      const position = new naverMaps.LatLng(office.latitude, office.longitude)
      const marker = new naverMaps.Marker({
        map: mapRef.current!,
        position,
        title: office.name,
      })
      markersRef.current.push(marker)
      officeMarkersRef.current[office.id] = marker
      bounds.extend(position)
      hasExtended = true

      const openInfoWindow = () => {
        if (!mapRef.current || !infoWindowRef.current) return
        infoWindowRef.current.setContent(buildInfoWindowContent(office))
        infoWindowRef.current.open(mapRef.current, marker)
      }
      const closeInfoWindow = () => {
        infoWindowRef.current?.close()
      }

      naverMaps.Event.addListener(marker, 'mouseover', openInfoWindow)
      naverMaps.Event.addListener(marker, 'mouseout', closeInfoWindow)
      naverMaps.Event.addListener(marker, 'click', openInfoWindow)
    })
    if (hasExtended) {
      const boundsWithGuard = bounds as typeof bounds & { isEmpty?: () => boolean }
      if (typeof boundsWithGuard.isEmpty === 'function') {
        if (!boundsWithGuard.isEmpty()) {
          mapRef.current.fitBounds(bounds)
        }
      } else {
        mapRef.current.fitBounds(bounds)
      }
    }
  }, [
    filteredOffices,
    selectedRegionInfo.center.lat,
    selectedRegionInfo.center.lng,
    selectedRegionInfo.label,
  ])

  const focusOfficeOnMap = (officeId: string) => {
    if (!mapRef.current || !window.naver) return
    const target = filteredOffices.find((office) => office.id === officeId)
    if (!target) return
    const position = new window.naver.maps.LatLng(target.latitude, target.longitude)
    mapRef.current.setZoom(14)
    mapRef.current.panTo(position)
    const marker = officeMarkersRef.current[officeId]
    if (marker && infoWindowRef.current) {
      infoWindowRef.current.setContent(buildInfoWindowContent(target))
      infoWindowRef.current.open(mapRef.current, marker)
    }
  }

  return (
    <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.pageTitle}>
            <h1>가까운 관공서 찾기</h1>
            <p>내 주변의 복지·민원 기관을 지도에서 바로 확인하고, 연락처와 운영시간도 함께 살펴보세요.</p>
          </div>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="region-select">검색 지역</label>
              <select
                id="region-select"
                className={styles.selectControl}
                value={selectedRegion}
                onChange={(event) => setSelectedRegion(event.target.value)}
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.mapSection}>
            <div
              id="nearby-map"
              className={styles.mapFrame}
              aria-label="관공서 위치 지도"
            >
              {mapError ? (
                <div className={styles.mapError}>{mapError}</div>
              ) : (
                <span className={styles.mapPlaceholder}>지도 로딩 중…</span>
              )}
            </div>
            <p className={styles.mapHelper}>지도를 확대·축소하거나 마커를 눌러 상세 정보를 확인하세요.</p>
          </section>

          <section className={styles.listSection}>
            <div className={styles.regionSummary}>
              <div>
                <p className={styles.regionEyebrow}>선택한 지역</p>
                <h2>{selectedRegionInfo.label}</h2>
              </div>
              <dl className={styles.regionStats}>
                <div>
                  <dt>표시 중</dt>
                  <dd aria-live="polite">{filteredOffices.length}곳</dd>
                </div>
              </dl>
            </div>
            {fetchError && (
              <div className={styles.emptyState}>
                <strong>{fetchError}</strong>
                <span>잠시 후 다시 시도해 주세요.</span>
              </div>
            )}
            {!fetchError && isLoading && (
              <div className={styles.emptyState}>
                <strong>관공서 정보를 불러오는 중입니다…</strong>
              </div>
            )}
            {!fetchError && !isLoading && filteredOffices.length === 0 ? (
              <div className={styles.emptyState}>
                <strong>{selectedRegionInfo.label}에서 등록된 관공서를 찾지 못했습니다.</strong>
                <span>다른 지역을 선택하거나 나중에 다시 확인해 주세요.</span>
              </div>
            ) : (
              <div className={styles.cardsGrid}>
                {filteredOffices.map((office) => (
                  <article key={office.id} className={styles.officeCard}>
                    <header>
                      <div>
                        <h3>{office.name}</h3>
                      </div>
                      <button
                        type="button"
                        className={styles.focusButton}
                        onClick={() => focusOfficeOnMap(office.id)}
                      >
                        지도에서 보기
                      </button>
                    </header>
                    <p className={styles.meta}>{office.address}</p>
                    {office.notes && <p className={styles.meta}>{office.notes}</p>}
                    <dl className={styles.metaList}>
                      {office.phone && (
                        <div>
                          <dt>전화</dt>
                          <dd>{office.phone}</dd>
                        </div>
                      )}
                      {office.openingHours && (
                        <div>
                          <dt>운영 시간</dt>
                          <dd>{office.openingHours}</dd>
                        </div>
                      )}
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }

  export default NearbyOfficesPage
