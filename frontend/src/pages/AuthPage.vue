<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TurnstileWidget from '../components/auth/TurnstileWidget.vue';
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
const turnstileToken = ref('');
const turnstileError = ref('');
const turnstileWidget = ref(null);
const googleTarget = ref(null);
const isSignup = computed(() => route.name === 'signup');
const purpose = computed(() => (isSignup.value ? 'SIGNUP' : 'LOGIN'));
const challengeAction = computed(() => (isSignup.value ? 'signup' : 'login'));
const validEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
const canAuthenticate = computed(
  () => Boolean(auth.config?.turnstile?.enabled && turnstileToken.value) && !auth.busy,
);

function destination() {
  if (!auth.user?.profileComplete) return '/profile';
  const value = typeof route.query.redirect === 'string' ? route.query.redirect : '/story-studio';
  return value.startsWith('/') ? value : '/story-studio';
}

function resetVerification() {
  turnstileToken.value = '';
  turnstileWidget.value?.reset();
}

async function requestCode() {
  if (!turnstileToken.value) {
    turnstileError.value = 'Please complete the security check first.';
    return;
  }
  turnstileError.value = '';
  await auth.requestOtp(email.value.trim(), purpose.value, turnstileToken.value).catch(() => null);
  resetVerification();
}

async function verifyCode() {
  const user = await auth.verifyOtp(code.value.trim()).catch(() => null);
  if (user) router.replace(destination());
}

