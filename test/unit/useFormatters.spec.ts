import { describe, it, expect } from 'vitest'
import { useFormatters } from '~/composables/useFormatters'

describe('useFormatters', () => {
  const { formatPrice, formatDate } = useFormatters()

  // Tests for formatPrice
  describe('formatPrice', () => {
    it('should format a positive number into JPY currency format', () => {
      expect(formatPrice(1000)).toBe('￥1,000')
    })

    it('should format zero correctly', () => {
      expect(formatPrice(0)).toBe('￥0')
    })

    it('should handle large numbers', () => {
      expect(formatPrice(1234567)).toBe('￥1,234,567')
    })

    it('should return "N/A" for null input', () => {
      expect(formatPrice(null)).toBe('N/A')
    })

    it('should return "N/A" for NaN input', () => {
      expect(formatPrice(NaN)).toBe('N/A')
    })
  })

  // Tests for formatDate
  describe('formatDate', () => {
    it('should format a valid date string to YYYY/MM/DD', () => {
      // Note: The result depends on the test runner's timezone.
      // Using a specific ISO string ensures consistency.
      // '2023-04-01T12:00:00Z' is April 1st in UTC.
      const dateString = '2023-04-01T12:00:00Z'
      expect(formatDate(dateString)).toBe('2023/04/01')
    })

    it('should format a Date object to YYYY/MM/DD', () => {
      // Using UTC to avoid timezone issues during testing.
      const dateObject = new Date(Date.UTC(2025, 11, 25)) // Month is 0-indexed, so 11 is December
      expect(formatDate(dateObject)).toBe('2025/12/25')
    })

    it('should pad month and day with a leading zero if needed', () => {
      const dateObject = new Date(Date.UTC(2024, 0, 5)) // Month 0 is January
      expect(formatDate(dateObject)).toBe('2024/01/05')
    })

    it('should return an empty string for an invalid date string', () => {
      expect(formatDate('not a real date')).toBe('')
    })

    it('should return an empty string for null input', () => {
      expect(formatDate(null)).toBe('')
    })

    it('should return an empty string for undefined input', () => {
      expect(formatDate(undefined)).toBe('')
    })
  })
})
