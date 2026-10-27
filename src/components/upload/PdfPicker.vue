<template>
  <div class="q-mt-lg">
    <div class="upload-card__section-title">PDF document (optional)</div>
    <div class="upload-card__section-hint">PDF only · up to {{ MAX_PDF_MB }} MB</div>

    <input ref="inputRef" type="file" accept="application/pdf" hidden @change="onPick" />

    <q-btn
      v-if="!model"
      outline
      rounded
      no-caps
      color="primary"
      icon="picture_as_pdf"
      label="Choose PDF"
      class="q-mt-sm"
      :disable="disabled"
      @click="inputRef?.click()"
    />

    <div v-else class="upload-card__file q-mt-sm">
      <q-icon name="picture_as_pdf" color="negative" size="22px" />
      <span class="upload-card__name">{{ model.name }}</span>
      <span class="upload-card__size">{{ humanStorageSize(model.size) }}</span>
      <q-btn
        flat
        round
        dense
        icon="close"
        aria-label="Remove PDF"
        :disable="disabled"
        @click="model = null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { format } from 'quasar'
import { MAX_PDF_MB, validatePdf } from '../../utils/upload'

const { humanStorageSize } = format

const model = defineModel({ default: null })
defineProps({ disabled: { type: Boolean, default: false } })
const emit = defineEmits(['error'])
const inputRef = ref(null)

function onPick(e) {
  const f = e.target.files?.[0]
  e.target.value = '' // allow picking the same file again
  if (!f) return
  const problem = validatePdf(f)
  emit('error', problem)
  if (!problem) model.value = f
}
</script>
