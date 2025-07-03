import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Modal } from 'react-bootstrap';
import EditUserForm from '../../../components/EditUserForm.jsx';

const EditUser = () => {

  const { id } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null); // Store fetched user

  // ✅ Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`);
        const data = await res.json();
        console.log('Fetched user data:', data);
        setUserData(data); // Set user data to pass to form
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUser();
  }, [id]);


  const handleSubmit = async (formData) => {
  try {
    const res = await fetch(`http://localhost:5000/api/users/update/${id}`, {
      method: 'PUT',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      body:formData,
    });

    if (res.ok) {
      console.log('User updated successfully');
      navigate('/users');
    } else {
      const errorData = await res.json();
      console.error('Update failed:', errorData);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};

  const handleClose = () => {
    navigate('/users'); // close modal and go back
  };

 return (
  <Modal show={true} onHide={handleClose} size="lg" centered backdrop="static" style={{ backgroundColor: '#86a1bb8b' }}>
    <Modal.Header closeButton>
      <Modal.Title>Edit Current User</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Container>
        {userData ? (
          <EditUserForm
            initialData={userData}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        ) : (
          <div>Loading user data...</div>
        )}
      </Container>
    </Modal.Body>
  </Modal>
);

}
export default EditUser;
