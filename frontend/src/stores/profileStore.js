import { defineStore } from 'pinia';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import { apiClient } from '../lib/api';
import { useAuthStore } from './authStore';

export const useProfileStore = defineStore('profile', {
  state: () => ({ busy: false, message: '', error: '', avatarVersion: Date.now() }),
  actions: {
    async load() {
      const { data } = await apiClient.get('/users/me');
      useAuthStore().user = data;
      return data;
    },
    async save(input) {
      this.busy = true;
      this.error = '';
      this.message = '';
      try {
        const user = await useAuthStore().updateProfile(input);
        this.message =
          user.ageGateStatus === 'ELIGIBLE'
            ? 'Profile saved. Your creator workspace is ready.'
            : 'Profile saved. Creation stays locked until the configured age or guardian policy allows it.';
        return user;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.busy = false;
      }
    },
    async uploadAvatar(file) {
      this.busy = true;
      this.error = '';
      this.message = '';
      let uppy;
      try {
        const slot = (
          await apiClient.post('/users/me/avatar/upload-session', {
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
          })
        ).data;
        uppy = new Uppy({
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
        if (result.failed?.length)
          throw new Error(result.failed[0].error?.message || 'Upload failed');
        await apiClient.post('/users/me/avatar/finalize');
        await useAuthStore().refresh();
        this.avatarVersion = Date.now();
        this.message = 'Profile picture updated.';
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        uppy?.destroy();
        this.busy = false;
      }
    },
    async deleteAccount() {
      await apiClient.delete('/users/me', { data: { confirmation: 'DELETE' } });
      useAuthStore().clearExpiredSession();
    },
  },
});
