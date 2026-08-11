import { defineStore } from 'pinia';
import { apiFetch, loginFetch } from '../lib/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    config: null,
    policy: null,
    ready: false,
    busy: false,
    challenge: null,
    error: '',
  }),
  getters: {
    signedIn: (state) => Boolean(state.user),
    isAdmin: (state) => state.user?.role === 'ADMIN',
    needsProfile: (state) => Boolean(state.user && !state.user.profileComplete),
  },
  actions: {
    async bootstrap() {
      if (this.ready) return this.user;
      try {
        this.config = await apiFetch('/auth/config');
        const session = await apiFetch('/auth/session');
        this.user = session.user;
        this.policy = session.policy;
      } catch (error) {
        if (error.status !== 401) this.error = error.message;
        this.user = null;
      } finally {
        this.ready = true;
      }
      return this.user;
    },
    async refresh() {
      const session = await apiFetch('/auth/session');
      this.user = session.user;
      this.policy = session.policy;
      return this.user;
    },
    async requestOtp(email, purpose) {
      this.busy = true;
      this.error = '';
      try {
        if (!this.config?.loginCsrf) this.config = await apiFetch('/auth/config');
        this.challenge = await loginFetch(
          '/auth/otp/request',
          { email, purpose },
          this.config.loginCsrf,
        );
        return this.challenge;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.busy = false;
      }
    },
    async verifyOtp(code) {
      this.busy = true;
      this.error = '';
      try {
        const result = await loginFetch(
          '/auth/otp/verify',
          { challengeId: this.challenge.challengeId, code },
          this.config.loginCsrf,
        );
        this.user = result.user;
        this.challenge = null;
        return result.user;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.busy = false;
      }
    },
    async googleLogin(credential) {
      this.busy = true;
      this.error = '';
      try {
        const result = await loginFetch('/auth/google', { credential }, this.config.loginCsrf);
        this.user = result.user;
        return result.user;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.busy = false;
      }
    },
    async updateProfile(profile) {
      const user = await apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(profile) });
      this.user = user;
      return user;
    },
    async logout(all = false) {
      await apiFetch(all ? '/auth/logout-all' : '/auth/logout', { method: 'POST' });
      this.user = null;
    },
  },
});
