<template>
  <q-page padding class="home-page">
    <div class="page-container">
      <section class="hero">
        <div class="hero__eyebrow">Video-grounded AI search</div>
        <h1 class="hero__title">Turn videos into searchable answers</h1>
        <p class="hero__sub">
          Upload a video, preview it, and jump to the exact moment that answers your question.
        </p>
        <q-btn
          to="/projects/1/upload"
          color="primary"
          size="lg"
          unelevated
          rounded
          no-caps
          icon="upload"
          label="Upload a video"
          class="hero__button"
        />
      </section>

      <section class="row q-col-gutter-md steps">
        <div v-for="feature in features" :key="feature.title" class="col-12 col-md-4">
          <q-card flat class="app-card feature">
            <q-avatar
              rounded
              size="56px"
              color="blue-1"
              text-color="primary"
              :icon="feature.icon"
              class="feature__icon"
            />
            <div class="feature__title">{{ feature.title }}</div>
            <div class="feature__text">{{ feature.text }}</div>
          </q-card>
        </div>
      </section>
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

<style lang="scss" src="../css/IndexPage.scss" scoped></style>
