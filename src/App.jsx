import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';

// Code-splitting: the article page (and DOMPurify) loads only when needed.
const ArticlePage = lazy(() => import('./pages/ArticlePage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'light'; } catch { return 'light'; }
  });
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {  }
  }, [theme]);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header theme={theme} onToggleTheme={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))} />
      <main id="main">
        <Suspense fallback={<div className="page-loading" role="status">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
