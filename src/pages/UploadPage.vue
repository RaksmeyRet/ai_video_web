<template>
  <q-page padding class="upload-page">
    <div class="upload-page__inner">
      <header class="upload-page__header">
        <div class="text-overline text-primary">VIDEO WORKSPACE</div>
        <h1 class="text-h4 q-my-sm">Add video segments</h1>
        <p class="text-body1 text-grey-7 q-mb-none">
          Optionally select a video for reference, then add and save its
          segments.
        </p>
      </header>

      <UploadSteps :current-step="currentStep" />

      <div class="upload-page__content">
        <q-card flat bordered class="upload-card">
          <q-card-section class="upload-card__body">
            <template v-if="!file">
              <div class="upload-card__section-title"
                >Video file (optional)</div
              >
              <div class="upload-card__section-hint">
                MP4, MOV, or WebM · up to {{ MAX_MB }} MB
              </div>
            </template>

            <input
              ref="inputRef"
              type="file"
              accept="video/*"
              hidden
              @change="onPick"
            />

            <DropZone v-if="!file" @browse="pick" @drop="setFile" />
            <VideoPreview
              v-else
              :file="file"
              :preview-url="previewUrl"
              :uploading="uploading"
              @change="pick"
              @remove="clearFile"
              @error="error = $event"
            />

            <div
              v-if="error"
              class="text-negative text-caption q-mt-md"
              role="alert"
            >
              {{ error }}
            </div>

            <div class="upload-card__section-title q-mt-lg"
              >Segment details</div
            >
            <div class="upload-card__section-hint">
              Add one record for each video segment.
            </div>

            <SegmentForm
              v-for="(seg, i) in segments"
              :key="seg.key"
              v-model="segments[i]"
              :index="i"
              :disabled="uploading"
              :can-remove="segments.length > 1"
              @remove="removeSegment(i)"
            />

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

            <UploadProgress
              v-if="uploading"
              :progress="progress"
              class="q-mt-md"
            />
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
              label="Save segments"
              :disable="uploading"
              @click="upload"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import UploadSteps from '../components/upload/UploadSteps.vue'
import DropZone from '../components/upload/DropZone.vue'
import VideoPreview from '../components/upload/VideoPreview.vue'
import SegmentForm from '../components/upload/SegmentForm.vue'
import UploadProgress from '../components/upload/UploadProgress.vue'
import { useSegments } from '../composables/useSegments'
import { useVideoUpload } from '../composables/useVideoUpload'
import { MAX_MB, REDIRECT_TO } from '../utils/upload'

const $q = useQuasar()
const router = useRouter()

const inputRef = ref(null)

const {
  segments,
  add: addSegment,
  remove: removeSegment,
  reset: resetSegments
} = useSegments()

const {
  file,
  previewUrl,
  uploading,
  progress,
  error,
  currentStep,
  setFile,
  clearFile,
  submit
} = useVideoUpload()

const pick = () => inputRef.value?.click()

function onPick(e) {
  setFile(e.target.files?.[0])
  e.target.value = '' // allow picking the same file again
}

function resetAll() {
  clearFile()
  resetSegments()
  progress.value = 0
}

function onCancel() {
  resetAll()
  router.push(REDIRECT_TO)
}

async function upload() {
  const ok = await submit({
    segments: segments.value
  })
  if (!ok) return
  $q.notify({ type: 'positive', message: 'Segments saved successfully' })
  router.push(REDIRECT_TO)
  resetAll()
}
</script>

<style lang="scss" src="../css/UploadPage.scss"></style>
