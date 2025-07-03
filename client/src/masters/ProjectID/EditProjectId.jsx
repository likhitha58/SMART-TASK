// 📁 src/masters/ProjectID/EditProjectId.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import '../../styles/masters/ProjectID/EditProjectId.css';

const EditProjectId = ({ show, handleClose, onSuccess, project }) => {
  const [projectData, setProjectData] = useState({
    ProjectID: '',
    PracticeArea: '',
    Client: '',
    NatureOfWork: '',
    AgreementExecutor: '',
    Location: '',
    // LocationState: '',
    Status: 'Active',
  });

  const [file, setFile] = useState(null);

  useEffect(() => {
    if (project && show) {
      setProjectData({
        ProjectID: project.ProjectID || '',
        PracticeArea: project.PracticeArea || '',
        Client: project.Client || '',
        NatureOfWork: project.NatureOfWork || '',
        AgreementExecutor: project.AgreementExecutor || '',
        Location: project.Location || '',
        Status: project.Status || 'Active',
      });
    }
  }, [project, show]);



  const fetchProjectData = async (id) => {
    try {
      const res = await axios.get(`/api/masters/projectids/${id}`);
      if (res.data?.data) {
        setProjectData((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
    }
  };

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

      await axios.put(`/api/masters/project-ids/edit/${ project.ID }`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Project ID updated successfully!');
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error updating project ID:', err);
      alert('Failed to update project ID');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Project ID</Modal.Title>
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
                <Form.Label>Client</Form.Label>
                <Form.Control
                  type="text"
                  name="Client"
                  value={projectData.Client}
                  onChange={handleChange}
                  placeholder="Enter client"
                />
              </Form.Group>
            </Col>

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
          </Row>

          <Row className="mb-3">
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
          </Row>

          <Row>
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
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProjectId;
