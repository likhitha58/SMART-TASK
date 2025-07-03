// 📁 src/masters/Location/EditLocation.jsx

import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const EditLocation = ({ show, handleClose, onSuccess, locationId }) => {
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

  // Fetch existing location details
  useEffect(() => {
    if (locationId && show) {
      axios
        .get(`/api/masters/locations/${locationId}`)
        .then((res) => {
          const data = res.data?.data || res.data;
          setLocationData(data);
        })
        .catch((err) => {
          console.error('Failed to fetch location details:', err);
        });
    }
  }, [locationId, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/masters/locations/edit/${locationId}`, locationData);
      alert('Location updated successfully!');
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error updating location:', err);
      alert('Failed to update location');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Location</Modal.Title>
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
              <Form.Select
                name="Country"
                value={locationData.Country}
                onChange={handleChange}
              >
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
              <Form.Select
                name="Status"
                value={locationData.Status}
                onChange={handleChange}
              >
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
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditLocation;
