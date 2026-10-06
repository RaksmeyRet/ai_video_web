// "06:16" -> 376
export const toSeconds = (t) => {
  const [m, s] = t.split(':').map(Number)
  return m * 60 + s
}

// 376 -> "06:16"
export const formatTime = (sec) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// "06:16-08:40" -> 376
export const startSeconds = (range) => toSeconds(range.split('-')[0])