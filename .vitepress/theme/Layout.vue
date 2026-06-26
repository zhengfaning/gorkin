<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-before>
      <GlobalRunButton />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import GlobalRunButton from '../../src/components/GlobalRunButton.vue'
</script>
