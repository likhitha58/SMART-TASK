import React, { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/components/Navbar.css';
import logo from '../assets/images/logoSmartTask.png';
import AIChatBot from './AIChatBot.jsx';

function AppNavbar() {
  const [showChat, setShowChat] = useState(false);
  const toggleChat = () => setShowChat(prev => !prev);

  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'admin1',
    department: 'IT'
  };

  return (
    <>
      <Navbar expand="lg" className="custom-navbar">
        <Container fluid className="px-4">
          {/* Brand Section (Logo + Title) */}
          <div className="d-flex align-items-center">
            <img
              src={logo}
              alt="Smart Task Logo"
              width="45"
              height="45"
              className="me-2"
            />
            <Navbar.Brand as={Link} to="/" className="navbar-title">
              Smart Task
            </Navbar.Brand>
          </div>

          {/* Toggler for mobile */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          {/* Nav Links */}
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center">
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              {/* <Nav.Link onClick={toggleChat}>💬 Chat</Nav.Link> */}
              <Nav.Link as={Link} to="/login">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {showChat && <AIChatBot loggedInUser={user} />}
    </>
  );
}

export default AppNavbar;
