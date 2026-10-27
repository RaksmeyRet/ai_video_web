import { KNOWLEDGE_URL } from './upload'

// GET /api/rag/knowledge/:id/
export async function getKnowledge(id) {
  const res = await fetch(`${KNOWLEDGE_URL}${id}/`)
  if (res.status === 404) throw new Error('This item was not found.')
  if (!res.ok) throw new Error(`Could not load it (${res.status}).`)
  return res.json()
}

// 75 -> "01:15"
export const fmtTime = sec => {
  const s = Math.round(sec ?? 0)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
