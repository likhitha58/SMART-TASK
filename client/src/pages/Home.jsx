import React from 'react';
import AppNavbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/pages-css/Home.css';

function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <Container fluid className="flex-grow-1 home-container">
        <Row>
          <Col md={2}><Sidebar /></Col>
          <Col md={10} className="p-4">
            <h1 className="home-title">Welcome to Smart Task Dashboard</h1>
            <p className="home-subtext">Select a section from the sidebar to get started.</p>

            {/* Cards with animation */}
            <Row className="mt-4 g-4">
              <Col md={6}>
                <Card className="animated-card">
                  <Card.Body>
                    <Card.Title>Overview</Card.Title>
                    <Card.Text>
                      Smart Task helps you assign, schedule, and review tasks with ease.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <br></br>
              <Col md={6}>
                <Card className="animated-card">
                  <Card.Body>
                    <Card.Title>Quick Tips</Card.Title>
                    <Card.Text>
                      Use the sidebar to access user and task management tools quickly.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="animated-card">
                  <Card.Body>
                    <Card.Title>Manage Users</Card.Title>
                    <Card.Text>
                      Assign or add users for smooth collaborative tasks with coordination and logged-in time.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="animated-card">
                  <Card.Body>
                    <Card.Title>Review</Card.Title>
                    <Card.Text>
                      Review the assigned tasks with ease for updated prooject requests.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default Home;
