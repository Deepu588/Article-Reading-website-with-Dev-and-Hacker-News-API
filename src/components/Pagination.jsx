import { Pagination as RBPagination } from 'react-bootstrap';

export default function Pager({ page, hasMore, onChange }) {
  const pages = [page - 1, page, page + 1].filter(p => p >= 1 && (p <= page || hasMore));
  return (
    <RBPagination className="justify-content-center my-4 inkwell-pager">
      <RBPagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} />
      {page > 2 && <RBPagination.Item onClick={() => onChange(1)}>1</RBPagination.Item>}
      {page > 3 && <RBPagination.Ellipsis disabled />}
      {pages.map(p => (
        <RBPagination.Item key={p} active={p === page} onClick={() => onChange(p)}>{p}</RBPagination.Item>
      ))}
      <RBPagination.Next disabled={!hasMore} onClick={() => onChange(page + 1)} />
    </RBPagination>
  );
}
