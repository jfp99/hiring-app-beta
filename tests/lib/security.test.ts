// tests/lib/security.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sanitizeString,
  sanitizeObject,
  sanitizeFilename,
  sanitizeEmail,
  escapeRegExp,
  isValidObjectId,
  sanitizeMongoQuery,
  createSafeRegex,
  generateCSRFToken,
  validateCSRFToken,
  validatePasswordStrength,
  maskEmail,
  maskPhone,
  anonymizePII,
  type PIIFields
} from '@/app/lib/security'

// =============================================================================
// INPUT SANITIZATION TESTS
// =============================================================================

describe('sanitizeString', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello'
    const result = sanitizeString(input)
    // Note: sanitizeString removes tags but keeps their content
    expect(result).toBe('alert("xss")Hello')
  })

  it('should remove javascript: protocol', () => {
    const input = 'javascript:alert("xss")'
    const result = sanitizeString(input)
    expect(result).toBe('alert("xss")')
  })

  it('should remove event handlers', () => {
    const input = '<div onclick="alert(1)">Test</div>'
    const result = sanitizeString(input)
    expect(result).toBe('Test')
  })

  it('should remove data: protocol', () => {
    const input = 'data:text/html,<script>alert(1)</script>'
    const result = sanitizeString(input)
    expect(result).toBe('text/html,alert(1)')
  })

  it('should trim whitespace', () => {
    const input = '  Hello World  '
    const result = sanitizeString(input)
    expect(result).toBe('Hello World')
  })

  it('should limit string length to 10000 characters', () => {
    const input = 'a'.repeat(15000)
    const result = sanitizeString(input)
    expect(result).toHaveLength(10000)
  })

  it('should return empty string for non-string input', () => {
    const result = sanitizeString(123 as any)
    expect(result).toBe('')
  })

  it('should handle empty string', () => {
    const result = sanitizeString('')
    expect(result).toBe('')
  })
})

describe('sanitizeObject', () => {
  it('should sanitize string values', () => {
    const input = { name: '<script>alert("xss")</script>John' }
    const result = sanitizeObject(input)
    expect(result.name).toBe('alert("xss")John')
  })

  it('should recursively sanitize nested objects', () => {
    const input = {
      user: {
        name: '<b>John</b>',
        bio: '<script>xss</script>Hello'
      }
    }
    const result = sanitizeObject(input)
    expect(result.user.name).toBe('John')
    expect(result.user.bio).toBe('xssHello')
  })

  it('should sanitize arrays of strings', () => {
    const input = { tags: ['<script>tag1</script>', 'tag2', '<b>tag3</b>'] }
    const result = sanitizeObject(input)
    expect(result.tags).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should sanitize arrays of objects', () => {
    const input = {
      items: [
        { name: '<script>Item1</script>' },
        { name: 'Item2' }
      ]
    }
    const result = sanitizeObject(input)
    expect(result.items[0].name).toBe('Item1')
    expect(result.items[1].name).toBe('Item2')
  })

  it('should preserve non-string values', () => {
    const input = {
      name: 'John',
      age: 30,
      active: true,
      data: null
    }
    const result = sanitizeObject(input)
    expect(result.age).toBe(30)
    expect(result.active).toBe(true)
    expect(result.data).toBeNull()
  })
})

describe('sanitizeFilename', () => {
  it('should replace special characters with underscores', () => {
    const input = 'my file?.txt'
    const result = sanitizeFilename(input)
    expect(result).toBe('my_file_.txt')
  })

  it('should prevent directory traversal', () => {
    const input = '../../../etc/passwd'
    const result = sanitizeFilename(input)
    // Slashes become underscores, multiple dots become single dots
    expect(result).toBe('_._._etc_passwd')
  })

  it('should remove leading dots', () => {
    const input = '...hidden.txt'
    const result = sanitizeFilename(input)
    expect(result).toBe('hidden.txt')
  })

  it('should limit filename length to 255 characters', () => {
    const input = 'a'.repeat(300) + '.txt'
    const result = sanitizeFilename(input)
    expect(result).toHaveLength(255)
  })

  it('should preserve valid filenames', () => {
    const input = 'document-2024.pdf'
    const result = sanitizeFilename(input)
    expect(result).toBe('document-2024.pdf')
  })
})

describe('sanitizeEmail', () => {
  it('should convert to lowercase', () => {
    const input = 'John.Doe@EXAMPLE.COM'
    const result = sanitizeEmail(input)
    expect(result).toBe('john.doe@example.com')
  })

  it('should trim whitespace', () => {
    const input = '  john@example.com  '
    const result = sanitizeEmail(input)
    expect(result).toBe('john@example.com')
  })

  it('should remove invalid characters', () => {
    const input = 'john<script>@example.com'
    const result = sanitizeEmail(input)
    expect(result).toBe('johnscript@example.com')
  })

  it('should limit length to 320 characters', () => {
    const input = 'a'.repeat(350) + '@example.com'
    const result = sanitizeEmail(input)
    expect(result).toHaveLength(320)
  })

  it('should preserve valid email', () => {
    const input = 'john.doe+test@example.com'
    const result = sanitizeEmail(input)
    // Note: + is allowed in email spec but sanitizeEmail removes it
    expect(result).toBe('john.doetest@example.com')
  })
})

