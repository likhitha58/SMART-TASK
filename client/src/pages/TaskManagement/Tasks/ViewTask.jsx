// 📁 src/pages/ViewTask.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../../../api/axiosConfig'; // ✅ uses baseURL = 'http://localhost:5000/api'
import AppNavbar from '../../../components/Navbar.jsx';
import Footer from '../../../components/Footer.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import { Form, Button, Container, Row, Col, Table, Image } from 'react-bootstrap';
import '../../../styles/pages-css/TaskManagement/Tasks/ViewTask.css';
import { MdOutlineTaskAlt, MdNotes } from 'react-icons/md';
import { FaUpload, FaTrashAlt } from 'react-icons/fa';
import { HiPaperClip } from 'react-icons/hi';
import creatorPhoto from '../../../assets/images/profileimage.jpg';

const ViewTask = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [isAssignee, setIsAssignee] = useState(false);
    const [formData, setFormData] = useState({ Title: '', Department: '', DueDate: '', Notes: '', Priority: '' });
    const [noteText, setNoteText] = useState('');
    const [newAttachments, setNewAttachments] = useState([]);
    const [attachmentTitles, setAttachmentTitles] = useState([]);
    const [assigneeNoteText, setAssigneeNoteText] = useState('');
    const [useFallbackImage, setUseFallbackImage] = useState(false);


    const navigate = useNavigate();

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get(`/tasks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data;

                // ✅ Debug logging
                console.log("✅ Creator photo from backend:", data.creatorPhoto);
                console.log("🌐 VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
                console.log("🧪 Full image URL:", `${import.meta.env.VITE_API_BASE_URL}${data.creatorPhoto}`);

                setTask(data);
                setFormData({
                    Title: data.Title || '',
                    Department: data.Department || '',
                    DueDate: data.DueDate?.split('T')[0] || '',
                    Notes: data.Notes || '',
                    Priority: data.Priority || '',
                });
                setNoteText(data.Notes || '');
                setIsCreator(data.isCreator);
                setIsAssignee(data.isAssignee);
            } catch (err) {
                console.error('❌ Error fetching task:', err);
            }
        };

        fetchTask();
    }, [id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNoteChange = (e) => {
        setNoteText(e.target.value);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();

            // Core fields
            formDataToSend.append('title', formData.Title);
            formDataToSend.append('department', formData.Department);
            formDataToSend.append('dueDate', formData.DueDate);
            formDataToSend.append('priority', formData.Priority);
            formDataToSend.append('notes', noteText); // ✅ Always send notes field (will be handled differently in backend)



            // Add missing fields with fallback or empty strings (to prevent NULL overwrite)
            formDataToSend.append('subject', task.Subject || '');
            formDataToSend.append('projectId', task.ProjectID || '');
            formDataToSend.append('location', task.Location || '');
            if (task.EndDate) {
                formDataToSend.append('endDate', task.EndDate.split('T')[0]);
            }

            formDataToSend.append('recurrence', task.Recurrence || '');
            formDataToSend.append('weeklyInterval', task.WeeklyInterval || '');
            formDataToSend.append('reminder', task.Reminder || '');
            formDataToSend.append('newTaskOption', task.NewTaskOption || '');
            formDataToSend.append('weeklyDays', JSON.stringify(task.WeeklyDays || []));
            formDataToSend.append('recurrenceSummary', task.RecurrenceSummary || '');
            formDataToSend.append('assignedUsers', JSON.stringify(task.AssignedUsers?.map((u) => Number(u.UserID)) || []));


            // Attachments
            newAttachments.forEach((file, index) => {
                if (file) {
                    formDataToSend.append('attachments', file);
                    formDataToSend.append('attachmentTitles', attachmentTitles[index] || file.name);
                }
            });
// console.log('Sending data to update:', updatedTaskData);

            await axios.put(`/tasks/${id}`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedTask = await axios.get(`/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = updatedTask.data;
            setTask(data);
            setFormData({
                Title: data.Title || '',
                Department: data.Department || '',
                DueDate: data.DueDate?.split('T')[0] || '',
                Notes: data.Notes || '',
                Priority: data.Priority || '',
            });
            setNoteText(data.Notes || '');
            setNewAttachments([]);
            setAttachmentTitles([]);

            toast.success('Task updated successfully!');
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
        }
    };


    const handleAttachmentTitleChange = (index, value) => {
        const titles = [...attachmentTitles];
        titles[index] = value;
        setAttachmentTitles(titles);
    };

    const handleFileChange = (index, file) => {
        const files = [...newAttachments];
        files[index] = file;
        setNewAttachments(files);
    };


    if (!task) return <div>Loading...</div>;
    // ✅ Generate correct image URL safely
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
    const photoPath = task?.creatorPhoto?.replace(/^\/+/, ''); // assume just filename like "12345.jpg"
    const fullImageUrl = `${baseUrl}/uploads/${photoPath}?t=${Date.now()}`;



    return (
        <>
            <AppNavbar />
            <div className="addtask-container">
                {/* <div className="sidebar"> */}
                    <Sidebar />
                {/* </div> */}
                <div className="form-wrapper">
                    <h2 className="mb-4">View Task</h2>
                    <Container className="addtask-content">
                        <div className="mb-4 p-4 rounded" style={{ backgroundColor: '#f0f4f8' }}>
                            <h4 className="task-details-title mb-4">
                                <MdOutlineTaskAlt style={{ marginRight: '8px' }} /> Task Details
                            </h4>
                            <Row>
                                <Col md={4} className="text-center task-left">
                                    <Image
                                        src={!useFallbackImage && task?.creatorPhoto ? fullImageUrl : creatorPhoto}
                                        alt="Creator"
                                        roundedCircle
                                        className="mb-3"
                                        style={{ height: 250, width: 250, objectFit: 'cover' }}
                                        onError={(e) => {
                                            console.warn("🛑 Failed to load image:", e.target.src);
                                            setUseFallbackImage(true);
                                        }}
                                    />


                                    <h5 style={{ fontSize: 30 }}>{task.CreatorName || 'Task Creator'}</h5>
                                    <small className="text-muted">Designed Task</small>

                                </Col>

                                <Col md={8} className="task-right">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Task Title:</Form.Label>
                                        <Form.Control name="Title" value={formData.Title} onChange={handleChange} readOnly={!isCreator} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Department:</Form.Label>
                                        <Form.Control name="Department" value={formData.Department} onChange={handleChange} readOnly={!isCreator} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Due Date:</Form.Label>
                                        <Form.Control name="DueDate" type="date" value={formData.DueDate} onChange={handleChange} readOnly={!isCreator} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Task Notes:</Form.Label>
                                        <Form.Control as="textarea" rows={4} value={noteText} onChange={handleNoteChange} readOnly={!isCreator} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Priority:</Form.Label>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>{formData.Priority}</span>
                                            <div>
                                                {['Low', 'Medium', 'High'].map((level) => (
                                                    <Button
                                                        key={level}
                                                        variant={
                                                            level === 'Low' ? 'outline-success' :
                                                                level === 'Medium' ? 'outline-warning' :
                                                                    'outline-danger'
                                                        }
                                                        size="sm"
                                                        className="me-2"
                                                        active={formData.Priority === level}
                                                        disabled={!isCreator}
                                                        onClick={() => setFormData((prev) => ({ ...prev, Priority: level }))}
                                                    >
                                                        {level}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </Form.Group>
                                    <div>
                                        <HiPaperClip style={{ marginRight: '8px' }} /> <strong>Attachments:</strong>
                                        <Table striped bordered hover responsive size="sm" className="mt-2">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>File</th>
                                                    <th>Download</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {task.attachments?.map((att, index) => (
                                                    <tr key={index}>
                                                        <td>{att.Title}</td>
                                                        <td>{att.FileName}</td>
                                                        <td>
                                                            <a href={`/uploads/${att.FileName}`} download className="btn btn-sm btn-primary">Download</a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Container>

                    {(isCreator || isAssignee) && (
                        <Container className="attachments-notes-container">
                            <h4 className="attachments-notes-title">
                                <HiPaperClip style={{ marginRight: '8px' }} /> Attachments and Notes
                            </h4>
                            {newAttachments.map((_, index) => (
                                <Row key={index} className="align-items-end mb-2">
                                    <Col md={5}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Attachment title"
                                            value={attachmentTitles[index] || ''}
                                            onChange={(e) => handleAttachmentTitleChange(index, e.target.value)}
                                        />
                                    </Col>
                                    <Col md={5}>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => handleFileChange(index, e.target.files[0])}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            variant="danger"
                                            className="mt-2"
                                            onClick={() => {
                                                const newAtts = [...newAttachments];
                                                const newTitles = [...attachmentTitles];
                                                newAtts.splice(index, 1);
                                                newTitles.splice(index, 1);
                                                setNewAttachments(newAtts);
                                                setAttachmentTitles(newTitles);
                                            }}
                                        >
                                            <FaTrashAlt className="me-2" /> Remove
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button
                                variant="secondary"
                                className="mb-3"
                                onClick={() => {
                                    setNewAttachments([...newAttachments, null]);
                                    setAttachmentTitles([...attachmentTitles, '']);
                                }}
                            >
                                <FaUpload className="me-2" /> Add Attachment
                            </Button>

                            <Table striped bordered hover responsive className="attachments-table mb-4">
                                <thead><tr><th>Attachment Title</th><th>Attachment</th><th>Remove</th></tr></thead>
                                <tbody>{/* Add uploaded attachments dynamically if needed */}</tbody>
                            </Table>
                            <div>
                                <label><strong><MdNotes style={{ marginRight: '6px' }} /> Notes:</strong></label>
                                <textarea className="form-control" rows={4} value={noteText} onChange={handleNoteChange} disabled={!isCreator && !isAssignee} />
                            </div>
                        </Container>
                    )}

                    <Row className="mt-4 justify-content-between">
                        <Col xs="auto">
                            {(isCreator || isAssignee) && (
                                <Button variant="primary" onClick={handleSave} size="lg">Save Edited Task</Button>
                            )}
                        </Col>
                        <Col xs="auto">
                            <Button variant="secondary" onClick={() => navigate('/tasks')} size="lg">Back to List</Button>
                        </Col>
                    </Row>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ViewTask;
