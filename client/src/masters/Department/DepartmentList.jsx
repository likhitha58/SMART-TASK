import React, { useEffect, useState } from 'react';
import AppNavbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { Button, Container, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/AxiosConfig';
import AddDepartment from './AddDepartment';
import EditDepartment from './EditDepartment';
import '../../styles/masters/Department/DepartmentList.css';

const DepartmentList = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // ✅
  const [selectedDeptId, setSelectedDeptId] = useState(null); // ✅


  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/masters/departments');
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : [];
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleEditClick = (id) => {
    setSelectedDeptId(id);
    setShowEditModal(true);
  };


  return (
    <>
      <AppNavbar />
      <div className="departmentlist-container">
        <div className="sidebar">
          <Sidebar />
        </div>

        <div className="departmentlist-background">
          <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="departmentlist-title">Department List</h2>
              <Button
                variant="primary"
                className="add-department-btn"
                onClick={() => setShowAddModal(true)}
              >
                + Add Department
              </Button>
            </div>

            <Table striped bordered hover responsive className="departmentlist-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Department</th>
                  <th>Short Name</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {departments.length > 0 ? (
                  departments.map((dept, index) => (
                    <tr key={dept.ID || index}>
                      <td>{index + 1}</td>
                      <td>{dept.DepartmentName || '—'}</td>
                      <td>{dept.ShortName || '—'}</td>
                      <td>
                        <Button
                          variant={dept.Status === 'Active' ? 'success' : 'secondary'}
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
                          {dept.Status || 'Inactive'}
                        </Button>

                      </td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditClick(dept.ID)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No departments found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Container>
        </div>
      </div>
      <Footer />

      {/* 🔽 Modal rendered here */}
      <AddDepartment
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onSuccess={fetchDepartments}
      />
      {showEditModal && selectedDeptId && (
  <EditDepartment
    key={selectedDeptId} // ✅ This forces a full re-render of the modal
    show={showEditModal}
    handleClose={() => setShowEditModal(false)}
    departmentId={selectedDeptId}
    onUpdated={fetchDepartments}
  />
)}

    </>
  );
};

export default DepartmentList;
