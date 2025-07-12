import React, { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import AppNavbar from '../../../components/Navbar.jsx';
import Footer from '../../../components/Footer.jsx';
import axios from 'axios';
import '../../../styles/pages-css/TaskManagement/Reviews/ReviewList.css';

const ReviewList = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchCreatedTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/reviews/own-created-tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(res.data);
      } catch (error) {
        console.error('Failed to fetch tasks created by you:', error);
      }
    };

    fetchCreatedTasks();
  }, []);

  const calculateOverdueDays = (dateStr) => {
    if (!dateStr) return 0;
    const assignedDate = new Date(dateStr);
    const today = new Date();
    assignedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today - assignedDate;
    return Math.max(Math.floor(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="reviewlist-container">
        <Sidebar />
        <div className="reviewlist-background">
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="reviewlist-title">Task Review</h2>
            </div>

            <Table striped bordered hover className="reviewlist-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Priority</th>
                  <th>Department</th>
                  <th>Task</th>
                  <th>Due Date</th>
                  <th>Assigned Since</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? (
                  reviews.map((task, index) => (
                    <tr key={task.ID}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="text-center">
                          <Button
                            size="sm"
                            variant={getPriorityVariant(task.Priority)}
                            title={`Priority: ${task.Priority}`}
                          >
                            {task.Priority}
                          </Button>
                        </div>
                      </td>
                      <td>{task.Department || '—'}</td>
                      <td>{task.Title || '—'}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled
                          title="Due Date"
                          style={{
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {task.DueDate
                            ? new Date(task.DueDate).toLocaleDateString('en-IN')
                            : '—'}
                        </Button>
                      </td>
                      <td>
                        <div className="text-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            title="Days since created"
                          >
                            {calculateOverdueDays(task.CreatedAt)} days
                          </Button>
                        </div>
                      </td>
                      <td>
                        <div className="text-center">
                          <Button
                            variant="info"
                            size="sm"
                            title="Review task"
                            onClick={() => navigate(`/view-review/${task.ID}`)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No reviews found.
                    </td>
                  </tr>
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

export default ReviewList;
