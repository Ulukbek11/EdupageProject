import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function ClassManagement() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentsConfig, setStudentsConfig] = useState([]);
    const [unassignedStudents, setUnassignedStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', grade: '' });
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            const response = await adminAPI.getAllClassGroups();
            setClasses(response.data);
        } catch (error) {
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadClassStudents = async (classId) => {
        try {
            const response = await adminAPI.getStudentsByClass(classId);
            setStudentsConfig(response.data);
        } catch (error) {
            console.error('Error loading class students:', error);
        }
    };

    const loadUnassignedStudents = async () => {
        try {
            const response = await adminAPI.getUnassignedStudents();
            setUnassignedStudents(response.data);
        } catch (error) {
            console.error('Error loading unassigned students:', error);
        }
    };

    const handleClassSelect = async (cls) => {
        setSelectedClass(cls);
        await loadClassStudents(cls.id);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await adminAPI.updateClassGroup(formData.id, formData);
            } else {
                await adminAPI.createClassGroup(formData);
            }
            setShowModal(false);
            setFormData({ name: '', grade: '' });
            loadClasses();
        } catch (error) {
            console.error('Error saving class:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will remove all students from this class first.')) {
            try {
                await adminAPI.deleteClassGroup(id);
                loadClasses();
                if (selectedClass?.id === id) {
                    setSelectedClass(null);
                    setStudentsConfig([]);
                }
            } catch (error) {
                console.error('Error deleting class:', error);
            }
        }
    };

    const handleRemoveStudent = async (studentId) => {
        if (window.confirm('Remove student from this class?')) {
            try {
                await adminAPI.updateStudentClass(studentId, null);
                loadClassStudents(selectedClass.id);
                // Also update the class list to reflect student count changes if possible, or just re-fetch
                loadClasses();
            } catch (error) {
                console.error('Error removing student:', error);
            }
        }
    };

    const handleAssignStudents = async () => {
        try {
            await adminAPI.bulkAssignStudents(selectedStudents, selectedClass.id);
            setShowAssignModal(false);
            setSelectedStudents([]);
            loadClassStudents(selectedClass.id);
            loadClasses();
        } catch (error) {
            console.error('Error assigning students:', error);
        }
    };

    const openAssignModal = () => {
        loadUnassignedStudents();
        setShowAssignModal(true);
    };

    return (
        <div className="container" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 100px)' }}>
            {/* List of Classes */}
            <div className="card" style={{ flex: '1', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">
                    <h2 className="card-title">Classes</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                        setFormData({ name: '', grade: '' });
                        setShowModal(true);
                    }}>
                        + New Class
                    </button>
                </div>
                <div className="table-container" style={{ flex: '1', overflowY: 'auto' }}>
                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : classes.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Grade</th>
                                    <th>Students</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map(cls => (
                                    <tr
                                        key={cls.id}
                                        onClick={() => handleClassSelect(cls)}
                                        style={{
                                            cursor: 'pointer',
                                            background: selectedClass?.id === cls.id ? 'var(--bg-card-hover)' : 'transparent'
                                        }}
                                    >
                                        <td>{cls.name}</td>
                                        <td>{cls.grade}</td>
                                        <td>{cls.studentCount}</td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData(cls);
                                                    setShowModal(true);
                                                }}
                                                style={{ marginRight: '0.5rem' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(cls.id);
                                                }}
                                            >
                                                ×
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">No classes found</div>
                    )}
                </div>
            </div>

            {/* Selected Class Details & Students */}
            <div className="card" style={{ flex: '2', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {selectedClass ? (
                    <>
                        <div className="card-header">
                            <h2 className="card-title">
                                Students in {selectedClass.name}
                                <span className="badge badge-info" style={{ marginLeft: '1rem' }}>
                                    {studentsConfig.length} Students
                                </span>
                            </h2>
                            <button className="btn btn-primary btn-sm" onClick={openAssignModal}>
                                + Add Students
                            </button>
                        </div>
                        <div className="table-container" style={{ flex: '1', overflowY: 'auto' }}>
                            {studentsConfig.length > 0 ? (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Student ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentsConfig.map(student => (
                                            <tr key={student.id}>
                                                <td>{student.name}</td>
                                                <td>{student.email}</td>
                                                <td>{student.studentNumber}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleRemoveStudent(student.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">👥</div>
                                    <p>No students in this class yet</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="empty-state" style={{ margin: 'auto' }}>
                        <div className="empty-state-icon">🏫</div>
                        <p>Select a class to manage students</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Class Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{formData.id ? 'Edit Class' : 'New Class'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Class Name</label>
                                    <input
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. 10A"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Grade Level</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.grade}
                                        onChange={e => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                        placeholder="e.g. 10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Students Modal */}
            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Students to {selectedClass.name}</h3>
                            <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-4">Select students from list of unassigned students:</p>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                {unassignedStudents.length > 0 ? (
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}>
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedStudents(unassignedStudents.map(s => s.id));
                                                            else setSelectedStudents([]);
                                                        }}
                                                        checked={selectedStudents.length === unassignedStudents.length && unassignedStudents.length > 0}
                                                    />
                                                </th>
                                                <th>Name</th>
                                                <th>Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {unassignedStudents.map(student => (
                                                <tr key={student.id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.includes(student.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedStudents([...selectedStudents, student.id]);
                                                                else setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{student.name}</td>
                                                    <td>{student.email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-4 text-center">No unassigned students found.</div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div style={{ marginRight: 'auto' }}>
                                {selectedStudents.length} selected
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAssignStudents}
                                disabled={selectedStudents.length === 0}
                            >
                                Assign Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
