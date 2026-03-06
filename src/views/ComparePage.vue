<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { templates, statusConfig } from '../data/templates.js'

const route = useRoute()
const router = useRouter()

const template = computed(() => templates.find(t => t.id === route.params.id))
</script>

<template>
  <div v-if="template" class="compare">
    <div class="compare__bar">
      <div class="compare__bar-left">
        <router-link to="/" class="compare__back">← Back</router-link>
        <span class="compare__name">{{ template.name }}</span>
        <span
          class="compare__badge"
          :style="{ background: statusConfig[template.status]?.color }"
        >{{ statusConfig[template.status]?.label }}</span>
      </div>
      <div class="compare__bar-right">
        <router-link :to="`/preview/${template.id}/new`" class="compare__action-btn">Full preview</router-link>
        <a v-if="template.figma" :href="template.figma" target="_blank" class="compare__action-btn">Figma ↗</a>
      </div>
    </div>

    <div class="compare__stage">
      <div class="compare__pane">
        <div class="compare__pane-label">Old</div>
        <iframe
          v-if="template.old"
          :src="template.old"
          class="compare__iframe"
          sandbox="allow-same-origin"
        ></iframe>
        <div v-else class="compare__missing">No old template.</div>
      </div>
      <div class="compare__divider"></div>
      <div class="compare__pane">
        <div class="compare__pane-label">New</div>
        <iframe
          v-if="template.new"
          :src="template.new"
          class="compare__iframe"
          sandbox="allow-same-origin"
        ></iframe>
        <div v-else class="compare__missing">No new template yet.</div>
      </div>
    </div>
  </div>

  <div v-else class="compare__not-found">Template not found.</div>
</template>

<style scoped>
.compare {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.compare__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
}

.compare__bar-left,
.compare__bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.compare__back {
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
}

.compare__back:hover { color: #111; }

.compare__name {
  font-size: 14px;
  font-weight: 600;
  color: #111;
}

.compare__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
}

.compare__action-btn {
  padding: 4px 12px;
  border: 1px solid #2563eb;
  border-radius: 5px;
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
}

.compare__action-btn:hover {
  background: #eff6ff;
}

.compare__stage {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #f3f4f6;
}

.compare__pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  gap: 8px;
}

.compare__pane-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.compare__iframe {
  flex: 1;
  border: none;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.compare__divider {
  width: 1px;
  background: #e5e7eb;
  flex-shrink: 0;
}

.compare__missing,
.compare__not-found {
  margin: auto;
  color: #9ca3af;
  font-size: 15px;
}
</style>
