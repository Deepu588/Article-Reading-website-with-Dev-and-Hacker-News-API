# Chanakya's Medium – Article & Blog Hosting Website

React + React Bootstrap + custom CSS + Axios. Built with Vite.

## Setup
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
npm run preview
```
Requires Node 18+. No API keys needed.

## Features
- Article listing with featured first card, responsive grid, skeleton loaders, error + empty states
- Article detail page: sanitised HTML body, reading-progress bar, reactions/reading time, related articles
- Search (debounced), topic filter chips, sort (Popular / Latest / Rising), server-side pagination
- All filters live in the URL (`/?tag=react&sort=latest&page=2&q=hooks`) – shareable, back/forward works
- Light/dark theme (saved in localStorage), keyboard-accessible, skip link, reduced-motion support
- Responsive: desktop, tablet and mobile (Bootstrap grid + custom CSS tokens)

## APIs used (each source has its own Axios instance in `src/api/client.js`)
| API | Endpoint | Used for |
|---|---|---|
| DEV.to | `GET /api/articles?page&per_page&tag&top/state` | Listing, filters, sort, pagination, related articles |
| DEV.to | `GET /api/articles/:id` | Article detail (`body_html`, author, tags) |
| DEV.to | `GET /api/tags` | Topic filter chips |
| DEV.to | `GET /api/comments?a_id=:id` | Real threaded comments on the article page |
| Hacker News (Algolia) | `GET /api/v1/search?tags=front_page` | "Trending on Hacker News" sidebar (home) |
| Hacker News (Algolia) | `GET /api/v1/search?query=<title>&tags=story` | "On Hacker News" related discussions (article page) |

**Data flow:** component → `useAsync` hook → API function (Axios + 2-level cache + retry) → state → render.
Search filters the loaded page client-side (DEV.to's public API has no search endpoint).

## Performance optimisations
- **Route-level code splitting** (`React.lazy`) – article page and DOMPurify load on demand
- **Vendor chunking** in `vite.config.js` for better caching
- **Two-level cache**: in-memory promise cache (instant repeat views, de-duplicates in-flight calls) + `sessionStorage` with a 5-minute TTL (instant after refresh)
- **Prefetch on hover/focus**: article data and the article-page chunk are loaded before the click
- **Auto-retry once** on failed requests; failures are never cached
- **Stale-result guard** in `useAsync` (ignores outdated responses, no race conditions)
- **Debounced search** (300 ms) + `useMemo` filtering, `React.memo` on cards and sidebar
- **Lazy-loaded images** with explicit width/height and `aspect-ratio` to avoid layout shift; first card loads eagerly
- **Skeleton loaders** for perceived speed; `preconnect` to fonts and dev.to
- **rAF-throttled, passive scroll listener** for the progress bar
- **Sanitised HTML** (DOMPurify) for safe rendering of third-party content

## Structure
```
src/
  api/client.js        axios instances, cache, endpoint functions
  hooks/               useAsync, useDebounce
  components/          Header, Footer, ArticleCard, Sidebar, Pagination, Skeleton
  pages/               Home, ArticlePage, NotFound
  styles.css           design tokens + custom CSS
```
