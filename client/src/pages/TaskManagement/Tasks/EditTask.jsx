import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import { MdOutlineTaskAlt } from 'react-icons/md';
import { HiPaperClip } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUsers, FaPlusCircle } from 'react-icons/fa';
import AppNavbar from '../../../components/Navbar.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import '../../../styles/pages-css/TaskManagement/Tasks/EditTask.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';


const subjectOptionsByDepartment = {
  Development: ['Bug Fixing', 'Feature Development', 'Code Review'],
  Deployment: ['Release Planning', 'Server Setup', 'Monitoring'],
  Testing: ['Unit Testing', 'Integration Testing', 'Bug Reporting'],
  HR: ['Onboarding', 'Payroll', 'Policy Review'],
  Marketing: ['Campaign Planning', 'SEO Analysis', 'Content Creation'],
  Sales: ['Client Outreach', 'Lead Generation', 'Follow-up'],
};



const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showUserOptions, setShowUserOptions] = useState(false);

  const [showRecurrenceToast, setShowRecurrenceToast] = useState(false);
  const [selectedRecurrence, setSelectedRecurrence] = useState('');
  const [weekInterval, setWeekInterval] = useState(1);

  const [departments, setDepartments] = useState([]);
  const [projectIds, setProjectIds] = useState([]);
  const [locations, setLocations] = useState([]);


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
    reminder: '',
    attachmentTitle: '',
    attachmentFile: null,
    attachments: [],
    assignedUsers: [],
    notes: '',
    newTaskOption: '',
    recurrenceSummary: '',
    weeklyDays: [], // ✅ Add this if it's missing
    weeklyInterval: 1, // ✅ also initialize interval here
  });


  const weekDaysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const toggleWeeklyDay = (day) => {
    const updatedDays = formData.weeklyDays.includes(day)
      ? formData.weeklyDays.filter(d => d !== day)
      : [...formData.weeklyDays, day];

    setFormData({ ...formData, weeklyDays: updatedDays });
  };


