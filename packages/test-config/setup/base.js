/**
 * This library extends the Jest/Vitest expect() function with a set of
 * additional matchers that are very useful for testing user interfaces.
 * Specifically, it adds custom matchers that make your tests more readable
 * and expressive.
 * Example:
 * - expect(element).toBeInTheDocument() = "toBeInTheDocument"
 * - expect(element).toHaveTextContent(/text/i) = "toHaveTextContent"
 * - expect(element).toHaveAttribute('attribute', 'value') = "toHaveAttribute"
 * - expect(element).toHaveClass('class') = "toHaveClass"
 * - expect(element).toHaveStyle('style') = "toHaveStyle"
 */
import '@testing-library/jest-dom'
