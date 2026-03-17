<script setup>
import { useComments } from '../composables/useComments.js'

const { allComments, popup, newName, newText, addComment, deleteComment, resolveComment } = useComments()
</script>

<template>
  <template v-if="popup">
    <!-- Overlay -->
    <div class="cp-overlay" @click="popup = null" />

    <!-- Popup -->
    <div class="cp" :style="{ top: popup.top + 'px', left: popup.left + 'px' }">
      <div class="cp__header">
        <span class="cp__title">Comments</span>
        <button class="cp__close" @click="popup = null">✕</button>
      </div>

      <div class="cp__body">
        <div v-if="!allComments[popup.templateId]?.length" class="cp__empty">
          No comments yet.
        </div>
        <div v-for="c in allComments[popup.templateId]" :key="c._docId" class="cp-item">
          <div class="cp-item__meta">
            <div class="cp-item__info">
              <span class="cp-item__author">{{ c.name }}</span>
              <span class="cp-item__time">{{ c.timestamp }}</span>
            </div>
            <div class="cp-item__actions">
              <button
                class="cp-item__resolve"
                :class="{ 'cp-item__resolve--done': c.resolved }"
                @click="resolveComment(popup.templateId, c._docId)"
                :title="c.resolved ? 'Unresolve' : 'Resolve'"
              >✓</button>
              <button class="cp-item__delete" @click="deleteComment(popup.templateId, c._docId)" title="Delete">✕</button>
            </div>
          </div>
          <p class="cp-item__text" :class="{ 'cp-item__text--resolved': c.resolved }">{{ c.text }}</p>
        </div>
      </div>

      <div class="cp__footer">
        <input v-model="newName" class="cp__name" placeholder="Your name" />
        <textarea
          v-model="newText"
          class="cp__input"
          placeholder="Add a comment…"
          rows="2"
          @keydown.enter.ctrl="addComment"
          @keydown.enter.meta="addComment"
        />
        <button class="cp__submit" :disabled="!newText.trim()" @click="addComment">Add</button>
      </div>
    </div>
  </template>
</template>

<style scoped>
.cp-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.cp {
  position: fixed;
  z-index: 1000;
  width: 300px;
  max-height: 360px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
}

.cp__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 8px;
  border-bottom: 1px solid #f3f4f6;
}

.cp__title {
  font-weight: 600;
  color: #111;
  font-size: 13px;
}

.cp__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 3px;
  line-height: 1;
}

.cp__close:hover {
  background: #f3f4f6;
  color: #374151;
}

.cp__body {
  flex: 1;
  overflow-y: auto;
  max-height: 220px;
}

.cp__empty {
  padding: 16px 14px;
  color: #9ca3af;
  font-size: 13px;
}

.cp-item {
  padding: 8px 14px;
  border-bottom: 1px solid #f9fafb;
}

.cp-item:last-child {
  border-bottom: none;
}

.cp-item__meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.cp-item__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.cp-item__author {
  font-weight: 600;
  font-size: 12px;
  color: #111;
}

.cp-item__time {
  font-size: 11px;
  color: #9ca3af;
}

.cp-item__actions {
  display: flex;
  gap: 2px;
  align-items: center;
}

.cp-item__resolve,
.cp-item__delete {
  background: none;
  border: none;
  cursor: pointer;
  color: #d1d5db;
  font-size: 10px;
  padding: 1px 3px;
  border-radius: 3px;
  line-height: 1;
}

.cp-item__resolve:hover {
  color: #22c55e;
  background: #f0fdf4;
}

.cp-item__resolve--done {
  color: #22c55e !important;
}

.cp-item__resolve--done:hover {
  color: #16a34a !important;
  background: #dcfce7;
}

.cp-item__delete:hover {
  color: #ef4444;
  background: #fef2f2;
}

.cp-item__text {
  margin: 0;
  color: #374151;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.cp-item__text--resolved {
  color: #9ca3af;
  text-decoration: line-through;
}

.cp__footer {
  padding: 10px 14px 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cp__name {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  font-family: inherit;
  box-sizing: border-box;
}

.cp__name:focus {
  outline: none;
  border-color: #3b82f6;
}

.cp__name::placeholder { color: #9ca3af; }

.cp__input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  box-sizing: border-box;
}

.cp__input:focus {
  outline: none;
  border-color: #3b82f6;
}

.cp__input::placeholder { color: #9ca3af; }

.cp__submit {
  align-self: flex-end;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 5px 14px;
  font-size: 13px;
  cursor: pointer;
}

.cp__submit:hover:not(:disabled) { background: #1d4ed8; }

.cp__submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
