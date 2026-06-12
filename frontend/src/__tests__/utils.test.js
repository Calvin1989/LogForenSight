import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn helper', () => {
  it('should merge regular classes', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('should override conflicting classes with tailwind-merge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional-a', false && 'conditional-b')).toBe('base conditional-a')
  })

  it('should handle array of classes', () => {
    expect(cn(['p-2', 'm-2'], ['p-4', 'm-4'])).toBe('p-4 m-4')
  })
})
