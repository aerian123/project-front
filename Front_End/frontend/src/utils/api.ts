/**
 * 백엔드(Spring Boot) REST API와 통신하는 공통 함수입니다.
 * BASE_URL은 Vite 환경 변수(VITE_API_BASE_URL)로 주입받고,
 * 값이 없으면 개발 환경 기본값(127.0.0.1:8081; Spring Boot 서버)을 사용합니다.
 */
const baseFromEnv = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
const BASE_URL = baseFromEnv || 'http://127.0.0.1:8081'

type JsonValue = Record<string, unknown> | JsonValue[] | string | number | boolean | null;

/**
 * POST 요청을 JSON 형식으로 전송합니다.
 * - 성공 시 백엔드에서 돌려준 JSON을 그대로 반환합니다.
 * - 실패하면 에러 메시지를 만들어 throw 하여 호출측에서 catch 할 수 있게 합니다.
 */
export async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${BASE_URL}${normalizedPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    // 성공 응답은 JSON으로 파싱해서 반환
    return (await response.json()) as TResponse;
  }

  // 실패 응답은 가능한 한 자세한 메시지를 추출해 에러로 던집니다.
  let message = response.statusText;
  try {
    const errorBody = (await response.json()) as { message?: JsonValue };
    if (errorBody?.message && typeof errorBody.message === 'string') {
      message = errorBody.message;
    }
  } catch {
    // JSON 파싱이 실패하면 statusText만 사용
  }

  throw new Error(message);
}

/**
 * 추후 필요 시 GET/PUT/DELETE 요청도 동일한 패턴으로 추가하면 됩니다.
 */
export async function getJson<TResponse>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<TResponse> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const query = params
    ? Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        )
        .join('&')
    : ''
  const url = query ? `${BASE_URL}${normalizedPath}?${query}` : `${BASE_URL}${normalizedPath}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(response.statusText || '요청에 실패했습니다.')
  }
  return (await response.json()) as TResponse
}
