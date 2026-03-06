<script setup>
import { ref, computed } from 'vue'
import { templates, statusConfig, productConfig } from '../data/templates.js'
import { useComments } from '../composables/useComments.js'
import CommentsPopup from '../components/CommentsPopup.vue'

const search = ref('')
const filterCategory = ref('All')
const filterStatus = ref('All')
const filterProduct = ref('All')

const categories = ['All', ...new Set(templates.map(t => t.category))].sort()
const statuses = ['All', 'not-started', 'in-review', 'done']
const products = ['All', 'LH', 'SM']

const filtered = computed(() => templates.filter(t => {
  const matchSearch = t.name.toLowerCase().includes(search.value.toLowerCase())
  const matchCat = filterCategory.value === 'All' || t.category === filterCategory.value
  const matchStatus = filterStatus.value === 'All' || t.status === filterStatus.value
  const matchProduct = filterProduct.value === 'All' || t.product === filterProduct.value
  return matchSearch && matchCat && matchStatus && matchProduct
}))

const total = templates.length
const done = templates.filter(t => t.status === 'done').length
const progress = total ? Math.round((done / total) * 100) : 0

const { popup, openComments, commentCount } = useComments()
</script>

<template>
  <div class="home">
    <div class="home__header">
      <div>
        <h1 class="home__title">Pay Email Library</h1>
        <p class="home__subtitle">{{ done }} of {{ total }} templates complete</p>
        <div class="home__progress-bar">
          <div class="home__progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      <div class="home__base-links">
        <span class="home__base-label">Base templates</span>
        <div class="home__base-group">
          <span class="home__base-group-label">Property</span>
          <a href="/templates/new/lh-base.html" target="_blank" class="home__base-btn">LH</a>
          <a href="/templates/new/sm-base.html" target="_blank" class="home__base-btn">SM</a>
        </div>
        <div class="home__base-group">
          <span class="home__base-group-label">Guest</span>
          <span class="home__base-btn home__base-btn--disabled">LH</span>
          <span class="home__base-btn home__base-btn--disabled">SM</span>
        </div>
      </div>
    </div>

    <div class="home__filters">
      <input v-model="search" class="home__search" placeholder="Search templates…" />
      <select v-model="filterProduct" class="home__select">
        <option v-for="p in products" :key="p" :value="p">
          {{ p === 'All' ? 'All brands' : productConfig[p].label }}
        </option>
      </select>
      <select v-model="filterCategory" class="home__select">
        <option v-for="c in categories" :key="c">{{ c }}</option>
      </select>
      <select v-model="filterStatus" class="home__select">
        <option v-for="s in statuses" :key="s" :value="s">
          {{ s === 'All' ? 'All statuses' : statusConfig[s].label }}
        </option>
      </select>
    </div>

    <div v-if="filtered.length === 0" class="home__empty">No templates match your filters.</div>

    <table v-else class="home__table">
      <thead>
        <tr>
          <th>Template</th>
          <th>Brand</th>
          <th>Category</th>
          <th>Status</th>
          <th>Old</th>
          <th>New</th>
          <th>Compare</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in filtered" :key="t.id">
          <td class="home__name">{{ t.name }}</td>
          <td>
            <span
              class="home__badge"
              :style="{ background: productConfig[t.product]?.color ?? '#9ca3af' }"
            >{{ productConfig[t.product]?.label ?? t.product }}</span>
          </td>
          <td class="home__category">{{ t.category }}</td>
          <td>
            <span
              class="home__badge"
              :style="{ background: statusConfig[t.status]?.color ?? '#9ca3af' }"
            >{{ statusConfig[t.status]?.label ?? t.status }}</span>
          </td>
          <td>
            <router-link v-if="t.old" :to="`/preview/${t.id}/old`" class="home__link">Preview</router-link>
            <span v-else class="home__na">—</span>
          </td>
          <td>
            <router-link v-if="t.new" :to="`/preview/${t.id}/new`" class="home__link">Preview</router-link>
            <span v-else class="home__na">—</span>
          </td>
          <td>
            <router-link v-if="t.old && t.new" :to="`/compare/${t.id}`" class="home__link">Side by side</router-link>
            <span v-else class="home__na">—</span>
          </td>
          <td>
            <button
              class="comment-btn"
              :class="{ 'comment-btn--active': popup?.templateId === t.id, 'comment-btn--has': commentCount(t.id) > 0 }"
              @click="openComments(t.id, $event)"
              :title="commentCount(t.id) ? `${commentCount(t.id)} comment${commentCount(t.id) > 1 ? 's' : ''}` : 'Add comment'"
            >
              <img src="/templates/new/assets/icons/article.svg" width="16" height="16" alt="Comments" />
              <span v-if="commentCount(t.id) > 0" class="comment-btn__count">{{ commentCount(t.id) }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CommentsPopup />
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.home__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 16px;
}

.home__base-links {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.home__base-label {
  font-size: 13px;
  color: #6b7280;
}

.home__base-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.home__base-group-label {
  font-size: 12px;
  color: #9ca3af;
  margin-right: 2px;
}

.home__base-btn {
  padding: 4px 12px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
}

.home__base-btn:hover {
  background: #f3f4f6;
}

.home__base-btn--disabled {
  color: #d1d5db;
  border-color: #e5e7eb;
  cursor: default;
}

.home__title {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin: 0 0 4px;
}

.home__subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px;
}

.home__progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  max-width: 300px;
  margin-top: 12px;
}

.home__progress-fill {
  height: 100%;
  background: #22c55e;
  border-radius: 99px;
  transition: width 0.3s;
}

.home__filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.home__search {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.home__search:focus {
  border-color: #3b82f6;
}

.home__select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  outline: none;
  cursor: pointer;
}

.home__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.home__table th {
  text-align: left;
  padding: 10px 14px;
  border-bottom: 2px solid #e5e7eb;
  color: #374151;
  font-weight: 600;
  white-space: nowrap;
}

.home__table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  vertical-align: middle;
}

.home__table tr:hover td {
  background: #f9fafb;
}

.home__name {
  font-weight: 500;
  color: #111 !important;
}

.home__category {
  color: #6b7280 !important;
}

.home__badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.home__link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.home__link:hover {
  text-decoration: underline;
}

.home__na {
  color: #d1d5db;
}

.home__empty {
  text-align: center;
  padding: 60px 0;
  color: #9ca3af;
  font-size: 15px;
}

/* ── Comment button ─────────────────────────────────────────────────────────── */

.comment-btn {
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

.comment-btn:hover,
.comment-btn--active {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.comment-btn--has {
  color: #2563eb;
}

.comment-btn img {
  opacity: 0.5;
  display: block;
}

.comment-btn:hover img,
.comment-btn--active img,
.comment-btn--has img {
  opacity: 1;
}

.comment-btn__count {
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  line-height: 1;
}


</style>
