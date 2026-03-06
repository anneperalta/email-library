<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { templates, statusConfig } from '../data/templates.js'
import { useComments } from '../composables/useComments.js'
import CommentsPopup from '../components/CommentsPopup.vue'

const route = useRoute()
const router = useRouter()

const template = computed(() => templates.find(t => t.id === route.params.id))
const version = computed(() => route.params.version) // 'old' | 'new'

const src = computed(() => version.value === 'old' ? template.value?.old : template.value?.new)

const viewport = computed({
  get: () => route.query.viewport ?? 'desktop',
  set: val => router.replace({ query: { ...route.query, viewport: val } })
})

const { popup, openComments, commentCount } = useComments()
</script>

<template>
  <div v-if="template" class="preview">
    <div class="preview__bar">
      <div class="preview__bar-left">
        <router-link to="/" class="preview__back">← Back</router-link>
        <span class="preview__name">{{ template.name }}</span>
        <span
          class="preview__badge"
          :style="{ background: statusConfig[template.status]?.color }"
        >{{ statusConfig[template.status]?.label }}</span>
        <button
          class="preview__comment-btn"
          :class="{ 'preview__comment-btn--active': popup?.templateId === template.id, 'preview__comment-btn--has': commentCount(template.id) > 0 }"
          @click="openComments(template.id, $event)"
          :title="commentCount(template.id) ? `${commentCount(template.id)} comment${commentCount(template.id) > 1 ? 's' : ''}` : 'Add comment'"
        >
          <img src="/templates/new/assets/icons/article.svg" width="16" height="16" alt="Comments" />
          <span v-if="commentCount(template.id) > 0" class="preview__comment-count">{{ commentCount(template.id) }}</span>
        </button>
      </div>
      <div class="preview__bar-center">
        <button
          class="preview__ver-btn"
          :class="{ 'preview__ver-btn--active': version === 'old' }"
          :disabled="!template.old"
          @click="router.push(`/preview/${template.id}/old`)"
        >Old</button>
        <button
          class="preview__ver-btn"
          :class="{ 'preview__ver-btn--active': version === 'new' }"
          :disabled="!template.new"
          @click="router.push(`/preview/${template.id}/new`)"
        >New</button>
      </div>
      <div class="preview__bar-right">
        <button
          class="preview__vp-btn"
          :class="{ 'preview__vp-btn--active': viewport === 'desktop' }"
          @click="viewport = 'desktop'"
        >Desktop</button>
        <button
          class="preview__vp-btn"
          :class="{ 'preview__vp-btn--active': viewport === 'mobile' }"
          @click="viewport = 'mobile'"
        >Mobile</button>
        <router-link
          v-if="template.old && template.new"
          :to="`/compare/${template.id}`"
          class="preview__action-btn"
        >Side by side</router-link>
        <a
          v-if="template.figma"
          :href="template.figma"
          target="_blank"
          class="preview__action-btn"
        >Figma ↗</a>
      </div>
    </div>

    <div class="preview__stage" :class="{ 'preview__stage--mobile': viewport === 'mobile' }">
      <iframe
        v-if="src"
        :src="src"
        class="preview__iframe"
        :style="viewport === 'mobile' ? { width: '430px', flex: 'none' } : { width: '100%' }"
        sandbox="allow-same-origin"
      ></iframe>
      <div v-else class="preview__missing">
        No {{ version }} template file available yet.
      </div>
    </div>
  </div>

  <div v-else class="preview__not-found">Template not found.</div>

  <CommentsPopup />
</template>

<style scoped>
.preview {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.preview__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  gap: 16px;
  flex-shrink: 0;
}

.preview__bar-left,
.preview__bar-center,
.preview__bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview__back {
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
}

.preview__back:hover { color: #111; }

.preview__name {
  font-size: 14px;
  font-weight: 600;
  color: #111;
}

.preview__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
}

.preview__ver-btn,
.preview__vp-btn {
  padding: 4px 12px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
}

.preview__ver-btn--active,
.preview__vp-btn--active {
  background: #111;
  color: #fff;
  border-color: #111;
}

.preview__ver-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.preview__action-btn {
  padding: 4px 12px;
  border: 1px solid #2563eb;
  border-radius: 5px;
  background: #fff;
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
  cursor: pointer;
}

.preview__action-btn:hover {
  background: #eff6ff;
}

.preview__stage {
  flex: 1;
  background: #f3f4f6;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 24px;
}

.preview__iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.preview__missing,
.preview__not-found {
  margin: auto;
  color: #9ca3af;
  font-size: 15px;
}

.preview__comment-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 4px 6px;
  cursor: pointer;
  color: #9ca3af;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.preview__comment-btn:hover,
.preview__comment-btn--active {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.preview__comment-btn--has {
  color: #2563eb;
}

.preview__comment-btn img {
  opacity: 0.5;
  display: block;
}

.preview__comment-btn:hover img,
.preview__comment-btn--active img,
.preview__comment-btn--has img {
  opacity: 1;
}

.preview__comment-count {
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  line-height: 1;
}
</style>
