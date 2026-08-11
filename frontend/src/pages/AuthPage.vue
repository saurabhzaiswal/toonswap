<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SiteHeader from '../components/SiteHeader.vue';
import SiteFooter from '../components/SiteFooter.vue';
import AppButton from '../components/ui/AppButton.vue';
import UiInput from '../components/ui/UiInput.vue';
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const email = ref('');
const code = ref('');
const googleTarget = ref(null);
const isSignup = computed(() => route.name === 'signup');

function destination() {
  if (!auth.user?.profileComplete) return '/profile';
  const value = typeof route.query.redirect === 'string' ? route.query.redirect : '/story-studio';
  return value.startsWith('/') ? value : '/story-studio';
}

async function requestCode() {
  await auth.requestOtp(email.value, isSignup.value ? 'SIGNUP' : 'LOGIN').catch(() => null);
}

async function verifyCode() {
  const user = await auth.verifyOtp(code.value).catch(() => null);
  if (user) router.replace(destination());
}

function loadGoogle() {
  if (!auth.config?.googleClientId || !googleTarget.value) return;
  const initialize = () => {
    window.google?.accounts.id.initialize({
      client_id: auth.config.googleClientId,
      callback: async ({ credential }) => {
        const user = await auth.googleLogin(credential).catch(() => null);
        if (user) router.replace(destination());
      },
    });
    window.google?.accounts.id.renderButton(googleTarget.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: isSignup.value ? 'signup_with' : 'signin_with',
      width: 360,
    });
  };
  if (window.google?.accounts) return initialize();
  const existing = document.querySelector('script[data-toonswap-google]');
  if (existing) return existing.addEventListener('load', initialize, { once: true });
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.dataset.toonswapGoogle = 'true';
  script.addEventListener('load', initialize, { once: true });
  document.head.appendChild(script);
}

onMounted(async () => {
  await auth.bootstrap();
  if (auth.signedIn) return router.replace(destination());
  await nextTick();
  loadGoogle();
});
</script>

