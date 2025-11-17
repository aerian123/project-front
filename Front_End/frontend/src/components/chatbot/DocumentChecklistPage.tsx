import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getServiceDetail } from '../../utils/guidanceSearch'
import {
  CASES_STORAGE_KEY,
  CASES_UPDATED_EVENT,
  getCaseByServiceId,
  type CaseTrackerStatus,
  upsertCase,
} from '../../utils/caseTracker'
import styles from './DocumentChecklistPage.module.css'
import {
  loadNaverMap,
  type NaverInfoWindowInstance,
  type NaverLatLng,
  type NaverMarkerInstance,
} from '../../utils/naver'
import { getJson } from '../../utils/api'
import type { CivilPetition } from '../../types/civilPetition'
import type { ServiceGuidanceDetail } from '../../types/guidance'
// 🚀 ================= [여기에 삽입] ================= 🚀
//

// 👈 [추가] OfficeCategory 정의 (OfficeInfo가 사용)
type OfficeCategory = 'all' | 'welfare' | 'civil' | 'employment'

// 👈 [추가] 관공서 정보 타입 (NearbyOfficesPage.tsx에서 복사)
type OfficeInfo = {
  id: string
  name: string
  category: OfficeCategory
  regionCode?: string | null
  address: string
  phone?: string
  openingHours?: string
  notes?: string
  latitude: number
  longitude: number
}
type OfficeWithDistance = OfficeInfo & { distanceKm: number }

type LatLngInstance = NaverLatLng & {
  lat: () => number
  lng: () => number
}

