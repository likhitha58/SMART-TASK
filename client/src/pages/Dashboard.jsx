import React, { useEffect, useState } from 'react';
import {
  FaChartBar,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import AppNavbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/pages-css/Dashboard.css';
import axios from 'axios';

const Dashboard = () => {
  const [startedTasks, setStartedTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    // Fetch ongoing (started) tasks
    axios.get('/api/dashboard/ongoing-tasks')
      .then((res) => {
        const formatted = res.data.map((task) => ({
          id: task.ID,
          title: task.Title || `Task #${task.ID}`,
          dueDate: task.DueDate ? new Date(task.DueDate) : null
        }));
        setStartedTasks(formatted);
      })
      .catch((err) => {
        console.error('Error fetching ongoing tasks:', err);
      });

    // Fetch upcoming tasks
    axios.get('/api/dashboard/upcoming-tasks')
      .then((res) => {
        const formatted = res.data.map((task) => ({
          id: task.ID,
          title: task.Title || `Task #${task.ID}`,
          dueDate: task.DueDate ? new Date(task.DueDate) : null
        }));
        setUpcomingTasks(formatted);
      })
      .catch((err) => {
        console.error('Error fetching upcoming tasks:', err);
      });
  }, []);


  return (
    <>
      <AppNavbar />
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-main">
          <h1 className="dashboard-title d-flex align-items-center gap-2">
            <FaChartBar /> Dashboard
          </h1>

          {/* Tasks Already Started */}
          <div className="dashboard-card">
            <h5 className="d-flex align-items-center gap-2">
              <FaCheckCircle className="text-success" /> Tasks Already Started
            </h5>
            <div className="table-responsive mt-3 dashboard-table">
              <table className="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Title</th>
                    <th>Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  {startedTasks.length > 0 ? (
                    startedTasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.title}</td>
                        <td>{task.dueDate ? task.dueDate.toLocaleDateString() : '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">No started tasks found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="dashboard-card">
            <h5 className="d-flex align-items-center gap-2">
              <FaClock className="text-warning" /> Upcoming Tasks
            </h5>
            <div className="table-responsive mt-3 dashboard-table">
              <table className="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Title</th>
                    <th>Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.title}</td>
                        <td>{task.dueDate ? task.dueDate.toLocaleDateString() : '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">No upcoming tasks found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
