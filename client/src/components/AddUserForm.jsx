import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import '../styles/components/AddUserForm.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddUserForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    username: '',
    mobile: '',
    department: '',
    role: '',
    status: '',
    password: '',
    confirmPassword: '',
    photo: null,
  });
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/masters/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        toast.error('Failed to load departments');
      }
    };

    fetchDepartments();

  }, []);

  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(' Passwords do not match!');
      return;
    }

    const formPayload = new FormData();
    formPayload.append('fullname', formData.fullname);
    formPayload.append('email', formData.email);
    formPayload.append('username', formData.username);
    formPayload.append('mobile', formData.mobile);
    formPayload.append('department', formData.department);
    formPayload.append('role', formData.role);
    formPayload.append('status', formData.status);
    formPayload.append('password', formData.password);
    if (formData.photo) {
      formPayload.append('photo', formData.photo);
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/users',
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('User added successfully!');
      console.log('User added:', response.data);
      if (onSubmit) onSubmit(formData);
    } catch (error) {
      console.error('Error submitting user:', error);
      toast.error(' Error adding user. Please try again!');
    }
  };

  return (
    <Form onSubmit={handleSubmit} encType="multipart/form-data" className="p-3">
      <Form.Group as={Row} className="mb-3" controlId="fullname">
        <Form.Label column sm={3}>Full Name</Form.Label>
        <Col sm={9}>
          <Form.Control
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="email">
        <Form.Label column sm={3}>Email</Form.Label>
        <Col sm={9}>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="role">
        <Form.Label column sm={3}>Role</Form.Label>
        <Col sm={9}>
          <Form.Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Role --</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
            <option value="Testing">Testing</option>
          </Form.Select>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="username">
        <Form.Label column sm={3}>Username</Form.Label>
        <Col sm={9}>
          <Form.Control
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="password">
        <Form.Label column sm={3}>Password</Form.Label>
        <Col sm={9}>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="confirmPassword">
        <Form.Label column sm={3}>Confirm Password</Form.Label>
        <Col sm={9}>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="mobile">
        <Form.Label column sm={3}>Mobile Number</Form.Label>
        <Col sm={9}>
          <Form.Control
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="department">
        <Form.Label column sm={3}>Department</Form.Label>
        <Col sm={9}>
          <Form.Select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept.ID} value={dept.DepartmentName}>
                {dept.DepartmentName}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Form.Group>


      <Form.Group as={Row} className="mb-3" controlId="status">
        <Form.Label column sm={3}>Status</Form.Label>
        <Col sm={9}>
          <Button
            variant={formData.status === 'Active' ? 'success' : 'secondary'}
            onClick={() =>
              setFormData({
                ...formData,
                status: formData.status === 'Active' ? 'Inactive' : 'Active',
              })
            }
          >
            {formData.status || 'Set Status'}
          </Button>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="photo">
        <Form.Label column sm={3}>Upload Photo</Form.Label>
        <Col sm={9}>
          <Form.Control
            type="file"
            name="photo"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setFormData({ ...formData, photo: file });
              if (file) {
                setPreviewUrl(URL.createObjectURL(file));
              }
            }}
          />

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '10px',
                marginTop: '10px',
              }}
            />
          )}
        </Col>
      </Form.Group>

      <Row className="mt-4">
        <Col sm={{ span: 9, offset: 3 }} className="d-flex gap-3">
          <Button type="submit">Add User</Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default AddUserForm;
