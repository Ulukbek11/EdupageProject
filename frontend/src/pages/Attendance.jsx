import { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';

export default function Attendance() {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [attendanceRes, statsRes] = await Promise.all([
                attendanceAPI.getMyAttendance(),
                attendanceAPI.getMyStats(),
            ]);
            setAttendance(attendanceRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PRESENT: 'badge-success',
            ABSENT: 'badge-danger',
            LATE: 'badge-warning',
            EXCUSED: 'badge-info',
        };
        return badges[status] || 'badge-info';
    };

    const calculateRate = () => {
        if (!stats) return 0;
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        if (total === 0) return 100;
        return Math.round((stats.present / total) * 100);
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
                <h1 className="page-title">My Attendance</h1>
                <p className="page-subtitle">Track your class attendance</p>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon success">✓</div>
                        <div className="stat-content">
                            <div className="stat-value">{calculateRate()}%</div>
                            <div className="stat-label">Attendance Rate</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success">✓</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.present}</div>
                            <div className="stat-label">Present</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon danger">✗</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.absent}</div>
                            <div className="stat-label">Absent</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning">⏰</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.late}</div>
                            <div className="stat-label">Late</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Attendance History</h2>
                </div>

                {attendance.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map(record => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>{record.subjectName}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td>{record.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <p>No attendance records yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
