import axios from 'axios';

/**
 * Data sources 
 *  1. DEV.to  – article feed, article detail, tags, real comments
 *  2. Hacker News (Algolia) – trending sidebar + "related discussions" on article page
 */
const devto = axios.create({ baseURL: 'https://dev.to/api', timeout: 15000 });
const hn = axios.create({ baseURL: 'https://hn.algolia.com/api/v1', timeout: 15000 });


const TTL = 5 * 60 * 1000; // 5 minutes
const mem = new Map();
const readL2 = key => {
  try {
    const raw = sessionStorage.getItem('cm:' + key);
    if (!raw) return null;
    const { t, d } = JSON.parse(raw);
    return Date.now() - t < TTL ? d : null;
  } catch { return null; }
};
const writeL2 = (key, d) => {
  try { sessionStorage.setItem('cm:' + key, JSON.stringify({ t: Date.now(), d })); } catch { }
};
const withRetry = async (fn, retries = 1) => {
  try { return await fn(); } catch (e) { if (retries > 0) return withRetry(fn, retries - 1); throw e; }
};
const cached = (key, request) => {
  if (mem.has(key)) return mem.get(key);
  const hit = readL2(key);
  const p = hit
    ? Promise.resolve(hit)
    : withRetry(request).then(d => { writeL2(key, d); return d; });
  mem.set(key, p);
  p.catch(() => mem.delete(key)); 
  return p;
};

export const SORTS = {
  popular: { label: 'Popular', params: { top: 30 } },
  latest: { label: 'Latest', params: { state: 'fresh' } },
  rising: { label: 'Rising', params: { state: 'rising' } }
};

export const getArticles = ({ page = 1, perPage = 12, tag, sort = 'popular' }) =>
  cached(`articles:${page}:${perPage}:${tag}:${sort}`, () =>
    devto.get('/articles', {
      params: { page, per_page: perPage, tag: tag || undefined, ...(SORTS[sort]?.params || {}) }
    }).then(r => r.data));

export const getArticle = id =>
  cached(`article:${id}`, () => devto.get(`/articles/${id}`).then(r => r.data));

export const getTags = () =>
  cached('tags', () => devto.get('/tags', { params: { per_page: 14 } }).then(r => r.data));

export const getComments = id =>
  cached(`comments:${id}`, () => devto.get('/comments', { params: { a_id: id } }).then(r => r.data));

export const getTrending = () =>
  cached('trending', () =>
    hn.get('/search', { params: { tags: 'front_page', hitsPerPage: 6 } }).then(r => r.data.hits));

export const getHnDiscussions = title =>
  cached(`hn:${title}`, () =>
    hn.get('/search', { params: { query: title, tags: 'story', hitsPerPage: 4 } }).then(r => r.data.hits));

export const prefetchArticle = id => { getArticle(id).catch(() => {}); getComments(id).catch(() => {}); };
