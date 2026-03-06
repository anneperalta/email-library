<script setup>
import { ref, computed } from 'vue'
import { templates, statusConfig, productConfig } from '../data/templates.js'

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

// ── Comments ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pay-email-library-comments'
const AUDIT_KEY   = 'pay-email-library-audit'

function audit(action, templateId, comment) {
  try {
    const log = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]')
    log.push({
      action,
      templateId,
      commentId: comment.id,
      name: comment.name,
      text: comment.text,
      at: new Date().toISOString(),
    })
    localStorage.setItem(AUDIT_KEY, JSON.stringify(log))
  } catch {}
}

const loadComments = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

const allComments = ref(loadComments())
const popup = ref(null)   // { templateId, top, left }
const newName = ref(localStorage.getItem('pay-email-library-author') || '')
const newText = ref('')

const POPUP_W = 300
const POPUP_H = 360

function openComments(templateId, e) {
  if (popup.value?.templateId === templateId) {
    popup.value = null
    return
  }
  const rect = e.currentTarget.getBoundingClientRect()
  let left = rect.right + 10
  let top  = rect.top

  if (left + POPUP_W > window.innerWidth - 10) left = rect.left - POPUP_W - 10
  if (top  + POPUP_H > window.innerHeight - 10) top = window.innerHeight - POPUP_H - 10
  top = Math.max(10, top)

  popup.value = { templateId, top, left }
  newText.value = ''
}

function addComment() {
  const text = newText.value.trim()
  if (!text || !popup.value) return
  const name = newName.value.trim()
  localStorage.setItem('pay-email-library-author', newName.value.trim())
  const { templateId } = popup.value
  if (!allComments.value[templateId]) allComments.value[templateId] = []
  const comment = {
    id: Date.now(),
    name: name || 'Anonymous',
    text,
    timestamp: new Date().toLocaleString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
  }
  allComments.value[templateId].push(comment)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allComments.value))
  audit('added', templateId, comment)
  newText.value = ''
}

function deleteComment(templateId, id) {
  const comment = allComments.value[templateId]?.find(c => c.id === id)
  if (comment) audit('deleted', templateId, comment)
  allComments.value[templateId] = allComments.value[templateId].filter(c => c.id !== id)
  if (!allComments.value[templateId].length) delete allComments.value[templateId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allComments.value))
}

function resolveComment(templateId, id) {
  const comment = allComments.value[templateId]?.find(c => c.id === id)
  if (!comment) return
  comment.resolved = !comment.resolved
  audit(comment.resolved ? 'resolved' : 'unresolved', templateId, comment)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allComments.value))
}

function commentCount(templateId) {
  return allComments.value[templateId]?.length ?? 0
}
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
        <a href="/templates/new/lh-base.html" target="_blank" class="home__base-btn">LH</a>
        <a href="/templates/new/sm-base.html" target="_blank" class="home__base-btn">SM</a>
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

    <!-- Overlay -->
    <div v-if="popup" class="popup-overlay" @click="popup = null" />

    <!-- Comment popup -->
    <div
      v-if="popup"
      class="comment-popup"
      :style="{ top: popup.top + 'px', left: popup.left + 'px' }"
    >
      <div class="comment-popup__header">
        <span class="comment-popup__title">Comments</span>
        <button class="comment-popup__close" @click="popup = null">✕</button>
      </div>

      <div class="comment-popup__body">
        <div v-if="!allComments[popup.templateId]?.length" class="comment-popup__empty">
          No comments yet.
        </div>
        <div
          v-for="c in allComments[popup.templateId]"
          :key="c.id"
          class="comment-item"
        >
          <div class="comment-item__meta">
            <div class="comment-item__info">
              <span class="comment-item__author">{{ c.name }}</span>
              <span class="comment-item__time">{{ c.timestamp }}</span>
            </div>
            <div class="comment-item__actions">
              <button
                class="comment-item__resolve"
                :class="{ 'comment-item__resolve--done': c.resolved }"
                @click="resolveComment(popup.templateId, c.id)"
                :title="c.resolved ? 'Unresolve' : 'Resolve'"
              >✓</button>
              <button class="comment-item__delete" @click="deleteComment(popup.templateId, c.id)" title="Delete">✕</button>
            </div>
          </div>
          <p class="comment-item__text" :class="{ 'comment-item__text--resolved': c.resolved }">{{ c.text }}</p>
        </div>
      </div>

      <div class="comment-popup__footer">
        <input
          v-model="newName"
          class="comment-popup__name"
          placeholder="Your name"
        />
        <textarea
          v-model="newText"
          class="comment-popup__input"
          placeholder="Add a comment…"
          rows="2"
          @keydown.enter.ctrl="addComment"
          @keydown.enter.meta="addComment"
        />
        <button class="comment-popup__submit" :disabled="!newText.trim()" @click="addComment">
          Add
        </button>
      </div>
    </div>
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
  gap: 8px;
  flex-shrink: 0;
}

.home__base-label {
  font-size: 13px;
  color: #6b7280;
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

/* ── Overlay ────────────────────────────────────────────────────────────────── */

.popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

/* ── Comment popup ──────────────────────────────────────────────────────────── */

.comment-popup {
  position: fixed;
  z-index: 1000;
  width: 300px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
}

.comment-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid #f3f4f6;
}

.comment-popup__title {
  font-weight: 600;
  color: #111;
  font-size: 13px;
}

.comment-popup__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
  line-height: 1;
}

.comment-popup__close:hover {
  background: #f3f4f6;
  color: #374151;
}

.comment-popup__body {
  flex: 1;
  overflow-y: auto;
  max-height: 220px;
  padding: 8px 0;
}

.comment-popup__empty {
  padding: 16px 14px;
  color: #9ca3af;
  font-size: 12px;
}

.comment-item {
  padding: 8px 14px;
  border-bottom: 1px solid #f9fafb;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item__meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.comment-item__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.comment-item__time {
  font-size: 11px;
  color: #9ca3af;
}

.comment-item__actions {
  display: flex;
  gap: 2px;
  align-items: center;
}

.comment-item__resolve,
.comment-item__delete {
  background: none;
  border: none;
  cursor: pointer;
  color: #d1d5db;
  font-size: 10px;
  padding: 1px 3px;
  border-radius: 3px;
  line-height: 1;
}

.comment-item__resolve:hover {
  color: #22c55e;
  background: #f0fdf4;
}

.comment-item__resolve--done {
  color: #22c55e !important;
}

.comment-item__resolve--done:hover {
  color: #16a34a !important;
  background: #dcfce7;
}

.comment-item__delete:hover {
  color: #ef4444;
  background: #fef2f2;
}

.comment-item__text {
  margin: 0;
  color: #374151;
  font-size: 13px;
  line-height: 1.5;
}

.comment-item__text--resolved {
  color: #9ca3af;
  text-decoration: line-through;
  word-break: break-word;
}

.comment-popup__footer {
  padding: 10px 14px 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-popup__name {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  font-family: inherit;
  box-sizing: border-box;
  margin-bottom: 6px;
}

.comment-popup__name:focus {
  outline: none;
  border-color: #3b82f6;
}

.comment-popup__name::placeholder {
  color: #9ca3af;
}

.comment-item__author {
  font-weight: 600;
  font-size: 12px;
  color: #111;
}

.comment-popup__input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: #374151;
  box-sizing: border-box;
}

.comment-popup__input:focus {
  border-color: #3b82f6;
}

.comment-popup__input::placeholder {
  color: #9ca3af;
}

.comment-popup__submit {
  align-self: flex-end;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.comment-popup__submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.comment-popup__submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
