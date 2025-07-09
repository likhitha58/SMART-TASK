import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/components/Sidebar.css';
import logo from '../assets/images/logoSmartTask.png';
import defaultAvatar from '../assets/images/profileimage.jpg';

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: '', photo: '' });

  // Dropdown visibility states
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [showMastersMenu, setShowMastersMenu] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const imageUrl = storedUser.photo
        ? `${baseURL}/uploads/${storedUser.photo}`
        : defaultAvatar;

      setUser({
        name: storedUser.name,
        photo: imageUrl,
      });
    }
  }, []);

  return (
    <>
      <div
        className="sidebar-hover-zone"
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      />

      <div
        className={`sidebar-wrapper${sidebarOpen ? ' open' : ''}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="sidebar-logo-container">
          <img src={user.photo || defaultAvatar} alt="User" className="sidebar-user-photo" />
          <div className="sidebar-user-name-under-logo">{user.name}</div>
        </div>

        <Nav defaultActiveKey="/users" className="sidebar-nav">
          {/* User Management */}
          <div className="sidebar-link" onClick={() => setShowUserMenu(!showUserMenu)}>
            User Management
          </div>
          {showUserMenu && (
            <div className="sidebar-submenu">
              <Nav.Link as={Link} to="/users" className="sidebar-sublink" style={{ fontWeight: 500 }}>
                Users
              </Nav.Link>
            </div>
          )}

          {/* Task Management */}
          <div className="sidebar-link" onClick={() => setShowTaskMenu(!showTaskMenu)}>
            Task Management
          </div>
          {showTaskMenu && (
            <div className="sidebar-submenu">
              <Nav.Link as={Link} to="/tasks" className="sidebar-sublink" style={{ fontWeight: 500 }}>
                Tasks
              </Nav.Link>
              <Nav.Link as={Link} to="/review-list" className="sidebar-sublink" style={{ fontWeight: 500 }}>
                Reviews
              </Nav.Link>
              <Nav.Link as={Link} to="/task-history" className="sidebar-sublink" style={{ fontWeight: 500 }}>
                History
              </Nav.Link>
            </div>
          )}

          {/* Masters */}
          <div className="sidebar-link" onClick={() => setShowMastersMenu(!showMastersMenu)}>
            Masters
          </div>
          {showMastersMenu && (
            <div className="sidebar-submenu">
              <Nav.Link as={Link} to="/masters/departments" className="sidebar-sublink" style={{ fontWeight: 500 }}>
                Department
              </Nav.Link>
              <Nav.Link as={Link} to="/masters/locations" className="sidebar-sublink" style={{ fontWeight: 500 }}>
                Location
              </Nav.Link>
              <Nav.Link as={Link} to="/masters/project" className="sidebar-sublink" style={{ fontWeight: 500 }}>
                Project ID
              </Nav.Link>
            </div>
          )}
        </Nav>
      </div>
    </>
  );
}

export default Sidebar;
