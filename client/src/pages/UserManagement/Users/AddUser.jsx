// 📁 client/src/pages/UserManagement/Users/AddUser.js
import React from 'react';
import { Modal, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AddUserForm from '../../../components/AddUserForm.jsx'; // adjust path if needed
import '../../../styles/pages-css/UserManagement/AddUser.css';

const AddUser = () => {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    console.log('Submitted from modal:', formData);
    navigate('/users');
  };


  const handleClose = () => {
    navigate('/users'); // close modal and go back
  };

  return (
    <div className="form-container">
      <Modal show={true} onHide={handleClose} size="lg" centered backdrop="static" style={{ backgroundColor: '#86a1bb8b' }}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <AddUserForm onSubmit={handleSubmit} onCancel={handleClose} />
          </Container>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AddUser;
