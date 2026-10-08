<template>
  <q-card flat bordered class="upload-card">
    <q-card-section class="upload-card__body">
      <template v-if="!file">
        <div class="upload-card__section-title">Video file</div>
        <div class="upload-card__section-hint">MP4, MOV, or WebM · up to {{ MAX_MB }} MB</div>
      </template>

      <input ref="inputRef" type="file" accept="video/*" hidden @change="onPick" />

      <!-- Drop zone -->
      <div
        v-if="!file"
        class="dropzone upload-card__dropzone"
        :class="{ 'dropzone--active': dragging }"
        role="button"
        tabindex="0"
        aria-label="Select or drop a video file"
        @click="pick"
        @keydown.enter.prevent="pick"
        @keydown.space.prevent="pick"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <q-avatar
          rounded
          size="56px"
          color="blue-1"
          text-color="primary"
          icon="cloud_upload"
          class="upload-card__icon"
        />
        <div class="upload-card__drop-title">Drag and drop your video here</div>
        <div class="text-caption text-grey-7">or select a file from your device</div>
        <q-btn
          outline
          rounded
          no-caps
          color="primary"
          icon="folder_open"
          label="Browse files"
          @click.stop="pick"
        />
      </div>

      <!-- Selected video preview -->
      <div v-else class="upload-card__preview">
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
            @click="pick"
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
            @click="clearFile"
          />
        </div>
      </div>

      <div v-if="error" class="text-negative text-caption q-mt-md" role="alert">{{ error }}</div>

      <q-input
        v-model="description"
        type="textarea"
        outlined
        autogrow
        class="q-mt-lg"
        label="Description (optional)"
        placeholder="What is this video about?"
        :disable="uploading"
      />

      <div v-if="uploading" class="q-mt-md">
        <q-linear-progress rounded size="8px" :value="progress" />
        <div class="text-caption text-grey-8 q-mt-xs">
          Uploading {{ Math.round(progress * 100) }}%
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions class="upload-card__actions">
      <q-btn
        flat
        rounded
        no-caps
        color="grey-8"
        label="Cancel"
        :disable="uploading"
        @click="onCancel"
      />
      <q-space />
      <q-btn
        unelevated
        rounded
        no-caps
        color="primary"
        icon="upload"
        label="Upload"
        :disable="!file || uploading"
        @click="upload"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { format } from 'quasar'
import { useRouter } from 'vue-router'

const { humanStorageSize } = format
const router = useRouter()

const props = defineProps({
  uploadUrl: { type: String, default: 'http://localhost:8000/api/videos' }, // change to your backend endpoint
  redirectTo: { type: String, default: '/' },
})
const emit = defineEmits(['cancel', 'uploaded', 'step-change'])

const MAX_MB = 200

const inputRef = ref(null)
const videoRef = ref(null)
const file = ref(null)
const previewUrl = ref('')
const description = ref('')
const dragging = ref(false)
const uploading = ref(false)
const progress = ref(0)
const error = ref('')

function pick() {
  inputRef.value?.click()
}

function onVideoError() {
  const mediaError = videoRef.value?.error

  if (mediaError?.code === 4) {
    error.value = 'This video format or codec is not supported by your browser. Try an MP4 video encoded with H.264.'
    return
  }

  error.value = 'The video preview could not be loaded. Try selecting the video again.'
}

function setFile(f) {
  error.value = ''
  if (!f) return
  if (!f.type.startsWith('video/')) {
    error.value = 'Please choose a video file (MP4, MOV, or WebM).'
    return
  }
  if (f.size > MAX_MB * 1024 * 1024) {
    error.value = `This video is larger than ${MAX_MB} MB.`
    return
  }
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  file.value = f
  previewUrl.value = URL.createObjectURL(f)
  emit('step-change', 2)
}

function onPick(e) {
  setFile(e.target.files?.[0])
  e.target.value = '' // allow picking the same file again
}

function onDrop(e) {
  dragging.value = false
  setFile(e.dataTransfer?.files?.[0])
}

function clearFile() {
  videoRef.value?.pause()
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  file.value = null
  previewUrl.value = ''
  error.value = ''
  emit('step-change', 1)
}

function reset() {
  clearFile()
  description.value = ''
  progress.value = 0
}

function onCancel() {
  reset()
  emit('cancel')
}

function upload() {
  if (!file.value) return
  const body = new FormData()
  body.append('file', file.value)
  body.append('description', description.value.trim())

  uploading.value = true
  emit('step-change', 3)
  progress.value = 0
  error.value = ''

  const xhr = new XMLHttpRequest()
  xhr.open('POST', props.uploadUrl)
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) progress.value = e.loaded / e.total
  }
  xhr.onload = () => {
    uploading.value = false
    if (xhr.status >= 200 && xhr.status < 300) {
      let data = null
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        // response is not JSON, that is fine
      }
      emit('uploaded', data)
      router.push(props.redirectTo)
      reset()
    } else {
      error.value = 'Upload failed. Please try again.'
      emit('step-change', 2)
    }
  }
  xhr.onerror = () => {
    uploading.value = false
    error.value = 'Could not reach the server. Check your connection and try again.'
    emit('step-change', 2)
  }
  xhr.send(body)
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style lang="scss" src="../css/UploadVideo.scss" scoped></style>
