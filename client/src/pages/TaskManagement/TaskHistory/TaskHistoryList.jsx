import React from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import AppNavbar from '../../../components/Navbar.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import '../../../styles/pages-css/TaskManagement/Tasks/ViewTask.css';

const TaskHistoryList = () => {
    return (
        <>
            <AppNavbar />
            <div className="tasklist-container">
                <div className="sidebar">
                    <Sidebar />
                </div>

                <div className="form-wrapper">
                    <h2 className="tasklist-title">Task History</h2>

                    <Container className="addtask-content">
                        <Form className="mb-4">
                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group controlId="formProjectId">
                                        <Form.Label>Project ID</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Project ID" />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="formDepartment">
                                        <Form.Label>Department</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Department" />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="formTaskName">
                                        <Form.Label>Task Name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Task Name" />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="formFromDate">
                                        <Form.Label>From Date</Form.Label>
                                        <Form.Control type="date" />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="formToDate">
                                        <Form.Label>To Date</Form.Label>
                                        <Form.Control type="date" />
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="d-flex align-items-end">
                                    <Button size="sm" variant="info" className="w-100">
                                        View
                                    </Button>
                                </Col>

                                {/* <Col md={4} className="d-flex justify-content-center align-items-center">
                                    <Button size="md" variant="info">
                                        View
                                    </Button>
                                </Col> */}


                            </Row>
                        </Form>

                        <Table striped bordered hover responsive className="mt-3">
                            <thead className="table-primary">
                                <tr>
                                    <th>#</th>
                                    <th>Project ID</th>
                                    <th>Department</th>
                                    <th>Task Name</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>PRJ-001</td>
                                    <td>Development</td>
                                    <td>Task-V</td>
                                    <td>2025-06-10</td>
                                    <td>2025-06-28</td>
                                    <td>
                                        
                                        <Button size="sm" variant="info">View</Button>
                                    </td>
                                </tr>
                                {/* More rows can be mapped here dynamically */}
                            </tbody>
                        </Table>
                    </Container>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default TaskHistoryList;
