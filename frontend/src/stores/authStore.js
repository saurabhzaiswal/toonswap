import { defineStore } from 'pinia';
import { apiClient } from '../lib/api';

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
        this.config = (await apiClient.get('/auth/config', { skipAuthRedirect: true })).data;
        const session = (await apiClient.get('/auth/session', { skipAuthRedirect: true })).data;
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
      const session = (await apiClient.get('/auth/session')).data;
      this.user = session.user;
      this.policy = session.policy;
      return this.user;
    },
    async requestOtp(email, purpose, turnstileToken) {
      this.busy = true;
      this.error = '';
      try {
        if (!this.config?.loginCsrf)
          this.config = (await apiClient.get('/auth/config', { skipAuthRedirect: true })).data;
        this.challenge = (
          await apiClient.post(
            '/auth/otp/request',
            { email, purpose, turnstileToken },
            {
              headers: { 'x-toonswap-login-csrf': this.config.loginCsrf },
              skipAuthRedirect: true,
            },
          )
        ).data;
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
        const result = (
          await apiClient.post(
            '/auth/otp/verify',
            {
              requestId: this.challenge.requestId,
              requestToken: this.challenge.requestToken,
              code,
            },
            {
              headers: { 'x-toonswap-login-csrf': this.config.loginCsrf },
              skipAuthRedirect: true,
            },
          )
        ).data;
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
    async googleLogin(credential, purpose, turnstileToken) {
      this.busy = true;
      this.error = '';
      try {
        const result = (
          await apiClient.post(
            '/auth/google',
            { credential, purpose, turnstileToken },
            {
              headers: { 'x-toonswap-login-csrf': this.config.loginCsrf },
              skipAuthRedirect: true,
            },
          )
        ).data;
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
      const user = (await apiClient.put('/users/me', profile)).data;
      this.user = user;
      return user;
    },
    async logout(all = false) {
      await apiClient.post(all ? '/auth/logout-all' : '/auth/logout');
      this.user = null;
      this.policy = null;
    },
    clearExpiredSession() {
      this.user = null;
      this.policy = null;
      this.challenge = null;
      this.ready = true;
    },
  },
});
