<template>
  <q-page padding class="upload-page">
    <div class="upload-page__inner">
      <header class="upload-page__header">
        <div class="text-overline text-primary">VIDEO WORKSPACE</div>
        <h1 class="text-h4 q-my-sm">Add knowledge</h1>
        <p class="text-body1 text-grey-7 q-mb-none">
          Upload a video or a PDF, then describe each segment.
        </p>
      </header>

      <UploadSteps :current-step="step" />

      <div class="upload-page__content">
        <q-card flat bordered class="upload-card">
          <q-card-section class="upload-card__body">
            <!-- File: one file per item (video OR PDF) -->
            <div class="upload-card__section-title">File</div>
            <div class="upload-card__section-hint">
              Choose Video or PDF, then add the file in the box below.
            </div>

            <q-btn-toggle
              v-model="tab"
              class="file-toggle q-mt-md"
              spread
              rounded
              unelevated
              no-caps
              color="grey-3"
              text-color="grey-8"
              toggle-color="primary"
              toggle-text-color="white"
              :options="fileTabs"
              :disable="uploading"
            />

            <div v-if="lockMessage" class="file-lock q-mt-sm">
              <q-icon name="lock" size="16px" />
              <span>{{ lockMessage }}</span>
            </div>

            <div class="file-box q-mt-md">
              <template v-if="tab === 'video'">
                <DropZone
                  v-if="!file"
                  icon="movie"
                  title="Drop your video here"
                  :hint="`MP4, MOV or WebM · up to ${MAX_MB} MB`"
                  accept="video/*"
                  :disabled="uploading"
                  @select="setFile"
                />
                <VideoPreview
                  v-else
                  :file="file"
                  :preview-url="previewUrl"
                  :uploading="uploading"
                  @change="clearFile"
                  @remove="clearFile"
                  @error="error = $event"
                />
              </template>

              <template v-else>
                <DropZone
                  v-if="!pdfFile"
                  icon="picture_as_pdf"
                  title="Drop your PDF here"
                  :hint="`PDF only · up to ${MAX_PDF_MB} MB`"
                  accept="application/pdf"
                  :disabled="uploading"
                  @select="setPdf"
                />
                <div v-else class="file-row">
                  <q-icon name="picture_as_pdf" color="negative" size="24px" />
                  <span class="file-row__name">{{ pdfFile.name }}</span>
                  <span class="file-row__size">{{
                    humanStorageSize(pdfFile.size)
                  }}</span>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    aria-label="Remove PDF"
                    :disable="uploading"
                    @click="removePdf"
                  />
                </div>
              </template>
            </div>

            <div
              v-if="error"
              class="text-negative text-caption q-mt-md"
              role="alert"
            >
              {{ error }}
            </div>

            <!-- Details: under the upload box -->
            <div class="upload-card__section-title q-mt-lg">
              {{ tab === 'video' ? 'Video details' : 'PDF details' }}
            </div>

            <q-input
              v-model="title"
              outlined
              class="q-mt-md"
              label="Title"
              placeholder="Company Onboarding & Welcome Orientation"
              :disable="uploading"
            />
            <q-input
              v-model="description"
              type="textarea"
              outlined
              autogrow
              class="q-mt-md"
              label="Description (optional)"
              :disable="uploading"
            />
            <q-select
              v-model="language"
              outlined
              emit-value
              map-options
              class="q-mt-md"
              label="Language of the file"
              :options="languages"
              :disable="uploading"
            />
            <q-input
              v-if="tab === 'pdf'"
              v-model="pageCount"
              type="number"
              min="1"
              outlined
              class="q-mt-md"
              label="Page count"
              hint="Read from the PDF automatically. You can edit it."
              :disable="uploading"
            />

            <q-separator class="q-my-lg" />

            <!-- Segments -->
            <div class="upload-card__section-title">Segment details</div>
            <div class="upload-card__section-hint">
              {{
                tab === 'video'
                  ? 'Add one record for each part of the video.'
                  : 'Add one record for each page range of the PDF.'
              }}
            </div>

            <SegmentForm
              v-for="(seg, i) in segments"
              :key="seg.key"
              v-model="segments[i]"
              :index="i"
              :source-type="tab"
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
              label="Upload & save"
              :disable="uploading || !hasFile"
              @click="upload"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { format, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import UploadSteps from '../components/upload/UploadSteps.vue'
import DropZone from '../components/upload/DropZone.vue'
import VideoPreview from '../components/upload/VideoPreview.vue'
import SegmentForm from '../components/upload/SegmentForm.vue'
import UploadProgress from '../components/upload/UploadProgress.vue'
import { useSegments } from '../composables/useSegments'
import { useVideoUpload } from '../composables/useVideoUpload'
import {
  MAX_MB,
  MAX_PDF_MB,
  REDIRECT_TO,
  readPdfPageCount,
  validatePdf
} from '../utils/upload'

const { humanStorageSize } = format
const $q = useQuasar()
const router = useRouter()

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Khmer', value: 'km' }
]

const tab = ref('video') // 'video' | 'pdf'
const title = ref('')
const description = ref('')
const language = ref('en')
const pdfFile = ref(null)
const pageCount = ref('')

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
  createdId,
  setFile,
  clearFile,
  submit
} = useVideoUpload()

const hasFile = computed(() =>
  tab.value === 'video' ? !!file.value : !!pdfFile.value
)

// 1 = choose file, 2 = describe segments, 3 = saving
const step = computed(() => (uploading.value ? 3 : hasFile.value ? 2 : 1))

// the other tab is disabled once a file is chosen
const fileTabs = computed(() => [
  {
    value: 'video',
    label: 'Video',
    icon: file.value ? 'check_circle' : 'movie',
    disable: !!pdfFile.value
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: pdfFile.value ? 'check_circle' : 'picture_as_pdf',
    disable: !!file.value
  }
])

const lockMessage = computed(() => {
  if (file.value) return 'One file per item. Remove the video to upload a PDF instead.'
  if (pdfFile.value) return 'One file per item. Remove the PDF to upload a video instead.'
  return ''
})

async function setPdf(f) {
  if (file.value) return // a video is already chosen
  const problem = validatePdf(f)
  error.value = problem
  if (problem) return
  pdfFile.value = f
  pageCount.value = (await readPdfPageCount(f)) ?? ''
}

function removePdf() {
  pdfFile.value = null
  pageCount.value = ''
}

function resetAll() {
  clearFile()
  resetSegments()
  removePdf()
  title.value = ''
  description.value = ''
  language.value = 'en'
  progress.value = 0
  tab.value = 'video'
}

function onCancel() {
  resetAll()
  router.push(REDIRECT_TO)
}

async function upload() {
  const ok = await submit({
    type: tab.value,
    title: title.value,
    description: description.value,
    language: language.value,
    pdf: pdfFile.value,
    pageCount: pageCount.value,
    segments: segments.value
  })
  if (!ok) return

  $q.notify({ type: 'positive', message: 'Saved successfully' })
  const id = createdId?.value
  resetAll()
  router.push(id ? `/knowledge/${id}` : REDIRECT_TO)
}
</script>

<style lang="scss" src="../css/UploadPage.scss"></style>

<style lang="scss">
.file-toggle {
  width: 100%;
  border-radius: 999px;

  .q-btn {
    min-height: 46px;
    font-weight: 600;
  }
}

.file-lock {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5f6b7a;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #dde3ea;
  border-radius: 12px;
  background: #fff;
}

.file-row__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.file-row__size {
  font-size: 12px;
  color: #5f6b7a;
}
</style>
