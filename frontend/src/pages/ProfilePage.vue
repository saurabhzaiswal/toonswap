<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import SiteHeader from '../components/SiteHeader.vue';
import SiteFooter from '../components/SiteFooter.vue';
import AppButton from '../components/ui/AppButton.vue';
import UiCheckbox from '../components/ui/UiCheckbox.vue';
import UiInput from '../components/ui/UiInput.vue';
import { apiFetch, apiRoot } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore();
const router = useRouter();
const saving = ref(false);
const message = ref('');
const error = ref('');
const avatarInput = ref(null);
const avatarVersion = ref(Date.now());
const form = reactive({
  name: '',
  dateOfBirth: '',
  city: '',
  countryCode: '',
  locale: navigator.language || 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  acceptTerms: false,
  acceptPrivacy: false,
});

async function load() {
  const profile = await apiFetch('/users/me');
  Object.assign(form, {
    name: profile.name || '',
    dateOfBirth: profile.dateOfBirth?.slice(0, 10) || '',
    city: profile.city || '',
    countryCode: profile.countryCode || '',
    locale: profile.locale || navigator.language || 'en',
    timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    acceptTerms: Boolean(profile.profileComplete),
    acceptPrivacy: Boolean(profile.profileComplete),
  });
  auth.user = profile;
}

async function save() {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    await auth.updateProfile({ ...form, countryCode: form.countryCode.toUpperCase() });
    message.value =
      auth.user.ageGateStatus === 'ELIGIBLE'
        ? 'Profile saved. Your creator workspace is ready.'
        : 'Profile saved. Creation remains locked until the required age policy or guardian flow is configured.';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    saving.value = false;
  }
}

async function uploadAvatar(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    const slot = await apiFetch('/users/me/avatar/upload-session', {
      method: 'POST',
      body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
    });
    const uppy = new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 5 * 1024 * 1024,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
      },
    });
    uppy.use(XHRUpload, {
      endpoint: slot.uploadUrl,
      method: 'PUT',
      formData: false,
      headers: { 'Content-Type': file.type },
      allowedMetaFields: false,
      getResponseData: () => ({}),
    });
    uppy.addFile({ name: file.name, type: file.type, data: file });
    const result = await uppy.upload();
    uppy.destroy();
    if (result.failed?.length) throw new Error(result.failed[0].error?.message || 'Upload failed');
    await apiFetch('/users/me/avatar/finalize', { method: 'POST' });
    await auth.refresh();
    avatarVersion.value = Date.now();
    message.value = 'Profile picture updated.';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    saving.value = false;
    event.target.value = '';
  }
}

async function deleteAccount() {
  if (
    !window.confirm(
      'Permanently delete your ToonSwap account and its stored media? This cannot be undone.',
    )
  )
    return;
  await apiFetch('/users/me', {
    method: 'DELETE',
    body: JSON.stringify({ confirmation: 'DELETE' }),
  });
  auth.user = null;
  router.replace('/');
}

onMounted(load);
</script>

