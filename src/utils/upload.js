export const MAX_MB = 200
export const REDIRECT_TO = '/project' // use '/' until the /project route exists
export const SEGMENTS_URL = '/api/rag/segments/' // keep the trailing slash

const TIME_RE = /^\d{2}:[0-5]\d$/

const toSeconds = t => {
  const [m, s] = t.split(':').map(Number)
  return m * 60 + s
}

export const newVideoId = () => `VID-${Math.floor(Date.now() / 1000)}`

const segmentId = (videoId, n) =>
  `SEG-${videoId.split('-').pop()}-${String(n).padStart(2, '0')}`

// returns an error message, or '' if the file is fine
export function validateVideo(f) {
  if (!f.type.startsWith('video/')) return 'Please choose a video file (MP4, MOV, or WebM).'
  if (f.size > MAX_MB * 1024 * 1024) return `This video is larger than ${MAX_MB} MB.`
  return ''
}

// returns { data } or { error }
export function buildSegments(list, videoId) {
  const data = []
  for (const [i, s] of list.entries()) {
    const empty =
      !s.startTime && !s.endTime && !s.title.trim() && !s.summary.trim() &&
      !s.keywords.length && !s.possible_questions.length
    if (empty) continue

    const n = i + 1
    if (!TIME_RE.test(s.startTime) || !TIME_RE.test(s.endTime))
      return { error: `Enter a valid start and end time for segment ${n} (mm:ss).` }
    if (!s.title.trim()) return { error: `Enter a title for segment ${n}.` }
    if (toSeconds(s.endTime) <= toSeconds(s.startTime))
      return { error: `Segment ${n}: end time must be after start time.` }

    data.push({
      video_id: videoId,
      segment_id: segmentId(videoId, data.length + 1),
      time: `${s.startTime} - ${s.endTime}`,
      title: s.title.trim(),
      summary: s.summary.trim(),
      keywords: s.keywords,
      possible_questions: s.possible_questions,
    })
  }
  return { data }
}

// POST /api/rag/segments/ once per segment (the backend embeds and saves each one)
export async function saveSegments(segments, onProgress = () => {}) {
  for (const [i, seg] of segments.entries()) {
    const res = await fetch(SEGMENTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seg)
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(
        `Saving ${seg.segment_id} failed (${res.status}). ${detail.slice(0, 200)}`
      )
    }
    onProgress((i + 1) / segments.length)
  }
}
