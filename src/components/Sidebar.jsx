import { memo } from 'react';
import useAsync from '../hooks/useAsync.js';
import { getTrending } from '../api/client.js';

function Sidebar() {
  const { data, loading, error } = useAsync(() => getTrending(), []);
  return (
    <aside className="sidebar" aria-label="Trending on Hacker News">
      <h3>Trending on Hacker News</h3>
      {loading && [1, 2, 3, 4].map(i => <div key={i} className="skel skel-line" />)}
      {error && <p className="muted">Trending is unavailable right now.</p>}
      {data && (
        <ol>
          {data.filter(h => h.title && h.url).map(h => (
            <li key={h.objectID}>
              <a href={h.url} target="_blank" rel="noreferrer noopener">{h.title}</a>
              <span className="muted">{h.points} points · {h.num_comments ?? 0} comments</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
export default memo(Sidebar);
