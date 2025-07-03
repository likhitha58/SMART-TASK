// 📁 src/masters/Location/AddLocation.jsx

import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const AddLocation = ({ show, handleClose, onSuccess }) => {
  const [locationData, setLocationData] = useState({
    LocationName: '',
    ShortName: '',
    Address: '',
    Country: 'India',
    State: '',
    District: '',
    Pincode: '',
    Status: 'Active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/masters/locations/add', locationData);
      alert('Location added successfully!');
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error adding location:', err);
      alert('Failed to add location');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Location</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="LocationName"
                value={locationData.LocationName}
                onChange={handleChange}
                placeholder="Enter location name"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Short Name</Form.Label>
              <Form.Control
                type="text"
                name="ShortName"
                value={locationData.ShortName}
                onChange={handleChange}
                placeholder="Enter short name"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="Address"
                value={locationData.Address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Country</Form.Label>
              <Form.Select name="Country" value={locationData.Country} onChange={handleChange}>
                <option value="India">India</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="State"
                value={locationData.State}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </Col>

            <Col md={6}>
              <Form.Label>District</Form.Label>
              <Form.Control
                type="text"
                name="District"
                value={locationData.District}
                onChange={handleChange}
                placeholder="Enter district"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Pincode</Form.Label>
              <Form.Control
                type="text"
                name="Pincode"
                value={locationData.Pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Status</Form.Label>
              <Form.Select name="Status" value={locationData.Status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
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

export default AddLocation;
