import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/components/Navbar.css';
import logo from '../assets/images/logoSmartTask.png';
import AIChatBot from './AIChatBot.jsx';
import { useState } from 'react';

function AppNavbar() {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(prev => !prev);
  };

  const user = JSON.parse(localStorage.getItem('user')) || { username: 'admin1', department: 'IT' }; // for testing

  return (
    <>
      <Navbar variant="dark" expand="lg">
        <Container>
          <img src={logo} alt="Smart Task Logo" width="50" height="50" className="d-inline-block align-top" />
          <Navbar.Brand as={Link} to="/">Smart Task</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link onClick={toggleChat}>💬 Chat</Nav.Link>
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