<template>
  <div class="auth-page">
    <SiteHeader />
    <main class="auth-main">
      <section class="auth-card" aria-labelledby="auth-title">
        <div class="auth-copy">
          <p class="auth-kicker">Private by design · original by default</p>
          <h1 id="auth-title">
            {{ isSignup ? 'Create your ToonSwap account' : 'Welcome back, creator' }}
          </h1>
          <p>
            {{
              isSignup
                ? 'Save your characters, voices, stories, and consented media in one protected workspace.'
                : 'Continue building your original cartoon world securely.'
            }}
          </p>
          <ul>
            <li><span>✓</span> Passwordless email code</li>
            <li><span>✓</span> Google sign-in when configured</li>
            <li><span>✓</span> Passkeys are on the security roadmap</li>
          </ul>
        </div>

        <form class="auth-form" @submit.prevent="auth.challenge ? verifyCode() : requestCode()">
          <div class="form-heading">
            <span>{{ auth.challenge ? '02' : '01' }}</span>
            <div>
              <strong>{{
                auth.challenge ? 'Enter your 6-digit code' : 'Start with your email'
              }}</strong>
              <small v-if="auth.challenge">Sent to {{ auth.challenge.destination }}</small>
              <small v-else>No password to remember.</small>
            </div>
          </div>

          <UiInput
            v-if="!auth.challenge"
            v-model="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            required
          />
          <p v-if="auth.config && !auth.config.otpEnabled" class="auth-notice">
            Email sign-in is waiting for SMTP configuration on this deployment.
          </p>
          <UiInput
            v-else
            v-model="code"
            label="Verification code"
            inputmode="numeric"
            placeholder="123456"
            required
          />

          <p v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</p>
          <AppButton
            type="submit"
            block
            arrow
            :disabled="
              auth.busy || (auth.challenge ? code.length !== 6 : !email || !auth.config?.otpEnabled)
            "
          >
            {{
              auth.busy
                ? 'Please wait…'
                : auth.challenge
                  ? 'Verify and continue'
                  : 'Email me a code'
            }}
          </AppButton>
          <button
            v-if="auth.challenge"
            class="change-email"
            type="button"
            @click="
              auth.challenge = null;
              code = '';
            "
          >
            Use a different email
          </button>

          <div v-if="auth.config?.googleClientId" class="divider"><span>or</span></div>
          <div v-if="auth.config?.googleClientId" ref="googleTarget" class="google-button"></div>

          <p class="switch-auth">
            {{ isSignup ? 'Already have an account?' : 'New to ToonSwap?' }}
            <RouterLink :to="isSignup ? '/login' : '/signup'">{{
              isSignup ? 'Sign in' : 'Create one'
            }}</RouterLink>
          </p>
          <small class="legal-copy"
            >By continuing, you agree to our <RouterLink to="/terms">Terms</RouterLink> and
            <RouterLink to="/privacy">Privacy Policy</RouterLink>.</small
          >
        </form>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.auth-main {
  min-height: calc(100vh - 160px);
  padding: clamp(110px, 13vw, 160px) 24px 80px;
  background:
    radial-gradient(
      circle at 20% 20%,
      color-mix(in srgb, #{$gold} 18%, transparent),
      transparent 28%
    ),
    $canvas;
}
.auth-card {
  width: min(1050px, 100%);
  margin: auto;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  overflow: hidden;
  border: 1.5px solid $line;
  border-radius: 30px;
  background: $paper;
  box-shadow: $shadow-lift;
}
.auth-copy {
  padding: clamp(34px, 5vw, 64px);
  color: white;
  background: $ink;
}
.auth-kicker {
  color: $gold !important;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.auth-copy h1 {
  max-width: 10ch;
  margin: 18px 0;
  font-size: clamp(2.4rem, 5vw, 4.5rem);
  line-height: 0.96;
  letter-spacing: -0.055em;
}
.auth-copy p {
  color: #d8d4df;
  font-size: 1.02rem;
  line-height: 1.65;
}
.auth-copy ul {
  display: grid;
  gap: 14px;
  padding: 24px 0 0;
  list-style: none;
}
.auth-copy li {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: 750;
}
.auth-copy li span {
  color: $mint;
}
.auth-form {
  display: grid;
  align-content: center;
  gap: 20px;
  padding: clamp(30px, 5vw, 64px);
}
.form-heading {
  display: flex;
  gap: 13px;
  align-items: center;
}
.form-heading > span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  color: white;
  background: $violet;
  font-weight: 900;
}
.form-heading div {
  display: grid;
  gap: 2px;
}
.form-heading strong {
  font-size: 1.12rem;
}
.form-heading small,
.legal-copy {
  color: $muted;
  line-height: 1.5;
}
.auth-error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  color: #9b241b;
  background: #fff0ed;
  font-weight: 750;
}
.auth-notice {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  color: #755200;
  background: #fff4ce;
  font-weight: 750;
}
.change-email {
  justify-self: center;
  border: 0;
  color: $muted;
  background: none;
  text-decoration: underline;
  cursor: pointer;
}
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: $muted;
}
.divider::before,
.divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: $line;
}
.google-button {
  min-height: 44px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.switch-auth {
  margin: 2px 0 0;
  text-align: center;
}
.switch-auth a,
.legal-copy a {
  color: $coral;
  font-weight: 850;
}
.legal-copy {
  text-align: center;
}
@media (max-width: 760px) {
  .auth-main {
    padding: 96px 14px 44px;
  }
  .auth-card {
    grid-template-columns: 1fr;
    border-radius: 22px;
  }
  .auth-copy {
    padding: 30px 24px;
  }
  .auth-copy h1 {
    max-width: 13ch;
    font-size: 2.6rem;
  }
  .auth-copy ul {
    display: none;
  }
  .auth-form {
    padding: 30px 22px 36px;
  }
}
</style>
