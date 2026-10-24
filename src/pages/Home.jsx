import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Form, ButtonGroup, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import useAsync from '../hooks/useAsync.js';
import useDebounce from '../hooks/useDebounce.js';
import { getArticles, getTags, SORTS } from '../api/client.js';
import ArticleCard from '../components/ArticleCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Pager from '../components/Pagination.jsx';
import { CardSkeleton, ErrorBox } from '../components/Skeleton.jsx';

const PER_PAGE = 12;

export default function Home() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const tag = params.get('tag') || '';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'popular';

  const [query, setQuery] = useState(params.get('q') || '');
  const debounced = useDebounce(query, 300);

  const update = changes => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page'); // reset to page 1 when a filter changes
    setParams(next);
  };

  useEffect(() => {
    if ((params.get('q') || '') !== debounced) {
      const next = new URLSearchParams(params);
      debounced ? next.set('q', debounced) : next.delete('q');
      setParams(next, { replace: true });
    }
  }, [debounced]);

  const articles = useAsync(() => getArticles({ page, perPage: PER_PAGE, tag, sort }), [page, tag, sort]);
  const tags = useAsync(() => getTags(), []);

  const visible = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!articles.data) return [];
    if (!q) return articles.data;
    return articles.data.filter(a =>
      [a.title, a.description, a.user.name, a.tag_list.join(' ')].join(' ').toLowerCase().includes(q));
  }, [articles.data, debounced]);

  return (
    <>
      <section className="hero">
        <Container>
          <h1>Read something worth your next ten minutes.</h1>
          <p>Fresh engineering articles, filtered by topic, sorted your way.</p>
          <Form role="search" onSubmit={e => e.preventDefault()} className="search-box">
            <Form.Label htmlFor="search" visuallyHidden>Search articles</Form.Label>
            <Form.Control id="search" type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, author or topic" />
          </Form>
        </Container>
      </section>

      <Container className="py-4">
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filter by topic">
            <Button size="sm" className={`chip ${!tag ? 'active' : ''}`} onClick={() => update({ tag: '' })}>All</Button>
            {(tags.data || []).map(t => (
              <Button key={t.id} size="sm" className={`chip ${tag === t.name ? 'active' : ''}`}
                onClick={() => update({ tag: t.name })}>#{t.name}</Button>
            ))}
          </div>
          <ButtonGroup size="sm" aria-label="Sort articles">
            {Object.entries(SORTS).map(([key, s]) => (
              <Button key={key} variant={sort === key ? 'primary' : 'outline-primary'}
                onClick={() => update({ sort: key === 'popular' ? '' : key })}>{s.label}</Button>
            ))}
          </ButtonGroup>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            {articles.error && <ErrorBox error={articles.error} onRetry={articles.reload} />}
            {articles.loading && <Row className="g-4"><CardSkeleton /></Row>}
            {!articles.loading && !articles.error && visible.length === 0 && (
              <div className="state-box"><h3>No articles match</h3>
                <p>Try a different keyword, or clear the topic filter.</p>
                <Button variant="outline-primary" onClick={() => { setQuery(''); setParams({}); }}>Clear filters</Button>
              </div>
            )}
            {!articles.loading && visible.length > 0 && (
              <Row className="g-4">
                {visible.map((a, i) => (
                  <Col key={a.id} xs={12} md={i === 0 && !debounced ? 12 : 6}>
                    <ArticleCard article={a} featured={i === 0 && !debounced} />
                  </Col>
                ))}
              </Row>
            )}
            {!articles.error && (
              <Pager page={page} hasMore={(articles.data?.length || 0) === PER_PAGE}
                onChange={p => { update({ page: p > 1 ? String(p) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            )}
          </Col>
          <Col lg={4}><Sidebar /></Col>
        </Row>
      </Container>
    </>
  );
}
