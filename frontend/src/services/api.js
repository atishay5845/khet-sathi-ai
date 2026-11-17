import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 25000,
})

export const getHealth = () => api.get('/health').then((r) => r.data)
export const getMarketPrices = (crop = 'Wheat', location = 'Punjab') => api.get('/market/prices', { params: { crop, location } }).then((r) => r.data)
export const getMarketTrends = (crop = 'Wheat', location = 'Punjab') => api.get('/market/trends', { params: { crop, location } }).then((r) => r.data)
export const getSchemes = (q = 'farmer agricultural support') => api.get('/schemes', { params: { q } }).then((r) => r.data)
export const getHistory = () => api.get('/history').then((r) => r.data)
export const getAdvisory = (id) => api.get(`/advisories/${id}`).then((r) => r.data)
export const getWeather = (location = 'Ludhiana, Punjab') => api.get('/weather', { params: { location } }).then((r) => r.data)

export async function streamAdvisory(payload, onEvent, signal) {
  const response = await fetch(`${api.defaults.baseURL}/advisories/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(payload),
    signal,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${response.status})`)
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() || ''
    for (const chunk of chunks) {
      const line = chunk.split('\n').find((part) => part.startsWith('data: '))
      if (!line) continue
      try { onEvent(JSON.parse(line.slice(6))) } catch { /* ignore malformed heartbeat */ }
    }
  }
}

export default api
