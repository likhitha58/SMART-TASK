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
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get('/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('📦 Fetched tasks:', response.data);

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
    return Math.max(Math.floor(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  return (
    <>
      <AppNavbar />
      <div className="tasklist-container">
        <Sidebar />

        <div className="tasklist-background">
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="tasklist-title">Task List</h2>
              <div className="d-flex justify-content-end mb-4">
                <Button
                  variant="primary"
                  size="sm"
                  className="add-task-btn"
                  onClick={() => navigate('/add-task')}
                  title="Create a new task"
                >
                  + Add Task
                </Button>
              </div>
            </div>

            <Table striped bordered hover className="tasklist-table">
              <thead className="table-header">
                <tr>
                  <th>S.No</th>
                  <th>Priority</th>
                  <th>Department</th>
                  <th>Task</th>
                  <th>Start Date</th>
                  <th>Assigned since</th>
                  <th>Status</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => {
                    const isOwner = Number(task.AssignedById) === Number(currentUserId);
                    const overdue = calculateOverdueDays(task.DueDate);
                    const dueDateFormatted = task.DueDate
                      ? new Date(task.DueDate).toLocaleDateString('en-IN')
                      : '—';

                    return (
                      <tr key={task.ID}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="text-center">
                            <Button
                              size="sm"
                              variant={
                                task.Priority === 'High'
                                  ? 'danger'
                                  : task.Priority === 'Medium'
                                    ? 'warning'
                                    : 'success'
                              }
                              title={`Priority: ${task.Priority}`}
                            >
                              {task.Priority}
                            </Button>
                          </div>
                        </td>
                        <td>{task.Department || '—'}</td>
                        <td>{task.Title || '—'}</td>
                        <td>
                          <Button variant="primary" size="sm" disabled title="Due Date" style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {dueDateFormatted}
                          </Button>
                        </td>
                        <td>
                          <div className="text-center">
                            <Button
                              variant={overdue > 0 ? 'danger' : 'success'}
                              size="sm"
                              disabled
                              title="Days overdue"
                            >
                              {overdue} {overdue === 1 ? 'day' : 'days'}
                            </Button>
                          </div>
                        </td>
                        <td>
                          <Button variant="secondary" size="sm" disabled title="Status">
                            Pending
                          </Button>
                        </td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => navigate(`/view-task/${task.ID}`)}
                            title="View task"
                          >
                            View
                          </Button>
                        </td>
                        <td>
                          <Button
                            variant={isOwner ? 'warning' : 'secondary'}
                            size="sm"
                            onClick={() => navigate(`/edit-task/${task.ID}`)}
                            disabled={!isOwner}
                            title={
                              isOwner
                                ? 'Edit task (you created this)'
                                : 'You are not authorized to edit this task'
                            }
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No pending tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Container>
        </div >
      </div >
      <Footer />
    </>
  );
};

export default TaskList;
