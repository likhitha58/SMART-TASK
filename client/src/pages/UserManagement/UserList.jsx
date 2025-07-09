// 📁 client/src/pages/UserManagement/Users/UserList.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppNavbar from '../../components/Navbar.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import Footer from '../../components/Footer.jsx';
import '../../styles/pages-css/UserManagement/UserList.css';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users'); // Ensure this matches your backend route
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <AppNavbar />
      <div className="userlist-container">
        {/* <div className="sidebar"> */}
          <Sidebar style={{padding:30}}/>
        {/* </div> */}

        <div className="userlist-background">
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="userlist-title">User List</h2>
              <Button
                variant="primary"
                size="lg"
                className="add-user-btn"
                onClick={() => {
                  console.log("clicked");
                  navigate('/add-user');
                }}
              >
                + Add User
              </Button>
            </div>

            <Table striped bordered hover className="userlist-table">
              <thead className="table-header">
                <tr>
                  <th>S.No</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Mobile No.</th>
                  <th>Role</th>
                  {/* <th>Photo</th> */}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.ID}>
                    <td>{index + 1}</td>
                    <td>{user.Username}</td>
                    <td>{user.FullName}</td>
                    <td>{user.Email}</td>
                    <td>{user.Mobile}</td>
                    <td>{user.Role}</td>
                    {/* <td><img src={`http://localhost:5000/uploads/${user.photo}`} alt="Profile" /></td> */}
                    <td>
                      <Button
                        variant={user.Status === 'Active' ? 'success' : 'secondary'}
                        size="sm" disabled
                      >
                        {user.Status === 'Active' ? 'Active' : 'Inactive'}
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => navigate(`/edit/${user.ID}`)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserList;
