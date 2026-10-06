<template>
  <q-page padding>
    <div class="text-h5 text-weight-bold q-mb-md">Project #{{ id }}</div>

    <VideoUploader ref="uploader" @submit="onSubmit" />

    <div class="row q-col-gutter-lg q-mt-md">
      <div class="col-12 col-md-5">
        <SegmentForm :get-time="() => uploader?.getTime() ?? 0" @add="onAdd" />
      </div>
      <div class="col-12 col-md-7">
        <SegmentList :segments="segments" @seek="onSeek" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import VideoUploader from '@/components/VideoUploader.vue'
import SegmentForm from '@/components/SagmentForm.vue'
import SegmentList from '@/components/SegmentList.vue'
import { startSeconds } from '@/untils/time.js'

const $q = useQuasar()
const id = useRoute().params.id
const uploader = ref(null)
const segments = ref([])

const videoNum = String(id).padStart(6, '0')
const videoId = `VID-${videoNum}`

const onSeek = (time) => uploader.value?.seek(startSeconds(time))

const onAdd = (data) => {
  const n = String(segments.value.length + 1).padStart(2, '0')
  segments.value.push({ segment_id: `SEG-${videoNum}-${n}`, video_id: videoId, ...data })
  $q.notify({ type: 'positive', message: 'Segment added' })
}

const onSubmit = ({ file, description }) => {
  console.log('submit to backend (Step 3)', file, description, segments.value)
  $q.notify({ type: 'positive', icon: 'check', message: 'Video ready to send' })
}
</script>