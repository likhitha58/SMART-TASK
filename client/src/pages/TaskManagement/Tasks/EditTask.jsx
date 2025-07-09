import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Spinner, Toast } from 'react-bootstrap';
import { MdOutlineTaskAlt } from 'react-icons/md';
import { HiPaperClip } from 'react-icons/hi';
import { FaUsers, FaPlusCircle, FaStickyNote } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'react-datepicker/dist/react-datepicker.css';
import AppNavbar from '../../../components/Navbar.jsx';
import Footer from '../../../components/Footer';
import Sidebar from '../../../components/Sidebar';
import axiosInstance from '../../../api/axiosConfig';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    subject: '',
    projectId: '',
    location: '',
    priority: '',
    dueDate: '',
    endDate: '',
    recurrence: '',
    weeklyInterval: 1,
    reminder: '',
    notes: '',
    newTaskOption: 0,
    weeklyDays: [],
    assignedUsers: [],
    attachments: [],
    attachmentTitle: '',
    attachmentFile: null,
    recurrenceSummary: ''
  });

  const [users, setUsers] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projectIds, setProjectIds] = useState([]);
  const [locations, setLocations] = useState([]);
const [showUserOptions, setShowUserOptions] = useState(false);
const [showRecurrenceToast, setShowRecurrenceToast] = useState(false);
const [selectedRecurrence, setSelectedRecurrence] = useState('');


  // ✅ Fetch dropdown data
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [deptRes, projRes, locRes, userRes] = await Promise.all([
          axiosInstance.get('/masters/departments'),
          axiosInstance.get('/masters/project-ids'),
          axiosInstance.get('/masters/locations'),
          axiosInstance.get('/users')
        ]);
        setDepartments(deptRes.data);
        setProjectIds(projRes?.data?.data || []);
        setLocations(locRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error('Error loading dropdowns', err);
      }
    };
    fetchMasters();
  }, []);

  // ✅ Fetch task details by ID
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get(`http://localhost:5000/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const task = res.data;
        setFormData(prev => ({
          ...prev,
          title: task.Title,
          department: task.Department,
          subject: task.Subject,
          projectId: task.ProjectID,
          location: task.Location,
          priority: task.Priority,
          dueDate: task.DueDate?.split('T')[0],
          endDate: task.EndDate?.split('T')[0],
          recurrence: task.Recurrence,
          weeklyInterval: task.WeeklyInterval || 1,
          reminder: task.Reminder,
          notes: task.Notes,
          newTaskOption: task.NewTaskOption || 0,
          weeklyDays: task.WeeklyDays ? task.WeeklyDays.split(',') : [],
          assignedUsers: (task.AssignedUsers || []).map(u => u.UserID),
          recurrenceSummary: task.RecurrenceSummary
        }));

        setExistingAttachments(task.Attachments || []);
      } catch (error) {
        toast.error('Error fetching task');
        console.error(error);
      }
    };
    fetchTask();
  }, [id]);

  // ✅ Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     if (name === 'recurrence') {
    setSelectedRecurrence(value);
    setShowRecurrenceToast(true);
  }
  };

  const handleUserToggle = (userId) => {
    const updated = formData.assignedUsers.includes(userId)
      ? formData.assignedUsers.filter(id => id !== userId)
      : [...formData.assignedUsers, userId];
    setFormData(prev => ({ ...prev, assignedUsers: updated }));
  };
const handleAddAttachment = () => {
  const { attachmentTitle, attachmentFile } = formData;
  if (attachmentTitle && attachmentFile) {
    const newAttachment = {
      title: attachmentTitle,
      file: attachmentFile,
    };
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment],
      attachmentTitle: '',
      attachmentFile: null,
    }));
  } else {
    toast.warning('Please provide both a title and file.');
  }
};
const handlePriorityChange = (priority) => {
  setFormData(prev => ({ ...prev, priority }));
};
const handleAssignUserToggle = (userId) => {
  const isAlreadyAssigned = formData.assignedUsers.includes(userId);
  const updated = isAlreadyAssigned
    ? formData.assignedUsers.filter(id => id !== userId)
    : [...formData.assignedUsers, userId];
  setFormData(prev => ({ ...prev, assignedUsers: updated }));
};
const handleRemoveAttachment = (attachmentId) => {
  setExistingAttachments(prev => prev.filter(att => att.ID !== attachmentId));
};

const handleRemoveLocalAttachment = (index) => {
  const updated = [...formData.attachments];
  updated.splice(index, 1);
  setFormData(prev => ({ ...prev, attachments: updated }));
};
const getRecurrenceMessage = (type) => {
  switch (type) {
    case 'Daily': return 'Task will repeat daily.';
    case 'Random Dates': return 'Occurs on manually chosen random dates.';
    default: return 'Custom recurrence selected.';
  }
};

const getNextRecurrenceDate = (startDate, interval = 1, unit = 'month', mode = 'date') => {
  if (!startDate) return 'N/A';
  const start = new Date(startDate);
  if (unit === 'month') {
    start.setMonth(start.getMonth() + interval);
  } else if (unit === 'year') {
    start.setFullYear(start.getFullYear() + interval);
  }
  return start.toDateString();
};

  const handleFileAttach = () => {
    const { attachmentTitle, attachmentFile } = formData;
    if (attachmentTitle && attachmentFile) {
      const newAttachment = {
        title: attachmentTitle,
        file: attachmentFile,
      };
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment],
        attachmentTitle: '',
        attachmentFile: null,
      }));
    } else {
      toast.warning('Provide both title and file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('department', formData.department);
    payload.append('subject', formData.subject);
    payload.append('projectId', formData.projectId);
    payload.append('location', formData.location);
    payload.append('priority', formData.priority);
    payload.append('dueDate', formData.dueDate);
    payload.append('endDate', formData.endDate);
    payload.append('recurrence', formData.recurrence);
    payload.append('weeklyInterval', formData.weeklyInterval);
    payload.append('reminder', formData.reminder);
    payload.append('notes', formData.notes);
    payload.append('newTaskOption', formData.newTaskOption);
    payload.append('recurrenceSummary', formData.recurrenceSummary);
    payload.append('weeklyDays', JSON.stringify(formData.weeklyDays));

    formData.assignedUsers.forEach(userId => payload.append("assignedUsers", userId));

    formData.attachments.forEach(att => {
      payload.append('attachments', att.file);
      payload.append('attachmentTitles', att.title);
    });

    try {
      await axiosInstance.put(`http://localhost:5000/api/tasks/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Task updated!');
      navigate('/tasks');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating task');
      console.error('❌ Update Error:', error);
    }
  };
  return (
    <>
      <AppNavbar />
      <div className="addtask-container">
        {/* <div className="sidebar"> */}
        <Sidebar />
        {/* </div> */}
        <div className="form-wrapper">
          <h2 style={{ textAlign: 'left', fontWeight: 600, color: '#2c3e50', fontSize: 28 }}>Edit Current Task</h2>
          <Container className="addtask-content">
            <Form onSubmit={handleSubmit}>

              {/* === Container 1: Task + Description === */}
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f0f4f8' }}>
                <Row className="mb-3">
                  <Col>
                    <Form.Group controlId="title">
                      <Form.Label>
                        <MdOutlineTaskAlt style={{ marginRight: '8px', fontSize: '1.3rem', verticalAlign: 'middle' }} />
                        Task</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        placeholder="Enter Task..."
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* === Container 2: Rest of the Fields === */}
              <div className="mb-4 p-4 rounded" style={{ backgroundColor: '#f0f4f8' }}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="department">
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.ID} value={dept.DepartmentName}>
                            {dept.DepartmentName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Project ID</Form.Label>
                      <Form.Select
                        name="projectId"
                        value={formData.projectId}
                        onChange={handleChange}
                        required
                      >
                        {/* <option value="">-- Select Project ID --</option> */}
                        {(Array.isArray(projectIds) ? projectIds : []).map((proj) => (
                          <option key={proj.ID} value={proj.ProjectID}>
                            {proj.ProjectID} - {proj.PracticeArea}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Location</Form.Label>
                      <Form.Select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      >
                        {/* <option value="">-- Select Location --</option> */}
                        {(Array.isArray(locations) ? locations : []).map((loc) => (
                          <option key={loc.ID} value={loc.LocationName}>
                            {loc.LocationName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Priority with Label Beside Buttons */}
                <Row className="mb-3 align-items-center">
                  <Col md={2}>
                    <Form.Label style={{ fontWeight: 500 }}>Priority</Form.Label>
                  </Col>
                  <Col md={10}>
                    <Row>
                      <Col xs={4} className="px-1">
                        <Button
                          variant="success"
                          className={`w-100 priority-btn ${formData.priority === 'Low' ? 'active' : ''}`}
                          onClick={() => handlePriorityChange('Low')}
                        >
                          Low
                        </Button>
                      </Col>
                      <Col xs={4} className="px-1">
                        <Button
                          variant="warning"
                          className={`w-100 priority-btn ${formData.priority === 'Medium' ? 'active' : ''}`}
                          onClick={() => handlePriorityChange('Medium')}
                        >
                          Medium
                        </Button>
                      </Col>
                      <Col xs={4} className="px-1">
                        <Button
                          variant="danger"
                          className={`w-100 priority-btn ${formData.priority === 'High' ? 'active' : ''}`}
                          onClick={() => handlePriorityChange('High')}
                        >
                          High
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="dueDate">
                      <Form.Label>Due Date</Form.Label>
                      <DatePicker
                        selected={formData.dueDate ? new Date(formData.dueDate) : null}
                        onChange={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            dueDate: date,
                          }))
                        }
                        className="form-control"
                        placeholderText="Select Due Date"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select" // or "scroll" if you prefer scrollable dropdowns
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="endDate">
                      <Form.Label>End Date</Form.Label>
                      <DatePicker
                        selected={formData.endDate ? new Date(formData.endDate) : null}
                        onChange={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            endDate: date,
                          }))
                        }
                        className="form-control"
                        placeholderText="Select Due Date"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select" // or "scroll" if you prefer scrollable dropdowns
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="recurrence">
                      <Form.Label>Recurrence</Form.Label>
                      <Form.Select
                        name="recurrence"
                        value={formData.recurrence}
                        onChange={handleChange}
                      >
                        <option value="">Select Recurrence</option>
                        <option value="one-off">One-off</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Month by Date">Month by Date</option>
                        <option value="Month by Day">Month by Day</option>
                        <option value="Year by Date">Year by Date</option>
                        <option value="Year by Day">Year by Day</option>
                        <option value="Random Dates">Random Dates</option>
                      </Form.Select>
                    </Form.Group>


                    {showRecurrenceToast && selectedRecurrence && (
                      <div className="mt-2 p-3 rounded text-white" style={{ backgroundColor: '#aeccd1' }}>
                        <strong>{selectedRecurrence}</strong>:&nbsp;

                        {selectedRecurrence === 'Weekly' ? (
                          <>
                            Task will repeat every <strong>{formData.weeklyInterval || 1} week{formData.weeklyInterval > 1 ? 's' : ''}</strong>
                            {formData.weeklyDays?.length > 0 && (
                              <> on <strong>{formData.weeklyDays.join(', ')}</strong></>
                            )}
                            .

                            <div className="mt-2">
                              <Form.Label style={{ color: '#fff' }}>Repeat every:</Form.Label>
                              <Form.Select
                                style={{ width: '150px' }}
                                value={formData.weeklyInterval}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    weeklyInterval: parseInt(e.target.value),
                                  }))
                                }
                              >
                                {[1, 2, 3, 4].map((val) => (
                                  <option key={val} value={val}>{val} week{val > 1 ? 's' : ''}</option>
                                ))}
                              </Form.Select>
                            </div>

                            <div className="mt-3">
                              <Form.Label style={{ color: '#fff' }}>Select Days:</Form.Label>
                              <div className="d-flex flex-wrap gap-2">
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                  <Form.Check
                                    key={day}
                                    inline
                                    type="checkbox"
                                    id={`day-${day}`}
                                    label={day}
                                    value={day}
                                    checked={Array.isArray(formData.weeklyDays) && formData.weeklyDays.includes(day)}

                                    onChange={(e) => {
                                      const selectedDays = formData.weeklyDays || [];
                                      const updated = e.target.checked
                                        ? [...new Set([...selectedDays, day])]
                                        : selectedDays.filter(d => d !== day);

                                      setFormData((prev) => ({
                                        ...prev,
                                        weeklyDays: updated,
                                      }));
                                    }}

                                  />
                                ))}
                              </div>
                            </div>
                          </>
                        ) : selectedRecurrence === 'Month by Day' ? (
                          <>
                            Task will repeat every <strong>{formData.monthlyInterval || 1} month(s)</strong>.

                            <div className="mt-2">
                              <Form.Label style={{ color: '#fff' }}>Repeat every:</Form.Label>
                              <Form.Select
                                style={{ width: '150px' }}
                                value={formData.monthlyInterval || 1}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    monthlyInterval: parseInt(e.target.value),
                                  }))
                                }
                              >
                                {[...Array(12)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1} month{i > 0 ? 's' : ''}</option>
                                ))}
                              </Form.Select>
                            </div>

                            <div className="mt-2">
                              Day of next occurrence: <strong>{getNextRecurrenceDate(formData.dueDate, formData.monthlyInterval || 1, 'month', 'day')}</strong>
                            </div>
                          </>
                        ) : selectedRecurrence === 'Month by Date' ? (
                          <>
                            Task will repeat every <strong>{formData.monthlyInterval || 1} month(s)</strong>.

                            <div className="mt-2">
                              <Form.Label style={{ color: '#fff' }}>Repeat every:</Form.Label>
                              <Form.Select
                                style={{ width: '150px' }}
                                value={formData.monthlyInterval || 1}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    monthlyInterval: parseInt(e.target.value),
                                  }))
                                }
                              >
                                {[...Array(12)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1} month{i > 0 ? 's' : ''}</option>
                                ))}
                              </Form.Select>
                            </div>

                            <div className="mt-2">
                              Date of next occurrence: <strong>{getNextRecurrenceDate(formData.dueDate, formData.monthlyInterval || 1, 'month', 'date')}</strong>
                            </div>
                          </>
                        ) : selectedRecurrence === 'Year by Day' ? (
                          <>
                            Task will repeat every <strong>{formData.yearlyInterval || 1} year(s)</strong>.

                            <div className="mt-2">
                              <Form.Label style={{ color: '#fff' }}>Repeat every:</Form.Label>
                              <Form.Select
                                style={{ width: '150px' }}
                                value={formData.yearlyInterval || 1}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    yearlyInterval: parseInt(e.target.value),
                                  }))
                                }
                              >
                                {[...Array(10)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1} year{i > 0 ? 's' : ''}</option>
                                ))}
                              </Form.Select>
                            </div>

                            <div className="mt-2">
                              Day of next occurrence: <strong>{getNextRecurrenceDate(formData.dueDate, formData.yearlyInterval || 1, 'year', 'day')}</strong>
                            </div>
                          </>
                        ) : selectedRecurrence === 'Year by Date' ? (
                          <>
                            Task will repeat every <strong>{formData.yearlyInterval || 1} year(s)</strong>.

                            <div className="mt-2">
                              <Form.Label style={{ color: '#fff' }}>Repeat every:</Form.Label>
                              <Form.Select
                                style={{ width: '150px' }}
                                value={formData.yearlyInterval || 1}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    yearlyInterval: parseInt(e.target.value),
                                  }))
                                }
                              >
                                {[...Array(10)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1} year{i > 0 ? 's' : ''}</option>
                                ))}
                              </Form.Select>
                            </div>

                            <div className="mt-2">
                              Date of next occurrence: <strong>{getNextRecurrenceDate(formData.dueDate, formData.yearlyInterval || 1, 'year', 'date-month')}</strong>
                            </div>
                          </>
                        ) : (
                          <>{getRecurrenceMessage(selectedRecurrence)}</>
                        )}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="reminder">
                      <Form.Label>Reminder</Form.Label>
                      <Form.Control
                        type="text"
                        name="reminder"
                        value={formData.reminder || ''}
                        onChange={handleChange}
                        placeholder="e.g., 10 mins before"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* === Container 3: Attachments === */}
              <div className="mb-4 p-4 rounded" style={{ backgroundColor: '#f0f4f8' }}>
                <h5 style={{ fontWeight: 600, color: '#2c3e50' }}>
                  <HiPaperClip style={{ marginRight: '8px', fontSize: '1.3rem' }} />
                  Attachments</h5>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group controlId="attachmentTitle">
                      <Form.Label>Attachment Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="attachmentTitle"
                        placeholder="Enter Attachment Title"
                        value={formData.attachmentTitle || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, attachmentTitle: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={5}>
                    <Form.Group controlId="attachmentFile">
                      <Form.Label>Upload File</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => setFormData({ ...formData, attachmentFile: e.target.files[0] })}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3} className="d-flex align-items-end">
                    <Button
                      variant="primary"
                      onClick={() => handleAddAttachment()}
                      className="w-100"
                    >
                      Upload
                    </Button>
                  </Col>
                </Row>

                {/* Attachment List */}
                {formData.attachments.length > 0 && (
                  <ul className="list-unstyled">
                    {formData.attachments.map((att, idx) => (
                      <li key={att.ID || idx} className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>{att.Title || att.title}</strong>: {att.FileName || (att.file && att.file.name)}
                        </div>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => att.ID ? handleRemoveAttachment(att.ID) : handleRemoveLocalAttachment(idx)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

              </div>

              {/* === Container 4: Assign Users === */}
              <div className="mb-4 p-4 rounded" style={{ backgroundColor: '#f0f4f8' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 style={{ fontWeight: 600, color: '#2c3e50' }}>
                    <FaUsers style={{ marginRight: '8px' }} />
                    Assign To</h5>
                  <FaPlusCircle
                    size={24}
                    color="#0d6efd"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowUserOptions(!showUserOptions)}
                  />
                </div>

                {/* Show user options when + is clicked */}
                {showUserOptions && (
                  <div className="mb-3 d-flex flex-wrap gap-3">
                    {users.map((user) => (
                      <Button
                        key={user.ID}
                        variant={formData.assignedUsers.includes(user.ID) ? "success" : "outline-primary"}
                        onClick={() => handleAssignUserToggle(user.ID)}
                      >
                        {user.FullName}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Assigned Users Table */}
                {formData.assignedUsers.length > 0 && (
                  <Table bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Assigned User</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.assignedUsers.map((userId, index) => {
                        const user = users.find((u) => u.ID === userId);
                        return (
                          <tr key={userId} >
                            <td>{index + 1}</td>
                            <td>{user ? user.FullName : 'Unknown'}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleAssignUserToggle(userId)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </div>

              {/* === Container 5: Task Notes & Options === */}
              <div className="mb-4 p-4 rounded" style={{ backgroundColor: '#f4f9f9' }}>
                <h5 style={{ fontWeight: 600, color: '#2c3e50' }}>
                  <FaStickyNote className="me-2" />
                  Task Notes & Options
                </h5>

                {/* Notes Textarea */}
                <Row className="mb-3 mt-3">
                  <Col>
                    <Form.Group controlId="taskNotes">
                      <Form.Label style={{ fontWeight: 500 }}>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        placeholder="Enter relevant notes..."
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* New Task On Options */}
                <Row>
                  <Col>
                    <Form.Label style={{ fontWeight: 500 }}>New Task On:</Form.Label>
                    <div className="d-flex flex-column mt-2">
                      <Form.Check
                        type="radio"
                        label="After completing current task"
                        name="newTaskOption"
                        id="optionAfter"
                        checked={formData.newTaskOption === 1}
                        onChange={() => setFormData({ ...formData, newTaskOption: 1 })}
                      />
                      <Form.Check
                        type="radio"
                        label="As per task interval"
                        name="newTaskOption"
                        id="optionInterval"
                        checked={formData.newTaskOption === 2}
                        onChange={() => setFormData({ ...formData, newTaskOption: 2 })}
                      />

                    </div>
                  </Col>
                </Row>
              </div>

              <Row className="mt-4 justify-content-between">
                <Col xs="auto">
                  <Button variant="primary" type="submit" size="lg"
                    style={{
                      padding: '12px 32px',
                      fontSize: '1.1rem',
                      borderRadius: '8px',
                      fontWeight: '500',
                    }}
                  >
                    Save Edited Task
                  </Button>
                </Col>
                <Col xs="auto">
                  <Button variant="secondary" onClick={() => navigate('/tasks')} size="lg"
                    style={{
                      padding: '12px 32px',
                      fontSize: '1.1rem',
                      borderRadius: '8px',
                      fontWeight: '500',
                    }}
                  >
                    Back to List
                  </Button>
                </Col>
              </Row>


            </Form>
          </Container>
        </div>
      </div >
      <Footer />
    </>
  );
};

export default EditTask;
