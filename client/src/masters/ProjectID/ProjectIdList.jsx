import React, { useEffect, useState } from 'react';
import AppNavbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { Button, Container, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import AddProjectId from './AddProjectId';
import EditProjectId from './EditProjectId';
import '../../styles/masters/ProjectID/ProjectIdList.css';

const ProjectIdList = () => {
  const [projectIds, setProjectIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjectIds = async () => {
    try {
      const res = await axios.get('/api/masters/project-ids');
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : [];
      setProjectIds(data);
    } catch (err) {
      console.error('Error fetching project IDs:', err);
      setProjectIds([]);
    }
  };

  useEffect(() => {
    fetchProjectIds();
  }, []);

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  return (
    <>
      <AppNavbar />
      <div className="projectidlist-container">
        {/* <div className="sidebar"> */}
          <Sidebar />
        {/* </div> */}

        <div className="projectidlist-background">
          <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="projectidlist-title">Project ID List</h2>
              <Button
                variant="primary"
                className="add-projectid-btn"
                onClick={() => setShowAddModal(true)}
              >
                + Add Project ID
              </Button>
            </div>

            <Table striped bordered hover responsive className="projectidlist-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Project ID</th>
                  {/* <th>Project Name</th> */}
                  <th>Practice Area</th>
                  <th>Client</th>
                  <th>Nature of Work</th>
                  <th>Agreement Executor</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {projectIds.length > 0 ? (
                  projectIds.map((proj, index) => (
                    <tr key={proj.ID || index}>
                      <td>{index + 1}</td>
                      <td>{proj.ProjectID || '—'}</td>
                      {/* <td>{proj.ProjectName || '—'}</td> */}
                      <td>{proj.PracticeArea || '—'}</td>
                      <td>{proj.Client || '—'}</td>
                      <td>{proj.NatureOfWork || '—'}</td>
                      <td>{proj.AgreementExecutor || '—'}</td>
                      <td>{proj.Location || '—'}</td>
                      <td>
                        <Button
                          variant={proj.Status === 'Active' ? 'success' : 'secondary'}
                          size="sm"
                          disabled
                        >
                          {proj.Status || 'Inactive'}
                        </Button>
                      </td>

                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditClick(proj)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">
                      No project IDs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Container>
        </div>
      </div>
      <Footer />

      {/* Add Modal */}
      <AddProjectId
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onSuccess={fetchProjectIds}
      />

      {/* Edit Modal */}
      {selectedProject && (
        <EditProjectId
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          project={selectedProject}
          onSuccess={fetchProjectIds}
        />
      )}
      <EditProjectId
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        project={selectedProject}
        onSuccess={fetchProjectIds}
      />

    </>
  );
};

export default ProjectIdList;
