import { isValidDomain } from '@/lib/domain-validator'

/**
 * Plain Domains — her satırda yalnızca bir domain adı.
 *
 * Yorum satırları: `#`, `//`, `!` ile başlayanlar atlanır.
 * Boşluk içeren satırlar bu format değildir ve atlanır.
 * Satır başı/sonu boşluklar trim edilir.
 */

export function parsePlain(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith('#') || line.startsWith('//') || line.startsWith('!')) continue

      // Boşluk veya tab içeriyorsa bu format değil
      if (/\s/.test(line)) continue

      const domain = line.toLowerCase()
      if (!isValidDomain(domain)) continue

      seen.add(domain)
    } catch {
      // bozuk satırı sessizce atla
    }
  }

  return [...seen]
}
