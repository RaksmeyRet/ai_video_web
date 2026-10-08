<template>
  <q-page padding class="upload-page">
    <div class="upload-page__inner">
      <header class="upload-page__header">
        <div class="text-overline text-primary">VIDEO WORKSPACE</div>
        <h1 class="text-h4 q-my-sm">Upload your video</h1>
        <p class="text-body1 text-grey-7 q-mb-none">
          Select a video, preview it, then upload it with an optional description.
        </p>
      </header>

      <div class="upload-page__steps" aria-label="Upload steps">
        <div
          class="upload-page__step"
          :class="{ 'upload-page__step--active': currentStep === 1, 'upload-page__step--done': currentStep > 1 }"
        >
          <q-badge color="primary" rounded label="1" />
          <span>Select video</span>
        </div>
        <q-separator class="upload-page__step-divider" />
        <div class="upload-page__step" :class="{ 'upload-page__step--active': currentStep === 2 }">
          <q-badge :color="currentStep >= 2 ? 'primary' : 'grey-5'" rounded label="2" />
          <span>Preview</span>
        </div>
        <q-separator class="upload-page__step-divider" />
        <div class="upload-page__step" :class="{ 'upload-page__step--active': currentStep === 3 }">
          <q-badge :color="currentStep === 3 ? 'primary' : 'grey-5'" rounded label="3" />
          <span>Upload</span>
        </div>
      </div>

      <div class="upload-page__content">
        <q-card flat bordered class="upload-card">
          <q-card-section class="upload-card__body">
            <template v-if="!file">
              <div class="upload-card__section-title">Video file</div>
              <div class="upload-card__section-hint">MP4, MOV, or WebM · up to {{ MAX_MB }} MB</div>
            </template>

            <input ref="inputRef" type="file" accept="video/*" hidden @change="onPick" />

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
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { format, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const { humanStorageSize } = format
const $q = useQuasar()
const router = useRouter()

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
const currentStep = ref(1)

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
  currentStep.value = 2
}

function onPick(e) {
  setFile(e.target.files?.[0])
  e.target.value = ''
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
  currentStep.value = 1
}

function reset() {
  clearFile()
  description.value = ''
  progress.value = 0
}

function goHome() {
  router.push('/')
}

function onCancel() {
  reset()
  goHome()
}

function onUploaded() {
  $q.notify({ type: 'positive', message: 'Video uploaded successfully' })
  router.push('/')
}

function upload() {
  if (!file.value) return

  const body = new FormData()
  body.append('file', file.value)
  body.append('description', description.value.trim())

  uploading.value = true
  currentStep.value = 3
  progress.value = 0
  error.value = ''

  const xhr = new XMLHttpRequest()
  xhr.open('POST', 'http://localhost:8000/api/videos')
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
      onUploaded(data)
      reset()
    } else {
      error.value = 'Upload failed. Please try again.'
      currentStep.value = 2
    }
  }
  xhr.onerror = () => {
    uploading.value = false
    error.value = 'Could not reach the server. Check your connection and try again.'
    currentStep.value = 2
  }
  xhr.send(body)
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style lang="scss" scoped>
.upload-page {
  min-height: calc(100vh - 57px);
  padding-top: 20px;
  padding-bottom: 40px;

  &__inner {
    width: min(100%, 760px);
    margin-right: auto;
    margin-left: auto;
  }

  &__header,
  &__content {
    width: 100%;
  }

  &__header {
    margin-bottom: 20px;
  }

  &__header h1 {
    color: #172033;
    font-weight: 700;
  }

  &__steps {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
    color: #697586;
    font-size: 0.85rem;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;

    &--active {
      color: #172033;
      font-weight: 600;
    }

    &--done {
      color: #172033;
    }
  }

  &__step-divider {
    flex: 1;
    min-width: 12px;
  }
}

@media (max-width: 599px) {
  .upload-page__steps {
    gap: 8px;
    font-size: 0.75rem;
  }
}
</style>

<style lang="scss" src="../css/UploadVideo.scss" scoped></style>
