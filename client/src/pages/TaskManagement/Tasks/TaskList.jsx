// 📁 client/src/pages/TaskManagement/Tasks/TaskList.jsx

import React, { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosConfig.jsx';
import AppNavbar from '../../../components/Navbar.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import '../../../styles/pages-css/TaskManagement/Tasks/TaskList.css';
import { jwtDecode } from 'jwt-decode';

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Decode token and set user ID
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }

    // Fetch tasks
   const fetchTasks = async () => {
  try {
    const token = localStorage.getItem("token"); // Make sure token is stored during login

    const response = await axios.get('/tasks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('📦 Fetched tasks :', response.data);

    const filteredTasks = Array.isArray(response.data)
      ? response.data.filter(task => Number(task.Status) === 0)
      : [];

    setTasks(filteredTasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    setTasks([]);
  }
};


    fetchTasks();
  }, []);

  const calculateOverdueDays = (dueDateStr) => {
    if (!dueDateStr) return 0;

    const dueDate = new Date(dueDateStr);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - dueDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <>
      <AppNavbar />
      <div className="tasklist-container">
        <div className="sidebar">
          <Sidebar />
        </div>

        <div className="tasklist-background">
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="tasklist-title">Task List</h2>
              <Button
                variant="primary"
                size="lg"
                className="add-task-btn"
                onClick={() => navigate('/add-task')}
              >
                + Add Task
              </Button>
            </div>

            <Table striped bordered hover className="tasklist-table">
              <thead className="table-header">
                <tr>
                  <th>S.No</th>
                  <th>Priority</th>
                  <th>Department</th>
                  <th>Task</th>
                  <th>Start Date</th>
                  <th>Assigned Since</th>
                  <th>Status</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task.ID}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                          size="sm"
                          variant={
                            task.Priority === 'High'
                              ? 'danger'
                              : task.Priority === 'Medium'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {task.Priority}
                        </Button>
                      </div>
                    </td>
                    <td>{task.Department || '—'}</td>
                    <td>{task.Title}</td>
                    <td>
                      {task.DueDate ? (
                        <Button variant="primary" size="sm">
                          {new Date(task.DueDate).toLocaleDateString()}
                        </Button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant="danger" size="sm" disabled>
                          {calculateOverdueDays(task.DueDate)} days
                        </Button>
                      </div>
                    </td>
                    <td>
                      <Button variant="secondary" size="sm" disabled>
                        Pending
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => navigate(`/view-task/${task.ID}`)}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant={Number(task.AssignedById) === Number(currentUserId) ? 'warning' : 'secondary'}
                        size="sm"
                        onClick={() => navigate(`/edit-task/${task.ID}`)}
                        disabled={Number(task.AssignedById) !== Number(currentUserId)}
                        title={
                          Number(task.AssignedById) !== Number(currentUserId)
                            ? 'You are not authorized to edit this task'
                            : ''
                        }
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TaskList;
