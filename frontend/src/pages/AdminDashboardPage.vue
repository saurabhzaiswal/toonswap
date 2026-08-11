<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import SiteHeader from '../components/SiteHeader.vue';
import SiteFooter from '../components/SiteFooter.vue';
import AppButton from '../components/ui/AppButton.vue';
import UiInput from '../components/ui/UiInput.vue';
import UiSelect from '../components/ui/UiSelect.vue';
import { useAdminStore } from '../stores/adminStore';

const admin = useAdminStore();
const { overview, users, jobs, activity, loading, error } = storeToRefs(admin);
const tab = ref('users');
const search = ref('');
const status = ref('');
const role = ref('');
const action = ref('');
const page = ref(1);
let debounce;

const statusOptions = [
  { label: 'All account statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Blocked', value: 'BLOCKED' },
];
const roleOptions = [
  { label: 'All roles', value: '' },
  { label: 'User', value: 'USER' },
  { label: 'Admin', value: 'ADMIN' },
];
const jobStatusOptions = [
  { label: 'All job statuses', value: '' },
  ...['PENDING', 'PROCESSING', 'DONE', 'FAILED'].map((value) => ({
    label: value.toLowerCase(),
    value,
  })),
];
const title = computed(() =>
  tab.value === 'users'
    ? `${users.value.pagination.total} accounts`
    : tab.value === 'jobs'
      ? `${jobs.value.pagination.total} generation jobs`
      : `${activity.value.pagination.total} activity events`,
);
const currentPage = computed(() =>
  tab.value === 'users' ? users.value : tab.value === 'jobs' ? jobs.value : activity.value,
);

async function loadOverview() {
  await admin.loadOverview();
}
async function loadTable() {
  await admin.loadTable(tab.value, {
    page: page.value,
    search: search.value,
    status: status.value,
    role: role.value,
    action: action.value,
  });
}
async function changeStatus(user) {
  const next = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
  const reason =
    next === 'BLOCKED' ? window.prompt('Reason for blocking this account:', 'Policy review') : '';
  if (next === 'BLOCKED' && reason === null) return;
  await admin.changeStatus(user, next, reason);
  await Promise.all([loadOverview(), loadTable()]);
}
async function changeRole(user) {
  const next = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
  if (!window.confirm(`Change ${user.email} to ${next}?`)) return;
  await admin.changeRole(user, next);
  await loadTable();
}
async function makeUnlimited(user) {
  await admin.makeUnlimited(user);
  await loadTable();
}
function selectTab(value) {
  tab.value = value;
  page.value = 1;
  search.value = '';
  status.value = '';
  role.value = '';
  action.value = '';
  loadTable();
}
function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value),
      )
    : 'Never';
}
watch([search, status, role, action], () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    page.value = 1;
    loadTable();
  }, 280);
});
onMounted(() => Promise.all([loadOverview(), loadTable()]));
</script>

