import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Table } from 'react-bootstrap';
import AppNavbar from '../../../components/Navbar.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import defaultImage from '../../../assets/images/profileimage.jpg';
import axios from '../../../api/axiosConfig.jsx';
import { useParams } from 'react-router-dom';
import { FaUserCircle, FaPaperclip } from 'react-icons/fa';
import '../../../styles/pages-css/TaskManagement/TaskHistory/ViewTaskHistory.css';

const ViewTaskHistory = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [historyByDate, setHistoryByDate] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`/task-history/view/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Full Task Response:", res.data.task);
        setTask(res.data.task);
        setHistoryByDate(res.data.history); // [{ date, users: [{ name, photo, notes, attachments }] }]
      } catch (err) {
        console.error('❌ Failed to fetch task history:', err);
      }
    };

    fetchData();
  }, [id]);

  return (
    <>
      <AppNavbar />
      <div className="taskhistory-container">
        <Sidebar />

        <div className="taskhistory-content">
          <Container>
            <h3 className="task-title">Task History</h3>

            {task && (
              <Container className="mb-4 p-3 bg-light rounded task-creator-details-container">
                <Card className="task-header-card">
                  <Card.Body className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="d-flex align-items-center mb-2 mb-md-0">
                      <img
                        src={
                          task.CreatorPhoto
                            ? `${API_BASE_URL}/uploads/${task.CreatorPhoto}`
                            : defaultImage
                        }
                        alt="owner"
                        className="rounded-circle me-3"
                        width={60}
                        height={60}
                      />

                      <div>
                        <h5 className="mb-1">Owner: {task.CreatorName}</h5>
                        <p className="mb-0 text-muted">
                          Created On: {new Date(task.CreatedAt).toLocaleDateString()} <br />
                          Closed On: {new Date(task.EndDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-end">
                      <p className="mb-1"><strong>Task:</strong> {task.Title}</p>
                      <p className="mb-0"><strong>Status:</strong> {task.Status === 1 ? 'Completed' : 'In Progress'}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Container>
            )}
            <Tabs defaultActiveKey="participants" className="mb-3">
              <Tab eventKey="reviews" title="Reviews">
                {task ? (
                  <Card className="mb-4">
                    <Card.Header><strong>Review ID:</strong> {task.ID}</Card.Header>
                    <Card.Body>
                      <h6><strong>Review Notes from Task Creator:</strong></h6>
                      <div className="p-3 bg-light rounded border">
                        {task.TaskReviewNotes ? task.TaskReviewNotes : <span className="text-muted">No review notes available.</span>}
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <p className="text-muted">Loading review details...</p>
                )}
              </Tab>

              <Tab eventKey="participants" title="Participants">
                {task ? (
                  <div className="mb-4">
                    <h5 className="mb-3">Creator</h5>
                    <Row className="g-4 mb-5">
                      <Col md={6}>
                        <Card className="participant-card">
                          <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                              <img
                                src={task.CreatorPhoto ? `${API_BASE_URL}/uploads/${task.CreatorPhoto}` : defaultImage}
                                alt={task.CreatorName}
                                className="rounded-circle me-2"
                                width={40}
                                height={40}
                              />
                              <h6 className="mb-0">{task.CreatorName}</h6>
                            </div>

                            <div className="mb-2">
                              <strong>📝 Notes:</strong>
                              <div className="participant-notes-box">
                                {task.CreatorNotes || '—'}
                              </div>
                            </div>

                            <div>
                              <strong><FaPaperclip className="me-1" />Attachments:</strong>
                              <Table striped bordered size="sm" className="mt-2">
                                <thead>
                                  <tr>
                                    <th>Title</th>
                                    <th>Attachment</th>
                                    <th>Download</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(task.attachments?.length || 0) > 0 ? (
                                    task.attachments.map((att, i) => (
                                      <tr key={i}>
                                        <td>{att.Title}</td>
                                        <td>{att.FileName}</td>
                                        <td>
                                          <a
                                            href={`${API_BASE_URL}/uploads/${att.FileName}`}
                                            download
                                            className="btn btn-sm btn-outline-primary"
                                          >
                                            Download
                                          </a>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="3" className="text-center text-muted">No attachments</td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <h5 className="mb-3">Participants</h5>
                    <Row className="g-4">
                      {(task.assignedUsers || []).map((user, idx) => (
                        <Col md={6} key={idx}>
                          <Card className="participant-card">
                            <Card.Body>
                              <div className="d-flex align-items-center mb-2">
                                <img
                                  src={user.photo ? `${API_BASE_URL}/uploads/${user.photo}` : defaultImage}
                                  alt={user.name}
                                  className="rounded-circle me-2"
                                  width={40}
                                  height={40}
                                />
                                <h6 className="mb-0">{user.name}</h6>
                              </div>

                              <div className="mb-2">
                                <strong>📝 Notes:</strong>
                                <div className="participant-notes-box">
                                  {user.notes || '—'}
                                </div>
                              </div>

                              <div>
                                <strong><FaPaperclip className="me-1" />Attachments:</strong>
                                <Table striped bordered size="sm" className="mt-2">
                                  <thead>
                                    <tr>
                                      <th>Title</th>
                                      <th>Attachment</th>
                                      <th>Download</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(user.attachments?.length || 0) > 0 ? (
                                      user.attachments.map((att, i) => (
                                        <tr key={i}>
                                          <td>{att.Title}</td>
                                          <td>{att.FileName}</td>
                                          <td>
                                            <a
                                              href={`${API_BASE_URL}/uploads/${att.FileName}`}
                                              download
                                              className="btn btn-sm btn-outline-primary"
                                            >
                                              Download
                                            </a>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan="3" className="text-center text-muted">No attachments</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </Table>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ) : (
                  <p className="text-muted">Loading participant details...</p>
                )}
              </Tab>

            </Tabs>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewTaskHistory;