function loadGoogle() {
  if (!auth.config?.googleClientId || !googleTarget.value || !turnstileToken.value) return;
  const initialize = () => {
    if (!googleTarget.value) return;
    googleTarget.value.innerHTML = '';
    window.google?.accounts.id.initialize({
      client_id: auth.config.googleClientId,
      callback: async ({ credential }) => {
        const user = await auth
          .googleLogin(credential, purpose.value, turnstileToken.value)
          .catch(() => null);
        resetVerification();
        if (user) router.replace(destination());
      },
    });
    window.google?.accounts.id.renderButton(googleTarget.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: isSignup.value ? 'signup_with' : 'signin_with',
      width: Math.min(380, googleTarget.value.clientWidth || 380),
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

function changeEmail() {
  auth.challenge = null;
  auth.error = '';
  code.value = '';
  nextTick(() => turnstileWidget.value?.reset());
}

watch(turnstileToken, async (token) => {
  if (!token) return;
  turnstileError.value = '';
  await nextTick();
  loadGoogle();
});
watch(isSignup, async () => {
  changeEmail();
  resetVerification();
  await nextTick();
});

onMounted(async () => {
  await auth.bootstrap();
  if (auth.signedIn) return router.replace(destination());
});
</script>

<template>
  <div class="auth-page">
    <SiteHeader />
    <main class="auth-main">
      <section class="auth-layout" aria-labelledby="auth-title">
        <div class="auth-panel">
          <nav class="auth-tabs" aria-label="Account access">
            <RouterLink to="/login" :class="{ active: !isSignup }">Sign in</RouterLink>
            <RouterLink to="/signup" :class="{ active: isSignup }">Create account</RouterLink>
          </nav>

          <Transition name="auth-step" mode="out-in">
            <div v-if="!auth.challenge" key="request" class="auth-content">
              <header class="auth-heading">
                <p>
                  <span></span
                  >{{ isSignup ? 'Your creator journey starts here' : 'Good to see you again' }}
                </p>
                <h1 id="auth-title">
                  {{ isSignup ? 'Create stories people remember.' : 'Your stories are waiting.' }}
                </h1>
                <span>
                  {{
                    isSignup
                      ? 'One secure account for your original characters, voices, scenes, and private media.'
                      : 'Sign in without a password and continue from your protected creator workspace.'
                  }}
                </span>
              </header>

              <form class="auth-form" @submit.prevent="requestCode">
                <UiInput
                  v-model="email"
                  label="Email address"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  hint="We will email a short-lived 6-digit code."
                  required
                />

                <div class="security-check">
                  <div class="security-copy">
                    <span aria-hidden="true">✓</span>
                    <div>
                      <strong>Quick security check</strong>
                      <small>Stops automated sign-in abuse.</small>
                    </div>
                  </div>
                  <TurnstileWidget
                    v-if="auth.config?.turnstile?.enabled"
                    ref="turnstileWidget"
                    v-model:token="turnstileToken"
                    :site-key="auth.config.turnstile.siteKey"
                    :action="challengeAction"
                    @error="turnstileError = 'Security verification could not load. Please retry.'"
                    @expired="turnstileError = 'Security verification expired. Please retry.'"
                  />
                  <div
                    v-else-if="!auth.config"
                    class="security-loading"
                    aria-label="Loading security check"
                  >
                    <i></i><i></i>
                  </div>
                  <p v-else class="auth-notice">
                    Account access is unavailable until Turnstile is configured.
                  </p>
                  <p v-if="turnstileError" class="field-error" role="alert">{{ turnstileError }}</p>
                </div>

                <p v-if="auth.config && !auth.config.otpEnabled" class="auth-notice">
                  Email codes are unavailable until mail delivery is configured.
                </p>
                <p v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</p>

                <AppButton
                  type="submit"
                  block
                  arrow
                  :disabled="!canAuthenticate || !validEmail || !auth.config?.otpEnabled"
                >
                  {{
                    auth.busy
                      ? 'Sending securely…'
                      : isSignup
                        ? 'Create my account'
                        : 'Continue with email'
                  }}
                </AppButton>

                <template v-if="auth.config?.googleClientId">
                  <div class="divider"><span>or</span></div>
                  <div v-if="turnstileToken" ref="googleTarget" class="google-button"></div>
                  <p v-else class="google-lock">Finish the security check to use Google.</p>
                </template>
              </form>
            </div>

            <div v-else key="verify" class="auth-content verify-content">
              <div class="mail-mark" aria-hidden="true">
                <span>•••</span>
              </div>
              <header class="auth-heading">
                <p><span></span>Almost there</p>
                <h1 id="auth-title">Check your email.</h1>
                <span>
                  Enter the 6-digit code sent to <strong>{{ auth.challenge.destination }}</strong>
                </span>
              </header>
              <form class="auth-form" @submit.prevent="verifyCode">
                <UiInput
                  v-model="code"
                  label="Verification code"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  placeholder="123456"
                  hint="The code expires shortly and can be used only once."
                  required
                />
                <p v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</p>
                <AppButton type="submit" block arrow :disabled="auth.busy || code.length !== 6">
                  {{ auth.busy ? 'Verifying…' : 'Open my creator workspace' }}
                </AppButton>
                <button class="change-email" type="button" @click="changeEmail">
                  ← Use a different email
                </button>
              </form>
            </div>
          </Transition>

          <footer class="auth-legal">
            <span><i></i> Protected with HttpOnly sessions</span>
            <small>
              By continuing, you agree to our <RouterLink to="/terms">Terms</RouterLink> and
              <RouterLink to="/privacy">Privacy Policy</RouterLink>.
            </small>
          </footer>
        </div>

        <aside class="auth-showcase" aria-label="Original ToonSwap creator universe">
          <div class="showcase-topline">
            <span>Original IP only</span><small>Made for every generation</small>
          </div>
          <div class="showcase-copy">
            <p>ONE ACCOUNT. EVERY WORLD.</p>
            <h2>Make the cartoon only you could imagine.</h2>
          </div>
          <div class="character-stage" aria-hidden="true">
            <div class="portrait portrait-one"></div>
            <div class="portrait portrait-two"></div>
            <div class="portrait portrait-three"></div>
            <span class="voice-note">♪ Your voice</span>
            <span class="story-note">✦ Your story</span>
          </div>
          <div class="showcase-stats">
            <div><strong>216</strong><span>original character blueprints</span></div>
            <div><strong>200+</strong><span>language roadmap</span></div>
            <div><strong>15s–60m</strong><span>story planning</span></div>
          </div>
        </aside>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;

.auth-main {
  min-height: calc(100vh - 80px);
  display: grid;
  place-items: center;
  padding: clamp(104px, 10vw, 132px) clamp(14px, 4vw, 54px) 58px;
  background:
    radial-gradient(
      circle at 0 30%,
      color-mix(in srgb, #{$mint} 15%, transparent),
      transparent 25%
    ),
    radial-gradient(
      circle at 100% 80%,
      color-mix(in srgb, #{$coral} 13%, transparent),
      transparent 28%
    ),
    $canvas;
}

.auth-layout {
  width: min(1160px, 100%);
  display: grid;
  grid-template-columns: minmax(430px, 0.92fr) minmax(480px, 1.08fr);
  overflow: hidden;
  border: 1.5px solid $line;
  border-radius: 32px;
  background: white;
  box-shadow: $shadow-lift;
}

.auth-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: clamp(26px, 4vw, 48px);
  background: $paper;
}

.auth-tabs {
  width: fit-content;
  display: flex;
  gap: 5px;
  padding: 5px;
  border: 1px solid $line;
  border-radius: 15px;
  background: $soft;
}

.auth-tabs a {
  min-width: 118px;
  padding: 11px 16px;
  border-radius: 11px;
  color: $muted;
  text-align: center;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 900;
  transition: 0.18s ease;
}

.auth-tabs a.active {
  color: $ink;
  background: white;
  box-shadow: 0 5px 16px rgba(31, 23, 17, 0.09);
}

.auth-content {
  width: 100%;
  max-width: 470px;
  display: grid;
  gap: 28px;
  margin: clamp(34px, 6vh, 62px) auto 30px;
}

.auth-heading p {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 12px;
  color: $coral;
  font-size: 0.76rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.085em;
}

.auth-heading p span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: $mint;
  box-shadow: 0 0 0 5px color-mix(in srgb, #{$mint} 18%, transparent);
}

.auth-heading h1 {
  max-width: 10ch;
  margin: 0 0 14px;
  font-size: clamp(2.45rem, 4vw, 4.15rem);
  line-height: 0.96;
  letter-spacing: -0.062em;
  text-wrap: balance;
}

.auth-heading > span {
  display: block;
  max-width: 48ch;
  color: $muted;
  font-size: 1rem;
  line-height: 1.65;
}

.auth-form {
  display: grid;
  gap: 16px;
}

.security-check {
  display: grid;
  gap: 10px;
  padding: 13px 14px;
  border: 1px solid $line;
  border-radius: 17px;
  background: color-mix(in srgb, #{$soft} 48%, white);
}

.security-copy {
  display: flex;
  align-items: center;
  gap: 11px;
}

.security-copy > span {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1.5px solid $ink;
  border-radius: 11px;
  color: $ink;
  background: $mint;
  font-weight: 950;
}

.security-copy div {
  display: grid;
  gap: 2px;
}

.security-copy small,
.auth-legal small {
  color: $muted;
}

.security-loading {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
}

.security-loading i {
  height: 10px;
  flex: 1;
  border-radius: 999px;
  background: $line;
  animation: shimmer 1s ease-in-out infinite alternate;
}

.security-loading i:last-child {
  flex: 0.35;
}

.auth-error,
.auth-notice,
.field-error,
.google-lock {
  margin: 0;
  padding: 11px 13px;
  border-radius: 11px;
  font-size: 0.86rem;
  font-weight: 750;
  line-height: 1.45;
}

.auth-error,
.field-error {
  color: #9b241b;
  background: #fff0ed;
}
.auth-notice {
  color: #755200;
  background: #fff4ce;
}
.google-lock {
  color: $muted;
  background: $soft;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: $muted;
  font-size: 0.75rem;
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

.change-email {
  justify-self: center;
  padding: 8px;
  border: 0;
  color: $muted;
  background: none;
  font: inherit;
  font-size: 0.87rem;
  font-weight: 850;
  cursor: pointer;
}

.verify-content {
  align-content: center;
}

.mail-mark {
  width: 74px;
  height: 62px;
  display: grid;
  place-items: center;
  border: 2px solid $ink;
  border-radius: 16px;
  color: $ink;
  background: $gold;
  box-shadow: 6px 7px 0 $ink;
  transform: rotate(-3deg);
}

.mail-mark::before,
.mail-mark::after {
  content: '';
  position: absolute;
}

.mail-mark span {
  font-weight: 950;
  letter-spacing: 0.12em;
}

.auth-legal {
  display: grid;
  gap: 10px;
  margin-top: auto;
  padding-top: 22px;
  border-top: 1px solid $line;
  line-height: 1.5;
}

.auth-legal > span {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $muted;
  font-size: 0.78rem;
  font-weight: 850;
}

.auth-legal > span i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $mint;
  box-shadow: 0 0 0 4px color-mix(in srgb, #{$mint} 18%, transparent);
}

.auth-legal a {
  color: $coral;
  font-weight: 850;
}

.auth-showcase {
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: clamp(28px, 4vw, 48px);
  border-left: 1.5px solid $line;
  background:
    radial-gradient(circle at 78% 20%, rgba(255, 255, 255, 0.85), transparent 18%),
    linear-gradient(145deg, #fff0b6 0%, #ffd15d 45%, #ffc25a 100%);
}

.auth-showcase::before {
  content: '';
  position: absolute;
  top: -90px;
  right: -70px;
  width: 260px;
  height: 260px;
  border: 35px solid rgba(113, 82, 243, 0.16);
  border-radius: 50%;
}

.showcase-topline {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.showcase-topline span {
  padding: 8px 11px;
  border: 1.5px solid $ink;
  border-radius: 999px;
  background: white;
  font-size: 0.68rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.showcase-topline small {
  color: color-mix(in srgb, #{$ink} 68%, transparent);
  font-weight: 800;
}

.showcase-copy {
  position: relative;
  z-index: 2;
  margin-top: clamp(40px, 7vh, 74px);
}

.showcase-copy p {
  margin: 0 0 11px;
  color: color-mix(in srgb, #{$ink} 68%, transparent);
  font-size: 0.74rem;
  font-weight: 950;
  letter-spacing: 0.11em;
}

.showcase-copy h2 {
  max-width: 11ch;
  margin: 0;
  font-size: clamp(2.7rem, 4vw, 4.8rem);
  line-height: 0.95;
  letter-spacing: -0.065em;
}

.character-stage {
  position: relative;
  min-height: 300px;
  margin-top: auto;
}

.portrait {
  position: absolute;
  width: clamp(145px, 15vw, 205px);
  aspect-ratio: 0.82;
  border: 2px solid $ink;
  border-radius: 70px 70px 30px 30px;
  background-image: url('/art/character-atlas.png');
  background-size: 600% 400%;
  box-shadow: 9px 11px 0 $ink;
}

.portrait-one {
  left: 2%;
  bottom: 0;
  background-position: 0 0;
  transform: rotate(-7deg);
}
.portrait-two {
  z-index: 2;
  left: 33%;
  bottom: 8px;
  background-position: 20% 33.333%;
  transform: rotate(2deg);
}
.portrait-three {
  right: 0;
  bottom: -5px;
  background-position: 40% 66.666%;
  transform: rotate(8deg);
}

.voice-note,
.story-note {
  position: absolute;
  z-index: 3;
  padding: 9px 12px;
  border: 1.5px solid $ink;
  border-radius: 11px;
  background: white;
  box-shadow: 4px 5px 0 $ink;
  font-size: 0.75rem;
  font-weight: 950;
}

.voice-note {
  top: 18px;
  right: 3%;
  transform: rotate(4deg);
}
.story-note {
  left: 3%;
  bottom: 38px;
  transform: rotate(-5deg);
}

.showcase-stats {
  position: relative;
  z-index: 4;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 24px;
}

.showcase-stats div {
  display: grid;
  gap: 3px;
  padding: 12px;
  border: 1px solid rgba(23, 20, 31, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.52);
  backdrop-filter: blur(8px);
}

.showcase-stats strong {
  font-size: 1.15rem;
}
.showcase-stats span {
  font-size: 0.66rem;
  line-height: 1.3;
}

.auth-step-enter-active,
.auth-step-leave-active {
  transition: 0.22s ease;
}
.auth-step-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.auth-step-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes shimmer {
  to {
    opacity: 0.4;
  }
}

@media (max-width: 930px) {
  .auth-layout {
    grid-template-columns: minmax(400px, 1fr) minmax(330px, 0.75fr);
  }
  .auth-showcase {
    padding: 30px;
  }
  .showcase-copy h2 {
    font-size: clamp(2.5rem, 6vw, 3.8rem);
  }
  .portrait {
    width: clamp(125px, 17vw, 165px);
  }
  .character-stage {
    min-height: 265px;
  }
  .showcase-stats {
    grid-template-columns: 1fr;
  }
  .showcase-stats div {
    grid-template-columns: 70px 1fr;
    align-items: center;
  }
}

@media (max-width: 760px) {
  .auth-main {
    padding: 91px 12px 40px;
  }
  .auth-layout {
    grid-template-columns: 1fr;
    border-radius: 23px;
  }
  .auth-panel {
    padding: 20px 18px 28px;
  }
  .auth-tabs {
    width: 100%;
  }
  .auth-tabs a {
    min-width: 0;
    flex: 1;
  }
  .auth-content {
    margin: 34px auto 28px;
    gap: 23px;
  }
  .auth-heading h1 {
    max-width: 12ch;
    font-size: clamp(2.35rem, 11vw, 3.35rem);
  }
  .auth-showcase {
    min-height: 470px;
    border-top: 1.5px solid $line;
    border-left: 0;
  }
  .showcase-copy {
    margin-top: 34px;
  }
  .showcase-copy h2 {
    max-width: 12ch;
    font-size: clamp(2.5rem, 11vw, 3.6rem);
  }
  .character-stage {
    min-height: 240px;
  }
  .portrait {
    width: clamp(120px, 31vw, 175px);
  }
  .showcase-stats {
    grid-template-columns: repeat(3, 1fr);
  }
  .showcase-stats div {
    display: grid;
    grid-template-columns: 1fr;
  }
}

@media (max-width: 440px) {
  .auth-main {
    padding-inline: 8px;
  }
  .auth-layout {
    border-radius: 19px;
  }
  .auth-panel {
    padding-inline: 14px;
  }
  .auth-heading h1 {
    font-size: 2.55rem;
  }
  .security-check {
    padding-inline: 10px;
  }
  .auth-showcase {
    min-height: 420px;
    padding: 24px 18px;
  }
  .showcase-topline small {
    display: none;
  }
  .showcase-copy h2 {
    font-size: 2.65rem;
  }
  .character-stage {
    min-height: 210px;
  }
  .portrait {
    width: 122px;
    box-shadow: 6px 8px 0 $ink;
  }
  .voice-note {
    top: 2px;
  }
  .story-note {
    bottom: 25px;
  }
  .showcase-stats {
    gap: 5px;
  }
  .showcase-stats div {
    padding: 9px 7px;
  }
  .showcase-stats strong {
    font-size: 0.96rem;
  }
  .showcase-stats span {
    font-size: 0.58rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-step-enter-active,
  .auth-step-leave-active,
  .security-loading i {
    transition: none;
    animation: none;
  }
}
</style>
