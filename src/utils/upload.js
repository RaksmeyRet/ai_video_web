export const MAX_MB = 200
export const MAX_PDF_MB = 20
export const REDIRECT_TO = '/project' // use '/' until the /project route exists

export const KNOWLEDGE_URL = '/api/rag/knowledge/' // keep the trailing slash
export const PRESIGN_URL = '/api/rag/storage/presigned-url/'

// ---------- Validation ----------
export function validateVideo(f) {
  if (!f.type.startsWith('video/')) return 'Please choose a video file (MP4, MOV, or WebM).'
  if (f.size > MAX_MB * 1024 * 1024) return `This video is larger than ${MAX_MB} MB.`
  return ''
}

export function validatePdf(f) {
  if (f.type !== 'application/pdf') return 'Please choose a PDF file.'
  if (f.size > MAX_PDF_MB * 1024 * 1024) return `This PDF is larger than ${MAX_PDF_MB} MB.`
  return ''
}

// ---------- File info ----------
// duration of a local video in seconds (null if it can't be read)
export const readVideoDuration = file =>
  new Promise(resolve => {
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(v.src)
      resolve(Number.isFinite(v.duration) ? v.duration : null)
    }
    v.onerror = () => resolve(null)
    v.src = URL.createObjectURL(file)
  })

// number of pages in a local PDF (null if it can't be read); needs: npm i pdf-lib
export async function readPdfPageCount(file) {
  try {
    const { PDFDocument } = await import('pdf-lib')
    const pdf = await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true
    })
    return pdf.getPageCount()
  } catch {
    return null
  }
}

// ---------- Segments ----------
const isBlank = v => v === '' || v === null || v === undefined

// returns { data } or { error }
export function buildSegments(list, sourceType) {
  const data = []
  for (const [i, s] of list.entries()) {
    const n = i + 1
    const hasText =
      s.title.trim() || s.summary.trim() || s.keywords.length || s.questions.length
    const hasRange =
      sourceType === 'video'
        ? !isBlank(s.startTime) || !isBlank(s.endTime)
        : !isBlank(s.pageStart) || !isBlank(s.pageEnd)
    if (!hasText && !hasRange) continue

    if (!s.title.trim()) return { error: `Enter a title for segment ${n}.` }

    const seg = {
      segment_index: data.length,
      title: s.title.trim(),
      summary: s.summary.trim(),
      ...(s.transcript?.trim() ? { transcript: s.transcript.trim() } : {}),
      keywords: s.keywords,
      possible_questions: s.questions
    }

    if (sourceType === 'video') {
      // times are typed in seconds, e.g. 0.0 and 30.0
      const a = parseFloat(s.startTime)
      const b = parseFloat(s.endTime)
      if (Number.isNaN(a) || Number.isNaN(b) || a < 0)
        return { error: `Enter a valid start and end time in seconds for segment ${n}.` }
      if (b <= a) return { error: `Segment ${n}: end time must be after start time.` }
      seg.start_time_seconds = a
      seg.end_time_seconds = b
    } else {
      const a = Number(s.pageStart)
      const b = Number(s.pageEnd)
      if (!a || !b || b < a) return { error: `Enter a valid page range for segment ${n}.` }
      seg.page_start = a
      seg.page_end = b
    }
    data.push(seg)
  }
  return { data }
}

// ---------- Upload to S3 ----------
// uploads one file (video or PDF) and returns its final URL
export async function uploadToS3(file, onProgress = () => {}) {
  const presignUrl = new URL(PRESIGN_URL, window.location.origin)
  presignUrl.search = new URLSearchParams({
    filename: file.name,
    file_type: file.type,
    file_size: String(file.size),
    folder: file.type === 'application/pdf' ? 'documents' : 'videos'
  })

  const res = await fetch(presignUrl)
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Could not start the upload (${res.status}). ${detail.slice(0, 200)}`)
  }
  const { upload_url, file_url } = await res.json()
  if (!upload_url || !file_url) {
    throw new Error('The backend did not return both upload_url and file_url.')
  }

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', upload_url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = e => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload to storage failed (${xhr.status}).`))
    xhr.onerror = () =>
      reject(new Error('Could not reach storage. Check your connection and the bucket CORS.'))
    xhr.send(file)
  })
  return file_url
}

// ---------- Save to the backend ----------
export function buildKnowledge({
  type, title, description, language, fileUrl, duration, pageCount, segments
}) {
  const source = { language, file_url: fileUrl }
  if (type === 'video' && duration) source.duration_seconds = duration
  if (type === 'pdf' && pageCount) source.page_count = pageCount
  return {
    title: title.trim(),
    description: description.trim(),
    source_type: type,
    sources: [source],
    segments
  }
}

// POST /api/rag/knowledge/ -> the backend embeds every segment
export async function createKnowledge(payload) {
  const res = await fetch(KNOWLEDGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Saving failed (${res.status}). ${detail.slice(0, 200)}`)
  }
  return res.json()
}
