import React from 'react';
import AppNavbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import { Container, Row, Col } from 'react-bootstrap';

function Dashboard() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <Container fluid className="flex-grow-1">
        <Row>
          <Col md={2}><Sidebar /></Col>
          <Col md={10} className="p-4">
            <h2>Dashboard Overview</h2>
            <p>Summary of tasks, users, and recent activity will appear here.</p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default Dashboard;
