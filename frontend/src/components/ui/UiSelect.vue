<script setup>
import VSelect from 'vue-select';
import { nextUiId } from './id';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  id: { type: String, default: '' },
  options: { type: Array, required: true },
  hint: { type: String, default: '' },
  placeholder: { type: String, default: 'Choose an option…' },
  disabled: Boolean,
  searchable: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'change']);
const controlId = props.id || nextUiId('toon-select');
const optionValue = (option) => (typeof option === 'object' ? option.value : option);
const optionLabel = (option) => (typeof option === 'object' ? option.label : option);
const optionDescription = (option) => (typeof option === 'object' ? option.description : '');
const optionAvatar = (option) => (typeof option === 'object' ? option.avatar : '');
const optionAvatarStyle = (option) => (typeof option === 'object' ? option.avatarStyle : null);

function updateValue(value) {
  emit('update:modelValue', value ?? '');
  emit('change', value ?? '');
}
</script>

<template>
  <div class="field">
    <label :id="`${controlId}-label`" class="label" :for="controlId">{{ label }}</label>
    <VSelect
      :input-id="controlId"
      class="toon-select"
      :model-value="modelValue"
      :options="options"
      :reduce="optionValue"
      :get-option-label="optionLabel"
      :get-option-key="optionValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :searchable="searchable"
      :clearable="false"
      :filterable="searchable"
      :aria-labelledby="`${controlId}-label`"
      :aria-describedby="hint ? `${controlId}-help` : undefined"
      @update:model-value="updateValue"
    >
      <template #selected-option="option">
        <span
          v-if="optionAvatar(option) || optionAvatarStyle(option)"
          class="option-avatar"
          :style="optionAvatarStyle(option)"
          ><img v-if="optionAvatar(option)" :src="optionAvatar(option)" alt=""
        /></span>
        <span class="option-copy"
          ><b>{{ optionLabel(option) }}</b
          ><small v-if="optionDescription(option)">{{ optionDescription(option) }}</small></span
        >
      </template>
      <template #option="option">
        <span
          v-if="optionAvatar(option) || optionAvatarStyle(option)"
          class="option-avatar"
          :style="optionAvatarStyle(option)"
          ><img v-if="optionAvatar(option)" :src="optionAvatar(option)" alt=""
        /></span>
        <span class="option-copy"
          ><b>{{ optionLabel(option) }}</b
          ><small v-if="optionDescription(option)">{{ optionDescription(option) }}</small></span
        >
      </template>
      <template #no-options="{ search }"
        ><span class="empty-option">No match for “{{ search }}”. Try another word.</span></template
      >
      <template #open-indicator="{ attributes }"
        ><span v-bind="attributes" class="chevron" aria-hidden="true"></span
      ></template>
    </VSelect>
    <small v-if="hint" :id="`${controlId}-help`" class="hint">{{ hint }}</small>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as *;
.field {
  position: relative;
  display: grid;
  gap: 8px;
  min-width: 0;
}
.label {
  @include readable-label;
}
.hint {
  color: $muted;
  font-size: 0.82rem;
  line-height: 1.4;
}
.option-avatar {
  flex: 0 0 auto;
  display: block;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, #{$ink} 25%, transparent);
  border-radius: 12px;
  background-color: var(--color-secondary-soft);
  background-repeat: no-repeat;
}
.option-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.option-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.option-copy b {
  overflow: hidden;
  color: inherit;
  font-size: 0.98rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.option-copy small {
  overflow: hidden;
  color: $muted;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty-option {
  display: block;
  padding: 18px 12px;
  color: $muted;
  line-height: 1.45;
}
.chevron {
  display: block;
  width: 10px;
  height: 10px;
  border-right: 2px solid $ink;
  border-bottom: 2px solid $ink;
  transform: translateY(-3px) rotate(45deg);
  transition: transform 0.16s ease;
}
:deep(.vs--open .chevron) {
  transform: translateY(3px) rotate(225deg);
}
:deep(.vs__dropdown-toggle) {
  min-height: 58px;
  padding: 5px 9px 5px 12px;
  border: 1.5px solid $line;
  border-radius: $radius-sm;
  background: $paper;
  cursor: text;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.08s ease;
}
:deep(.vs__dropdown-toggle:hover) {
  border-color: color-mix(in srgb, #{$violet} 55%, #{$line});
}
:deep(.vs--open .vs__dropdown-toggle),
:deep(.vs__dropdown-toggle:focus-within) {
  border-color: $violet;
  box-shadow: 0 0 0 4px color-mix(in srgb, #{$violet} 16%, transparent);
}
:deep(.vs__selected-options) {
  min-width: 0;
  padding: 0;
}
:deep(.vs__selected) {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
:deep(.vs__search),
:deep(.vs__search:focus) {
  min-height: 44px;
  margin: 0;
  padding: 0 6px;
  color: $ink;
  font: inherit;
  font-size: 0.96rem;
}
:deep(.vs__search::placeholder) {
  color: #948d9d;
  opacity: 1;
}
:deep(.vs__actions) {
  padding: 0 8px;
}
:deep(.vs__dropdown-menu) {
  z-index: 120;
  top: calc(100% + 7px);
  max-height: min(320px, 46vh);
  padding: 8px;
  overflow-x: hidden;
  overscroll-behavior: contain;
  border: 1.5px solid $ink;
  border-radius: 16px;
  background: $paper;
  box-shadow: $shadow-lift;
  scrollbar-width: thin;
}
:deep(.vs__dropdown-option) {
  display: flex;
  gap: 11px;
  align-items: center;
  min-height: 54px;
  margin: 2px 0;
  padding: 7px 10px;
  border-radius: 11px;
  color: $ink;
  white-space: normal;
}
:deep(.vs__dropdown-option--highlight) {
  color: $ink;
  background: var(--color-soft);
}
:deep(.vs__dropdown-option--selected) {
  color: white;
  background: $violet;
}
:deep(.vs__dropdown-option--selected .option-copy small) {
  color: rgba(255, 255, 255, 0.78);
}
:deep(.vs--disabled .vs__dropdown-toggle) {
  cursor: not-allowed;
  opacity: 0.52;
}
</style>
