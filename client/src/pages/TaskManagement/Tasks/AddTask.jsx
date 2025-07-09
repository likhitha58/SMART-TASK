
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import axiosInstance from '../../../api/axiosConfig.js';
import { MdOutlineTaskAlt } from 'react-icons/md'; // ⬅️ Add this import at the top
import { HiPaperClip } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaPlusCircle } from 'react-icons/fa';
import AppNavbar from '../../../components/Navbar.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import '../../../styles/pages-css/TaskManagement/Tasks/AddTask.css';
import DatePicker from 'react-datepicker';
import { FaStickyNote} from 'react-icons/fa';

import 'react-datepicker/dist/react-datepicker.css';


const AddTask = () => {
  const [showRecurrenceToast, setShowRecurrenceToast] = useState(false);
  const [selectedRecurrence, setSelectedRecurrence] = useState('');

  const [users, setUsers] = useState([]);
  const [showUserOptions, setShowUserOptions] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [projectIds, setProjectIds] = useState([]);
  const [locations, setLocations] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    // description: '',
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
    attachmentTitle: '',
    attachmentFile: null,
    attachments: [],
    assignedUsers: [],
    notes: '',
    newTaskOption: '',
    weeklyDays: [],
    monthlyInterval: 1,
    yearlyInterval: 1,
    recurrenceSummary: '',
  });


  const subjectOptionsByDepartment = {
    Development: ['Bug Fixing', 'Feature Development', 'Code Review'],
    Deployment: ['Release Planning', 'Server Setup', 'Monitoring'],
    Testing: ['Unit Testing', 'Integration Testing', 'Bug Reporting'],
    HR: ['Onboarding', 'Payroll', 'Policy Review'],
    Marketing: ['Campaign Planning', 'SEO Analysis', 'Content Creation'],
    Sales: ['Client Outreach', 'Lead Generation', 'Follow-up'],
  };


  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'department') {
      setFormData((prev) => ({
        ...prev,
        department: value,
        subject: '',
      }));
    } else if (name === 'recurrence') {
      setFormData((prev) => ({
        ...prev,
        recurrence: value,
      }));
      setSelectedRecurrence(value); // Save the selection
      setShowRecurrenceToast(true); // Show the toast
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };



  const handlePriorityChange = (priority) => {
    setFormData({ ...formData, priority });
  };

  const handleAddAttachment = () => {
    const { attachmentTitle, attachmentFile } = formData;
    if (attachmentTitle && attachmentFile) {
      const newAttachment = {
        title: attachmentTitle,
        file: attachmentFile,
      };
      setFormData({
        ...formData,
        attachments: [...formData.attachments, newAttachment],
        attachmentTitle: '',
        attachmentFile: null,
      });
    } else {
      toast.warning('Please provide both title and file for the attachment.');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/masters/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchProjectIds = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/masters/project-ids');

      // If your API returns: { data: [...] }
      const projectData = response?.data?.data;

      if (Array.isArray(projectData)) {
        setProjectIds(projectData);
      } else {
        console.warn("⚠️ projectIds response is not an array:", projectData);
        setProjectIds([]);
      }
    } catch (error) {
      console.error("❌ Error fetching project IDs:", error);
      setProjectIds([]); // Prevents crash from .map
    }
  };



  const fetchLocations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/masters/locations');
      setLocations(res.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
    fetchDepartments();
    fetchProjectIds();
    fetchLocations();
  }, []);


  const handleAssignUserToggle = (userId) => {
    const alreadyAssigned = formData.assignedUsers.includes(userId);
    const updatedUsers = alreadyAssigned
      ? formData.assignedUsers.filter((id) => id !== userId)
      : [...formData.assignedUsers, userId];

    setFormData({ ...formData, assignedUsers: updatedUsers });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const summary = generateRecurrenceSummary();
  const payload = new FormData();
  const newTaskOptionValue = parseInt(formData.newTaskOption);
  payload.append('recurrenceSummary', summary);
  payload.append('title', formData.title || '');
  payload.append('department', formData.department);
  payload.append('subject', formData.subject || '');
  payload.append('projectId', formData.projectId);
  payload.append('location', formData.location);
  payload.append('priority', formData.priority || '');
  payload.append(
    'dueDate',
    formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''
  );
  payload.append(
    'endDate',
    formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''
  );
  payload.append('recurrence', formData.recurrence || '');
  payload.append('reminder', formData.reminder || '');
  payload.append('notes', formData.notes || '');
  payload.append('newTaskOption', isNaN(newTaskOptionValue) ? 0 : newTaskOptionValue);
  payload.append('weeklyInterval', formData.weeklyInterval || 1);
  payload.append('monthlyInterval', formData.monthlyInterval || 1);
  payload.append('yearlyInterval', formData.yearlyInterval || 1);
  payload.append('weeklyDays', JSON.stringify(formData.weeklyDays || []));

  (formData.assignedUsers || []).forEach((userId) => {
    payload.append('assignedUsers', userId);
  });

  (formData.attachments || []).forEach((att) => {
    if (att?.file) {
      payload.append('attachments', att.file);
      payload.append('attachmentTitles', att.title || att.file.name);
    }
  });

  try {
    const token = localStorage.getItem('token');
    const res = await axios.post('http://localhost:5000/api/tasks/add-task', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success('Task added successfully!');
    console.log("Recurrence Summary:", summary);
    // Optional: reset form or navigate
  } catch (error) {
    console.error('Error adding task:', error);
    if (error.response) {
      toast.error(error.response.data.message || 'Unknown server error.');
    } else {
      toast.error('Error adding task. Check console for more info.');
    }
  }
};




  const [weekInterval, setWeekInterval] = useState(1);

  const getRecurrenceMessage = (recurrence) => {
    const formattedDueDate = formData.dueDate ? new Date(formData.dueDate) : null;

    if (!recurrence) return '';
    if (!formattedDueDate) return 'Please select a due date.';

    switch (recurrence) {
      case 'one-off':
        return 'This is a one-time task.';
      case 'Daily':
        return 'Task will repeat daily.';
      case 'Weekly':
        return 'Task will repeat weekly.';
      case 'Month by Date':
        return `Repeating task every 1 month on ${formattedDueDate.getDate()}`;
      case 'Month by Day':
        return `Repeating task every 1 month on the ${formattedDueDate.toLocaleDateString('en-US', { weekday: 'long' })}`;
      case 'Year by Date':
        return `Repeating task every year on ${formattedDueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
      case 'Year by Day':
        return `Repeating task every year on the ${formattedDueDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}`;
      case 'Random Dates':
        return 'Task will occur on randomly selected dates.';
      default:
        return 'Custom recurrence selected.';
    }
  };

  const formDataToSend = new FormData();
  formDataToSend.append('title', formData.title);

  const handleRemoveAttachment = (indexToRemove) => {
    const updatedAttachments = formData.attachments.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, attachments: updatedAttachments });
  };

  const getNextRecurrenceDate = (baseDateStr, interval, type, format = 'full') => {
    const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
    const nextDate = new Date(baseDate);

    if (type === 'month') {
      nextDate.setMonth(nextDate.getMonth() + interval);
    } else if (type === 'year') {
      nextDate.setFullYear(nextDate.getFullYear() + interval);
    }

    switch (format) {
      case 'day':
        return nextDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          month: 'long',
          ...(type === 'year' && { year: 'numeric' }) // include year only if yearly
        });
      case 'date':
        return nextDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          ...(type === 'year' && { year: 'numeric' })
        });
      case 'date-month':
        return nextDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      default:
        return nextDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
    }
  };

  const generateRecurrenceSummary = () => {
    const {
      recurrence,
      weeklyInterval,
      weeklyDays,
      monthlyInterval,
      yearlyInterval,
      dueDate
    } = formData;

    switch (recurrence) {
      case 'Weekly':
        return `Every ${weeklyInterval || 1} week${weeklyInterval > 1 ? 's' : ''} on ${weeklyDays?.join(', ')}`;
      case 'Month by Date':
        return `Every ${monthlyInterval || 1} month${monthlyInterval > 1 ? 's' : ''} on ${getNextRecurrenceDate(dueDate, monthlyInterval || 1, 'month', 'date')}`;
      case 'Month by Day':
        return `Every ${monthlyInterval || 1} month${monthlyInterval > 1 ? 's' : ''} on ${getNextRecurrenceDate(dueDate, monthlyInterval || 1, 'month', 'day')}`;
      case 'Year by Date':
        return `Every ${yearlyInterval || 1} year${yearlyInterval > 1 ? 's' : ''} on ${getNextRecurrenceDate(dueDate, yearlyInterval || 1, 'year', 'date')}`;
      case 'Year by Day':
        return `Every ${yearlyInterval || 1} year${yearlyInterval > 1 ? 's' : ''} on ${getNextRecurrenceDate(dueDate, yearlyInterval || 1, 'year', 'day')}`;
      case 'Daily':
        return 'Every day';
      case 'Random Dates':
        return 'Repeats on random dates';
      case 'one-off':
      default:
        return 'One-time task';
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
          <h2 style={{ textAlign: 'left', fontWeight: 600, color: '#2c3e50', fontSize: 28 }}>Add New Task</h2>
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
                        value={formData.title}
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
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Select Department --</option>
                        {Array.isArray(departments) && departments.map((dept) => (
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
                        <option value="">-- Select Project ID --</option>
                        {Array.isArray(projectIds) && projectIds.map((proj) => (
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
                        <option value="">-- Select Location --</option>
                        {Array.isArray(locations) && locations.map((loc) => (
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
                            dueDate: date.toISOString().split('T')[0],
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
                            endDate: date.toISOString().split('T')[0],
                          }))
                        }
                        className="form-control"
                        placeholderText="Select End Date"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select" // you can change this to "scroll" if preferred
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
                                    checked={formData.weeklyDays?.includes(day)}
                                    onChange={(e) => {
                                      const selectedDays = formData.weeklyDays || [];
                                      setFormData((prev) => ({
                                        ...prev,
                                        weeklyDays: e.target.checked
                                          ? [...selectedDays, day]
                                          : selectedDays.filter((d) => d !== day),
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
                        value={formData.reminder}
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
                  Attachments
                </h5>

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
                        onChange={(e) =>
                          setFormData({ ...formData, attachmentFile: e.target.files[0] })
                        }
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
                {formData.attachments && formData.attachments.length > 0 && (
                  <div>
                    <h6 className="mt-3 mb-2">Attached Files:</h6>
                    <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                      {formData.attachments.map((att, idx) => (
                        <li key={idx} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                          <div>
                            <strong>{att.title}:</strong> {att.file.name}
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveAttachment(idx)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                          <tr key={userId}>
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
                        checked={formData.newTaskOption === 'after'}
                        onChange={() => setFormData({ ...formData, newTaskOption: 'after' })}
                      />
                      <Form.Check
                        type="radio"
                        label="As per task interval"
                        name="newTaskOption"
                        id="optionInterval"
                        checked={formData.newTaskOption === 'interval'}
                        onChange={() => setFormData({ ...formData, newTaskOption: 'interval' })}
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
                    Save Task
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
          </Container >
        </div >
      </div >
      <Footer />
    </>
  );
};

export default AddTask;
