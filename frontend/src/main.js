import { createApp } from 'vue';
import { createPinia } from 'pinia';
import RouterRoot from './RouterRoot.vue';
import './style.css';
import './styles/base.scss';
import router from './router';

const app = createApp(RouterRoot);
app.use(createPinia());
app.use(router);
app.mount('#app');
