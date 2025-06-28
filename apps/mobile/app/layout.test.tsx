import { render } from '@testing-library/react'
import RootLayout from './layout'

vi.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--mock-font-sans',
  }),
  Geist_Mono: () => ({
    variable: '--mock-font-mono',
  }),
}))

describe('RootLayout', () => {
  it('renders the children correctly', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>,
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('renders the Toaster component', () => {
    const { container } = render(
      <RootLayout>
        <div />
      </RootLayout>,
    )

    const toaster = container.querySelector('section[aria-label="Notifications alt+T"]')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute('aria-atomic', 'false')
    expect(toaster).toHaveAttribute('aria-live', 'polite')
  })
})
