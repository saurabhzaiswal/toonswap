import { defineStore } from 'pinia';
import { apiClient } from '../lib/api';

const emptyPage = () => ({ items: [], pagination: { page: 1, pages: 1, total: 0 } });

export const useAdminStore = defineStore('admin', {
  state: () => ({
    overview: null,
    users: emptyPage(),
    jobs: emptyPage(),
    activity: emptyPage(),
    loading: false,
    error: '',
  }),
  actions: {
    async loadOverview() {
      this.overview = (await apiClient.get('/admin/overview')).data;
    },
    async loadTable(tab, filters) {
      this.loading = true;
      this.error = '';
      try {
        const params = new URLSearchParams({
          page: String(filters.page),
          pageSize: String(filters.pageSize || 20),
        });
        if (filters.search?.trim()) params.set('search', filters.search.trim());
        if (tab === 'users' && filters.status) params.set('status', filters.status);
        if (tab === 'users' && filters.role) params.set('role', filters.role);
        if (tab === 'jobs' && filters.status) params.set('status', filters.status);
        if (tab === 'activity' && filters.action) params.set('action', filters.action);
        this[tab] = (await apiClient.get(`/admin/${tab}`, { params })).data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async changeStatus(user, status, reason) {
      await apiClient.patch(`/admin/users/${user.id}/status`, { status, reason });
    },
    async changeRole(user, role) {
      await apiClient.patch(`/admin/users/${user.id}/role`, { role });
    },
    async makeUnlimited(user) {
      await apiClient.patch(`/admin/users/${user.id}/usage-policy`, {
        unlimited: true,
        note: 'Admin dashboard override',
      });
    },
  },
});
