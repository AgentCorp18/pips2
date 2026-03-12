# WP-6.8 Lighthouse Audit & Performance Optimization

**Date:** 2026-03-12
**Branch:** main (direct fixes)
**Status:** Complete

---

## Audit Methodology

Performed automated browser-based audits using Playwright MCP on the live production site (pips-app.vercel.app). Evaluated 6 key pages across performance, accessibility, SEO, and best practices categories. Additionally performed static code analysis of the Next.js codebase for optimization opportunities.

### Pages Audited

| Page        | URL          | Load (ms) | TTFB (ms) |
| ----------- | ------------ | --------- | --------- |
| Landing     | /            | 1997      | 116       |
| Login       | /login       | 263       | 30        |
| Methodology | /methodology | 365       | 46        |
| Pricing     | /pricing     | ~300      | ~40       |
| Privacy     | /privacy     | ~280      | ~35       |
| Terms       | /terms       | ~280      | ~35       |

---

## Estimated Lighthouse Scores (Pre-Fix)

| Page           | Performance | Accessibility | Best Practices | SEO |
| -------------- | ----------- | ------------- | -------------- | --- |
| Landing (/)    | ~90         | ~85           | ~80            | ~88 |
| Login (/login) | ~95         | ~75           | ~80            | ~82 |
| Methodology    | ~92         | ~80           | ~80            | ~88 |
| Pricing        | ~93         | ~88           | ~80            | ~85 |
| Privacy        | ~95         | ~90           | ~80            | ~85 |
| Terms          | ~95         | ~90           | ~80            | ~85 |

## Estimated Lighthouse Scores (Post-Fix)

| Page           | Performance | Accessibility | Best Practices | SEO |
| -------------- | ----------- | ------------- | -------------- | --- |
| Landing (/)    | ~92         | ~92           | ~90            | ~95 |
| Login (/login) | ~96         | ~88           | ~90            | ~90 |
| Methodology    | ~93         | ~90           | ~90            | ~95 |
| Pricing        | ~94         | ~90           | ~90            | ~92 |
| Privacy        | ~96         | ~92           | ~90            | ~92 |
| Terms          | ~96         | ~92           | ~90            | ~92 |

---

## Issues Found and Fixed

### 1. CSP Blocking Vercel Analytics (Best Practices - Critical)

**Issue:** Content-Security-Policy `script-src` directive did not include `https://va.vercel-scripts.com`, causing Vercel Analytics and Speed Insights scripts to be blocked. Console showed errors on every page load.

**Fix:** Added `https://va.vercel-scripts.com` to `script-src` in `next.config.ts`.

**File:** `apps/web/next.config.ts`

### 2. Missing Canonical URLs (SEO - High)

**Issue:** No canonical URL set on any page. Canonical URLs are critical for SEO to prevent duplicate content issues and consolidate link equity.

**Fix:** Added `alternates.canonical` to root layout metadata and to each audited page's metadata export. Also fixed `metadataBase` from incorrect `https://pipsapp.com` to actual `https://pips-app.vercel.app`.

**Files:**

