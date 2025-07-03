// src/pages/Masters/Department/EditDepartmentModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import '../../styles/masters/Department/EditDepartment.css';
const EditDepartment = ({ show, handleClose, departmentId, onUpdated }) => {
  const [form, setForm] = useState({
    DepartmentName: '',
    ShortName:'',
    Status: 'Active',
  });

  useEffect(() => {
    if (departmentId && show) {
      axios.get(`/api/masters/departments/${departmentId}`)
        .then(res => {
         const data = res.data?.data || res.data;
console.log('Fetched department:', data); // ✅ LOG to debug
          setForm({
            DepartmentName: data.DepartmentName || '',
            ShortName: data.ShortName || '',
            Status: data.Status || 'Active',
          });
        })
        .catch(err => console.error('Error fetching department:', err));
    }
  }, [departmentId, show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/masters/departments/edit/${departmentId}`, form);
      alert('✅ Department updated successfully!');
      handleClose();
      onUpdated(); // Refresh the list
    } catch (err) {
      console.error('❌ Error updating department:', err);
      alert('Error updating department');
    }
  };

  return (
      <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Department</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Department Name</Form.Label>
            <Form.Control
              type="text"
              name="DepartmentName"
              value={form.DepartmentName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Short Name</Form.Label>
            <Form.Control
              type="text"
              name="ShortName"
              value={form.ShortName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="Status"
              value={form.Status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-3">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditDepartment;