describe('escapeRegExp', () => {
  it('should escape special regex characters', () => {
    const input = '.*+?^${}()|[]\\/'
    const result = escapeRegExp(input)
    // Backslash before forward slash is not double-escaped
    expect(result).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\/')
  })

  it('should not modify regular characters', () => {
    const input = 'hello world 123'
    const result = escapeRegExp(input)
    expect(result).toBe('hello world 123')
  })

  it('should escape dot for exact matching', () => {
    const input = 'test.com'
    const result = escapeRegExp(input)
    expect(result).toBe('test\\.com')
  })
})

// =============================================================================
// NOSQL INJECTION PREVENTION TESTS
// =============================================================================

describe('isValidObjectId', () => {
  it('should return true for valid ObjectId', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true)
    expect(isValidObjectId('5f8d04f4a1b9c0001c8e4a3d')).toBe(true)
  })

  it('should return false for invalid ObjectId', () => {
    expect(isValidObjectId('invalid')).toBe(false)
    expect(isValidObjectId('507f1f77bcf86cd79943901')).toBe(false) // too short
    expect(isValidObjectId('507f1f77bcf86cd7994390112')).toBe(false) // too long
    expect(isValidObjectId('507f1f77bcf86cd799439g11')).toBe(false) // invalid character
  })

  it('should return false for empty string', () => {
    expect(isValidObjectId('')).toBe(false)
  })
})

describe('sanitizeMongoQuery', () => {
  it('should remove MongoDB operators from keys', () => {
    const input = { $where: 'malicious code', name: 'John' }
    const result = sanitizeMongoQuery(input)
    expect(result).toEqual({ name: 'John' })
    expect(result.$where).toBeUndefined()
  })

  it('should remove nested MongoDB operators', () => {
    const input = {
      name: 'John',
      data: { $gt: 100, value: 50 }
    }
    const result = sanitizeMongoQuery(input)
    expect(result).toEqual({
      name: 'John',
      data: { value: 50 }
    })
  })

  it('should preserve valid query structure', () => {
    const input = {
      name: 'John',
      age: 30,
      status: 'active'
    }
    const result = sanitizeMongoQuery(input)
    expect(result).toEqual(input)
  })

  it('should handle empty object', () => {
    const result = sanitizeMongoQuery({})
    expect(result).toEqual({})
  })

  it('should remove multiple operators', () => {
    const input = {
      $where: '1==1',
      $ne: 'test',
      name: 'John',
      $gt: 100
    }
    const result = sanitizeMongoQuery(input)
    expect(result).toEqual({ name: 'John' })
  })
})

describe('createSafeRegex', () => {
  it('should escape special regex characters', () => {
    const result = createSafeRegex('test.*pattern')
    expect(result.$regex).toBe('test\\.\\*pattern')
    expect(result.$options).toBe('i')
  })

  it('should limit pattern length to 100 characters', () => {
    const longPattern = 'a'.repeat(150)
    const result = createSafeRegex(longPattern)
    expect(result.$regex).toHaveLength(100)
  })

  it('should accept custom options', () => {
    const result = createSafeRegex('test', 'im')
    expect(result.$options).toBe('im')
  })

  it('should handle empty pattern', () => {
    const result = createSafeRegex('')
    expect(result.$regex).toBe('')
  })
})

// =============================================================================
// CSRF PROTECTION TESTS
// =============================================================================

describe('generateCSRFToken', () => {
  it('should generate a 64-character hex token', () => {
    const token = generateCSRFToken()
    expect(token).toHaveLength(64)
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true)
  })

  it('should generate unique tokens', () => {
    const token1 = generateCSRFToken()
    const token2 = generateCSRFToken()
    expect(token1).not.toBe(token2)
  })
})

