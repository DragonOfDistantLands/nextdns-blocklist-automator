/**
 * RFC 1123 uyumlu domain adı doğrulayıcı.
 * Her etiket: harf/rakam ile başlar/biter, tire içerebilir, max 63 karakter.
 * Toplam max uzunluk 253 karakter. En az bir nokta içermeli (TLD zorunlu).
 */
const VALID_DOMAIN_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i

/**
 * Verilen string'in geçerli bir domain adı olup olmadığını kontrol eder.
 * IP adresleri, localhost ve tek kelime etiketler reddedilir.
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false
  // Boşluk veya özel karakter içeriyorsa geçersiz
  if (/\s/.test(domain)) return false
  // Ardışık nokta içeriyorsa geçersiz
  if (domain.includes('..')) return false
  // IPv4 adreslerini reddet (sayı.sayı.sayı.sayı)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) return false
  return VALID_DOMAIN_REGEX.test(domain)
}
