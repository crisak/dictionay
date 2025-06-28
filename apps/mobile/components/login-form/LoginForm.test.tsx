import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from './index'
import { vi, type Mock } from 'vitest'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn((password: string) => {
      return Promise.resolve(password === 'testuser@example.comA12345678')
    }),
  },
}))

describe('LoginForm Integration Tests', () => {
  beforeEach(() => {
    ;(useTranslations as Mock).mockReturnValue((key: string) => key)

    vi.clearAllMocks()

    /**
     * Spy on localStorage.setItem to track calls without altering its behavior.
     */
    vi.spyOn(window.localStorage.__proto__, 'setItem')
  })

  // Success scenario: Valid email and password
  it('logs in successfully with valid credentials', async () => {
    render(<LoginForm />)

    // Simulate user entering valid email and password
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'testuser@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'A12345678' },
    })

    // Simulate form submission
    fireEvent.click(screen.getByText('loginButton'))

    // Wait for the success flow to complete
    await waitFor(
      () => {
        // Validate localStorage is updated with user token
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'token',
          JSON.stringify({
            email: 'testuser@example.com',
            username: 'John Doe',
          }),
        )
        // Validate redirection to the profile page
        expect(redirect).toHaveBeenCalledWith('/profile')
      },
      {
        timeout: 200,
      },
    )
  })

  // Error scenario: Invalid password
  it('shows an error message when the password is invalid', async () => {
    render(<LoginForm />)

    // Simulate user entering valid email but invalid password
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'testuser@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'wrongpassword' },
    })

    // Simulate form submission
    fireEvent.click(screen.getByText('loginButton'))

    // Wait for the error flow to complete
    await waitFor(() => {
      // Validate error toast is displayed
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password', {
        id: 'login-error',
        closeButton: true,
      })
    })
  })

  // Error scenario: Missing email or password
  it('shows validation errors when fields are empty', async () => {
    render(<LoginForm />)

    // Simulate form submission without entering any data
    fireEvent.click(screen.getByText('loginButton'))

    // Wait for validation errors to appear
    await waitFor(() => {
      /**
       * Messages by default from Zod
       * - email: "Invalid email"
       * - password: "String must contain at least 8 character(s)"
       */

      // Validate error messages for empty fields
      expect(screen.getByText('Invalid email')).toBeInTheDocument()

      expect(
        screen.getByText('String must contain at least 8 character(s)'),
      ).toBeInTheDocument()
    })
  })

  // Error scenario: Password too short
  it('shows validation error when password is too short', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByPlaceholderText('email')
    const passwordInput = screen.getByPlaceholderText('password')

    // Simulate user entering valid email but short password
    fireEvent.change(emailInput, {
      target: { value: 'testuser@example.com' },
    })
    fireEvent.change(passwordInput, {
      target: { value: 'short' },
    })

    // Simulate form submission
    fireEvent.click(screen.getByText('loginButton'))

    // Wait for validation error to appear
    await waitFor(
      () => {
        // Validate error message for short password
        expect(
          screen.getByText('String must contain at least 8 character(s)'),
        ).toBeInTheDocument()
      },
      {
        timeout: 200,
      },
    )
  })
})

/**
 * Documentation for the team:
 *
 * 1. **Success Scenario**:
 *    - Simulate valid email and password input.
 *    - Validate that `localStorage` is updated with the user token.
 *    - Validate that the user is redirected to the profile page.
 *
 * 2. **Error Scenarios**:
 *    - Invalid password: Ensure an error toast is displayed.
 *    - Missing fields: Validate that required field errors are shown.
 *    - Short password: Validate that the password length error is displayed.
 *
 * 3. **Component Changes for Better Testing**:
 *    - Add `data-testid` attributes to critical elements (e.g., form fields, buttons) for easier selection in tests.
 *    - Ensure error messages are rendered in a testable way (e.g., visible text or accessible roles).
 *    - Mock external dependencies (e.g., `bcrypt.compare`, `toast`, `redirect`) to isolate the component logic.
 *
 * 4. **Best Practices**:
 *    - Write tests for both success and failure scenarios.
 *    - Use `waitFor` to handle asynchronous operations like API calls or state updates.
 *    - Clear mocks before each test to avoid state leakage between tests.
 */
