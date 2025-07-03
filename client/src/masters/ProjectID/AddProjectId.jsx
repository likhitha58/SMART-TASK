// 📁 src/masters/ProjectID/AddProjectId.jsx

import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import '../../styles/masters/ProjectID/AddProjectId.css';

const AddProjectId = ({ show, handleClose, onSuccess }) => {
  const [projectData, setProjectData] = useState({
    ProjectID: '',
    PracticeArea: '',
    NatureOfWork: '',
    AgreementExecutor: '',
    Location: '',
    Client: '',
    Status: 'Active',
  });

  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      for (let key in projectData) {
        formData.append(key, projectData[key]);
      }
      if (file) {
        formData.append('ProjectIdFile', file);
      }

      await axios.post('/api/masters/project-ids/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Project ID added successfully!');
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error adding project:', err);
      alert('Failed to add project');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add Project ID</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Project ID</Form.Label>
                <Form.Control
                  type="text"
                  name="ProjectID"
                  value={projectData.ProjectID}
                  onChange={handleChange}
                  placeholder="Enter project ID"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Practice Area</Form.Label>
                <Form.Control
                  type="text"
                  name="PracticeArea"
                  value={projectData.PracticeArea}
                  onChange={handleChange}
                  placeholder="Enter practice area"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nature of Work</Form.Label>
                <Form.Control
                  type="text"
                  name="NatureOfWork"
                  value={projectData.NatureOfWork}
                  onChange={handleChange}
                  placeholder="Enter nature of work"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Agreement Executor</Form.Label>
                <Form.Control
                  type="text"
                  name="AgreementExecutor"
                  value={projectData.AgreementExecutor}
                  onChange={handleChange}
                  placeholder="Enter agreement executor"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Work Location</Form.Label>
                <Form.Control
                  type="text"
                  name="Location"
                  value={projectData.Location}
                  onChange={handleChange}
                  placeholder="Enter work location"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Client</Form.Label>
                <Form.Control
                  type="text"
                  name="Client"
                  value={projectData.Client}
                  onChange={handleChange}
                  placeholder="Enter client name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="Status"
                  value={projectData.Status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Upload Project ID File</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
              </Form.Group>
            </Col>
          </Row>
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

export default AddProjectId;
