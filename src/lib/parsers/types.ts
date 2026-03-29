import type { BlocklistFormat } from '@/types/blocklist'

/**
 * Parser fonksiyon imzası: ham metin alır, benzersiz domain dizisi döndürür.
 */
export type ParserFunction = (content: string) => string[]

/**
 * Parser kayıt nesnesi — tüm format'lara ait parser'ları tek yerde tutar.
 */
export type ParserRegistry = Record<BlocklistFormat, ParserFunction>
