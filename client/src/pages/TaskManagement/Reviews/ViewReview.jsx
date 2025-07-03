// 📁 client/src/pages/TaskManagement/Reviews/ViewReview.jsx

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Image, Button, Form, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AppNavbar from '../../../components/Navbar.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import { FaStickyNote, FaPaperclip, FaUsers } from 'react-icons/fa';
import '../../../styles/pages-css/TaskManagement/Reviews/ViewReview.css';
import axios from '../../../api/axiosConfig.jsx';
import { jwtDecode } from 'jwt-decode';

const ViewReview = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchTaskAndParticipants = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const taskRes = await axios.get(`/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedTask = taskRes.data;
        setTask(fetchedTask);
        const userIds = fetchedTask.AssignedUsers?.map(u => u.UserID);
        if (Array.isArray(userIds) && userIds.length > 0) {
          const usersRes = await axios.post(
  '/users/bulk',
  { userIds },
  { headers: { Authorization: `Bearer ${token}` } }
);


          setParticipants(usersRes.data);
        }

      } catch (err) {
        console.error('Error fetching task or participants:', err);
      }
    };

    fetchTaskAndParticipants();
  }, [id]);

  if (!task) return <div>Loading...</div>;

  return (
    <>
      <AppNavbar />
      <div className="tasklist-container">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="tasklist-background">
          <Container>
            <h2 className="tasklist-title">Task Review</h2>

            <Card className="mb-3">
              <Card.Body>
                <h5><strong>Task:</strong> {task.Title}</h5>
              </Card.Body>
            </Card>

            <Row>
              {/* Left Panel */}
              <Col md={7}>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <Image src="/assets/images/user-placeholder.png" width={80} height={80} roundedCircle className="me-3" />
                      <div>
                        <h5 className="mb-1">Site Admin</h5>
                        <small className="text-muted">Task Owner</small>
                      </div>
                    </div>

                    <Row className="mb-2">
                      <Col><strong>Start Date:</strong> {new Date(task.CreatedAt).toLocaleDateString()}</Col>
                      <Col><strong>End Date:</strong> {new Date(task.EndDate).toLocaleDateString()}</Col>
                    </Row>
                    <Row className="mb-2">
                      <Col><strong>Recursive:</strong> {task.recurrenceSummary || '—'}</Col>
                    </Row>
                    <Row className="mb-2">
                      <Col><strong>Review Count:</strong> 2</Col>
                      <Col><strong>Current Review:</strong> 2nd</Col>
                    </Row>
                    <Row className="mb-2">
                      <Col><strong>Next Review On:</strong> 2025-07-03</Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Review Notes */}
                <Card className="mb-3">
                  <Card.Header style={{ backgroundColor: '#8f70c54c', color: '#2c3e50' }}>
                    <FaStickyNote className="me-2" />
                    Review Notes
                  </Card.Header>
                  <Card.Body>
                    <Form.Group controlId="reviewNotes">
                      <Form.Control as="textarea" rows={4} placeholder="Enter your review notes..." />
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Attachments */}
                <Card>
                  <Card.Header style={{ backgroundColor: '#8f70c54c', color: '#2c3e50' }}>
                    <FaPaperclip className="me-2" />
                    Attachments
                  </Card.Header>
                  <Card.Body>
                    <Form className="mb-3">
                      <Row className="align-items-center">
                        <Col md={4} className="mb-2">
                          <Form.Control type="text" placeholder="Attachment Title" />
                        </Col>
                        <Col md={5} className="mb-2">
                          <Form.Control type="file" />
                        </Col>
                        <Col md={2} className="mb-2">
                          <Button variant="success" className="w-80">Add</Button>
                        </Col>
                      </Row>
                    </Form>

                    <Table bordered hover size="sm">
                      <thead className="table-primary">
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Attachment</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Report.pdf</td>
                          <td><Button size="sm" variant="outline-primary">Download</Button></td>
                          <td><Button size="sm" variant="danger">Remove</Button></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              {/* Right Panel – Participants */}
              <Col md={5}>
                <Card>
                  <Card.Header style={{ backgroundColor: '#f4e6a3', color: '#2c3e50' }}>
                    <FaUsers className="me-2" />
                    Participants
                  </Card.Header>
                  <Card.Body style={{ backgroundColor: 'rgb(240, 244, 248)' }}>
                    {participants.length > 0 ? (
                      participants.map((user, idx) => (
                        <Card key={user.id} className="mb-3">
                          <Card.Body>
                            <h6>{user.name}</h6>
                            <small>{new Date().toLocaleDateString()}</small>
                            <p><strong>Notes:</strong> —</p>
                            <p><strong>Attachment:</strong> —</p>
                            <Button size="sm" variant="outline-primary">Download</Button>
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <p>No participants found.</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewReview;