<template>
  <div>
    <SiteHeader />
    <main class="admin-main">
      <header class="admin-hero">
        <div>
          <p>Role-protected control room</p>
          <h1>ToonSwap admin</h1>
          <span
            >Fast account, safety, and generation operations - with every sensitive change
            auditable.</span
          >
        </div>
        <AppButton variant="outline" to="/profile">My profile</AppButton>
      </header>
      <section v-if="overview" class="metric-grid">
        <article>
          <small>Total users</small><strong>{{ overview.users.total }}</strong
          ><span>{{ overview.users.recentSignups }} joined this week</span>
        </article>
        <article>
          <small>Active accounts</small><strong>{{ overview.users.active }}</strong
          ><span>{{ overview.users.blocked }} blocked</span>
        </article>
        <article>
          <small>Generations</small><strong>{{ overview.generations.total }}</strong
          ><span>{{ overview.generations.today }} today</span>
        </article>
        <article>
          <small>Queue</small><strong>{{ overview.generations.pending }}</strong
          ><span>pending or processing</span>
        </article>
      </section>
      <section class="admin-panel">
        <div class="tab-bar">
          <button :class="{ active: tab === 'users' }" @click="selectTab('users')">Users</button
          ><button :class="{ active: tab === 'jobs' }" @click="selectTab('jobs')">
            Generation jobs
          </button>
          <button :class="{ active: tab === 'activity' }" @click="selectTab('activity')">
            Activity log
          </button>
        </div>
        <div class="panel-heading">
          <div>
            <p>Live operations</p>
            <h2>{{ title }}</h2>
          </div>
          <div class="filters">
            <UiInput
              v-model="search"
              label="Search"
              :placeholder="
                tab === 'users'
                  ? 'Email, name, city…'
                  : tab === 'jobs'
                    ? 'Job ID or user email…'
                    : 'Action, person, or entity…'
              "
            /><UiSelect
              v-if="tab !== 'activity'"
              v-model="status"
              label="Status"
              :options="tab === 'users' ? statusOptions : jobStatusOptions"
            /><UiSelect v-if="tab === 'users'" v-model="role" label="Role" :options="roleOptions" />
            <UiInput
              v-if="tab === 'activity'"
              v-model="action"
              label="Exact action (optional)"
              placeholder="USER_BLOCKED"
            />
          </div>
        </div>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <div class="table-wrap">
          <table v-if="tab === 'users'">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role / status</th>
                <th>Usage</th>
                <th>Last seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users.items" :key="user.id">
                <td>
                  <strong>{{ user.name || 'Profile incomplete' }}</strong
                  ><small>{{ user.email }}</small
                  ><small>{{
                    [user.city, user.countryCode].filter(Boolean).join(', ') || 'Location not added'
                  }}</small>
                </td>
                <td>
                  <span class="badge">{{ user.role }}</span
                  ><span class="badge" :class="user.status.toLowerCase()">{{ user.status }}</span>
                </td>
                <td>
                  <strong>{{ user._count.memeJobs }} videos</strong
                  ><small>{{ user._count.storyProjects }} story projects</small
                  ><small>{{
                    user.usagePolicyOverride?.unlimited
                      ? 'Unlimited override'
                      : user.usagePolicyOverride
                        ? `${user.usagePolicyOverride.generationLimit}/${user.usagePolicyOverride.windowDays}d`
                        : 'Default policy'
                  }}</small>
                </td>
                <td>{{ formatDate(user.lastSeenAt) }}</td>
                <td>
                  <div class="row-actions">
                    <AppButton
                      size="sm"
                      :variant="user.status === 'BLOCKED' ? 'secondary' : 'danger'"
                      @click="changeStatus(user)"
                      >{{ user.status === 'BLOCKED' ? 'Unblock' : 'Block' }}</AppButton
                    ><AppButton size="sm" variant="outline" @click="changeRole(user)">{{
                      user.role === 'ADMIN' ? 'Make user' : 'Make admin'
                    }}</AppButton
                    ><AppButton size="sm" variant="outline" @click="makeUnlimited(user)"
                      >Unlimited</AppButton
                    >
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table v-else-if="tab === 'jobs'">
            <thead>
              <tr>
                <th>Job</th>
                <th>User</th>
                <th>Character / language</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in jobs.items" :key="job.id">
                <td>
                  <code>{{ job.id }}</code>
                </td>
                <td>
                  <strong>{{ job.user.name || job.user.email }}</strong
                  ><small>{{ job.user.email }}</small>
                </td>
                <td>
                  <strong>{{ job.character }}</strong
                  ><small>{{ job.language }}</small>
                </td>
                <td>
                  <span class="badge" :class="job.status.toLowerCase()">{{ job.status }}</span
                  ><small v-if="job.errorMessage">{{ job.errorMessage }}</small>
                </td>
                <td>{{ formatDate(job.updatedAt) }}</td>
              </tr>
            </tbody>
          </table>
          <table v-else>
            <thead>
              <tr>
                <th>Event</th>
                <th>Actor / subject</th>
                <th>Entity</th>
                <th>Description</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in activity.items" :key="event.id">
                <td>
                  <span class="badge">{{ event.action }}</span>
                </td>
                <td>
                  <strong>{{ event.actor?.name || event.actor?.email || 'System' }}</strong>
                  <small v-if="event.subject">
                    Subject: {{ event.subject.name || event.subject.email }}
                  </small>
                </td>
                <td>
                  <strong>{{ event.entityName || event.entityType || ' - ' }}</strong>
                  <small>{{ event.entityType || 'General' }}</small>
                </td>
                <td>{{ event.description || 'Recorded activity' }}</td>
                <td>{{ formatDate(event.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="loading" class="loading">Loading the latest data…</div>
          <div v-else-if="currentPage.items.length === 0" class="loading">No matching records.</div>
        </div>
        <div class="pagination">
          <AppButton
            size="sm"
            variant="outline"
            :disabled="page <= 1"
            @click="
              page--;
              loadTable();
            "
            >← Previous</AppButton
          ><span>Page {{ page }} of {{ currentPage.pagination.pages }}</span
          ><AppButton
            size="sm"
            variant="outline"
            :disabled="page >= currentPage.pagination.pages"
            @click="
              page++;
              loadTable();
            "
            >Next →</AppButton
          >
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;
.admin-main {
  min-height: 80vh;
  padding: 120px max(16px, 4vw) 70px;
  background: $canvas;
}
.admin-hero {
  width: min(1400px, 100%);
  margin: 0 auto 28px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
}
.admin-hero p,
.panel-heading p {
  margin: 0;
  color: $coral;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.admin-hero h1 {
  margin: 6px 0;
  font-size: clamp(2.8rem, 5vw, 5rem);
  letter-spacing: -0.06em;
}
.admin-hero span {
  color: $muted;
}
.metric-grid {
  width: min(1400px, 100%);
  margin: 0 auto 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}
.metric-grid article {
  display: grid;
  gap: 7px;
  padding: 22px;
  border: 1.5px solid $line;
  border-radius: 20px;
  background: white;
  box-shadow: $shadow-soft;
}
.metric-grid strong {
  font-size: 2.4rem;
}
.metric-grid small,
.metric-grid span {
  color: $muted;
}
.admin-panel {
  width: min(1400px, 100%);
  margin: auto;
  overflow: hidden;
  border: 1.5px solid $line;
  border-radius: 26px;
  background: white;
  box-shadow: $shadow-soft;
}
.tab-bar {
  display: flex;
  padding: 9px;
  background: $soft;
}
.tab-bar button {
  min-height: 46px;
  padding: 0 22px;
  border: 0;
  border-radius: 13px;
  color: $muted;
  background: transparent;
  font-weight: 900;
  cursor: pointer;
}
.tab-bar button.active {
  color: white;
  background: $ink;
}
.panel-heading {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: end;
  gap: 30px;
  padding: 24px;
}
.panel-heading h2 {
  margin: 4px 0 0;
}
.filters {
  display: grid;
  grid-template-columns: 1.5fr 0.7fr 0.7fr;
  gap: 12px;
}
.table-wrap {
  position: relative;
  overflow-x: auto;
  border-top: 1px solid $line;
}
table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}
th {
  padding: 13px 18px;
  color: $muted;
  background: $soft;
  font-size: 0.78rem;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
td {
  padding: 17px 18px;
  border-top: 1px solid $line;
  vertical-align: middle;
}
td strong,
td small {
  display: block;
}
td small {
  margin-top: 3px;
  color: $muted;
}
code {
  font-size: 0.75rem;
}
.badge {
  display: inline-flex;
  margin: 2px 5px 2px 0;
  padding: 6px 9px;
  border-radius: 999px;
  background: $soft;
  font-size: 0.72rem;
  font-weight: 900;
}
.badge.active,
.badge.done {
  color: #08735c;
  background: #dcf8ef;
}
.badge.blocked,
.badge.failed {
  color: #a22820;
  background: #ffe7e2;
}
.badge.pending,
.badge.processing {
  color: #5c41c9;
  background: #eee9ff;
}
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.loading {
  padding: 30px;
  color: $muted;
  text-align: center;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  padding: 20px;
  border-top: 1px solid $line;
}
.error {
  margin: 0 24px 18px;
  padding: 12px;
  color: #9b241b;
  background: #fff0ed;
  border-radius: 10px;
}
@media (max-width: 1000px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .panel-heading {
    grid-template-columns: 1fr;
  }
  .filters {
    grid-template-columns: 1fr 1fr;
  }
  .filters > :first-child {
    grid-column: 1 / -1;
  }
}
@media (max-width: 620px) {
  .admin-main {
    padding: 98px 10px 44px;
  }
  .admin-hero {
    align-items: stretch;
    flex-direction: column;
  }
  .metric-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .metric-grid article {
    padding: 16px;
  }
  .metric-grid strong {
    font-size: 1.8rem;
  }
  .panel-heading {
    padding: 18px 14px;
  }
  .filters {
    grid-template-columns: 1fr;
  }
  .filters > :first-child {
    grid-column: auto;
  }
  .pagination {
    justify-content: space-between;
    gap: 8px;
  }
  .pagination span {
    font-size: 0.8rem;
  }
}
</style>
