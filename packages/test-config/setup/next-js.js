/* eslint-disable no-undef */
import './client.js'

vi.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--mock-font-sans',
  }),
  Geist_Mono: () => ({
    variable: '--mock-font-mono',
  }),
}))
