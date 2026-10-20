import { onBeforeUnmount, ref } from 'vue'
import {
  buildSegments,
  newVideoId,
  saveSegments,
  validateVideo
} from '../utils/upload'

export function useVideoUpload() {
  const file = ref(null)
  const previewUrl = ref('')
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref('')
  const currentStep = ref(2)

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
    currentStep.value = 2
  }

  function clearFile() {
    revoke()
    file.value = null
    previewUrl.value = ''
    error.value = ''
    currentStep.value = 2
  }

  // returns true when all segments are saved
  async function submit({ segments }) {
    const videoId = newVideoId()
    const built = buildSegments(segments, videoId)
    if (built.error) {
      error.value = built.error
      return false
    }
    if (!built.data.length) {
      error.value = 'Add at least one segment.'
      return false
    }

    uploading.value = true
    currentStep.value = 3
    progress.value = 0
    error.value = ''
    try {
      await saveSegments(built.data, p => (progress.value = p))
      return true
    } catch (e) {
      error.value = e.message
      currentStep.value = 2
      return false
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
    currentStep,
    setFile,
    clearFile,
    submit
  }
}
