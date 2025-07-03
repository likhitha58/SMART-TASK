// 📁 src/masters/Location/LocationList.jsx

import React, { useEffect, useState } from 'react';
import AppNavbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { Button, Container, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import '../../styles/masters/Location/LocationList.css';
import AddLocation from './AddLocation';
import EditLocation from './EditLocation';

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await axios.get('/api/masters/locations');
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : [];
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    }
  };

  const handleEditClick = (id) => {
    setSelectedLocationId(id);
    setShowEditModal(true);
  };

  return (
    <>
      <AppNavbar />
      <div className="locationlist-container">
        <div className="sidebar">
          <Sidebar />
        </div>

        <div className="locationlist-background">
          <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="locationlist-title">Location List</h2>
              <Button
                variant="primary"
                className="add-location-btn"
                onClick={() => setShowAddModal(true)}
              >
                + Add Location
              </Button>
            </div>

            <Table striped bordered hover responsive className="locationlist-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>State</th>
                  <th>District</th>
                  <th>Location</th>
                  <th>Short Name</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {locations.length > 0 ? (
                  locations.map((loc, index) => (
                    <tr key={loc.ID || index}>
                      <td>{index + 1}</td>
                      <td>{loc.State || '—'}</td>
                      <td>{loc.District || '—'}</td>
                      <td>{loc.LocationName || '—'}</td>
                      <td>{loc.ShortName || '—'}</td>
                      <td>
                        <Button
                          variant={loc.Status === 'Active' ? 'success' : 'secondary'}
                          style={{
                            fontSize: '1rem',
                            fontWeight: 400,
                            padding: '5px 16px',
                            borderRadius: '6px',
                            height: '35px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            color: 'white'
                          }}
                          disabled
                        >
                          {loc.Status || 'Inactive'}
                        </Button>
                      </td>

                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditClick(loc.ID)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No locations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Container>
        </div>
      </div>

      <Footer />

      {/* Modals */}
      <AddLocation
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onSuccess={fetchLocations}
      />

      <EditLocation
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        onSuccess={fetchLocations}
        locationId={selectedLocationId}
      />
    </>
  );
};

export default LocationList;
