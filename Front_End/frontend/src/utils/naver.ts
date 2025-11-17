const NAVER_CLIENT_ID = 'tbn355x42m'

export interface NaverLatLng {}
export interface NaverLatLngBounds {
  extend: (latLng: NaverLatLng) => void
}
export interface NaverMapInstance {
  setCenter: (latLng: NaverLatLng) => void
  setZoom: (zoom: number) => void
  panTo: (latLng: NaverLatLng) => void
  fitBounds: (bounds: NaverLatLngBounds) => void
}
export interface NaverMarkerInstance {
  setMap: (map: NaverMapInstance | null) => void
}
export interface NaverInfoWindowInstance {
  open: (map: NaverMapInstance, marker: NaverMarkerInstance) => void
  close: () => void
  setContent: (html: string) => void
}
interface NaverMarkerOptions {
  map: NaverMapInstance
  position: NaverLatLng
  title?: string
  icon?: unknown
}
interface NaverInfoWindowOptions {
  content?: string
  borderWidth?: number
  backgroundColor?: string
  disableAnchor?: boolean
}
interface NaverMapsNamespace {
  Map: new (container: HTMLElement, options: { center: NaverLatLng; zoom?: number }) => NaverMapInstance
  LatLng: new (lat: number, lng: number) => NaverLatLng
  Marker: new (options: NaverMarkerOptions) => NaverMarkerInstance
  LatLngBounds: new (southWest: NaverLatLng, northEast: NaverLatLng) => NaverLatLngBounds
  Point: new (x: number, y: number) => unknown
  InfoWindow: new (options?: NaverInfoWindowOptions) => NaverInfoWindowInstance
  Event: {
    addListener: (target: unknown, eventName: string, handler: (...args: unknown[]) => void) => void
  }
}

declare global {
  interface Window {
    naver?: {
      maps: NaverMapsNamespace
    }
  }
}

let naverScriptPromise: Promise<void> | null = null

export const loadNaverMap = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window is not defined'))
  }
  if (window.naver && window.naver.maps) {
    return Promise.resolve()
  }
  if (!naverScriptPromise) {
    naverScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`
      script.async = true
      script.onload = () => {
        if (!window.naver || !window.naver.maps) {
          reject(new Error('naver global not available'))
          return
        }
        resolve()
      }
      script.onerror = () => reject(new Error('Naver maps script failed to load'))
      document.head.appendChild(script)
    })
  }
  return naverScriptPromise
}

export {}
