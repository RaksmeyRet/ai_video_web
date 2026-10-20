import { ref } from 'vue'

export function useSegments() {
  let keySeq = 0
  const create = () => ({
    key: ++keySeq,
    startTime: '',
    endTime: '',
    title: '',
    summary: '',
    keywords: [],
    possible_questions: []
  })

  const segments = ref([create()])

  const add = () => segments.value.push(create())
  const remove = i => {
    if (segments.value.length > 1) segments.value.splice(i, 1)
  }
  const reset = () => (segments.value = [create()])

  return { segments, add, remove, reset }
}
