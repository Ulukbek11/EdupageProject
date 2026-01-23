import { useState, useEffect } from 'react';
import { gradesAPI } from '../services/api';

export default function Grades() {
    const [grades, setGrades] = useState([]);
    const [averages, setAverages] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [gradesRes, averagesRes] = await Promise.all([
                gradesAPI.getMyGrades(),
                gradesAPI.getMyAverages(),
            ]);
            setGrades(gradesRes.data);
            setAverages(averagesRes.data);
        } catch (error) {
            console.error('Error loading grades:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (value, maxValue = 100) => {
        const percentage = (value / maxValue) * 100;
        if (percentage >= 90) return 'badge-success';
        if (percentage >= 70) return 'badge-info';
        if (percentage >= 50) return 'badge-warning';
        return 'badge-danger';
    };

    const calculateOverallAverage = () => {
        const values = Object.values(averages);
        if (values.length === 0) return 'N/A';
        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
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
            <div className="page-header">
                <h1 className="page-title">My Grades</h1>
                <p className="page-subtitle">View your academic performance</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{calculateOverallAverage()}</div>
                        <div className="stat-label">Overall Average</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">📝</div>
                    <div className="stat-content">
                        <div className="stat-value">{grades.length}</div>
                        <div className="stat-label">Total Grades</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">📚</div>
                    <div className="stat-content">
                        <div className="stat-value">{Object.keys(averages).length}</div>
                        <div className="stat-label">Subjects</div>
                    </div>
                </div>
            </div>

            {/* Subject Averages */}
            {Object.keys(averages).length > 0 && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h2 className="card-title">Subject Averages</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {Object.entries(averages).map(([subject, average]) => (
                            <div key={subject} className="stat-card" style={{ margin: 0 }}>
                                <div className="stat-content">
                                    <div className="stat-value">{average}</div>
                                    <div className="stat-label">{subject}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Grades */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Grade History</h2>
                </div>

                {grades.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Type</th>
                                    <th>Grade</th>
                                    <th>Teacher</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map(grade => (
                                    <tr key={grade.id}>
                                        <td>{new Date(grade.date).toLocaleDateString()}</td>
                                        <td>{grade.subjectName}</td>
                                        <td>{grade.gradeType || 'General'}</td>
                                        <td>
                                            <span className={`badge ${getGradeColor(grade.value, grade.maxValue)}`}>
                                                {grade.value}/{grade.maxValue || 100}
                                            </span>
                                        </td>
                                        <td>{grade.teacherName}</td>
                                        <td>{grade.description || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <p>No grades recorded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
