<template>
  <q-card flat class="app-card q-pa-md">
    <div class="text-subtitle1 text-weight-medium q-mb-md">Add segment</div>

    <q-form ref="formRef" class="q-gutter-md" @submit.prevent="onSubmit">
      <!-- Time -->
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-input
            v-model="start"
            outlined
            label="Start (mm:ss)"
            mask="##:##"
            placeholder="06:16"
            :rules="[rules.time]"
          >
            <template #append>
              <q-btn flat round dense icon="my_location" @click="start = nowTime()">
                <q-tooltip>Use current video time</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>
        <div class="col-6">
          <q-input
            v-model="end"
            outlined
            label="End (mm:ss)"
            mask="##:##"
            placeholder="08:40"
            :rules="[rules.time, rules.afterStart]"
          >
            <template #append>
              <q-btn flat round dense icon="my_location" @click="end = nowTime()">
                <q-tooltip>Use current video time</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>
      </div>

      <q-input
        v-model="title"
        outlined
        label="Title"
        :rules="[(v) => !!v || 'Title is required']"
      />

      <q-input
        v-model="summary"
        type="textarea"
        outlined
        autogrow
        label="Summary"
        :rules="[(v) => !!v || 'Summary is required']"
      />

      <q-select
        v-model="keywords"
        outlined
        multiple
        use-chips
        use-input
        hide-dropdown-icon
        new-value-mode="add-unique"
        @new-value="addKeywords"
        label="Keywords"
        hint="Separate keywords with commas, or press Enter after each one"
        :rules="[(v) => v.length > 0 || 'Add at least one keyword']"
      />

      <q-select
        v-model="questions"
        outlined
        multiple
        use-chips
        use-input
        hide-dropdown-icon
        new-value-mode="add-unique"
        label="Possible questions"
        hint="Type a question and press Enter"
      />

      <q-btn
        type="submit"
        color="primary"
        unelevated
        no-caps
        size="lg"
        class="full-width"
        icon="add"
        label="Add segment"
      />
    </q-form>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { toSeconds, formatTime } from '@/untils/time.js'

const props = defineProps({
  // function that returns the current video time in seconds
  getTime: { type: Function, default: () => 0 },
})
const emit = defineEmits(['add'])

const formRef = ref(null)
const start = ref('')
const end = ref('')
const title = ref('')
const summary = ref('')
const keywords = ref([])
const questions = ref([])

const nowTime = () => formatTime(props.getTime())

function addKeywords(inputValue, done) {
  const additions = inputValue
    .split(/[,\n;]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
  const existing = new Set(keywords.value.map((keyword) => keyword.toLowerCase()))

  for (const keyword of additions) {
    const normalized = keyword.toLowerCase()
    if (!existing.has(normalized)) {
      keywords.value.push(keyword)
      existing.add(normalized)
    }
  }
  done()
}

const rules = {
  time: (v) => /^\d{2}:[0-5]\d$/.test(v || '') || 'Use mm:ss',
  afterStart: (v) =>
    !/^\d{2}:[0-5]\d$/.test(start.value) ||
    toSeconds(v) > toSeconds(start.value) ||
    'End must be after start',
}

function onSubmit() {
  emit('add', {
    time: `${start.value}-${end.value}`,
    title: title.value.trim(),
    summary: summary.value.trim(),
    keywords: keywords.value,
    questions: questions.value,
  })
  start.value = end.value = title.value = summary.value = ''
  keywords.value = []
  questions.value = []
  formRef.value.resetValidation()
}
</script>