import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Form, Table
} from 'react-bootstrap';
import Sidebar from '../../../components/Sidebar.jsx';
import AppNavbar from '../../../components/Navbar.jsx';
import Footer from '../../../components/Footer.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStickyNote, FaPaperclip, FaUsers, FaHourglassHalf } from 'react-icons/fa';
import defaultImage from '../../../assets/images/profileimage.jpg';
import '../../../styles/pages-css/TaskManagement/Reviews/ViewReview.css';
import axios from 'axios';

const ViewReview = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [task, setTask] = useState(null);
    const [creatorImage, setCreatorImage] = useState(defaultImage);
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewStatus, setReviewStatus] = useState('');
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [attachmentTitles, setAttachmentTitles] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);


    // Fetch task & attachments
    useEffect(() => {
        const fetchReviewData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${API_BASE_URL}/api/reviews/${id}/review-data`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setTask(res.data.task);
                setReviewNotes(res.data.task?.Notes || '');
                setParticipants(res.data.participants || []);
                setExistingAttachments(res.data.attachments || []);
                if (res.data.task?.CreatorPhoto) {
                    setCreatorImage(res.data.task.CreatorPhoto); // 👈 Already full URL, no need to prepend API_BASE_URL
                }

            } catch (err) {
                console.error('❌ Failed to fetch review data:', err);
                alert('Failed to load review data.');
            }
        };
        fetchReviewData();
    }, [id]);

    const handleAddAttachmentField = () => {
        setAttachmentFiles([...attachmentFiles, null]);
        setAttachmentTitles([...attachmentTitles, '']);
    };

    const handleAttachmentChange = (index, type, value) => {
        const updated = [...(type === 'file' ? attachmentFiles : attachmentTitles)];
        updated[index] = value;
        type === 'file' ? setAttachmentFiles(updated) : setAttachmentTitles(updated);
    };

    const handleRemoveAttachment = (index) => {
        const files = [...attachmentFiles];
        const titles = [...attachmentTitles];
        files.splice(index, 1);
        titles.splice(index, 1);
        setAttachmentFiles(files);
        setAttachmentTitles(titles);
    };

    const handleSaveReview = async () => {
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login again.');

        try {
            // 1️⃣ Upload attachments
            const formData = new FormData();
            for (let i = 0; i < attachmentFiles.length; i++) {
                if (attachmentFiles[i] && attachmentTitles[i]) {
                    formData.append('attachments', attachmentFiles[i]);
                    formData.append('attachmentTitles', attachmentTitles[i]);
                }
            }
            formData.append('taskId', id);

            if (formData.has('attachments')) {
                const result = await axios.post(`${API_BASE_URL}/api/reviews/attachments/upload`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                setExistingAttachments(prev => [
                    ...prev,
                    ...(result.data.attachments || [])
                ]);

            }

            // 2️⃣ Save review notes/status
            await axios.put(`${API_BASE_URL}/api/reviews/${id}/review-status`, {
                notes: reviewNotes,
                status: parseInt(reviewStatus),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Review saved successfully.');
            navigate('/review-list');
        } catch (error) {
            console.error('❌ Review Save Error:', error);
            alert('Something went wrong.');
        }
    };

    return (
        <>
            <AppNavbar />
            <div className="viewreview-container">
                <Sidebar />
                <div className="viewreview-background">
                    <Container>
                        <h2 className="mb-4">Task Review</h2>
                        <Row>
                            <Col md={8}>
                                <Card className="mb-3">
                                    <Card.Body>
                                        <h5><strong>Task:</strong> {task?.Title}</h5>
                                        <div className="d-flex align-items-center mt-3 mb-3">
                                            <img src={creatorImage} alt="creator" width={80} height={80} className="rounded-circle me-3" />
                                            <div>
                                                <h6>{task?.CreatorName}</h6>
                                                <small className="text-muted">Task Owner</small>
                                            </div>
                                        </div>
                                        <Row>
                                            <Col><strong>Start:</strong> {new Date(task?.DueDate).toLocaleDateString()}</Col>
                                            <Col><strong>End:</strong> {new Date(task?.EndDate).toLocaleDateString()}</Col>
                                        </Row>
                                        <Row className="mt-2">
                                            <Col><strong>Status:</strong> {task?.Status === 1 ? 'Completed' : 'Pending'}</Col>
                                            <Col><strong>Recurrence:</strong> {task?.RecurrenceSummary || 'None'}</Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-3">
                                    <Card.Header style={{ backgroundColor: '#8f70c54c' }}>
                                        <FaStickyNote className="me-2" /> Review Notes
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                        />
                                    </Card.Body>
                                </Card>

                                <Card className="mb-4">
                                    <Card.Header style={{ backgroundColor: '#8f70c54c' }}>
                                        <FaPaperclip className="me-2" /> <strong>Attachments</strong>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form className="mb-3">
                                            {attachmentFiles.map((file, idx) => (
                                                <Row key={idx} className="align-items-center mb-2">
                                                    <Col md={4}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Attachment Title"
                                                            value={attachmentTitles[idx] || ''}
                                                            onChange={(e) => handleAttachmentChange(idx, 'title', e.target.value)}
                                                        />
                                                    </Col>
                                                    <Col md={5}>
                                                        <Form.Control
                                                            type="file"
                                                            onChange={(e) => handleAttachmentChange(idx, 'file', e.target.files[0])}
                                                        />
                                                    </Col>
                                                    <Col md={2}>
                                                        <Button variant="danger" size="sm" onClick={() => handleRemoveAttachment(idx)}>
                                                            Remove
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            ))}
                                            <Button variant="success" size="sm" className="mt-2" onClick={handleAddAttachmentField}>
                                                + Add
                                            </Button>
                                        </Form>

                                        <Table bordered hover size="sm" className="mt-3">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>S.No</th>
                                                    <th>Title</th>
                                                    <th>File</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {existingAttachments.map((att, index) => (
                                                    <tr key={`existing-${index}`}>
                                                        <td>{index + 1}</td>
                                                        <td>{att.Title}</td>
                                                        <td>
                                                            <a href={`${API_BASE_URL}/uploads/${att.FileName}`} target="_blank" rel="noopener noreferrer">
                                                                {att.FileName}
                                                            </a>
                                                        </td>
                                                        <td>—</td> {/* No remove button for already uploaded ones */}
                                                    </tr>
                                                ))}
                                                {attachmentFiles.map((file, index) => (
                                                    <tr key={`new-${index}`}>
                                                        <td>{existingAttachments.length + index + 1}</td>
                                                        <td>{attachmentTitles[index] || 'Untitled'}</td>
                                                        <td>{file?.name || 'No file chosen'}</td>
                                                        <td>
                                                            <Button size="sm" variant="outline-danger" onClick={() => handleRemoveAttachment(index)}>
                                                                Remove
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                        </Table>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-3">
                                    <Card.Header style={{ backgroundColor: '#8f70c54c' }}>
                                        <FaHourglassHalf className="me-2" /> Task Status
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Select
                                            value={reviewStatus}
                                            onChange={(e) => setReviewStatus(e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="1">Completed</option>
                                            <option value="3">Review on Next Interval</option>
                                            <option value="4">New Review Date</option>
                                        </Form.Select>
                                        <div className="d-flex justify-content-between mt-3">
                                            <Button variant="success" onClick={handleSaveReview}>Save Review</Button>
                                            <Button variant="secondary" onClick={() => navigate('/review-list')}>Back to List</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card>
                                    <Card.Header style={{ backgroundColor: '#f4e6a3' }}>
                                        <FaUsers className="me-2" /> Participants
                                    </Card.Header>
                                    <Card.Body style={{ backgroundColor: 'rgba(246, 245, 237, 0.54)' }}>
                                        {participants.length > 0 ? (
                                            participants.map((user, idx) => (
                                                <Card key={user.ID} className="mb-3">
                                                    <Card.Body>
                                                        <img
                                                            src={user.Photo ? `${API_BASE_URL}/uploads/${user.Photo}` : defaultImage}
                                                            alt={user.Name}
                                                            className="rounded-circle me-2"
                                                            width="50"
                                                            height="50"
                                                        />
                                                        <h6><strong>{user.Name}</strong></h6>
                                                        <p><strong>Notes:</strong> {user.Notes || '—'}</p>
                                                        <p><strong>Attachments:</strong></p>
                                                        {user.Attachments && user.Attachments.length > 0 ? (
                                                            <ul className="list-unstyled">
                                                                {user.Attachments.map((att, index) => (
                                                                    <li key={index}><FaPaperclip className="me-2 text-muted" />{att.Title}</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p>—</p>
                                                        )}

                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : <p>No participants.</p>}
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
