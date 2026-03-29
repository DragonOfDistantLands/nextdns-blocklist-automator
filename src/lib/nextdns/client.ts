import axios, { type AxiosInstance } from 'axios'

export const NEXTDNS_BASE_URL = 'https://api.nextdns.io'

/**
 * Verilen API anahtarıyla yapılandırılmış bir Axios instance döndürür.
 * Tüm NextDNS istekleri bu instance üzerinden yapılır.
 */
export function createNextDNSClient(apiKey: string): AxiosInstance {
  return axios.create({
    baseURL: NEXTDNS_BASE_URL,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 10_000,
  })
}
