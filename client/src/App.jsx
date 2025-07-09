import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css'; // base styles
import './styles/components/CustomToast.css';
import { ToastContainer } from 'react-toastify';

import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Account from './pages/Account.jsx';
import UserList from './pages/UserManagement/UserList.jsx';
import AddUser from './pages/UserManagement/Users/AddUser.jsx';
import EditUser from './pages/UserManagement/Users/EditUser.jsx';
import TaskList from './pages/TaskManagement/Tasks/TaskList.jsx';
import AddTask from './pages/TaskManagement/Tasks/AddTask.jsx';
import EditTask from './pages/TaskManagement/Tasks/EditTask.jsx';
import ViewTask from './pages/TaskManagement/Tasks/ViewTask.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import DepartmentList from './masters/Department/DepartmentList.jsx';
import AddDepartment from './masters/Department/AddDepartment.jsx';
import LocationList from './masters/Location/LocationList.jsx';
import ProjectIdList from './masters/ProjectID/ProjectIdList.jsx';

import ReviewList from './pages/TaskManagement/Reviews/ReviewList';
import ViewReview from './pages/TaskManagement/Reviews/ViewReview';

import TaskHistoryList from './pages/TaskManagement/TaskHistory/TaskHistoryList.jsx';
import ViewTaskHistory from './pages/TaskManagement/TaskHistory/ViewTaskHistory.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

        <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
        <Route path="/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><EditUser /></ProtectedRoute>} />

        <Route path="/tasks" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
        <Route path="/add-task" element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
        <Route path="/edit-task/:id" element={<ProtectedRoute><EditTask /></ProtectedRoute>} />
        <Route path="/view-task/:id" element={<ProtectedRoute><ViewTask /></ProtectedRoute>} />

        <Route path="/masters/departments" element={<ProtectedRoute><DepartmentList /></ProtectedRoute>} />
        <Route path="/masters/departments/add" element={<ProtectedRoute><AddDepartment /></ProtectedRoute>} />

        <Route path="/masters/locations" element={<ProtectedRoute><LocationList /></ProtectedRoute>} />
        <Route path="/masters/project" element={<ProtectedRoute><ProjectIdList /></ProtectedRoute>} />

        <Route path="/review-list" element={<ProtectedRoute><ReviewList /></ProtectedRoute>} />
        <Route path="/view-review/:id" element={<ProtectedRoute><ViewReview /></ProtectedRoute>} />

        <Route path="/task-history" element={<ProtectedRoute><TaskHistoryList /></ProtectedRoute>} />
        <Route path="/view-task-history/:id" element={<ProtectedRoute><ViewTaskHistory /></ProtectedRoute>} />


      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </Router>

  );
}

export default App;
