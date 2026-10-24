import { Container } from 'react-bootstrap';
export default function Footer() {
  return (
    <footer className="site-footer">
      <Container className="d-flex flex-wrap justify-content-between gap-2">
        <span>© {new Date().getFullYear()} Chanakya's Medium</span>
        <span>Articles and comments from DEV.to · Trending from Hacker News</span>
      </Container>
    </footer>
  );
}
