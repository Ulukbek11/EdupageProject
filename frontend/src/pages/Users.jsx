import { useState, useEffect } from 'react';
import { adminAPI, authAPI } from '../services/api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classGroups, setClassGroups] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'STUDENT',
        classGroupId: '',
        subjectIds: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, studentsRes, teachersRes, classGroupsRes, subjectsRes] = await Promise.all([
                adminAPI.getAllUsers(),
                adminAPI.getAllStudents(),
                adminAPI.getAllTeachers(),
                adminAPI.getAllClassGroups(),
                adminAPI.getAllSubjects(),
            ]);
            setUsers(usersRes.data);
            setStudents(studentsRes.data);
            setTeachers(teachersRes.data);
            setClassGroups(classGroupsRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Handle Update
                if (newUser.role === 'TEACHER') {
                    await adminAPI.updateTeacherSubjects(selectedTeacherId, newUser.subjectIds.map(id => parseInt(id)));
                } else if (newUser.role === 'STUDENT') {
                    await adminAPI.updateStudentClass(selectedUserId, newUser.classGroupId ? parseInt(newUser.classGroupId) : null);
                }
                // Note: General user update (name/email) is not implemented in backend yet, so we skip it or add it later if requested.
            } else {
                // Handle Create
                await authAPI.register({
                    email: newUser.email,
                    password: newUser.password,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    classGroupId: newUser.role === 'STUDENT' ? parseInt(newUser.classGroupId) : null,
                    subjectIds: newUser.role === 'TEACHER' ? newUser.subjectIds.map(id => parseInt(id)) : null,
                });
            }

            setShowModal(false);
            resetForm();
            loadData();
            alert(isEditing ? 'ant updated successfully!' : 'User created successfully!');
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Error saving user');
        }
    };

    const resetForm = () => {
        setNewUser({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            role: 'STUDENT',
            classGroupId: '',
            subjectIds: [],
        });
        setIsEditing(false);
        setSelectedUserId(null);
        setSelectedTeacherId(null);
    };

    const handleEditClick = (user, type) => {
        // Prepare form data from user object
        // type can be 'teacher', 'student', or 'user'
        const formData = {
            email: user.email,
            password: '', // Password not editable here
            firstName: user.name ? user.name.split(' ')[0] : user.firstName,
            lastName: user.name ? user.name.split(' ').slice(1).join(' ') : user.lastName,
            role: type === 'teacher' ? 'TEACHER' : type === 'student' ? 'STUDENT' : user.role,
            classGroupId: '',
            subjectIds: [],
        };

        if (type === 'student') {
            formData.classGroupId = user.classGroupId || '';
            setSelectedUserId(user.id); // Student ID maps to ID in student table? No, user.id in student table is the STUDENT ID.
            // Wait, student.id is the Student entity ID.
            // In getStudents API: id is student ID.
        } else if (type === 'teacher') {
            // Map subject names to IDs
            // user.subjects is ["Math", "Physics"]
            const currentSubjectIds = user.subjects.map(name => {
                const sub = subjects.find(s => s.name === name);
                return sub ? sub.id : null;
            }).filter(id => id !== null);
            formData.subjectIds = currentSubjectIds;
            setSelectedTeacherId(user.id);
        }

        setNewUser(formData);
        setIsEditing(true);
        setShowModal(true);
    };

    const getRoleBadge = (role) => {
        const badges = {
            ADMIN: 'badge-danger',
            TEACHER: 'badge-info',
            STUDENT: 'badge-success',
        };
        return badges[role] || 'badge-info';
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage students, teachers, and administrators</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add User
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">👥</div>
                    <div className="stat-content">
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">🎓</div>
                    <div className="stat-content">
                        <div className="stat-value">{students.length}</div>
                        <div className="stat-label">Students</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">👨‍🏫</div>
                    <div className="stat-content">
                        <div className="stat-value">{teachers.length}</div>
                        <div className="stat-label">Teachers</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon danger">🛡️</div>
                    <div className="stat-content">
                        <div className="stat-value">{users.filter(u => u.role === 'ADMIN').length}</div>
                        <div className="stat-label">Admins</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['all', 'students', 'teachers'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="card">
                {activeTab === 'all' && (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.firstName} {user.lastName}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Class</th>
                                    <th>Student Number</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.classGroupName || '-'}</td>
                                        <td>{student.studentNumber || '-'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleEditClick(student, 'student')}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Subjects</th>
                                    <th>Employee Number</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map(teacher => (
                                    <tr key={teacher.id}>
                                        <td>{teacher.name}</td>
                                        <td>{teacher.email}</td>
                                        <td>{teacher.subjects.join(', ') || '-'}</td>
                                        <td>{teacher.employeeNumber || '-'}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleEditClick(teacher, 'teacher')}
                                            >
                                                Assign Subjects
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{isEditing ? 'Edit User' : 'Add New User'}</h3>
                            <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="modal-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={newUser.firstName}
                                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={newUser.lastName}
                                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required={!isEditing}
                                        minLength={6}
                                        disabled={isEditing}
                                        placeholder={isEditing ? '*******' : ''}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        disabled={isEditing}
                                    >
                                        <option value="STUDENT">Student</option>
                                        <option value="TEACHER">Teacher</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                {newUser.role === 'STUDENT' && (
                                    <div className="form-group">
                                        <label className="form-label">Class</label>
                                        <select
                                            className="form-select"
                                            value={newUser.classGroupId}
                                            onChange={(e) => setNewUser({ ...newUser, classGroupId: e.target.value })}
                                        >
                                            <option value="">Select class...</option>
                                            {classGroups.map(group => (
                                                <option key={group.id} value={group.id}>{group.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {newUser.role === 'TEACHER' && (
                                    <div className="form-group">
                                        <label className="form-label">Subjects</label>
                                        <select
                                            className="form-select"
                                            multiple
                                            value={newUser.subjectIds}
                                            onChange={(e) => setNewUser({
                                                ...newUser,
                                                subjectIds: Array.from(e.target.selectedOptions, option => option.value)
                                            })}
                                            style={{ height: '100px' }}
                                        >
                                            {subjects.map(subject => (
                                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                                            ))}
                                        </select>
                                        <small style={{ color: 'var(--text-muted)' }}>Hold Ctrl/Cmd to select multiple</small>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
