<template>
  <div>
    <div class="row items-center q-mb-md q-gutter-sm">
      <div class="text-h6">Segments</div>
      <q-badge color="primary" rounded>{{ filtered.length }}</q-badge>
      <q-space />
      <q-input
        v-model="search"
        dense
        outlined
        rounded
        clearable
        placeholder="Search title, keyword, question..."
        style="min-width: 280px"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>
    </div>

    <div v-if="!filtered.length" class="text-grey-6 text-center q-pa-xl">
      <q-icon name="movie_filter" size="48px" />
      <div>No segments found</div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="s in filtered" :key="s.segment_id" class="col-12">
        <q-card flat class="app-card segment q-pa-md">
          <div class="row items-center no-wrap">
            <q-btn
              unelevated
              rounded
              dense
              no-caps
              color="primary"
              icon="play_arrow"
              :label="s.time"
              class="q-px-sm"
              @click="emit('seek', s.time)"
            />
            <q-space />
            <span class="text-caption text-grey-6">{{ s.segment_id }}</span>
          </div>

          <div class="text-subtitle1 text-weight-medium q-mt-sm">{{ s.title }}</div>
          <div class="text-grey-8 q-mb-sm">{{ s.summary }}</div>

          <q-chip
            v-for="k in s.keywords"
            :key="k"
            dense
            size="sm"
            color="blue-1"
            text-color="primary"
          >
            {{ k }}
          </q-chip>

          <q-expansion-item dense icon="help_outline" label="Possible questions" class="q-mt-sm">
            <q-list dense>
              <q-item v-for="q in s.questions" :key="q">
                <q-item-section>{{ q }}</q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ segments: { type: Array, default: () => [] } })
const emit = defineEmits(['seek'])

const search = ref('')

const filtered = computed(() => {
  const q = (search.value || '').toLowerCase().trim()
  if (!q) return props.segments
  return props.segments.filter((s) =>
    [s.title, s.summary, ...s.keywords, ...s.questions].join(' ').toLowerCase().includes(q),
  )
})
</script>