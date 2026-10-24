import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

export default function Header({ theme, onToggleTheme }) {
  return (
    <Navbar expand="md" sticky="top" className="site-nav" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand">Chanakya's Medium</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>Articles</Nav.Link>
            <Nav.Link as={NavLink} to="/?sort=latest">Latest</Nav.Link>
            <Nav.Link as={NavLink} to="/?tag=react">React</Nav.Link>
          </Nav>
          <Button variant="outline-secondary" size="sm" onClick={onToggleTheme} aria-label="Toggle dark mode">
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