// 브라우저 위치와 관공서 사이의 실제 거리를 계산해 마커 색을 결정한다.
const haversineDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const formatDistance = (distanceKm: number) => {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`
  return `${distanceKm.toFixed(1)}km`
}

const getMarkerColor = (distanceKm: number) => {
  if (distanceKm <= 0.5) return '#2563eb'
  if (distanceKm <= 1) return '#facc15'
  return '#ef4444'
}

// 🚀 ================= [여기까지 삽입] ================= 🚀

const DocumentChecklistPage = () => {
  const { serviceId } = useParams()
  const id = serviceId!
  const detail = useMemo<ServiceGuidanceDetail | null>(() => getServiceDetail(id) ?? null, [id])
  const location = useLocation()
  const initialState = (location.state as { petition?: CivilPetition } | null) ?? null
  const [civilPetition, setCivilPetition] = useState<CivilPetition | null>(() => {
    if (initialState?.petition && initialState.petition.infoId === id) {
      return initialState.petition
    }
    return null
  })
  const [isLoadingPetition, setIsLoadingPetition] = useState(false)
  const [petitionError, setPetitionError] = useState<string | null>(null)

  useEffect(() => {
    if (detail || civilPetition || isLoadingPetition) return
    let isMounted = true
    setIsLoadingPetition(true)
    getJson<CivilPetition>(`/api/civil-petitions/${id}`)
      .then((data) => {
        if (!isMounted) return
        setCivilPetition(data)
        setPetitionError(null)
      })
      .catch((error) => {
        console.error('민원 세부 정보를 불러오지 못했습니다.', error)
        if (!isMounted) return
        setPetitionError('민원 세부 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoadingPetition(false)
      })

    return () => {
      isMounted = false
    }
  }, [detail, civilPetition, id, isLoadingPetition])

  if (detail) {
    return <StaticChecklistView detail={detail} serviceId={id} />
  }

  if (isLoadingPetition) {
    return (
      <div className={styles.page}>
        <p>민원 세부 정보를 불러오는 중입니다…</p>
      </div>
    )
  }

  if (petitionError) {
    return (
      <div className={styles.page}>
        <p>{petitionError}</p>
      </div>
    )
  }

  if (civilPetition) {
    return <CivilChecklistView petition={civilPetition} />
  }

  return (
    <div className={styles.page}>
      <p>표시할 민원 정보를 찾을 수 없습니다.</p>
    </div>
  )
}

type StaticChecklistProps = {
  detail: ServiceGuidanceDetail
  serviceId: string
}

const StaticChecklistView = ({ detail, serviceId }: StaticChecklistProps) => {
  const navigate = useNavigate()
  const docs = detail.documentChecklistDetails
  const mapContainerId = `service-map-${serviceId}`
  const infoWindowRef = useRef<NaverInfoWindowInstance | null>(null)
  const [caseStatus, setCaseStatus] = useState<CaseTrackerStatus>(() => {
    const entry = getCaseByServiceId(serviceId)
    return entry?.status ?? 'idle'
  })

  // ✅ 페이지 진입 시 상단으로 이동
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncCaseStatus = () => {
      const entry = getCaseByServiceId(serviceId)
      setCaseStatus(entry?.status ?? 'idle')
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CASES_STORAGE_KEY) syncCaseStatus()
    }

    const handleCasesUpdated = () => syncCaseStatus()

    syncCaseStatus()

    window.addEventListener('storage', handleStorage)
    window.addEventListener(CASES_UPDATED_EVENT, handleCasesUpdated)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CASES_UPDATED_EVENT, handleCasesUpdated)
    }
  }, [serviceId])

  // ✅ 네이버 지도 + 현재 위치 + 가까운 관공서 표시
  useEffect(() => {
    if (typeof window === 'undefined') return

    let markers: NaverMarkerInstance[] = []
    let canceled = false

    loadNaverMap()
      .then(() => {
        if (canceled) return
        const container = document.getElementById(mapContainerId)
        if (!container || !window.naver) return

        const naver = window.naver.maps
        infoWindowRef.current =
          infoWindowRef.current ??
          new naver.InfoWindow({
            borderWidth: 0,
            backgroundColor: 'transparent',
          })

        const buildInfoWindowContent = (office: OfficeWithDistance) => {
          const phoneLine = office.phone ? `<p>전화: ${office.phone}</p>` : ''
          const openingLine = office.openingHours ? `<p>운영: ${office.openingHours}</p>` : ''
          const notesLine = office.notes ? `<p>${office.notes}</p>` : ''
          return `
            <div class="nearby-info-window">
              <strong>${office.name}</strong>
              <p>${office.address}</p>
              <p>거리: ${formatDistance(office.distanceKm)}</p>
              ${phoneLine}
              ${openingLine}
              ${notesLine}
            </div>
          `.trim()
        }

        // (1) 지도 초기화 함수
        const initializeMap = (centerLatLng: LatLngInstance, nearbyOffices: OfficeWithDistance[]) => {
          const initializedMap = new naver.Map(container, {
            center: centerLatLng,
            zoom: 14,
          })

          // 현재 위치 마커
          new naver.Marker({
            map: initializedMap,
            position: centerLatLng,
            title: '현재 위치',
            icon: {
              content: `<div style="width:20px;height:20px;background-color:#007aff;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>`,
              anchor: new naver.Point(10, 10),
            },
          })

          // 단일 InfoWindow 인스턴스를 재사용해 hover/클릭마다 내용을 갈아 끼운다.
          const openInfoWindow = (office: OfficeWithDistance, marker: NaverMarkerInstance) => {
            if (!infoWindowRef.current) return
            infoWindowRef.current.setContent(buildInfoWindowContent(office))
            infoWindowRef.current.open(initializedMap, marker)
          }
          const closeInfoWindow = () => infoWindowRef.current?.close()

          // 가까운 관공서 마커
          nearbyOffices.forEach((office) => {
            const pos = new naver.LatLng(office.latitude, office.longitude)
            const marker = new naver.Marker({
              map: initializedMap,
              position: pos,
              title: office.name,
              icon: {
                content: `
                  <div style="
                    width:20px;
                    height:20px;
                    border-radius:50%;
                    border:3px solid #fff;
                    background:${getMarkerColor(office.distanceKm)};
                    box-shadow:0 4px 10px rgba(15,23,42,0.35);
                  "></div>
                `,
                anchor: new naver.Point(10, 10),
              },
            })
            markers.push(marker)

            naver.Event.addListener(marker, 'mouseover', () => openInfoWindow(office, marker))
            naver.Event.addListener(marker, 'mouseout', closeInfoWindow)
            naver.Event.addListener(marker, 'click', () => openInfoWindow(office, marker))
          })
        }

        // (2) 서버에서 가까운 관공서 데이터 가져오기
        const fetchNearbyData = (userLocation: LatLngInstance) => {
          const lat = userLocation.lat()
          const lng = userLocation.lng()
          const radius = 5 // 반경 5km

          getJson<OfficeInfo[]>(
            `/api/offices/nearby?lat=${lat}&lng=${lng}&radiusKm=${radius}`,
          )
            .then((data) => {
              const withDistance = data
                .map<OfficeWithDistance>((office) => ({
                  ...office,
                  distanceKm: haversineDistanceKm(lat, lng, office.latitude, office.longitude),
                }))
                .sort((a, b) => a.distanceKm - b.distanceKm)
              initializeMap(userLocation, withDistance)
            })
            .catch((err) => {
              console.error('가까운 관공서 로드 실패:', err)
              initializeMap(userLocation, [])
            })
        }

        // (3) 브라우저 위치 요청
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userLoc = new naver.LatLng(pos.coords.latitude, pos.coords.longitude) as LatLngInstance
              fetchNearbyData(userLoc)
            },
            (err) => {
              console.warn('위치정보 접근 거부:', err)
              const defaultLoc = new naver.LatLng(35.1595454, 126.8526012) as LatLngInstance
              initializeMap(defaultLoc, [])
            },
          )
        } else {
          const defaultLoc = new naver.LatLng(35.1595454, 126.8526012) as LatLngInstance
          initializeMap(defaultLoc, [])
        }
      })
      .catch((error) => console.error('네이버 지도 로드 실패', error))

    return () => {
      canceled = true
      markers.forEach((m) => m.setMap(null))
      markers = []
      infoWindowRef.current?.close()
    }
  }, [mapContainerId])

  const docFormats: Record<string, string> = {
    download: '온라인 다운로드',
    'in-person': '방문 발급',
    copy: '사본 제출',
  }

  const statusLabelMap: Record<CaseTrackerStatus, string> = {
    idle: '미진행',
    'in-progress': '진행 중',
    completed: '완료',
  }
  const statusLabel = statusLabelMap[caseStatus] ?? '미진행'

  const handleStartCase = () => {
    upsertCase(detail)
    setCaseStatus('in-progress')
    navigate('/my-complaints')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.lead}>필수 서류 체크리스트</p>
          <h1>{detail.title}</h1>
          <p className={styles.summary}>{detail.summary}</p>
        </div>
        <div className={styles.docStats}>
          총 <strong>{docs.length}</strong>건
        </div>
      </header>

      {/* 표 기반 체크리스트 */}
      <section className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">서류명</th>
              <th scope="col">발급기관</th>
              <th scope="col">발급 방법</th>
              <th scope="col">준비 메모</th>
              <th scope="col">첨부</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id}>
                <td className={styles.nameCell}>
                  <span>{doc.name}</span>
                  {doc.validityPeriod && (
                    <span className={styles.docHint}>유효기간 {doc.validityPeriod}</span>
                  )}
                </td>
                <td className={styles.metaCell}>
                  <p className={styles.docIssuer}>{doc.issuingAuthority}</p>
                  {doc.fee && <span className={styles.docHint}>수수료 {doc.fee}</span>}
                </td>
                <td>
                  <div className={styles.formatChips}>
                    {doc.availableFormats.map((format) => (
                      <span key={format} className={styles.formatChip}>
                        {docFormats[format] ?? format}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{doc.preparationNotes ?? '-'}</td>
                <td>
                  {doc.downloadUrl ? (
                    <a href={doc.downloadUrl} target="_blank" rel="noreferrer">
                      내려받기
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <div className={styles.actionCard}>
          <div>
            <h2>신청 진행 상태</h2>
            <p className={styles.actionDescription}>
              진행하기를 누르면 나의 민원으로 이동하여 체크리스트를 활용하실 수 있습니다.{' '}
            </p>
            <span className={styles.statusBadge}>현재 상태: {statusLabel}</span>
          </div>
          {/* 진행하기 버튼: 체크리스트 뷰에서도 언제든 노출합니다. */}
          <button type="button" className={styles.actionButton} onClick={handleStartCase}>
            진행하기
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>상담 및 방문 안내</h2>
        </div>
        <div className={styles.supportGrid}>
          <div className={styles.mapRow}>
            <div className={styles.mapPanel}>
              <h3>가까운 관공서</h3>
              <div
                id={mapContainerId}
                className={styles.mapFrame}
                aria-label="관공서 위치 지도 영역"
              >
                {/* TODO: 지도 API 연동 시 이 컨테이너에 지도를 그려주세요. */}
                {/* <span>지도 API 연동 준비 중입니다.</span> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

type CivilChecklistViewProps = {
  petition: CivilPetition
}

const CivilChecklistView = ({ petition }: CivilChecklistViewProps) => {
  const sequence = useMemo(() => {
    const onlineRows = petition.onlineSteps.map((content, index) => ({
      id: `online-${index}`,
      order: index + 1,
      type: '온라인 신청',
      content,
    }))
    const offlineRows = petition.offlineSteps.map((content, index) => ({
      id: `offline-${index}`,
      order: petition.onlineSteps.length + index + 1,
      type: '방문 신청',
      content,
    }))
    return [...onlineRows, ...offlineRows]
  }, [petition.onlineSteps, petition.offlineSteps])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.lead}>필수 안내 절차</p>
          <h1>{petition.cpName}</h1>
          <p className={styles.summary}>{petition.simple}</p>
        </div>
      </header>

      {petition.descriptions.length > 0 && (
        <section className={styles.section}>
          <h2>상세 안내</h2>
          <ul className={styles.bulletList}>
            {petition.descriptions.map((text, index) => (
              <li key={`${petition.infoId}-desc-${index}`}>{text}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h2>처리 순서</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">순서</th>
              <th scope="col">구분</th>
              <th scope="col">안내</th>
            </tr>
          </thead>
          <tbody>
            {sequence.length === 0 && (
              <tr>
                <td colSpan={3}>표시할 단계가 없습니다.</td>
              </tr>
            )}
            {sequence.map((row) => (
              <tr key={row.id}>
                <td>{row.order}</td>
                <td>
                  <span className={styles.sequenceChip}>{row.type}</span>
                </td>
                <td>{row.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default DocumentChecklistPage