useEffect(() => {
  const initializeForm = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      const [
        taskRes,
        deptRes,
        projRes,
        locRes,
        userRes
      ] = await Promise.all([
        axios.get(`http://localhost:5000/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/masters/departments'),
        axios.get('http://localhost:5000/api/masters/project-ids'),
        axios.get('http://localhost:5000/api/masters/locations'),
        axios.get('http://localhost:5000/api/users'),
      ]);

      const task = taskRes.data;
      if (Number(task.AssignedById) !== Number(userId)) {
        alert('You are not authorized to edit this task.');
        return navigate('/tasks');
      }

      setDepartments(deptRes.data);
      setProjectIds(projRes.data?.data || []);
      setLocations(locRes.data);
      setUsers(userRes.data);

      setFormData({
        title: task.Title || '',
        department: task.Department || '',
        subject: task.Subject || '',
        projectId: task.ProjectId || '',
        location: task.Location || '',
        priority: task.Priority || '',
        dueDate: task.DueDate ? task.DueDate.split('T')[0] : '',
        endDate: task.EndDate ? task.EndDate.split('T')[0] : '',
        recurrence: task.Recurrence || '',
        weeklyInterval: task.WeeklyInterval || 1,
        reminder: task.Reminder || '',
        attachments: task.Attachments || [],
        attachmentTitle: '',
        attachmentFile: '',
        assignedUsers: task.AssignedUsers?.map(u => u.UserID) || [],
        notes: task.Notes || '',
        newTaskOption: String(task.NewTaskOption || ''),
        recurrenceSummary: task.RecurrenceSummary || '',
        weeklyDays: (() => {
          try {
            if (Array.isArray(task.WeeklyDays)) return task.WeeklyDays;
            if (typeof task.WeeklyDays === 'string') return JSON.parse(task.WeeklyDays);
            return [];
          } catch (e) {
            console.error('❌ Failed to parse WeeklyDays:', e);
            return [];
          }
        })(),
        monthlyInterval: task.MonthlyInterval || 1,
        yearlyInterval: task.YearlyInterval || 1,
      });

      setSelectedRecurrence(task.Recurrence || '');
      setShowRecurrenceToast(!!task.Recurrence);

    } catch (error) {
      console.error('❌ Error during EditTask init:', error);
    }
  };

  initializeForm();
}, [id]);



  const formattedDueDate = formData.dueDate ? new Date(formData.dueDate) : null;
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



  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'recurrence') {
      setFormData((prev) => ({
        ...prev,
        recurrence: value,
      }));
      setSelectedRecurrence(value);
      setShowRecurrenceToast(true);
    } else if (name === 'department') {
      setFormData((prev) => ({
        ...prev,
        department: value,
        subject: '',
      }));
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

  const handleAssignUserToggle = (userId) => {
    const alreadyAssigned = formData.assignedUsers.includes(userId);
    const updatedUsers = alreadyAssigned
      ? formData.assignedUsers.filter((id) => id !== userId)
      : [...formData.assignedUsers, userId];
    setFormData({ ...formData, assignedUsers: updatedUsers });
  };

  // const handleUpdate = (e) => {
  //   e.preventDefault();
  //   // Update task API call
  //   console.log('Task updated:', formData);
  //   navigate('/tasks');
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token'); // ✅ Fetch the token

      const updatedData = {
        ...formData,
        recurrenceSummary: generateRecurrenceSummary(),
        newTaskOption: String(formData.newTaskOption || ''),
      };

      // ✅ Convert weeklyDays array to JSON string before sending
      if (Array.isArray(updatedData.weeklyDays)) {
        updatedData.weeklyDays = JSON.stringify(updatedData.weeklyDays);
      }

      // ❌ Optional: remove fields like 'attachments' if backend doesn't support them
      delete updatedData.attachments;

      await axios.put(`http://localhost:5000/api/tasks/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      }
      );

      alert('Task updated successfully!');
      navigate('/tasks');
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task. Please try again.');
    }
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
      alert('Please provide both a title and a file.');
    }
  };

  // Remove attachment that was just added in this session
  const handleRemoveLocalAttachment = (index) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments.splice(index, 1);
    setFormData({ ...formData, attachments: updatedAttachments });
  };

  // Remove already uploaded attachment from DB
  const handleRemoveAttachment = async (attachmentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/attachment/${attachmentId}`);
      setFormData((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((a) => a.ID !== attachmentId),
      }));
    } catch (error) {
      console.error('Error removing attachment:', error);
      alert('Failed to remove attachment');
    }
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
      case 'Weekly': {
        const validDays = Array.isArray(weeklyDays)
          ? weeklyDays
            .filter(day => typeof day === 'string' && day.trim() !== '' && day !== '[]')
            .map(day => day.replace(/[\[\]"]/g, '').trim()) // cleanup accidental brackets/quotes
          : [];


        if (validDays.length === 0) return `Every ${weeklyInterval || 1} week${weeklyInterval > 1 ? 's' : ''}`;


        return `Every ${weeklyInterval || 1} week${weeklyInterval > 1 ? 's' : ''} on ${validDays.join(', ')}`;
      };
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
  console.log("🟩 Final weeklyDays in state:", formData.weeklyDays);


  return (
    <>
      <AppNavbar />
      <div className="addtask-container">
        <div className="sidebar">
          <Sidebar />
        </div>
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
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        {/* <option value="">-- Select Department --</option> */}
                        {(Array.isArray(departments) ? departments : []).map((dept) => (
                          <option key={dept.ID} value={dept.ID}>
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
                          <option key={proj.ID} value={proj.ID}>
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
                          <option key={loc.ID} value={loc.ID}>
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
                  <MdOutlineTaskAlt style={{ marginRight: '8px', fontSize: '1.3rem', verticalAlign: 'middle' }} />
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
                        onChange={() => setFormData({ ...formData, newTaskOption: 1 })}
                      />
                      <Form.Check
                        type="radio"
                        label="As per task interval"
                        name="newTaskOption"
                        id="optionInterval"
                        checked={formData.newTaskOption === 'interval'}
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
