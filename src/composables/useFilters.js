import { ref, computed } from 'vue'

// Module-level state — persists across route navigation
const search = ref('')
const filterCategory = ref('All')
const filterStatus = ref('All')
const filterProduct = ref('All')

const isFiltered = computed(() =>
  search.value !== '' ||
  filterCategory.value !== 'All' ||
  filterStatus.value !== 'All' ||
  filterProduct.value !== 'All'
)

function clearFilters() {
  search.value = ''
  filterCategory.value = 'All'
  filterStatus.value = 'All'
  filterProduct.value = 'All'
}

export function useFilters() {
  return { search, filterCategory, filterStatus, filterProduct, isFiltered, clearFilters }
}
