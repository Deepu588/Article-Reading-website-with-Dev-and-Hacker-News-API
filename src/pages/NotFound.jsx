import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <Container className="py-5"><div className="state-box">
      <h1>Page not found</h1><p>The page you’re looking for doesn’t exist or has moved.</p>
      <Link className="btn btn-primary" to="/">Go to articles</Link></div></Container>
  );
}
