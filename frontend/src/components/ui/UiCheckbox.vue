<script setup>
defineProps({
  modelValue: Boolean,
  label: { type: String, required: true },
  hint: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);
</script>
<template>
  <label
    ><input
      :checked="modelValue"
      type="checkbox"
      @change="emit('update:modelValue', $event.target.checked)"
    /><span aria-hidden="true">✓</span>
    <div>
      <b>{{ label }}</b
      ><small v-if="hint">{{ hint }}</small>
    </div></label
  >
</template>
<style scoped lang="scss">
@use '../../styles/tokens' as *;
label {
  position: relative;
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 12px;
  align-items: start;
  cursor: pointer;
}
input {
  position: absolute;
  opacity: 0;
}
label > span {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 2px solid $line;
  border-radius: 8px;
  color: transparent;
  background: white;
  transition: 0.18s ease;
}
input:checked + span {
  color: white;
  border-color: $violet;
  background: $violet;
}
input:focus-visible + span {
  @include focus-ring;
}
div {
  display: grid;
  gap: 3px;
}
b {
  color: $ink;
  font-size: 0.92rem;
  line-height: 1.4;
}
small {
  color: $muted;
  font-size: 0.8rem;
  line-height: 1.45;
}
</style>
