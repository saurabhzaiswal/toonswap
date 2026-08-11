import { createApp } from 'vue';
import 'vue-select/dist/vue-select.css';
import RouterRoot from './RouterRoot.vue';
import './style.css';
import './styles/base.scss';
import router from './router';
import { pinia } from './pinia';

const app = createApp(RouterRoot);
app.use(pinia);
app.use(router);
app.mount('#app');
