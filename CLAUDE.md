# Email Library — Claude Instructions

## Project Overview
Vue 3 + Vite email template library for SiteMinder Pay and Little Hotelier Pay products. Hosts 60+ responsive HTML email templates with a preview/compare UI, deployed to Vercel.

- **Production:** https://pay-email-library.vercel.app/
- **GitHub:** https://github.com/anneperalta/email-library.git
- **Auto-deploys:** Vercel deploys automatically when changes are pushed to `main`

## Deployment Rules
**Never `git push` or deploy to Vercel unless explicitly instructed.** Wait for a clear instruction like "push" or "deploy" before running any push or deployment command.

## Dev Commands
```
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview built output
```

## Architecture

### Frontend (src/)
| File | Purpose |
|------|---------|
| `src/data/templates.js` | Template registry — source of truth for all template metadata |
| `src/views/HomePage.vue` | Gallery with filters/search |
| `src/views/PreviewPage.vue` | Single template preview with scenario selector |
| `src/views/ComparePage.vue` | Side-by-side old vs new comparison |
| `src/utils/processScenario.js` | Handles scenario variable substitution |
| `src/composables/useComments.js` | Firebase-backed review comments |
| `src/router.js` | Routes: `/`, `/preview/:id/:version`, `/compare/:id` |

### Templates (public/templates/new/)
4 base templates drive all styling:
- `sm-base.html` — SiteMinder property (Roboto, gradient bg, `#006DFF` buttons)
- `lh-base.html` — Little Hotelier property (Roboto, `#FF6842` buttons, `border-radius: 100px`)
- `sm-guest-base.html` — SiteMinder guest (Noto Sans, grey bg)
- `lh-guest-base.html` — Little Hotelier guest (Noto Sans, grey bg)

Feature templates live in subdirectories:
- `autopay/` — Autopay emails
- `payment-requests/` — Payment Request emails
- `ppay/` — Property Pay emails
- `siteminder-pay/` — SiteMinder Pay dispute emails

## Template Registry Schema
Each entry in `src/data/templates.js`:
```js
{
  id: 'unique-kebab-id',
  name: 'Display Name',
  category: 'Category Name',       // e.g., 'Autopay', 'Payment Requests'
  product: 'LH' | 'SM',
  figma: null | 'https://...',
  status: 'not-started' | 'in-review' | 'done',
  old: '/templates/old/path.html' | null,
  new: '/templates/new/path.html',
  scenarios?: [{ key: 'SCENARIO_KEY', label: 'Display Label' }]
}
```

## Clean Code Standard
**Typography → CSS classes. Spacing/layout → inline styles only.**

- Use CSS classes for: `font-family`, `font-size`, `font-weight`, `line-height`, `color`
- Use inline styles for: structural layout, spacing (`padding`, `margin`, `width`), `<body style>`, `<img style="display:block">`
- **Never modify** annotation attributes: `data-typography`, `data-spacing`, `data-spec`, `data-assets`

### Typography Classes (SM property)
`.email-title`, `.email-subtitle`, `.body-text`, `.body-bold`, `.details-title`, `.detail-text`, `.detail-bold`, `.label-tag`, `.meta-text`, `.legal-text`, `.link`, `.footer-link`, `.btn`

### Typography Classes (LH property)
Same as SM except: no `.meta-text`; `.label-tag` color `#FF6842`; `.btn` bg `#FF6842` with `border-radius: 100px`

### Structural Classes (guest templates)
`.section-status-box`, `.footer-divider`

## Template Naming Convention
`{feature}-{variant}-{audience}-{product}-{locale}.html`

Examples:
- `payment-success-property-sm-en.html`
- `payment-failed-guest-lh-en.html`
- `autopay-setup-property-sm-en.html`

## Adding a New Template
1. Create the HTML file in the appropriate `public/templates/new/{feature}/` subdirectory
2. Add an entry to `src/data/templates.js` with correct `id`, `category`, `product`, `status`, and `new` path
3. Add `scenarios` array if the template has conditional content variants
4. Set `status: 'not-started'` initially; update to `'in-review'` or `'done'` as work progresses