<template>
  <div>
    <SiteHeader />
    <main class="profile-main">
      <header class="profile-hero">
        <div>
          <p>Account & creator safety</p>
          <h1>Make ToonSwap feel like yours.</h1>
          <span>Your private profile helps us apply the right safety and generation policy.</span>
        </div>
        <div class="identity-card">
          <img
            v-if="auth.user?.avatarUrl"
            :src="`${apiRoot}/users/me/avatar?v=${avatarVersion}`"
            alt="Your profile"
          />
          <span v-else>{{ (form.name || auth.user?.email || 'T').slice(0, 1).toUpperCase() }}</span>
          <div>
            <strong>{{ form.name || 'Complete your profile' }}</strong
            ><small>{{ auth.user?.email }}</small>
          </div>
          <AppButton size="sm" variant="outline" @click="avatarInput.click()"
            >Change photo</AppButton
          >
          <input
            ref="avatarInput"
            class="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="uploadAvatar"
          />
        </div>
      </header>

      <form class="profile-card" @submit.prevent="save">
        <div class="section-title">
          <span>01</span>
          <div>
            <h2>About you</h2>
            <p>Only collect what is needed for your account and safety settings.</p>
          </div>
        </div>
        <div class="form-grid">
          <UiInput
            v-model="form.name"
            label="Display name"
            placeholder="How should we address you?"
            required
          />
          <UiInput
            v-model="form.dateOfBirth"
            label="Date of birth"
            type="date"
            required
            hint="Used to apply the configured age policy; never shown publicly."
          />
          <UiInput v-model="form.city" label="City" placeholder="New Delhi" required />
          <UiInput
            v-model="form.countryCode"
            label="Country code"
            placeholder="IN"
            required
            hint="Two-letter country code, such as IN, US, or BR."
          />
          <UiInput v-model="form.locale" label="Preferred locale" placeholder="hi-IN" />
          <UiInput v-model="form.timezone" label="Timezone" placeholder="Asia/Kolkata" />
        </div>
        <div class="agreements">
          <UiCheckbox v-model="form.acceptTerms"
            >I agree to the <RouterLink to="/terms">Terms</RouterLink>.</UiCheckbox
          >
          <UiCheckbox v-model="form.acceptPrivacy"
            >I understand the <RouterLink to="/privacy">Privacy Policy</RouterLink>.</UiCheckbox
          >
        </div>
        <p v-if="message" class="success" role="status">{{ message }}</p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <div class="form-actions">
          <AppButton type="submit" arrow :disabled="saving">{{
            saving ? 'Saving…' : 'Save profile'
          }}</AppButton
          ><AppButton variant="outline" to="/story-studio">Open Story Studio</AppButton>
        </div>
      </form>

      <section class="danger-zone">
        <div>
          <h2>Delete account</h2>
          <p>Deletes the account and stored media. This action cannot be reversed.</p>
        </div>
        <AppButton variant="danger" size="sm" @click="deleteAccount">Delete permanently</AppButton>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.profile-main {
  min-height: 80vh;
  padding: 128px max(20px, 5vw) 80px;
  background: $canvas;
}
.profile-hero,
.profile-card,
.danger-zone {
  width: min(1120px, 100%);
  margin-inline: auto;
}
.profile-hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 34px;
  align-items: end;
  margin-bottom: 30px;
}
.profile-hero p {
  margin: 0 0 10px;
  color: $coral;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.profile-hero h1 {
  max-width: 12ch;
  margin: 0 0 12px;
  font-size: clamp(2.8rem, 5vw, 5rem);
  line-height: 0.94;
  letter-spacing: -0.06em;
}
.profile-hero > div > span {
  color: $muted;
  font-size: 1.05rem;
}
.identity-card {
  display: grid;
  grid-template-columns: 68px 1fr auto;
  gap: 15px;
  align-items: center;
  padding: 18px;
  border: 1.5px solid $line;
  border-radius: 22px;
  background: white;
  box-shadow: $shadow-soft;
}
.identity-card > img,
.identity-card > span {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border: 2px solid $ink;
  border-radius: 20px;
  object-fit: cover;
  background: $gold;
  font-size: 1.7rem;
  font-weight: 900;
}
.identity-card div {
  display: grid;
  gap: 4px;
  min-width: 0;
}
.identity-card small {
  overflow: hidden;
  color: $muted;
  text-overflow: ellipsis;
}
.profile-card {
  padding: clamp(24px, 5vw, 52px);
  border: 1.5px solid $line;
  border-radius: 28px;
  background: white;
  box-shadow: $shadow-soft;
}
.section-title {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  margin-bottom: 30px;
}
.section-title > span {
  padding: 9px 11px;
  border-radius: 10px;
  color: white;
  background: $ink;
  font-weight: 900;
}
.section-title h2 {
  margin: 0;
  font-size: 1.6rem;
}
.section-title p {
  margin: 4px 0;
  color: $muted;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}
.agreements {
  display: grid;
  gap: 12px;
  margin-top: 28px;
  padding: 20px;
  border-radius: 16px;
  background: $soft;
}
.agreements a {
  color: $coral;
  font-weight: 800;
}
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 24px;
}
.success,
.error {
  padding: 13px 16px;
  border-radius: 12px;
  font-weight: 750;
}
.success {
  background: #e7faf5;
  color: #126a58;
}
.error {
  background: #fff0ed;
  color: #9b241b;
}
.danger-zone {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-top: 28px;
  padding: 26px 30px;
  border: 1.5px solid #e7b3ae;
  border-radius: 22px;
  background: #fff8f6;
}
.danger-zone h2,
.danger-zone p {
  margin: 0;
}
.danger-zone p {
  margin-top: 5px;
  color: $muted;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
@media (max-width: 820px) {
  .profile-main {
    padding: 104px 14px 50px;
  }
  .profile-hero {
    grid-template-columns: 1fr;
  }
  .identity-card {
    grid-template-columns: 58px 1fr;
  }
  .identity-card > img,
  .identity-card > span {
    width: 58px;
    height: 58px;
  }
  .identity-card .app-button {
    grid-column: 1 / -1;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .danger-zone {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
