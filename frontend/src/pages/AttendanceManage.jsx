import { useState, useEffect } from 'react';
import { scheduleAPI, attendanceAPI, adminAPI } from '../services/api';

export default function AttendanceManage() {
    const [schedules, setSchedules] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSchedules();
    }, []);

    useEffect(() => {
        if (selectedSchedule) {
            loadStudentsForClass();
        }
    }, [selectedSchedule]);

    const loadSchedules = async () => {
        try {
            const response = await scheduleAPI.getMySchedule();
            setSchedules(response.data);
        } catch (error) {
            console.error('Error loading schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentsForClass = async () => {
        try {
            const response = await adminAPI.getStudentsByClass(selectedSchedule.classGroupId);
            setStudents(response.data);

            // Initialize attendance state
            const initialAttendance = {};
            response.data.forEach(student => {
                initialAttendance[student.id] = { status: 'PRESENT', notes: '' };
            });
            setAttendance(initialAttendance);

            // Load existing attendance for this schedule/date
            try {
                const existingAttendance = await attendanceAPI.getScheduleAttendance(
                    selectedSchedule.id,
                    selectedDate
                );
                existingAttendance.data.forEach(record => {
                    initialAttendance[record.studentId] = {
                        status: record.status,
                        notes: record.notes || ''
                    };
                });
                setAttendance({ ...initialAttendance });
            } catch (e) {
                // No existing attendance
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleNotesChange = (studentId, notes) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], notes }
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const attendanceRecords = Object.entries(attendance).map(([studentId, data]) => ({
                studentId: parseInt(studentId),
                status: data.status,
                notes: data.notes
            }));

            await attendanceAPI.markAttendance({
                scheduleId: selectedSchedule.id,
                date: selectedDate,
                attendanceRecords
            });

            alert('Attendance saved successfully!');
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Error saving attendance');
        } finally {
            setSaving(false);
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
            <div className="page-header">
                <h1 className="page-title">Mark Attendance</h1>
                <p className="page-subtitle">Record student attendance for your classes</p>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h2 className="card-title">Select Class</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Class/Schedule</label>
                        <select
                            className="form-select"
                            value={selectedSchedule?.id || ''}
                            onChange={(e) => {
                                const schedule = schedules.find(s => s.id === parseInt(e.target.value));
                                setSelectedSchedule(schedule);
                            }}
                        >
                            <option value="">Select a class...</option>
                            {schedules.map(schedule => (
                                <option key={schedule.id} value={schedule.id}>
                                    {schedule.classGroupName} - {schedule.subjectName} ({schedule.dayOfWeek})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {selectedSchedule && students.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">
                            Students - {selectedSchedule.classGroupName}
                        </h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(status => (
                                                    <button
                                                        key={status}
                                                        className={`btn btn-sm ${attendance[student.id]?.status === status
                                                                ? 'btn-primary'
                                                                : 'btn-secondary'
                                                            }`}
                                                        onClick={() => handleStatusChange(student.id, status)}
                                                    >
                                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Optional notes..."
                                                value={attendance[student.id]?.notes || ''}
                                                onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                                style={{ width: '200px' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>
            )}

            {selectedSchedule && students.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <p>No students found in this class</p>
                    </div>
                </div>
            )}
        </div>
    );
}
