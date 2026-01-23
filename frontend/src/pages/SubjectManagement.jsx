import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function SubjectManagement() {
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', hoursPerWeek: 2 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await adminAPI.getAllSubjects();
            setSubjects(response.data);
        } catch (error) {
            console.error('Error loading subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await adminAPI.updateSubject(formData.id, formData);
            } else {
                await adminAPI.createSubject(formData);
            }
            setShowModal(false);
            setFormData({ name: '', description: '', hoursPerWeek: 2 });
            loadSubjects();
        } catch (error) {
            console.error('Error saving subject:', error);
            if (error.response?.status === 409) {
                alert('A subject with this name already exists!');
            } else {
                alert('Error saving subject');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await adminAPI.deleteSubject(id);
                loadSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Subject Management</h1>
                    <p className="page-subtitle">Manage curriculum subjects</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setFormData({ name: '', description: '', hoursPerWeek: 2 });
                    setShowModal(true);
                }}>
                    + New Subject
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : subjects.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Subject Name</th>
                                    <th>Hours/Week</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(subject => (
                                    <tr key={subject.id}>
                                        <td><strong>{subject.name}</strong></td>
                                        <td>{subject.hoursPerWeek}</td>
                                        <td>{subject.description}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => {
                                                        setFormData(subject);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(subject.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📚</div>
                            <p>No subjects defined yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{formData.id ? 'Edit Subject' : 'New Subject'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Subject Name</label>
                                    <input
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Mathematics"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hours Per Week</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.hoursPerWeek}
                                        onChange={e => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
                                        required
                                        min="1"
                                        max="40"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the subject..."
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
        </div>
    );
}
