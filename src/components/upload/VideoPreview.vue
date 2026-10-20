<template>
  <div class="upload-card__preview">
    <div class="upload-card__preview-heading">
      <div>
        <div class="upload-card__section-title">Preview</div>
        <div class="upload-card__section-hint">Check your video before uploading.</div>
      </div>
      <q-btn
        flat
        rounded
        no-caps
        color="primary"
        icon="swap_horiz"
        label="Change video"
        :disable="uploading"
        @click="emit('change')"
      />
    </div>

    <div class="upload-card__video">
      <video
        ref="videoRef"
        :key="previewUrl"
        :src="previewUrl"
        controls
        playsinline
        preload="auto"
        :aria-label="`Video preview: ${file.name}`"
        @error="onVideoError"
      />
    </div>

    <div class="upload-card__file">
      <q-icon name="movie" color="primary" size="22px" />
      <span class="upload-card__name">{{ file.name }}</span>
      <span class="upload-card__size">{{ humanStorageSize(file.size) }}</span>
      <q-btn
        flat
        round
        dense
        icon="close"
        aria-label="Remove video"
        :disable="uploading"
        @click="emit('remove')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { format } from 'quasar'

const { humanStorageSize } = format

defineProps({
  file: { type: File, required: true },
  previewUrl: { type: String, required: true },
  uploading: { type: Boolean, default: false }
})
const emit = defineEmits(['change', 'remove', 'error'])

const videoRef = ref(null)

function onVideoError() {
  const code = videoRef.value?.error?.code
  emit(
    'error',
    code === 4
      ? 'This video format or codec is not supported by your browser. Try an MP4 video encoded with H.264.'
      : 'The video preview could not be loaded. Try selecting the video again.'
  )
}
</script>
