<template>
  <div class="markdown-result">
    <Markdown :source="text" />
  </div>
</template>

<script setup>
import Markdown from 'vue3-markdown-it'

const props = defineProps({
  text: String
})
</script>

<style scoped>
.markdown-result {
  max-width: 100%;
  line-height: 1.6;
  padding: 1em;
}
</style>
