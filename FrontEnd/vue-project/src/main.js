import { createApp } from 'vue'
import App from './views/App.vue'


import "../node_modules/@fortawesome/fontawesome-free/js/all.js"
import "../node_modules/@fortawesome/fontawesome-free/css/all.css"
import './asset/main.style.css';

import router from "./router"

createApp(App).use(router).mount('#app')
