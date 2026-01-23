import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { scheduleAPI, attendanceAPI, gradesAPI, announcementsAPI } from '../services/api';

export default function Dashboard() {
    const { user, isStudent, isTeacher, isAdmin } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [scheduleRes, announcementsRes] = await Promise.all([
                scheduleAPI.getMySchedule(),
                announcementsAPI.getMyAnnouncements(),
            ]);

            setSchedule(scheduleRes.data);
            setAnnouncements(announcementsRes.data.slice(0, 3));

            if (isStudent) {
                const [attendanceStats, gradeAverages] = await Promise.all([
                    attendanceAPI.getMyStats(),
                    gradesAPI.getMyAverages(),
                ]);
                setStats({
                    attendance: attendanceStats.data,
                    grades: gradeAverages.data,
                });
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTodaySchedule = () => {
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const today = days[new Date().getDay()];
        return schedule.filter(s => s.dayOfWeek === today);
    };

    const calculateAttendanceRate = () => {
        if (!stats?.attendance) return 0;
        const total = Object.values(stats.attendance).reduce((a, b) => a + b, 0);
        if (total === 0) return 100;
        return Math.round((stats.attendance.present / total) * 100);
    };

    const calculateOverallGrade = () => {
        if (!stats?.grades || Object.keys(stats.grades).length === 0) return 'N/A';
        const values = Object.values(stats.grades);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return avg.toFixed(1);
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
                <h1 className="page-title">Welcome back, {user?.firstName}!</h1>
                <p className="page-subtitle">
                    {isStudent && "Here's your academic overview"}
                    {isTeacher && "Manage your classes and students"}
                    {isAdmin && "School administration dashboard"}
                </p>
            </div>

            {/* Stats for Students */}
            {isStudent && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon primary">📅</div>
                        <div className="stat-content">
                            <div className="stat-value">{getTodaySchedule().length}</div>
                            <div className="stat-label">Classes Today</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success">✓</div>
                        <div className="stat-content">
                            <div className="stat-value">{calculateAttendanceRate()}%</div>
                            <div className="stat-label">Attendance Rate</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning">📝</div>
                        <div className="stat-content">
                            <div className="stat-value">{calculateOverallGrade()}</div>
                            <div className="stat-label">Average Grade</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon primary">📢</div>
                        <div className="stat-content">
                            <div className="stat-value">{announcements.length}</div>
                            <div className="stat-label">New Announcements</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats for Teachers */}
            {isTeacher && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon primary">📅</div>
                        <div className="stat-content">
                            <div className="stat-value">{getTodaySchedule().length}</div>
                            <div className="stat-label">Classes Today</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success">📚</div>
                        <div className="stat-content">
                            <div className="stat-value">{schedule.length}</div>
                            <div className="stat-label">Total Classes/Week</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats for Admin */}
            {isAdmin && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon primary">📅</div>
                        <div className="stat-content">
                            <div className="stat-value">{schedule.length}</div>
                            <div className="stat-label">Total Schedule Entries</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success">📢</div>
                        <div className="stat-content">
                            <div className="stat-value">{announcements.length}</div>
                            <div className="stat-label">Active Announcements</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card-grid">
                {/* Today's Schedule */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Today's Schedule</h2>
                    </div>
                    {getTodaySchedule().length > 0 ? (
                        getTodaySchedule().map(item => (
                            <div key={item.id} className="schedule-item">
                                <div className="schedule-time">
                                    {item.startTime} - {item.endTime}
                                </div>
                                <div className="schedule-subject">{item.subjectName}</div>
                                {isStudent && (
                                    <div className="schedule-teacher">👤 {item.teacherName}</div>
                                )}
                                {isTeacher && (
                                    <div className="schedule-teacher">📍 {item.classGroupName}</div>
                                )}
                                {item.room && (
                                    <div className="schedule-room">🚪 Room {item.room}</div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🎉</div>
                            <p>No classes today!</p>
                        </div>
                    )}
                </div>

                {/* Recent Announcements */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Recent Announcements</h2>
                    </div>
                    {announcements.length > 0 ? (
                        announcements.map(announcement => (
                            <div
                                key={announcement.id}
                                className={`announcement-card ${announcement.important ? 'important' : ''}`}
                            >
                                <div className="announcement-header">
                                    <div>
                                        <div className="announcement-title">{announcement.title}</div>
                                        <div className="announcement-meta">
                                            By {announcement.authorName} • {new Date(announcement.publishedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {announcement.important && (
                                        <span className="badge badge-warning">Important</span>
                                    )}
                                </div>
                                <div className="announcement-content">
                                    {announcement.content.substring(0, 150)}
                                    {announcement.content.length > 150 && '...'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <p>No announcements yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
