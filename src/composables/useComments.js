import { ref } from 'vue'
import { db } from '../firebase'
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore'

const allComments = ref({})
const newName = ref(localStorage.getItem('pay-email-library-author') || '')
const popup   = ref(null)
const newText = ref('')

// Listen to all comments in real time
const q = query(collection(db, 'comments'), orderBy('createdAt', 'asc'))
onSnapshot(q, (snapshot) => {
  const grouped = {}
  snapshot.forEach((docSnap) => {
    const data = { ...docSnap.data(), _docId: docSnap.id }
    if (!grouped[data.templateId]) grouped[data.templateId] = []
    grouped[data.templateId].push(data)
  })
  allComments.value = grouped
})

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

  async function addComment() {
    const text = newText.value.trim()
    if (!text || !popup.value) return
    const name = newName.value.trim()
    localStorage.setItem('pay-email-library-author', name)
    const { templateId } = popup.value

    await addDoc(collection(db, 'comments'), {
      templateId,
      name: name || 'Anonymous',
      text,
      timestamp: new Date().toLocaleString('en-AU', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      resolved: false,
      createdAt: serverTimestamp(),
    })

    newText.value = ''
  }

  async function deleteComment(templateId, _docId) {
    await deleteDoc(doc(db, 'comments', _docId))
  }

  async function resolveComment(templateId, _docId) {
    const comment = allComments.value[templateId]?.find(c => c._docId === _docId)
    if (!comment) return
    await updateDoc(doc(db, 'comments', _docId), { resolved: !comment.resolved })
  }

  function commentCount(templateId) {
    return allComments.value[templateId]?.length ?? 0
  }

  return { allComments, popup, newName, newText, openComments, addComment, deleteComment, resolveComment, commentCount }
}
