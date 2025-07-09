import React from 'react';
import AppNavbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/pages-css/Home.css';
import { FaUserFriends, FaTasks, FaLightbulb, FaClipboardList } from 'react-icons/fa';

function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <Container fluid className="flex-grow-1 px-4 py-3 home-container">
        <Row>
          <Col xs={12} md={3} className="mb-4 mb-md-0">
            <Sidebar />
          </Col>

          <Col xs={12} md={9}>
            <div className="text-center mb-5">
              <h1 className="home-title">
                Welcome to <span className="text-primary">Smart Task</span>
              </h1>
              <p className="home-subtext">
                Your hub for managing tasks, users, and reviews effectively.
              </p>
            </div>

            <Row className="g-4">
              <Col xs={12} sm={6} lg={6}>
                <Card className="animated-card shadow-sm text-center h-100">
                  <Card.Body>
                    <Card.Title><FaClipboardList className="me-2 text-info" /> Overview</Card.Title>
                    <Card.Text>
                      Smart Task helps you assign, schedule, and review tasks with ease, enhancing productivity.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={6}>
                <Card className="animated-card shadow-sm text-center h-100">
                  <Card.Body>
                    <Card.Title><FaLightbulb className="me-2 text-warning" /> Quick Tips</Card.Title>
                    <Card.Text>
                      Use the sidebar to access all tools like User Management, Tasks, Projects, and Reviews efficiently.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={6}>
                <Card className="animated-card shadow-sm text-center h-100">
                  <Card.Body>
                    <Card.Title><FaUserFriends className="me-2 text-success" /> Manage Users</Card.Title>
                    <Card.Text>
                      Assign or add users for collaborative workflows and track login sessions and task assignments.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={6}>
                <Card className="animated-card shadow-sm text-center h-100">
                  <Card.Body>
                    <Card.Title><FaTasks className="me-2 text-danger" /> Review Tasks</Card.Title>
                    <Card.Text>
                      Review submitted tasks and track updates for each project to ensure alignment with goals.
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
