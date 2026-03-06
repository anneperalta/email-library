import { ref } from 'vue'

const STORAGE_KEY = 'pay-email-library-comments'
const AUDIT_KEY   = 'pay-email-library-audit'

function loadComments() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

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

// Module-level state so it's shared across all component instances
const allComments = ref(loadComments())
const newName = ref(localStorage.getItem('pay-email-library-author') || '')
const popup   = ref(null)
const newText = ref('')

export function useComments() {
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
    localStorage.setItem('pay-email-library-author', name)
    const { templateId } = popup.value
    if (!allComments.value[templateId]) allComments.value[templateId] = []
    const comment = {
      id: Date.now(),
      name: name || 'Anonymous',
      text,
      timestamp: new Date().toLocaleString('en-AU', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
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

  return { allComments, popup, newName, newText, openComments, addComment, deleteComment, resolveComment, commentCount }
}
