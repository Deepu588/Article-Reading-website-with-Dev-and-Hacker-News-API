import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import { formatDate } from '../utils.js';
import { prefetchArticle } from '../api/client.js';

const warm = id => { prefetchArticle(id); import('../pages/ArticlePage.jsx'); };

function ArticleCard({ article, featured = false }) {
  const img = article.cover_image || article.social_image;
  return (
    <article className={`card-article ${featured ? 'is-featured' : ''}`}
      onMouseEnter={() => warm(article.id)} onFocus={() => warm(article.id)}>
      <Link to={`/article/${article.id}`} className="card-media" tabIndex={-1} aria-hidden="true">
        {img
          ? <img src={img} alt="" width="1000" height="420" loading={featured ? 'eager' : 'lazy'} decoding="async" />
          : <div className="media-fallback">{article.title.charAt(0)}</div>}
      </Link>
      <div className="card-body-x">
        <div className="tag-row">
          {article.tag_list.slice(0, 3).map(t => <Badge key={t} bg="" className="tag-pill">#{t}</Badge>)}
        </div>
        <h2 className="card-title-x"><Link to={`/article/${article.id}`}>{article.title}</Link></h2>
        <p className="card-desc">{article.description}</p>
        <div className="byline">
          <img src={article.user.profile_image_90} alt="" width="28" height="28" loading="lazy" />
          <span>{article.user.name}</span>
          <span className="muted">{formatDate(article.published_at)} · {article.reading_time_minutes} min read</span>
        </div>
      </div>
    </article>
  );
}
export default memo(ArticleCard);
