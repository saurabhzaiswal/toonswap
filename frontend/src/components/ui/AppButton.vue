<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  to: { type: [String, Object], default: '' },
  href: { type: String, default: '' },
  disabled: Boolean,
  block: Boolean,
  arrow: Boolean,
  iconOnly: Boolean,
});
const tag = computed(() => props.to ? RouterLink : props.href ? 'a' : 'button');
</script>

<template>
  <component :is="tag" :to="to || undefined" :href="href || undefined" :type="!to && !href ? type : undefined" :disabled="!to && !href ? disabled : undefined" :aria-disabled="(to || href) && disabled ? 'true' : undefined" :tabindex="(to || href) && disabled ? -1 : undefined" class="app-button" :class="[`variant-${variant}`, { block, 'icon-only': iconOnly, disabled }]">
    <slot />
    <span v-if="arrow || $slots.icon" class="button-icon" aria-hidden="true"><slot name="icon">→</slot></span>
  </component>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as *;
.app-button { --button-bg: #{$coral}; --button-ink: white; --button-shadow: var(--color-primary-strong); --button-glow: color-mix(in srgb, #{$coral} 24%, transparent); --button-depth: 8px; position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 22px; min-height: 54px; padding: 0 22px 0 24px; border: 1.5px solid transparent; border-radius: 15px; color: var(--button-ink); background: var(--button-bg); box-shadow: 0 var(--button-depth) 0 var(--button-shadow), 0 16px 26px var(--button-glow); font: inherit; font-weight: 900; line-height: 1.1; text-decoration: none; cursor: pointer; transform: translateY(0) scale(1); transform-origin: center bottom; transition: transform .14s cubic-bezier(.2,.8,.2,1), box-shadow .14s ease, filter .14s ease, opacity .14s ease; user-select: none; touch-action: manipulation; }
.app-button:hover:not(.disabled):not(:disabled) { transform: translateY(-2px); filter: saturate(1.08) brightness(1.02); box-shadow: 0 calc(var(--button-depth) + 3px) 0 var(--button-shadow), 0 20px 32px var(--button-glow); }
.app-button:active:not(.disabled):not(:disabled) { transform: translateY(6px) scale(.985); filter: brightness(.94); box-shadow: 0 2px 0 var(--button-shadow), 0 7px 13px var(--button-glow); transition-duration: .055s; }
.app-button:focus-visible { outline: 3px solid color-mix(in srgb, #{$violet} 62%, white); outline-offset: 4px; }
.variant-primary { --button-bg: #{$coral}; --button-ink: white; --button-shadow: var(--color-primary-strong); --button-glow: color-mix(in srgb, #{$coral} 25%, transparent); }
.variant-dark { --button-bg: #{$ink}; --button-ink: white; --button-shadow: color-mix(in srgb, #{$ink} 76%, black); --button-glow: color-mix(in srgb, #{$ink} 20%, transparent); }
.variant-secondary { --button-bg: #{$mint}; --button-ink: #{$ink}; --button-shadow: color-mix(in srgb, #{$mint} 72%, #{$ink}); --button-glow: color-mix(in srgb, #{$mint} 24%, transparent); }
.variant-accent { --button-bg: #{$gold}; --button-ink: #{$ink}; --button-shadow: color-mix(in srgb, #{$gold} 72%, #{$ink}); --button-glow: color-mix(in srgb, #{$gold} 25%, transparent); border-color: $ink; }
.variant-outline { --button-bg: #{$paper}; --button-ink: #{$ink}; --button-shadow: color-mix(in srgb, #{$line} 68%, #{$ink}); --button-glow: color-mix(in srgb, #{$ink} 8%, transparent); border-color: $ink; }
.variant-ghost { --button-shadow: transparent; min-height: 44px; padding: 8px 12px; color: $ink; background: transparent; box-shadow: none; }
.variant-danger { --button-bg: var(--color-danger); --button-ink: white; --button-shadow: color-mix(in srgb, var(--color-danger) 70%, #{$ink}); --button-glow: color-mix(in srgb, var(--color-danger) 24%, transparent); }
.variant-bare { min-height: 0; padding: 0; border: 0; border-radius: 0; color: inherit; background: transparent; box-shadow: none; font-weight: inherit; }
.variant-bare:hover:not(.disabled):not(:disabled) { transform: translateY(-1px); box-shadow: none; filter: none; }.variant-bare:active:not(.disabled):not(:disabled) { transform: translateY(1px) scale(.97); box-shadow: none; opacity: .78; }
.button-icon { display: inline-grid; place-items: center; font-size: 1.25rem; line-height: 1; }
.block { width: 100%; }.icon-only { width: 50px; min-width: 50px; padding: 0; gap: 0; }.disabled, .app-button:disabled { pointer-events: none; cursor: not-allowed; opacity: .46; filter: grayscale(.18); box-shadow: 0 3px 0 color-mix(in srgb, #{$line} 70%, #{$ink}); transform: translateY(4px); }
@media (prefers-reduced-motion: reduce) { .app-button { transition-duration: .01ms; }.app-button:hover:not(.disabled):not(:disabled), .app-button:active:not(.disabled):not(:disabled) { transform: none; } }
</style>