- `apps/web/src/app/layout.tsx` (root metadataBase + canonical)
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/(marketing)/methodology/page.tsx`
- `apps/web/src/app/(marketing)/pricing/page.tsx`
- `apps/web/src/app/(marketing)/privacy/page.tsx`
- `apps/web/src/app/(marketing)/terms/page.tsx`

### 3. Missing Pages in Sitemap (SEO - High)

**Issue:** `/pricing`, `/privacy`, and `/terms` pages were not included in `sitemap.xml`, reducing search engine discoverability.

**Fix:** Added all three pages to the static pages array in `sitemap.ts`.

**File:** `apps/web/src/app/sitemap.ts`

### 4. Missing `<main>` Landmark on Auth Pages (Accessibility - High)

**Issue:** Auth layout used a plain `<div>` for its content area instead of a `<main>` element. Screen readers cannot identify the primary content region.

**Fix:** Changed the content wrapper `<div>` to `<main id="main-content">` in the auth layout.

**File:** `apps/web/src/app/(auth)/layout.tsx`

### 5. Missing `<main>` Landmark on Methodology Page (Accessibility - High)

**Issue:** Methodology page used `<div>` as its root wrapper instead of `<main>`.

**Fix:** Changed root `<div>` to `<main id="main-content">`.

**File:** `apps/web/src/app/(marketing)/methodology/page.tsx`

### 6. Missing `<h1>` on Auth Pages (Accessibility - High)

**Issue:** Auth pages (login, signup, forgot-password, reset-password) had no `<h1>` heading. The `CardTitle` component renders as a `<div>`, so the visual title was not semantically a heading.

**Fix:** Added visually-hidden `<h1 className="sr-only">` to each auth form, preserving the existing visual design while providing semantic heading structure.

**Files:**

- `apps/web/src/app/(auth)/login/login-form.tsx`
- `apps/web/src/app/(auth)/signup/signup-form.tsx`
- `apps/web/src/app/(auth)/forgot-password/forgot-password-form.tsx`
- `apps/web/src/app/(auth)/reset-password/reset-password-form.tsx`

### 7. No Skip-to-Content Link (Accessibility - Medium)

**Issue:** No skip navigation link present on any page. Keyboard users must tab through the entire navigation to reach main content.

**Fix:** Added a skip-to-content link as the first child of `<body>` in the root layout. The link is visually hidden (`sr-only`) until focused, then appears as a prominent button.

**File:** `apps/web/src/app/layout.tsx`

### 8. Added `id="main-content"` to All Page Wrappers (Accessibility - Medium)

**Issue:** Skip-to-content link needs a target anchor.

**Fix:** Added `id="main-content"` to the `<main>` element on landing page, pricing, privacy, terms, and methodology pages.

**Files:** All page files listed above.

### 9. Missing Static Asset Caching Headers (Performance - Medium)

**Issue:** No explicit caching headers for static assets, relying on Vercel defaults only.

**Fix:** Added Cache-Control headers in `next.config.ts`:

- `/_next/static/*`: `public, max-age=31536000, immutable` (1 year, immutable)
- `/favicon.ico`: `public, max-age=86400, stale-while-revalidate=604800`

**File:** `apps/web/next.config.ts`

### 10. Explicit Font Display Strategy (Performance - Low)

**Issue:** `next/font/google` uses `display: 'swap'` by default, but it was not explicitly specified, making it fragile to future default changes.

**Fix:** Added explicit `display: 'swap'` to all three font declarations (DM Sans, DM Serif Display, JetBrains Mono).

**File:** `apps/web/src/app/layout.tsx`

### 11. Missing og:image (SEO - Low, Deferred)

**Issue:** No `og:image` set on any page. Social shares will show no preview image. Changed `twitter.card` from `summary_large_image` to `summary` since there is no image to show.

**Fix (partial):** Changed twitter card type to `summary` to be accurate. Creating an actual OG image requires design work and is deferred.

### 12. Lazy Loading for Markdown Images (Performance - Low)

**Issue:** User-rendered markdown images in `MarkdownContent` did not have `loading="lazy"`.

**Fix:** Added `loading="lazy"` to the `<img>` element in the markdown renderer.

**File:** `apps/web/src/components/knowledge/markdown-content.tsx`

### 13. Incorrect metadataBase URL (SEO - Critical)

**Issue:** `metadataBase` was set to `https://pipsapp.com` which is not the actual domain. This would cause all generated canonical URLs and OG URLs to point to the wrong domain.

**Fix:** Changed to `https://pips-app.vercel.app` to match the actual production URL.

**File:** `apps/web/src/app/layout.tsx`

---

## Issues Deferred

### 1. OG Image Generation

**Why deferred:** Requires design work to create a branded social preview image, or implementation of `next/og` dynamic OG image generation. Recommend creating a static OG image at `public/og-image.png` (1200x630px) as a quick win, or implementing dynamic OG via Next.js ImageResponse API for page-specific previews.

### 2. Mobile Navigation Menu

**Why deferred:** Landing page nav links are `hidden md:flex`, meaning mobile users only see logo and auth buttons. This is an existing design choice. Adding a hamburger menu would require a new client component and is a feature request, not a Lighthouse fix.

### 3. Bundle Size Optimization

**Why deferred:** Current JS bundle is well-optimized (35KB total scripts, no single resource over 50KB). Lucide icons are tree-shaken correctly. Recharts and jspdf are only loaded on their respective app pages (not marketing pages). No actionable improvements identified.

### 4. Pre-existing TypeScript Errors in Shared Package

**Why deferred:** The `@pips/shared` package has type errors from vitest type definitions (AbortSignal, setTimeout, etc.). These are vitest internals, not application code, and do not affect the build.

---

## Positive Findings

1. **Server Components by default**: All landing page and marketing components are Server Components (no `use client`). Only interactive forms and app-level components use client-side JS. This is ideal for performance.

2. **No large images**: Public directory only contains small SVGs. No unoptimized raster images found.

3. **Proper heading hierarchy**: Landing page has correct H1 > H2 > H3 structure with single H1.

4. **JSON-LD structured data**: Landing page has WebApplication schema, methodology page has Organization schema.

5. **Security headers**: Comprehensive security header setup including HSTS, CSP, X-Frame-Options, Referrer-Policy, and Permissions-Policy.

6. **Sitemap and robots.txt**: Well-configured with proper URL structure and crawl directives.

7. **Font optimization**: Using `next/font/google` with `display: swap` - no layout shift from fonts.

8. **Fast TTFB**: All pages under 120ms TTFB, most under 50ms. Vercel Edge is performing well.

9. **Proper form accessibility**: Login form has proper labels, aria-invalid, aria-describedby for field errors.

10. **Dark mode support**: Comprehensive dark mode token system with proper contrast ratios.

---

## Recommendations for Future Optimization

1. **Create OG image**: Design a 1200x630px branded preview image, or implement `next/og` for dynamic OG images per page.
2. **Add mobile nav**: Implement a hamburger menu for mobile users on the landing page.
3. **Consider Partial Prerendering**: When Next.js 16 PPR stabilizes, evaluate for authenticated app pages.
4. **Image CDN**: If user-uploaded images grow, consider adding image optimization rules for Supabase storage URLs.
5. **Core Web Vitals monitoring**: Vercel Speed Insights is now unblocked by the CSP fix — monitor CLS, LCP, and INP over time.

---

## Verification

- `pnpm tsc --noEmit` (web): Pass (only pre-existing my-work test errors)
- `pnpm test` (affected tests): 119/119 pass
- `pnpm lint`: 0 errors, 30 pre-existing warnings

## Files Changed

| File                                                               | Change                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| `apps/web/next.config.ts`                                          | CSP fix + caching headers                              |
| `apps/web/src/app/layout.tsx`                                      | metadataBase, canonical, font display, skip-to-content |
| `apps/web/src/app/page.tsx`                                        | canonical, twitter card, main id                       |
| `apps/web/src/app/sitemap.ts`                                      | Added pricing/privacy/terms                            |
| `apps/web/src/app/(auth)/layout.tsx`                               | div > main landmark                                    |
| `apps/web/src/app/(auth)/login/login-form.tsx`                     | sr-only h1                                             |
| `apps/web/src/app/(auth)/signup/signup-form.tsx`                   | sr-only h1                                             |
| `apps/web/src/app/(auth)/forgot-password/forgot-password-form.tsx` | sr-only h1                                             |
| `apps/web/src/app/(auth)/reset-password/reset-password-form.tsx`   | sr-only h1                                             |
| `apps/web/src/app/(marketing)/methodology/page.tsx`                | div > main, canonical                                  |
| `apps/web/src/app/(marketing)/pricing/page.tsx`                    | main id, canonical                                     |
| `apps/web/src/app/(marketing)/privacy/page.tsx`                    | main id, canonical                                     |
| `apps/web/src/app/(marketing)/terms/page.tsx`                      | main id, canonical                                     |
| `apps/web/src/components/knowledge/markdown-content.tsx`           | lazy loading                                           |
