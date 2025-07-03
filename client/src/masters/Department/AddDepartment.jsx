import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from '../../api/axiosConfig.jsx'; // 👈 Use this
import '../../styles/masters/Department/AddDepartment.css';
const AddDepartment = ({ show, handleClose, onSuccess }) => {
  // ✅ Define departmentData before any use
  const [departmentData, setDepartmentData] = useState({
    DepartmentName: '',
    ShortName: '',
    Status: 'Active',
  });

  // ✅ Do not use departmentData before this point

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/masters/departments/add', departmentData);
      alert('Department added successfully!');
      onSuccess(); // refresh list
      handleClose(); // close modal
    } catch (err) {
      console.error('Error adding department:', err);
      alert('Failed to add department');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add Department</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Department Name</Form.Label>
            <Form.Control
              type="text"
              name="DepartmentName"
              value={departmentData.DepartmentName}
              onChange={handleChange}
              placeholder="Enter department name"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Short Name</Form.Label>
            <Form.Control
              type="text"
              name="ShortName"
              value={departmentData.ShortName}
              onChange={handleChange}
              placeholder="Enter short name"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="Status"
              value={departmentData.Status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Back to List
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddDepartment;
