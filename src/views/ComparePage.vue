<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { templates, statusConfig } from '../data/templates.js'
import { useComments } from '../composables/useComments.js'
import CommentsPopup from '../components/CommentsPopup.vue'
import { processScenario, cleanTemplate } from '../utils/processScenario.js'

const route = useRoute()

const template = computed(() => templates.find(t => t.id === route.params.id))

const { popup, openComments, commentCount } = useComments()

// ── Scenario toggles ─────────────────────────────────────────────
const scenario = ref(null)

watch(template, () => {
  scenario.value = template.value?.scenarios?.[0] ?? null
}, { immediate: true })

const iframeSrcdocNew = ref(null)
const iframeSrcdocOld = ref(null)

watch([scenario, template], async () => {
  if (!template.value) {
    iframeSrcdocNew.value = null
    iframeSrcdocOld.value = null
    return
  }
  const newHtml = template.value?.new ? await fetch(template.value.new).then(r => r.text()) : null
  const process = (html, path) => scenario.value
    ? processScenario(html, scenario.value, path)
    : cleanTemplate(html, path)
  iframeSrcdocNew.value = newHtml ? process(newHtml, template.value.new) : null
  iframeSrcdocOld.value = null // old pane always uses src directly
}, { immediate: true })
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
        <button
          class="compare__comment-btn"
          :class="{ 'compare__comment-btn--active': popup?.templateId === template.id, 'compare__comment-btn--has': commentCount(template.id) > 0 }"
          @click="openComments(template.id, $event)"
          :title="commentCount(template.id) ? `${commentCount(template.id)} comment${commentCount(template.id) > 1 ? 's' : ''}` : 'Add comment'"
        >
          <img src="/templates/new/assets/icons/article.svg" width="16" height="16" alt="Comments" />
          <span v-if="commentCount(template.id) > 0" class="compare__comment-count">{{ commentCount(template.id) }}</span>
        </button>
      </div>
      <div class="compare__bar-right">
        <router-link :to="`/preview/${template.id}/new`" class="compare__action-btn">Full preview</router-link>
        <a v-if="template.figma" :href="template.figma" target="_blank" class="compare__action-btn">Figma ↗</a>
      </div>
    </div>

    <div v-if="template.scenarios?.length" class="compare__scenario-bar">
      <button
        v-for="s in template.scenarios"
        :key="s.key"
        class="compare__scenario-btn"
        :class="{ 'compare__scenario-btn--active': scenario?.key === s.key }"
        @click="scenario = s"
      >{{ s.label }}</button>
    </div>

    <div class="compare__stage">
      <div class="compare__pane">
        <div class="compare__pane-label">Old</div>
        <iframe
          v-if="iframeSrcdocOld"
          :srcdoc="iframeSrcdocOld"
          class="compare__iframe"
          sandbox="allow-same-origin"
        ></iframe>
        <iframe
          v-else-if="template.old"
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
          v-if="iframeSrcdocNew"
          :srcdoc="iframeSrcdocNew"
          class="compare__iframe"
          sandbox="allow-same-origin"
        ></iframe>
        <iframe
          v-else-if="template.new"
          :src="template.new"
          class="compare__iframe"
          sandbox="allow-same-origin"
        ></iframe>
        <div v-else class="compare__missing">No new template yet.</div>
      </div>
    </div>
  </div>

  <div v-else class="compare__not-found">Template not found.</div>

  <CommentsPopup />
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

.compare__scenario-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
}

.compare__scenario-btn {
  padding: 3px 12px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  color: #374151;
}

.compare__scenario-btn--active {
  background: #111;
  color: #fff;
  border-color: #111;
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

.compare__comment-btn {
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

.compare__comment-btn:hover,
.compare__comment-btn--active {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.compare__comment-btn--has { color: #2563eb; }

.compare__comment-btn img { opacity: 0.5; display: block; }

.compare__comment-btn:hover img,
.compare__comment-btn--active img,
.compare__comment-btn--has img { opacity: 1; }

.compare__comment-count {
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  line-height: 1;
}
</style>
