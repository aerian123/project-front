import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '../../src/pages/Home/HomePage'

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </MemoryRouter>,
)

const mockFetch = vi.fn()

beforeAll(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  mockFetch.mockReset()
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('HomePage chatbot guidance', () => {
  test('renders CIVIL_PETITION_INFO results as cards after a successful search', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          infoId: 'CP_001',
          cpName: '내 생애 최초 주택 자금 대출',
          simple: '필요 서류 요약',
          descriptions: ['자금 대출 상세 안내'],
          onlineSteps: ['온라인 신청 경로'],
          offlineSteps: ['방문 신청 경로'],
        },
      ],
    } as Response)

    renderHome()
    const input = screen.getByLabelText('어떤 민원을 도와드릴까요?')
    fireEvent.change(input, { target: { value: '내 생애 최초 주택 자금 대출' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /"내 생애 최초 주택 자금 대출" 검색 결과/ })).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: '내 생애 최초 주택 자금 대출' })).toBeInTheDocument()
    expect(screen.getByText('필요 서류 요약')).toBeInTheDocument()
    expect(screen.getByText('온라인 신청')).toBeInTheDocument()
    expect(screen.getByText('방문 신청')).toBeInTheDocument()
    expect(screen.getByText('온라인 신청 경로')).toBeInTheDocument()
    expect(screen.getByText('방문 신청 경로')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '필수 서류 체크리스트' }),
    ).toBeInTheDocument()
  })

  test('shows not-found message when backend returns no records', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response)

    renderHome()
    const input = screen.getByLabelText('어떤 민원을 도와드릴까요?')
    fireEvent.change(input, { target: { value: '없는 민원' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(
        screen.getByText(/해당 민원 정보를 찾을 수 없습니다/),
      ).toBeInTheDocument()
    })
  })
})
