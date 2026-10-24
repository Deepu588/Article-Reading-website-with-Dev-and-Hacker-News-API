export function CardSkeleton({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div className="col-12 col-md-6" key={i} aria-hidden="true">
      <div className="card-article skeleton-card">
        <div className="skel skel-media" /><div className="card-body-x">
          <div className="skel skel-line w-25" /><div className="skel skel-line w-75" /><div className="skel skel-line" />
        </div>
      </div>
    </div>
  ));
}
export const ErrorBox = ({ error, onRetry }) => (
  <div className="state-box" role="alert">
    <h3>We couldn’t load this</h3>
    <p>{error?.message || 'Something went wrong.'} Check your connection and try again.</p>
    <button className="btn btn-primary" onClick={onRetry}>Retry</button>
  </div>
);
