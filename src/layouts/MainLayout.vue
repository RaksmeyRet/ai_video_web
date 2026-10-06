<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="drawer = !drawer" />
        <q-toolbar-title class="app-title">KHEMRA NEXUS</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered :width="220">
      <q-list padding>
        <q-item-label header>Menu</q-item-label>

        <q-item v-for="link in links" :key="link.to" :to="link.to" clickable v-ripple>
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <div class="page-container">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(false)

const links = [
  { label: 'Home', icon: 'home', to: '/' },
  { label: 'Project', icon: 'video_library', to: '/projects/1' },
]
</script>