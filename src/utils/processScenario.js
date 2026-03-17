/**
 * Strips all Handlebars condition tags from an email template for clean preview
 * when no scenario is selected. Shows all branch content simultaneously.
 * Used for templates without scenario toggles.
 */
export function cleanTemplate(html, filePath) {
  const basePath = filePath.substring(0, filePath.lastIndexOf('/') + 1)
  return html
    .replace(/\{\{#if\s+[^}]+\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '')
    .replace(/\{\{#eq\s[^}]+\}\}/g, '')
    .replace(/\{\{\/eq\}\}/g, '')
    .replace(/\{\{else(?:\s+eq\s+[^}]+)?\s*\}\}/g, '')
    .replace(/<head>/, `<head><base href="${basePath}">`)
}

/**
 * Processes Handlebars-style eq/if conditionals in an email template HTML string
 * for preview purposes. Resolves {{#eq}}/{{/eq}} blocks based on a scenario's
 * variable data, and strips {{#if}}/{{/if}} tags (always showing their content).
 *
 * Supports:
 *  - Trailing spaces before }}: {{#eq var "val" }}
 *  - {{else}} fallback branches
 *  - {{else eq varName "value"}} chained else-if branches
 *  - Nested {{#eq}} blocks (resolved iteratively, innermost first)
 *  - Key-based scenarios: { key: 'VALUE', label: '...' }
 *    → any variable lookup returns scenario.key (backward compat)
 *  - Data-based scenarios: { key: 'id', data: { var: val, ... }, label: '...' }
 *    → each variable is looked up from scenario.data
 */
export function processScenario(html, scenario, filePath) {
  const basePath = filePath.substring(0, filePath.lastIndexOf('/') + 1)

  // Strip {{#if ...}} / {{/if}} tags — always show their content
  html = html
    .replace(/\{\{#if\s+[^}]+\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '')

  // Build effective data lookup:
  // - data-based scenario: look up variable by name from scenario.data
  // - key-based scenario: any variable lookup returns scenario.key (Proxy)
  const effectiveData = scenario.data
    ? scenario.data
    : new Proxy({}, { get: () => scenario.key })

  // Iteratively resolve innermost {{#eq}} blocks
  // "innermost" = content contains no nested {{#eq or {{/eq}}
  let prev
  do {
    prev = html
    html = html.replace(
      /\{\{#eq (\w+) "([^"]+)"\s*\}\}((?:(?!\{\{#eq\b|\{\{\/eq\}\})[\s\S])*)\{\{\/eq\}\}/,
      (_, varName, firstVal, content) => pickBranch(varName, firstVal, content, effectiveData)
    )
  } while (html !== prev)

  return html.replace(/<head>/, `<head><base href="${basePath}">`)
}

/**
 * Given an {{#eq varName "firstVal"}} block's content (which may contain
 * {{else}} or {{else eq varName "value"}} separators), returns the content
 * of the matching branch based on effectiveData.
 */
function pickBranch(varName, firstVal, content, data) {
  const branches = []
  let remaining = content
  let curVar = varName
  let curVal = firstVal

  while (true) {
    const m = /\{\{else(?:\s+eq\s+(\w+)\s+"([^"]+)")?\s*\}\}/.exec(remaining)
    if (!m) {
      branches.push({ var: curVar, val: curVal, content: remaining })
      break
    }
    branches.push({ var: curVar, val: curVal, content: remaining.slice(0, m.index) })
    remaining = remaining.slice(m.index + m[0].length)
    if (m[1]) {
      curVar = m[1]
      curVal = m[2]
    } else {
      branches.push({ isElse: true, content: remaining })
      break
    }
  }

  for (const b of branches) {
    if (b.isElse) return b.content
    if (data[b.var] === b.val) return b.content
  }
  return ''
}
