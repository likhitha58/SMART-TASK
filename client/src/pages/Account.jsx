import React from 'react';
import AppNavbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Account() {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <Container fluid className="flex-grow-1">
        <Row>
          <Col md={2}><Sidebar /></Col>
          <Col md={10} className="p-4">
            <Card>
              <Card.Header>Account Details</Card.Header>
              <Card.Body>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default Account;