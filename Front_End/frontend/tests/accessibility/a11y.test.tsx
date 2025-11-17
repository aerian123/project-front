import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, test } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '../../src/pages/Home/HomePage'
import { ServiceDetailPage } from '../../src/pages/ServiceDetail/ServiceDetailPage'

describe('Accessibility regressions', () => {
  test('home page is free of critical accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>,
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('service detail page meets accessibility expectations', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/services/basic-pension']}>
        <Routes>
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
