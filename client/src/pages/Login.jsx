import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig.jsx';
import { Navbar, Container, Form, Button } from 'react-bootstrap';
import logo from '../assets/images/logoSmartTask.png';
import sideImage from '../assets/images/loginSideImage.png';
import '../styles/pages-css/Login.css';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/auth/login', {
        username,
        password,
      },{
        headers:{skipAuth:true}
      });

      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('token', token);

        // Decode token to extract user info
        const decoded = jwtDecode(token);
        const userInfo = {
          id: decoded.id,
          name: decoded.fullName,
          photo: decoded.photo, // filename or base64 string
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Login error');
    }
  };


  return (
    <div className="login-page-background">
      <Navbar expand="lg" className="custom-navbar">
        <Navbar.Brand href="/" className="brand">
          <img
            src={logo}
            alt="Smart Task Logo"
            width="50"
            height="50"
            className="d-inline-block align-top"
          />
          <span className="brand-name">Smart Task</span>
        </Navbar.Brand>
      </Navbar>

      <div className="login-wrapper">
        <div className="login-left">
          <img src={sideImage} alt="Smart Task Illustration" className="login-image" />
        </div>

        <div className="login-right">
          <Container className="login-form-container">
            <h2>Login</h2>
            <Form onSubmit={handleSubmit} autoComplete="off">
              <Form.Group controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <br />
              <Button type="submit" className="mt-3">
                Login
              </Button>
            </Form>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Login;
