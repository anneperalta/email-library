import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './views/HomePage.vue'
import PreviewPage from './views/PreviewPage.vue'
import ComparePage from './views/ComparePage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/preview/:id/:version', component: PreviewPage },
    { path: '/compare/:id', component: ComparePage },
  ],
})
