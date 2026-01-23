import { useState, useEffect } from 'react';
import { gradesAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function GradesManage() {
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classGroups, setClassGroups] = useState([]);
    const [selectedClassGroup, setSelectedClassGroup] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newGrade, setNewGrade] = useState({
        studentId: '',
        subjectId: '',
        value: '',
        maxValue: 100,
        gradeType: 'Assignment',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedClassGroup) {
            loadStudentsForClass();
        }
    }, [selectedClassGroup]);

    const loadData = async () => {
        try {
            const [classGroupsRes, subjectsRes] = await Promise.all([
                adminAPI.getAllClassGroups(),
                adminAPI.getAllSubjects(),
            ]);
            setClassGroups(classGroupsRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentsForClass = async () => {
        try {
            const response = await adminAPI.getStudentsByClass(selectedClassGroup);
            setStudents(response.data);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const handleCreateGrade = async (e) => {
        e.preventDefault();
        try {
            await gradesAPI.createGrade({
                studentId: parseInt(newGrade.studentId),
                subjectId: parseInt(newGrade.subjectId),
                value: parseFloat(newGrade.value),
                maxValue: parseFloat(newGrade.maxValue),
                gradeType: newGrade.gradeType,
                description: newGrade.description,
                date: newGrade.date,
            });

            setShowModal(false);
            setNewGrade({
                studentId: '',
                subjectId: '',
                value: '',
                maxValue: 100,
                gradeType: 'Assignment',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
            alert('Grade added successfully!');
        } catch (error) {
            console.error('Error creating grade:', error);
            alert('Error creating grade');
        }
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
                    <h1 className="page-title">Manage Grades</h1>
                    <p className="page-subtitle">Add and manage student grades</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Grade
                </button>
            </div>

            <div className="card mb-4">
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Class</label>
                    <select
                        className="form-select"
                        value={selectedClassGroup}
                        onChange={(e) => setSelectedClassGroup(e.target.value)}
                    >
                        <option value="">Select a class...</option>
                        {classGroups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.name} (Grade {group.grade})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedClassGroup && students.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Students</h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => {
                                                    setNewGrade(prev => ({ ...prev, studentId: student.id }));
                                                    setShowModal(true);
                                                }}
                                            >
                                                Add Grade
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Grade Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Grade</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateGrade}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Student</label>
                                    <select
                                        className="form-select"
                                        value={newGrade.studentId}
                                        onChange={(e) => setNewGrade({ ...newGrade, studentId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select student...</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Subject</label>
                                    <select
                                        className="form-select"
                                        value={newGrade.subjectId}
                                        onChange={(e) => setNewGrade({ ...newGrade, subjectId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select subject...</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Grade Value</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newGrade.value}
                                            onChange={(e) => setNewGrade({ ...newGrade, value: e.target.value })}
                                            min="0"
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Max Value</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newGrade.maxValue}
                                            onChange={(e) => setNewGrade({ ...newGrade, maxValue: e.target.value })}
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={newGrade.gradeType}
                                        onChange={(e) => setNewGrade({ ...newGrade, gradeType: e.target.value })}
                                    >
                                        <option value="Assignment">Assignment</option>
                                        <option value="Quiz">Quiz</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Project">Project</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={newGrade.date}
                                        onChange={(e) => setNewGrade({ ...newGrade, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description (optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newGrade.description}
                                        onChange={(e) => setNewGrade({ ...newGrade, description: e.target.value })}
                                        placeholder="E.g., Chapter 5 Test"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
