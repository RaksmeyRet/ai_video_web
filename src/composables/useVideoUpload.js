import { onBeforeUnmount, ref } from 'vue'
import {
  buildKnowledge,
  buildSegments,
  createKnowledge,
  readPdfPageCount,
  readVideoDuration,
  uploadToS3,
  validateVideo
} from '../utils/upload'

export function useVideoUpload() {
  const file = ref(null) // the video on your computer
  const previewUrl = ref('')
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref('')
  const createdId = ref(null)

  const fail = msg => {
    error.value = msg
    return false
  }

  function revoke() {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  }

  function setFile(f) {
    error.value = ''
    if (!f) return
    const problem = validateVideo(f)
    if (problem) {
      error.value = problem
      return
    }
    revoke()
    file.value = f
    previewUrl.value = URL.createObjectURL(f)
  }

  function clearFile() {
    revoke()
    file.value = null
    previewUrl.value = ''
    error.value = ''
  }

  // form: { type, title, description, language, pdf, pageCount, segments }
  async function submit(form) {
    error.value = ''
    const source = form.type === 'video' ? file.value : form.pdf

    if (!source) return fail(form.type === 'video' ? 'Please add a video.' : 'Please add a PDF.')
    if (!form.title.trim()) return fail('Enter a title.')

    const built = buildSegments(form.segments, form.type)
    if (built.error) return fail(built.error)
    if (!built.data.length) return fail('Add at least one segment.')

    uploading.value = true
    progress.value = 0
    try {
      // video or PDF -> S3 (with progress), then send its URL
      const fileUrl = await uploadToS3(source, p => (progress.value = p))
      const duration = form.type === 'video' ? await readVideoDuration(source) : null
      const pageCount =
        form.type === 'pdf'
          ? Number(form.pageCount) || (await readPdfPageCount(source))
          : null

      const created = await createKnowledge(
        buildKnowledge({ ...form, fileUrl, duration, pageCount, segments: built.data })
      )
      createdId.value = created.id
      progress.value = 1
      return true
    } catch (e) {
      return fail(e.message)
    } finally {
      uploading.value = false
    }
  }

  onBeforeUnmount(revoke)

  return {
    file,
    previewUrl,
    uploading,
    progress,
    error,
    createdId,
    setFile,
    clearFile,
    submit
  }
}
