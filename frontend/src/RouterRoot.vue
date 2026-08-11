<script setup>
import { onMounted } from 'vue';
import { Analytics } from '@vercel/analytics/vue';
import { useProjectStore } from './stores/projectStore';

const projectStore = useProjectStore();
onMounted(() => projectStore.hydrate());
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="route-fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <Analytics />
</template>
