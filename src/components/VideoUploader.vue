<template>
  <div class="row q-col-gutter-lg">
    <!-- Step 1 -->
    <div class="col-12 col-md-5">
      <q-card flat class="app-card q-pa-md">
        <div class="text-subtitle1 text-weight-medium q-mb-sm">1. Choose video</div>

        <div
          class="dropzone"
          :class="{ 'dropzone--active': dragging, 'dropzone--filled': file }"
          @click="picker.pickFiles()"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="onDrop"
        >
          <q-icon
            :name="file ? 'check_circle' : 'cloud_upload'"
            :color="file ? 'positive' : 'primary'"
            size="48px"
          />
          <template v-if="file">
            <div class="text-weight-medium ellipsis full-width text-center">{{ file.name }}</div>
            <div class="text-caption text-grey-7">{{ sizeMB }} MB · click to change</div>
          </template>
          <div v-else class="text-center">
            Drag &amp; drop a video here<br />
            <span class="text-primary">or click to browse</span>
          </div>
        </div>
        <q-file ref="picker" v-model="file" accept="video/*" class="hidden" />

        <div class="text-subtitle1 text-weight-medium q-mt-lg q-mb-sm">2. Description</div>
        <q-input
          v-model="description"
          type="textarea"
          outlined
          autogrow
          maxlength="300"
          counter
          placeholder="What is this video about?"
        />

        <q-btn
          class="full-width q-mt-md"
          color="primary"
          size="lg"
          unelevated
          no-caps
          icon="send"
          label="Submit video"
          :disable="!file"
          @click="emit('submit', { file, description })"
        />
      </q-card>
    </div>

    <!-- Preview -->
    <div class="col-12 col-md-7">
      <q-card flat class="app-card q-pa-md">
        <div class="text-subtitle1 text-weight-medium q-mb-sm">Preview</div>
        <div class="video-box" :class="{ 'video-box--empty': !videoUrl }">
          <video v-if="videoUrl" ref="player" :src="videoUrl" controls />
          <span v-else>Your video will appear here</span>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const emit = defineEmits(['submit'])
const picker = ref(null)
const player = ref(null)
const file = ref(null)
const description = ref('')
const dragging = ref(false)
const videoUrl = ref('')

watch(file, (selectedFile) => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoUrl.value = selectedFile ? URL.createObjectURL(selectedFile) : ''
})

onBeforeUnmount(() => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
})

function onDrop(event) {
  dragging.value = false
  const droppedFile = event.dataTransfer?.files?.[0]
  if (droppedFile?.type.startsWith('video/')) file.value = droppedFile
}

function seek(seconds) {
  if (!player.value) return
  player.value.currentTime = seconds
  player.value.play()
  player.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const getTime = () => (player.value ? Math.floor(player.value.currentTime) : 0)

defineExpose({ seek, getTime })
</script>