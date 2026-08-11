<script setup>
import AppButton from './AppButton.vue';
defineProps({
  modelValue: { type: [String, Number], required: true },
  options: { type: Array, required: true },
  label: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);
const valueOf = (option) => (typeof option === 'object' ? option.value : option);
const labelOf = (option) => (typeof option === 'object' ? option.label : option);
</script>
<template>
  <fieldset>
    <legend>{{ label }}</legend>
    <div>
      <AppButton
        v-for="option in options"
        :key="valueOf(option)"
        variant="bare"
        :class="{ active: modelValue === valueOf(option) }"
        :aria-pressed="modelValue === valueOf(option)"
        @click="emit('update:modelValue', valueOf(option))"
        >{{ labelOf(option) }}</AppButton
      >
    </div>
  </fieldset>
</template>
<style scoped lang="scss">
@use '../../styles/tokens' as *;
fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
legend {
  @include readable-label;
  margin-bottom: 8px;
}
div {
  display: flex;
  gap: 7px;
  padding: 6px;
  border: 1px solid color-mix(in srgb, #{$violet} 18%, #{$line});
  background: #eee8df;
  border-radius: 16px;
}
button {
  flex: 1;
  min-height: 44px !important;
  padding: 10px 14px !important;
  border: 1px solid transparent !important;
  border-radius: 11px !important;
  color: $muted !important;
  background: transparent !important;
  box-shadow: none !important;
  font: inherit;
  font-weight: 850 !important;
  cursor: pointer;
}
button:hover {
  color: $ink !important;
  background: rgba(255, 255, 255, 0.62) !important;
  transform: translateY(-1px);
}
button.active {
  color: white !important;
  border-color: $violet !important;
  background: $violet !important;
  box-shadow: 0 4px 0 color-mix(in srgb, #{$violet} 72%, #{$ink}) !important;
  transform: translateY(-2px);
}
button.active:active {
  transform: translateY(2px) !important;
  box-shadow: 0 1px 0 color-mix(in srgb, #{$violet} 72%, #{$ink}) !important;
}
button:focus-visible {
  @include focus-ring;
}
</style>
