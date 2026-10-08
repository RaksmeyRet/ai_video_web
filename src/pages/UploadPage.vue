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

            <!-- Segment records -->
            <div class="upload-card__section-title q-mt-lg">Segment details</div>
            <div class="upload-card__section-hint">Add one record for each segment of this video.</div>


            <div v-for="(seg, i) in segments" :key="seg.key" class="upload-card__segment">
              <div class="upload-card__segment-head">
                <span class="upload-card__segment-title">Segment {{ i + 1 }}</span>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  color="grey-7"
                  aria-label="Remove segment"
                  :disable="uploading || segments.length === 1"
                  @click="removeSegment(i)"
                />
              </div>

              <div class="upload-card__grid q-mt-md">
                <q-input v-model="seg.startTime" outlined dense label="Start time (mm:ss)" placeholder="06:16" mask="##:##" :disable="uploading" />
                <q-input v-model="seg.endTime" outlined dense label="End time (mm:ss)" placeholder="08:40" mask="##:##" :disable="uploading" />
              </div>
              <q-input
                v-model="seg.title"
                outlined
                dense
                class="q-mt-md"
                label="Title"
                placeholder="How to Apply for Invoice Financing"
                :disable="uploading"
              />
              <q-input
                v-model="seg.summary"
                type="textarea"
                outlined
                autogrow
                class="q-mt-md"
                label="Summary"
                :disable="uploading"
              />
              <q-select
                v-model="seg.keywords"
                outlined
                dense
                multiple
                use-input
                use-chips
                hide-dropdown-icon
                new-value-mode="add-unique"
                class="q-mt-md"
                label="Keywords"
                hint="Type a keyword and press Enter"
                :disable="uploading"
              />
              <q-select
                v-model="seg.questions"
                outlined
                dense
                multiple
                use-input
                use-chips
                hide-dropdown-icon
                new-value-mode="add-unique"
                class="q-mt-md"
                label="Possible questions"
                hint="Type a question and press Enter"
                :disable="uploading"
              />
            </div>

            <q-btn
              outline
              rounded
              no-caps
              color="primary"
              icon="add"
              label="Add segment"
              class="q-mt-md"
              :disable="uploading"
              @click="addSegment"
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
const UPLOAD_URL = 'http://localhost:8000/api/videos' // change to your backend endpoint
const REDIRECT_TO = '/'

const inputRef = ref(null)
const videoRef = ref(null)
const file = ref(null)
const previewUrl = ref('')
const description = ref('')
const videoId = ref('')

let keySeq = 0
const newSegment = () => ({
  key: ++keySeq,
  segmentId: '',
  startTime: '',
  endTime: '',
  title: '',
  summary: '',
  keywords: [],
  questions: [],
})
const segments = ref([newSegment()])

function addSegment() {
  segments.value.push(newSegment())
}

function removeSegment(i) {
  if (segments.value.length > 1) segments.value.splice(i, 1)
}
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
  currentStep.value = 1
}

function reset() {
  clearFile()
  description.value = ''
  videoId.value = ''
  segments.value = [newSegment()]
  progress.value = 0
}

function onCancel() {
  reset()
  router.push(REDIRECT_TO)
}

function onUploaded() {
  $q.notify({ type: 'positive', message: 'Video uploaded successfully' })
  router.push(REDIRECT_TO)
}

const TIME_RE = /^\d{2}:[0-5]\d$/
const toSeconds = (t) => {
  const [m, s] = t.split(':').map(Number)
  return m * 60 + s
}


function upload() {
  if (!file.value) return

  const msg = validate()
  if (msg) {
    error.value = msg
    return
  }

  const body = new FormData()
  body.append('file', file.value)
  body.append('description', description.value.trim())
  const num = videoId.value.replace(/\D/g, '')
  const payload = segments.value.map((seg, i) => ({
    segment_id: seg.segmentId.trim() || `SEG-${num}-${String(i + 1).padStart(2, '0')}`,
    video_id: videoId.value.trim(),
    start_time: seg.startTime,
    end_time: seg.endTime,
    title: seg.title.trim(),
    summary: seg.summary.trim(),
    keywords: seg.keywords,
    possible_questions: seg.questions,
  }))
  body.append('video_id', videoId.value.trim())
  body.append('segments', JSON.stringify(payload))

  uploading.value = true
  currentStep.value = 3
  progress.value = 0
  error.value = ''

  const xhr = new XMLHttpRequest()
  xhr.open('POST', UPLOAD_URL)
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) progress.value = e.loaded / e.total
  }
  xhr.onload = () => {
    uploading.value = false
    if (xhr.status >= 200 && xhr.status < 300) {
      onUploaded()
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

<style lang="scss" src="../css/UploadPage.scss" scoped></style>
