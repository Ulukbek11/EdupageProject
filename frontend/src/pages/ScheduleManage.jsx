import { useState, useEffect } from 'react';
import { scheduleAPI, adminAPI } from '../services/api';

export default function ScheduleManage() {
    const [schedules, setSchedules] = useState([]);
    const [classGroups, setClassGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newSchedule, setNewSchedule] = useState({
        classGroupId: '',
        teacherId: '',
        subjectId: '',
        dayOfWeek: 'MONDAY',
        startTime: '08:00',
        endTime: '08:45',
        room: '',
        lessonNumber: 1,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [schedulesRes, classGroupsRes, teachersRes, subjectsRes] = await Promise.all([
                scheduleAPI.getMySchedule(),
                adminAPI.getAllClassGroups(),
                adminAPI.getAllTeachers(),
                adminAPI.getAllSubjects(),
            ]);
            setSchedules(schedulesRes.data);
            setClassGroups(classGroupsRes.data);
            setTeachers(teachersRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            await scheduleAPI.createSchedule({
                classGroupId: parseInt(newSchedule.classGroupId),
                teacherId: parseInt(newSchedule.teacherId),
                subjectId: parseInt(newSchedule.subjectId),
                dayOfWeek: newSchedule.dayOfWeek,
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime,
                room: newSchedule.room,
                lessonNumber: parseInt(newSchedule.lessonNumber),
            });

            setShowModal(false);
            loadData();
            alert('Schedule created successfully!');
        } catch (error) {
            console.error('Error creating schedule:', error);
            alert(error.response?.data?.message || 'Error creating schedule');
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule entry?')) {
            try {
                await scheduleAPI.deleteSchedule(id);
                loadData();
            } catch (error) {
                console.error('Error deleting schedule:', error);
            }
        }
    };

    const handleAutoGenerate = async () => {
        try {
            // Simple auto-generation for demonstration
            const mappings = teachers.map(teacher => ({
                teacherId: teacher.id,
                subjectId: subjects.find(s => teacher.subjects.includes(s.name))?.id || subjects[0]?.id,
                classGroupIds: classGroups.map(c => c.id),
            })).filter(m => m.subjectId);

            await scheduleAPI.generateSchedule({
                classGroupIds: classGroups.map(c => c.id),
                teacherSubjectMappings: mappings,
                dayStartTime: '08:00',
                dayEndTime: '15:00',
                lessonDurationMinutes: 45,
                breakDurationMinutes: 15,
            });

            setShowGenerateModal(false);
            loadData();
            alert('Schedule generated successfully!');
        } catch (error) {
            console.error('Error generating schedule:', error);
            alert('Error generating schedule');
        }
    };

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

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
                    <h1 className="page-title">Manage Schedule</h1>
                    <p className="page-subtitle">Create and manage class schedules</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowGenerateModal(true)}>
                        ⚡ Auto-Generate
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + Add Entry
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Schedule Entries ({schedules.length})</h2>
                </div>

                {schedules.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Room</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules
                                    .sort((a, b) => days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime))
                                    .map(schedule => (
                                        <tr key={schedule.id}>
                                            <td>{schedule.dayOfWeek}</td>
                                            <td>{schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}</td>
                                            <td>{schedule.classGroupName}</td>
                                            <td>{schedule.subjectName}</td>
                                            <td>{schedule.teacherName}</td>
                                            <td>{schedule.room || '-'}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <p>No schedule entries yet</p>
                        <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
                            Create First Entry
                        </button>
                    </div>
                )}
            </div>

            {/* Add Schedule Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Schedule Entry</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateSchedule}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Class</label>
                                    <select
                                        className="form-select"
                                        value={newSchedule.classGroupId}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, classGroupId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select class...</option>
                                        {classGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Teacher</label>
                                    <select
                                        className="form-select"
                                        value={newSchedule.teacherId}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, teacherId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select teacher...</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} ({teacher.subjects.join(', ')})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Subject</label>
                                    <select
                                        className="form-select"
                                        value={newSchedule.subjectId}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, subjectId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select subject...</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Day of Week</label>
                                    <select
                                        className="form-select"
                                        value={newSchedule.dayOfWeek}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
                                    >
                                        {days.map(day => (
                                            <option key={day} value={day}>
                                                {day.charAt(0) + day.slice(1).toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Start Time</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={newSchedule.startTime}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">End Time</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={newSchedule.endTime}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Room (optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newSchedule.room}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                                        placeholder="E.g., Room 101"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Auto-Generate Modal */}
            {showGenerateModal && (
                <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Auto-Generate Schedule</h3>
                            <button className="modal-close" onClick={() => setShowGenerateModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                This will automatically generate a schedule based on available teachers, subjects, and classes.
                            </p>
                            <p style={{ color: 'var(--warning-500)' }}>
                                ⚠️ Warning: This will add new schedule entries. Existing entries will not be deleted.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowGenerateModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleAutoGenerate}>
                                Generate Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
