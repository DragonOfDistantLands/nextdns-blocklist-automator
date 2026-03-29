import { type NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const MAX_CONTENT_BYTES = 50 * 1024 * 1024 // 50 MB
const REQUEST_TIMEOUT_MS = 30_000          // 30 saniye

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl.searchParams.get('url')

  // --- URL doğrulama ---
  if (!url) {
    return NextResponse.json(
      { success: false, error: 'url parametresi zorunludur.', code: 'INVALID_URL' },
      { status: 400 },
    )
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz URL formatı.', code: 'INVALID_URL' },
      { status: 400 },
    )
  }

  // Yalnızca http/https protokolüne izin ver
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { success: false, error: 'Yalnızca http ve https URL\'lerine izin verilir.', code: 'INVALID_URL' },
      { status: 400 },
    )
  }

  // --- İçerik çekme ---
  try {
    const response = await axios.get<string>(url, {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: 'text',
      maxContentLength: MAX_CONTENT_BYTES,
      maxBodyLength: MAX_CONTENT_BYTES,
      headers: {
        'User-Agent': 'NextDNS-Blocklist-Automator/1.0',
        Accept: 'text/plain, text/*, */*',
      },
      // Büyük yanıtları hafızada tutmamak için
      decompress: true,
    })

    const content: string = response.data
    const lineCount = content.split('\n').length
    const byteSize = Buffer.byteLength(content, 'utf8')

    return NextResponse.json({
      success: true,
      content,
      lineCount,
      byteSize,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // Zaman aşımı
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        return NextResponse.json(
          { success: false, error: 'İstek zaman aşımına uğradı (30s). URL erişilebilir mi?', code: 'TIMEOUT' },
          { status: 504 },
        )
      }

      // İçerik boyutu sınırı
      if (err.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED' || err.message.includes('maxContentLength')) {
        return NextResponse.json(
          { success: false, error: 'İçerik boyutu 50 MB sınırını aşıyor.', code: 'CONTENT_TOO_LARGE' },
          { status: 413 },
        )
      }

      // 404 Not Found
      if (err.response?.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Belirtilen URL bulunamadı (404).', code: 'FETCH_FAILED' },
          { status: 502 },
        )
      }

      // Diğer HTTP hataları
      if (err.response) {
        return NextResponse.json(
          {
            success: false,
            error: `Hedef sunucu ${err.response.status} döndürdü.`,
            code: 'FETCH_FAILED',
            details: String(err.response.status),
          },
          { status: 502 },
        )
      }

      // Ağ bağlantı hatası (DNS çözümleme başarısız vb.)
      return NextResponse.json(
        { success: false, error: 'URL\'e ulaşılamadı. Adres doğru mu?', code: 'FETCH_FAILED' },
        { status: 502 },
      )
    }

    return NextResponse.json(
      { success: false, error: 'Beklenmeyen bir sunucu hatası oluştu.', code: 'FETCH_FAILED' },
      { status: 500 },
    )
  }
}
