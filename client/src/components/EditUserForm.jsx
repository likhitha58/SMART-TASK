import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/components/EditUserForm.css';

const EditUserForm = ({ initialData, onSubmit, onCancel }) => {
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
    existingPhoto: '',
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [hasNewImage, setHasNewImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullname: initialData.fullname || '',
        email: initialData.email || '',
        username: initialData.username || '',
        mobile: initialData.mobile || '',
        department: initialData.department || '',
        role: initialData.role || '',
        status: initialData.status || '',
        password: '',
        confirmPassword: '',
        photo: null,
        existingPhoto: initialData.photo || '',
      });
      if (initialData.photo) {
        setPreviewUrl(`http://localhost:5000/uploads/${initialData.photo}`);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(' Passwords do not match!');
      return;
    }

    const payload = new FormData();
    payload.append('fullname', formData.fullname);
    payload.append('email', formData.email);
    payload.append('username', formData.username);
    payload.append('mobile', formData.mobile);
    payload.append('department', formData.department);
    payload.append('role', formData.role);
    payload.append('status', formData.status);
    payload.append('password', formData.password);
    if (formData.photo) {
      payload.append('photo', formData.photo);
    }

    if (onSubmit) {
      onSubmit(payload);
      toast.success(' User updated successfully!');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3">
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
          <Form.Control
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
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

      {previewUrl && (
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Current Photo</Form.Label>
          <Col sm={9}>
            <img
              src={previewUrl}
              alt="User Preview"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '10px',
                marginTop: '10px',
                border: hasNewImage ? '2px solid #007bff' : '1px solid #ccc',
              }}
            />
          </Col>
        </Form.Group>
      )}

      <Form.Group as={Row} className="mb-3" controlId="photo">
        <Form.Label column sm={3}>Upload New Photo</Form.Label>
        <Col sm={9}>
          <Form.Control
            type="file"
            name="photo"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData({ ...formData, photo: file });
                setPreviewUrl(URL.createObjectURL(file));
                setHasNewImage(true);
              }
            }}
          />
        </Col>
      </Form.Group>

      <Row className="mt-4">
        <Col sm={{ span: 9, offset: 3 }} className="d-flex gap-3">
          <Button type="submit">Edit User</Button>
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

export default EditUserForm;
