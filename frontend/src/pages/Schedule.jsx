import { useState, useEffect } from 'react';
import { scheduleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Schedule() {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isStudent, isTeacher } = useAuth();

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            const response = await scheduleAPI.getMySchedule();
            setSchedule(response.data);
        } catch (error) {
            console.error('Error loading schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    const getScheduleForDay = (day) => {
        return schedule
            .filter(s => s.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const formatTime = (time) => {
        return time.substring(0, 5);
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
                <h1 className="page-title">Weekly Schedule</h1>
                <p className="page-subtitle">Your classes for the week</p>
            </div>

            <div className="schedule-grid">
                {days.map(day => (
                    <div key={day} className="schedule-day">
                        <div className="schedule-day-header">
                            {day.charAt(0) + day.slice(1).toLowerCase()}
                        </div>
                        {getScheduleForDay(day).length > 0 ? (
                            getScheduleForDay(day).map(item => (
                                <div key={item.id} className="schedule-item">
                                    <div className="schedule-time">
                                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
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
                            <div className="empty-state" style={{ padding: '1rem' }}>
                                <p style={{ fontSize: '0.85rem' }}>No classes</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
