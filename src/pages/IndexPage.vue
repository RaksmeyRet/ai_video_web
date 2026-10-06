<template>
  <q-page padding>
    <section class="hero">
      <div class="text-overline text-primary">VIDEO-GROUNDED AI SEARCH</div>
      <div class="hero__title">Turn videos into searchable answers</div>
      <p class="hero__sub">
        Upload a video, preview it, and jump to the exact moment that answers your question.
      </p>
      <q-btn
        to="/projects/1"
        color="primary"
        size="lg"
        unelevated
        rounded
        no-caps
        icon="upload"
        label="Upload a video"
      />
    </section>

    <div class="row q-col-gutter-md q-mt-md">
      <div v-for="f in features" :key="f.title" class="col-12 col-md-4">
        <q-card flat class="app-card feature q-pa-lg">
          <q-avatar color="blue-1" text-color="primary" :icon="f.icon" size="56px" />
          <div class="text-h6 q-mt-md">{{ f.title }}</div>
          <div class="text-grey-7">{{ f.text }}</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
const features = [
  { icon: 'cloud_upload', title: 'Upload', text: 'Drop in a video and add a short description.' },
  { icon: 'smart_display', title: 'Preview', text: 'Check the video before you submit it.' },
  { icon: 'manage_search', title: 'Search segments', text: 'Find any topic and play it instantly.' },
]
</script>