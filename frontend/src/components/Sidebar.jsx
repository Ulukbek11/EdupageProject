import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const studentLinks = [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/schedule', icon: '📅', label: 'Schedule' },
        { to: '/attendance', icon: '✓', label: 'Attendance' },
        { to: '/grades', icon: '📝', label: 'Grades' },
        { to: '/announcements', icon: '📢', label: 'Announcements' },
    ];

    const teacherLinks = [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/schedule', icon: '📅', label: 'My Schedule' },
        { to: '/attendance/manage', icon: '✓', label: 'Mark Attendance' },
        { to: '/grades/manage', icon: '📝', label: 'Manage Grades' },
        { to: '/announcements', icon: '📢', label: 'Announcements' },
    ];

    const adminLinks = [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/classes', icon: '🏫', label: 'Classes & Students' },
        { to: '/subjects', icon: '📚', label: 'Subjects' },
        { to: '/schedule/manage', icon: '📅', label: 'Manage Schedule' },
        { to: '/users', icon: '👥', label: 'Users' },
        { to: '/announcements', icon: '📢', label: 'Announcements' },
    ];

    const getLinks = () => {
        switch (user?.role) {
            case 'STUDENT': return studentLinks;
            case 'TEACHER': return teacherLinks;
            case 'ADMIN': return adminLinks;
            default: return [];
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">📚</div>
                <h1>Edupage</h1>
            </div>

            <nav className="sidebar-nav">
                {getLinks().map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="sidebar-link-icon">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-user-info">
                    <div className="sidebar-user-avatar">
                        {getInitials(user?.firstName, user?.lastName)}
                    </div>
                    <div className="sidebar-user-details">
                        <div className="sidebar-user-name">
                            {user?.firstName} {user?.lastName}
                        </div>
                        <div className="sidebar-user-role">{user?.role?.toLowerCase()}</div>
                    </div>
                </div>
                <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}
