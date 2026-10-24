import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import useAsync from '../hooks/useAsync.js';
import { getArticle, getArticles, getComments, getHnDiscussions } from '../api/client.js';
import { formatDate } from '../utils.js';
import { ErrorBox } from '../components/Skeleton.jsx';

function ReadingProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        setW((h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div className="progress-bar-x" style={{ width: `${w}%` }} role="presentation" />;
}

const countComments = list => list.reduce((n, c) => n + 1 + countComments(c.children || []), 0);

// Recursive threaded comment (DEV.to returns children inside each comment)
function Comment({ c, depth = 0 }) {
  const html = useMemo(() => DOMPurify.sanitize(c.body_html), [c.body_html]);
  return (
    <div className={`comment ${depth ? 'reply' : ''}`}>
      <div className="byline">
        <img src={c.user.profile_image_90} alt="" width="28" height="28" loading="lazy" />
        <strong>{c.user.name}</strong>
        <span className="muted">{formatDate(c.created_at)}</span>
      </div>
      <div className="comment-body" dangerouslySetInnerHTML={{ __html: html }} />
      {depth < 3 && c.children?.map(ch => <Comment key={ch.id_code} c={ch} depth={depth + 1} />)}
    </div>
  );
}

export default function ArticlePage() {
  const { id } = useParams();
  const article = useAsync(() => getArticle(id), [id]);
  const comments = useAsync(() => getComments(id), [id]);
  const firstTag = article.data?.tag_list?.[0] || article.data?.tags?.split(',')[0]?.trim();
  const related = useAsync(
    () => (firstTag ? getArticles({ perPage: 5, tag: firstTag }) : Promise.resolve([])), [firstTag]);
  const hn = useAsync(
    () => (article.data ? getHnDiscussions(article.data.title) : Promise.resolve([])), [article.data?.title]);

  const html = useMemo(() => (article.data ? DOMPurify.sanitize(article.data.body_html) : ''), [article.data]);
  useEffect(() => { if (article.data) document.title = `${article.data.title} – Chanakya's Medium`; }, [article.data]);

  if (article.error) return <Container className="py-5"><ErrorBox error={article.error} onRetry={article.reload} /></Container>;
  if (article.loading) return <Container className="py-5"><div className="skel skel-line w-75" /><div className="skel skel-media" /><div className="skel skel-line" /><div className="skel skel-line" /></Container>;

  const a = article.data;
  const tagList = Array.isArray(a.tags) ? a.tags : (a.tags || '').split(',').map(t => t.trim()).filter(Boolean);

  return (
    <>
      <ReadingProgress />
      <Container className="py-4">
        <Link to="/" className="back-link">← Back to articles</Link>
        <Row className="g-5 mt-0">
          <Col lg={8}>
            <article className="reader">
              <div className="tag-row">{tagList.map(t => (
                <Link key={t} to={`/?tag=${t}`}><Badge bg="" className="tag-pill">#{t}</Badge></Link>))}</div>
              <h1>{a.title}</h1>
              <div className="byline">
                <img src={a.user.profile_image_90} alt="" width="36" height="36" />
                <span>{a.user.name}</span>
                <span className="muted">{formatDate(a.published_at)} · {a.reading_time_minutes} min read · {a.public_reactions_count} reactions</span>
              </div>
              {a.cover_image && <img className="reader-cover" src={a.cover_image} alt="" width="1000" height="420" decoding="async" />}
              <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
              <a className="btn btn-outline-primary mt-4" href={a.url} target="_blank" rel="noreferrer noopener">View original on DEV.to</a>
            </article>

            <section className="comments" aria-label="Comments">
              <h2>Comments {comments.data && `(${countComments(comments.data)})`}</h2>
              {comments.loading && <div className="skel skel-line" />}
              {comments.error && <p className="muted">Comments couldn’t be loaded.</p>}
              {comments.data?.length === 0 && <p className="muted">No comments on this article yet.</p>}
              {comments.data?.map(c => <Comment key={c.id_code} c={c} />)}
            </section>
          </Col>

          <Col lg={4}>
            <aside className="sidebar mb-4" aria-label="Related articles">
              <h3>More in #{firstTag || 'articles'}</h3>
              {related.loading && <div className="skel skel-line" />}
              <ul className="related">
                {related.data?.filter(r => String(r.id) !== id).slice(0, 4).map(r => (
                  <li key={r.id}><Link to={`/article/${r.id}`}>{r.title}</Link>
                    <span className="muted">{r.reading_time_minutes} min read</span></li>
                ))}
              </ul>
            </aside>
            <aside className="sidebar" aria-label="Hacker News discussions">
              <h3>On Hacker News</h3>
              {hn.loading && <div className="skel skel-line" />}
              {hn.data?.length === 0 && <p className="muted">No related discussions found.</p>}
              <ul className="related">
                {hn.data?.filter(h => h.title).map(h => (
                  <li key={h.objectID}>
                    <a href={`https://news.ycombinator.com/item?id=${h.objectID}`} target="_blank" rel="noreferrer noopener">{h.title}</a>
                    <span className="muted">{h.points} points · {h.num_comments ?? 0} comments</span></li>
                ))}
              </ul>
            </aside>
          </Col>
        </Row>
      </Container>
    </>
  );
}