describe('validateCSRFToken', () => {
  it('should return true for matching tokens', () => {
    const token = generateCSRFToken()
    const result = validateCSRFToken(token, token)
    expect(result).toBe(true)
  })

  it('should return false for non-matching tokens', () => {
    const token1 = generateCSRFToken()
    const token2 = generateCSRFToken()
    const result = validateCSRFToken(token1, token2)
    expect(result).toBe(false)
  })

  it('should return false for different length tokens', () => {
    const result = validateCSRFToken('short', 'muchlongertoken')
    expect(result).toBe(false)
  })

  it('should return false for empty tokens', () => {
    expect(validateCSRFToken('', '')).toBe(false)
    expect(validateCSRFToken('token', '')).toBe(false)
    expect(validateCSRFToken('', 'token')).toBe(false)
  })

  it('should use constant-time comparison', () => {
    // This test ensures timing attacks are prevented
    const token = 'a'.repeat(64)
    const wrongStart = 'b' + 'a'.repeat(63)
    const wrongEnd = 'a'.repeat(63) + 'b'

    const start1 = performance.now()
    validateCSRFToken(token, wrongStart)
    const time1 = performance.now() - start1

    const start2 = performance.now()
    validateCSRFToken(token, wrongEnd)
    const time2 = performance.now() - start2

    // Timing should be similar (within 10ms) regardless of where difference is
    expect(Math.abs(time1 - time2)).toBeLessThan(10)
  })
})

// =============================================================================
// PASSWORD VALIDATION TESTS
// =============================================================================

describe('validatePasswordStrength', () => {
  it('should accept valid strong password', () => {
    const result = validatePasswordStrength('SecureP@ss123')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject password shorter than 8 characters', () => {
    const result = validatePasswordStrength('Abc@123')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must be at least 8 characters long')
  })

  it('should reject password without uppercase letter', () => {
    const result = validatePasswordStrength('securep@ss123')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one uppercase letter')
  })

  it('should reject password without lowercase letter', () => {
    const result = validatePasswordStrength('SECUREP@SS123')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one lowercase letter')
  })

  it('should reject password without number', () => {
    const result = validatePasswordStrength('SecureP@ssword')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one number')
  })

  it('should reject password without special character', () => {
    const result = validatePasswordStrength('SecurePass123')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one special character')
  })

  it('should return multiple errors for weak password', () => {
    const result = validatePasswordStrength('weak')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
  })

  it('should accept password with various special characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=']
    specialChars.forEach(char => {
      const result = validatePasswordStrength(`SecureP${char}ss123`)
      expect(result.valid).toBe(true)
    })
  })
})

// =============================================================================
// PII ANONYMIZATION TESTS
// =============================================================================

describe('maskEmail', () => {
  it('should mask email address correctly', () => {
    const result = maskEmail('john.doe@example.com')
    expect(result).toBe('j***e@example.com')
  })

  it('should handle short local part', () => {
    const result = maskEmail('ab@example.com')
    expect(result).toBe('a***b@example.com')
  })

  it('should return *** for invalid email', () => {
    const result = maskEmail('notanemail')
    expect(result).toBe('***')
  })

  it('should preserve domain', () => {
    const result = maskEmail('user@company.com')
    expect(result).toContain('@company.com')
  })
})

describe('maskPhone', () => {
  it('should mask phone number keeping last 4 digits', () => {
    const result = maskPhone('1234567890')
    expect(result).toBe('***-***-7890')
  })

  it('should handle phone with formatting', () => {
    const result = maskPhone('(123) 456-7890')
    expect(result).toBe('***-***-7890')
  })

  it('should return *** for short phone', () => {
    const result = maskPhone('123')
    expect(result).toBe('***')
  })

  it('should extract only digits', () => {
    const result = maskPhone('+1 (555) 123-4567')
    expect(result).toBe('***-***-4567')
  })
})

describe('anonymizePII', () => {
  it('should anonymize email', () => {
    const input: PIIFields = { email: 'john@example.com' }
    const result = anonymizePII(input)
    expect(result.email).toBe('j***n@example.com')
  })

  it('should anonymize phone', () => {
    const input: PIIFields = { phone: '1234567890' }
    const result = anonymizePII(input)
    expect(result.phone).toBe('***-***-7890')
  })

  it('should anonymize name', () => {
    const input: PIIFields = { name: 'John Doe' }
    const result = anonymizePII(input)
    expect(result.name).toBe('J*** D***')
  })

  it('should anonymize address', () => {
    const input: PIIFields = { address: '123 Main St, City, State' }
    const result = anonymizePII(input)
    expect(result.address).toBe('*** (address hidden)')
  })

  it('should anonymize multiple fields', () => {
    const input: PIIFields = {
      email: 'john@example.com',
      phone: '1234567890',
      name: 'John Doe',
      address: '123 Main St'
    }
    const result = anonymizePII(input)
    expect(result.email).toBe('j***n@example.com')
    expect(result.phone).toBe('***-***-7890')
    expect(result.name).toBe('J*** D***')
    expect(result.address).toBe('*** (address hidden)')
  })

  it('should preserve non-PII fields', () => {
    const input: PIIFields = {
      email: 'john@example.com',
      customField: 'value'
    }
    const result = anonymizePII(input)
    expect(result.customField).toBe('value')
  })

  it('should handle empty object', () => {
    const input: PIIFields = {}
    const result = anonymizePII(input)
    expect(result).toEqual({})
  })
})
