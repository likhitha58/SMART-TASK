import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosConfig.jsx';
import AppNavbar from '../../../components/Navbar.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import '../../../styles/pages-css/TaskManagement/Reviews/ReviewList.css';
import { jwtDecode } from 'jwt-decode';

const ReviewList = () => {
  const navigate = useNavigate();
  const [reviewTasks, setReviewTasks] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // { userId: { name, email, ... } }

  useEffect(() => {
    const fetchReviewTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const response = await axios.get('/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const tasks = Array.isArray(response.data) ? response.data : [];

        const filtered = tasks.filter(
          (task) => Number(task.Status) === 0 && Number(task.AssignedById) === Number(userId)
        );

        setReviewTasks(filtered);

        // Get all assigned user IDs from these tasks
        const allUserIds = new Set();
        filtered.forEach((task) => {
          if (Array.isArray(task.AssignedTo)) {
            task.AssignedTo.forEach((id) => allUserIds.add(id));
          }
        });

        // Fetch user details in bulk (recommended)
        if (allUserIds.size > 0) {
          const userDetailsRes = await axios.post(
            '/api/users/bulk',
            { userIds: Array.from(allUserIds) },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const map = {};
          userDetailsRes.data.forEach((user) => {
            map[user.id] = user;
          });

          setUsersMap(map);
        }
      } catch (err) {
        console.error('Error fetching review tasks or users:', err);
      }
    };

    fetchReviewTasks();
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
              <h2 className="tasklist-title">Review List</h2>
            </div>

            <Table striped bordered hover className="tasklist-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Priority</th>
                  <th>Department</th>
                  <th>Task</th>
                  <th>Due Date</th>
                  <th>Overdue Days</th>
                  
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {reviewTasks.map((task, index) => (
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
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => navigate(`/view-review/${task.ID}`)}
                      >
                        View
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

export default ReviewList;
