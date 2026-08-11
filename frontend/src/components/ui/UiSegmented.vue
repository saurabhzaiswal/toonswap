<script setup>
import AppButton from './AppButton.vue';
defineProps({ modelValue: { type: [String, Number], required: true }, options: { type: Array, required: true }, label: { type: String, required: true } });
const emit = defineEmits(['update:modelValue']);
const valueOf = (option) => typeof option === 'object' ? option.value : option;
const labelOf = (option) => typeof option === 'object' ? option.label : option;
</script>
<template><fieldset><legend>{{ label }}</legend><div><AppButton v-for="option in options" :key="valueOf(option)" variant="bare" :class="{ active: modelValue === valueOf(option) }" :aria-pressed="modelValue === valueOf(option)" @click="emit('update:modelValue', valueOf(option))">{{ labelOf(option) }}</AppButton></div></fieldset></template>
<style scoped lang="scss">
@use '../../styles/tokens' as *;
fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
legend { @include readable-label; margin-bottom: 8px; }
div { display: flex; gap: 6px; padding: 5px; background: #eee8df; border-radius: 16px; }
button { flex: 1; min-height: 44px; padding: 10px 14px; border: 0; border-radius: 12px; color: $muted; background: transparent; font: inherit; font-weight: 800; cursor: pointer; }
button.active { color: $ink; background: white; box-shadow: 0 5px 16px rgba(23, 19, 33, .09); }
button:focus-visible { @include focus-ring; }
</style>
