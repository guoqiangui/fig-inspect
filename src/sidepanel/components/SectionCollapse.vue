<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  defaultOpen?: boolean
}>(), { defaultOpen: true })

const open = ref(props.defaultOpen)
</script>

<template>
  <div class="section-collapse">
    <button class="section-header" @click="open = !open">
      <span class="section-arrow" :class="{ open }">&#9654;</span>
      <span class="section-title">{{ title }}</span>
    </button>
    <div v-show="open" class="section-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.section-collapse {
  border-bottom: 1px solid #e5e7eb;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.section-header:hover {
  background: #f9fafb;
}
.section-arrow {
  font-size: 8px;
  transition: transform 0.15s;
  color: #9ca3af;
}
.section-arrow.open {
  transform: rotate(90deg);
}
.section-title {
  flex: 1;
  text-align: left;
}
.section-body {
  padding: 4px 12px 8px;
}
</style>
