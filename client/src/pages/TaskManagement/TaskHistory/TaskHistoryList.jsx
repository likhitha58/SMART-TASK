import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../../../components/Navbar.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import axios from '../../../api/axiosConfig.jsx';
import '../../../styles/pages-css/TaskManagement/TaskHistory/TaskHistoryList.css';

const TaskHistoryList = () => {
  const navigate = useNavigate();
  const [taskHistory, setTaskHistory] = useState([]);
  const [filters, setFilters] = useState({
    projectId: '',
    department: '',
    taskName: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
  const prior = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    fetchAllCompletedTasks();
  }, []);

  const fetchAllCompletedTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/task-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskHistory(res.data);
    } catch (err) {
      console.error("❌ Error fetching completed tasks", err);
    }
  };

  const handleView = async () => {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, val]) => {
      if (val.trim()) {
        params.append(key, val);
      }
    });

    const res = await axios.get(`/task-history/filter?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("🔍 Filtered data:", res.data);
    setTaskHistory(res.data);
  } catch (err) {
    console.error("❌ Error filtering completed task history", err);
  }
};


  const handleViewTask = (id) => {
    navigate(`/view-task-history/${id}`);
  };

  return (
    <>
      <AppNavbar />
      <div className="tasklist-container">
        <Sidebar />
        <div className="tasklist-content">
          <h4 className="mb-4">Task History</h4>

          <Container fluid className="filter-form mb-4">
            <Row className="g-3">
              <Col md={2}>
                <Form.Label>Project ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. PROJ001"
                  value={filters.projectId}
                  onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. IT"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter task name"
                  value={filters.taskName}
                  onChange={(e) => setFilters({ ...filters, taskName: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                />
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button variant="dark" onClick={handleView} className="w-100">
                  View
                </Button>
              </Col>
            </Row>
          </Container>

          <Container fluid>
            <Table striped bordered responsive>
              <thead className="table-light">
                <tr>
                  <th>S.No</th>
                  <th>Project ID</th>
                  <th>Department</th>
                  <th>Task Name</th>
                  <th>Created</th>
                  <th>Closed</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {taskHistory.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-danger">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  taskHistory.map((task, index) => (
                    <tr key={task.ID}>
                      <td>{index + 1}</td>
                      <td>{task.ProjectID}</td>
                      <td>{task.DepartmentName}</td>
                      <td>{task.Title}</td>
                      <td>{new Date(task.CreatedAt).toLocaleDateString()}</td>
                      <td>{new Date(task.EndDate).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleViewTask(task.ID)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TaskHistoryList;
