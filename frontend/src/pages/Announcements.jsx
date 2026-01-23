import { useState, useEffect } from 'react';
import { announcementsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        important: false,
        targetRole: '',
    });

    const { isTeacher, isAdmin } = useAuth();

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const response = await announcementsAPI.getMyAnnouncements();
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Error loading announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...newAnnouncement,
                targetRole: newAnnouncement.targetRole || null,
            };
            await announcementsAPI.createAnnouncement(data);
            setShowModal(false);
            setNewAnnouncement({ title: '', content: '', important: false, targetRole: '' });
            loadAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await announcementsAPI.deleteAnnouncement(id);
                loadAnnouncements();
            } catch (error) {
                console.error('Error deleting announcement:', error);
            }
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
                    <h1 className="page-title">Announcements</h1>
                    <p className="page-subtitle">Stay updated with the latest news</p>
                </div>
                {(isTeacher || isAdmin) && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + New Announcement
                    </button>
                )}
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
                                    {announcement.targetRole && ` • For ${announcement.targetRole}s`}
                                    {announcement.targetClassGroupName && ` • ${announcement.targetClassGroupName}`}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {announcement.important && (
                                    <span className="badge badge-warning">Important</span>
                                )}
                                {(isTeacher || isAdmin) && (
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="announcement-content">{announcement.content}</div>
                    </div>
                ))
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p>No announcements yet</p>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Create Announcement</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateAnnouncement}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Content</label>
                                    <textarea
                                        className="form-input"
                                        rows="5"
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Audience</label>
                                    <select
                                        className="form-select"
                                        value={newAnnouncement.targetRole}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })}
                                    >
                                        <option value="">Everyone</option>
                                        <option value="STUDENT">Students Only</option>
                                        <option value="TEACHER">Teachers Only</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={newAnnouncement.important}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, important: e.target.checked })}
                                        />
                                        Mark as Important
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
