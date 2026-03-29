import { describe, it, expect } from 'vitest'
import { isValidDomain } from '../domain-validator'

describe('isValidDomain', () => {
  describe('geçerli domainler', () => {
    it('basit domain kabul eder', () => {
      expect(isValidDomain('example.com')).toBe(true)
    })
    it('alt domain kabul eder', () => {
      expect(isValidDomain('ads.example.com')).toBe(true)
    })
    it('derin alt domain kabul eder', () => {
      expect(isValidDomain('a.b.c.example.co.uk')).toBe(true)
    })
    it('tire içeren domain kabul eder', () => {
      expect(isValidDomain('my-ads.example.com')).toBe(true)
    })
    it('sayı içeren domain kabul eder', () => {
      expect(isValidDomain('ads123.example.com')).toBe(true)
    })
    it('ülke TLD kabul eder', () => {
      expect(isValidDomain('example.co.uk')).toBe(true)
    })
    it('yeni uzun TLD kabul eder', () => {
      expect(isValidDomain('example.online')).toBe(true)
    })
    it('büyük harfli domain kabul eder (case-insensitive)', () => {
      expect(isValidDomain('ADS.EXAMPLE.COM')).toBe(true)
    })
  })

  describe('geçersiz domainler', () => {
    it('boş string reddeder', () => {
      expect(isValidDomain('')).toBe(false)
    })
    it('localhost reddeder', () => {
      expect(isValidDomain('localhost')).toBe(false)
    })
    it('tek etiket reddeder', () => {
      expect(isValidDomain('example')).toBe(false)
    })
    it('IPv4 adresi reddeder', () => {
      expect(isValidDomain('0.0.0.0')).toBe(false)
    })
    it('127.0.0.1 reddeder', () => {
      expect(isValidDomain('127.0.0.1')).toBe(false)
    })
    it('boşluk içeren string reddeder', () => {
      expect(isValidDomain('example .com')).toBe(false)
    })
    it('ardışık nokta reddeder', () => {
      expect(isValidDomain('example..com')).toBe(false)
    })
    it('nokta ile başlayan domain reddeder', () => {
      expect(isValidDomain('.example.com')).toBe(false)
    })
    it('nokta ile biten domain reddeder', () => {
      expect(isValidDomain('example.com.')).toBe(false)
    })
    it('253 karakterden uzun domain reddeder', () => {
      const long = 'a'.repeat(63) + '.' + 'b'.repeat(63) + '.' + 'c'.repeat(63) + '.' + 'd'.repeat(63) + '.com'
      expect(isValidDomain(long)).toBe(false)
    })
    it('sadece sayılardan oluşan TLD reddeder', () => {
      expect(isValidDomain('example.123')).toBe(false)
    })
    it('özel karakter içeren domain reddeder', () => {
      expect(isValidDomain('exam_ple.com')).toBe(false)
    })
  })
})
