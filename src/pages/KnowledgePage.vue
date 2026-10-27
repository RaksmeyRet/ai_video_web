<template>
  <q-page padding class="kv-page">
    <div class="kv-inner">
      <!-- Loading / error -->
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner color="primary" size="40px" />
      </div>

      <q-banner v-else-if="error" rounded class="bg-red-1 text-negative">
        {{ error }}
        <template #action>
          <q-btn flat no-caps color="negative" label="Try again" @click="load" />
        </template>
      </q-banner>

      <template v-else-if="item">
        <!-- Header -->
        <header class="q-mb-lg">
          <div class="text-overline text-primary">PROJECT</div>
          <h1 class="text-h4 q-my-sm">{{ item.title }}</h1>
          <p v-if="item.description" class="text-body1 text-grey-7 q-mb-sm">
            {{ item.description }}
          </p>
          <div class="row items-center q-gutter-sm">
            <q-badge color="primary" :label="item.source_type.toUpperCase()" />
            <q-badge
              :color="item.processing_status === 'completed' ? 'positive' : 'warning'"
              :label="item.processing_status"
            />
            <span class="text-caption text-grey-7">
              {{ new Date(item.created_at).toLocaleString() }}
            </span>
          </div>
        </header>

        <div class="kv-grid">
          <!-- Media -->
          <section class="kv-media">
            <q-btn-toggle
              v-if="item.sources.length > 1"
              v-model="sourceIdx"
              class="q-mb-md"
              rounded
              unelevated
              no-caps
              toggle-color="primary"
              color="grey-3"
              text-color="grey-8"
              :options="item.sources.map((s, i) => ({ label: langLabel(s.language), value: i }))"
            />

            <video
              v-if="isVideo && source?.file_url"
              ref="videoRef"
              :key="source.id"
              class="kv-video"
              :src="source.file_url"
              controls
              playsinline
              preload="metadata"
              @timeupdate="onTimeUpdate"
            />

            <template v-else-if="isPdf && source?.file_url">
              <iframe
                :key="pdfSrc"
                class="kv-pdf"
                :src="pdfSrc"
                title="PDF document"
              />
              <q-btn
                flat
                no-caps
                color="primary"
                icon="open_in_new"
                label="Open PDF in a new tab"
                :href="pdfSrc"
                target="_blank"
                class="q-mt-sm"
              />
            </template>

            <q-banner v-else rounded class="bg-grey-2">
              No file is attached to this item.
            </q-banner>
          </section>

          <!-- Segments -->
          <section class="kv-segments">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              Segments ({{ item.segments.length }})
            </div>

            <q-card
              v-for="seg in item.segments"
              :key="seg.id"
              flat
              bordered
              class="kv-seg q-mb-md"
              :class="{ 'kv-seg--active': activeSeg === seg.id }"
            >
              <q-card-section>
                <div class="row items-start no-wrap">
                  <div class="col">
                    <div class="text-caption text-grey-7">
                      #{{ seg.segment_index + 1 }} · {{ rangeLabel(seg) }}
                    </div>
                    <div class="text-subtitle2 text-weight-bold">{{ seg.title }}</div>
                  </div>
                  <q-btn
                    round
                    dense
                    unelevated
                    color="primary"
                    :icon="isVideo ? 'play_arrow' : 'menu_book'"
                    :aria-label="isVideo ? 'Play this segment' : 'Go to this page'"
                    @click="playSegment(seg)"
                  />
                </div>

                <p v-if="seg.summary" class="q-mt-sm q-mb-none text-body2">
                  {{ seg.summary }}
                </p>

                <div v-if="seg.keywords?.length" class="q-mt-sm">
                  <q-chip
                    v-for="k in seg.keywords"
                    :key="k"
                    dense
                    outline
                    color="primary"
                    :label="k"
                  />
                </div>

                <q-expansion-item
                  v-if="seg.possible_questions?.length"
                  dense
                  dense-toggle
                  class="q-mt-xs"
                  label="Questions this answers"
                >
                  <ul class="q-my-sm q-pl-md">
                    <li v-for="q in seg.possible_questions" :key="q">{{ q }}</li>
                  </ul>
                </q-expansion-item>
              </q-card-section>
            </q-card>
          </section>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fmtTime, getKnowledge } from '../utils/knowledge'

const route = useRoute()

const item = ref(null)
const loading = ref(true)
const error = ref('')
const sourceIdx = ref(0)
const activeSeg = ref(null)
const pdfPage = ref(1)
const videoRef = ref(null)
let stopAt = null // pause the video when this second is reached

const source = computed(() => item.value?.sources?.[sourceIdx.value] ?? null)
const isVideo = computed(() => item.value?.source_type === 'video')
const isPdf = computed(() => item.value?.source_type === 'pdf')
const pdfSrc = computed(() =>
  source.value?.file_url ? `${source.value.file_url}#page=${pdfPage.value}` : ''
)

const langLabel = code => ({ en: 'English', km: 'Khmer' })[code] ?? code

const rangeLabel = seg =>
  isVideo.value
    ? `${fmtTime(seg.start_time_seconds)} – ${fmtTime(seg.end_time_seconds)}`
    : `Pages ${seg.page_start}–${seg.page_end}`

async function load() {
  loading.value = true
  error.value = ''
  try {
    item.value = await getKnowledge(route.params.id)
    sourceIdx.value = 0
    activeSeg.value = null
    pdfPage.value = 1
    stopAt = null
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })

function playSegment(seg) {
  activeSeg.value = seg.id
  if (isVideo.value) {
    const v = videoRef.value
    if (!v) return
    v.currentTime = seg.start_time_seconds ?? 0
    stopAt = seg.end_time_seconds ?? null
    v.play()
  } else if (isPdf.value) {
    pdfPage.value = seg.page_start ?? 1
  }
}

function onTimeUpdate() {
  const v = videoRef.value
  if (v && stopAt != null && v.currentTime >= stopAt) {
    v.pause()
    stopAt = null
  }
}
</script>

<style lang="scss" scoped>
.kv-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.kv-grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 24px;
  align-items: start;
}

.kv-media {
  position: sticky;
  top: 16px;
}

.kv-video {
  width: 100%;
  border-radius: 12px;
  background: #000;
}

.kv-pdf {
  width: 100%;
  height: 70vh;
  border: 1px solid #dde3ea;
  border-radius: 12px;
}

.kv-segments {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 4px;
}

.kv-seg {
  border-radius: 12px;

  &--active {
    border-color: var(--q-primary);
    box-shadow: 0 0 0 1px var(--q-primary);
  }
}

@media (max-width: 900px) {
  .kv-grid {
    grid-template-columns: 1fr;
  }

  .kv-media {
    position: static;
  }

  .kv-segments {
    max-height: none;
  }
}
</style>
