import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Announcements from './pages/Announcements';
import AttendanceManage from './pages/AttendanceManage';
import GradesManage from './pages/GradesManage';
import ScheduleManage from './pages/ScheduleManage';
import Users from './pages/Users';
import ClassManagement from './pages/ClassManagement';
import SubjectManagement from './pages/SubjectManagement';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="schedule" element={<Schedule />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="grades" element={<Grades />} />
                        <Route path="announcements" element={<Announcements />} />

                        {/* Teacher routes */}
                        <Route path="attendance/manage" element={
                            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                                <AttendanceManage />
                            </ProtectedRoute>
                        } />
                        <Route path="grades/manage" element={
                            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                                <GradesManage />
                            </ProtectedRoute>
                        } />

                        {/* Admin routes */}
                        <Route path="schedule/manage" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <ScheduleManage />
                            </ProtectedRoute>
                        } />
                        <Route path="users" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <Users />
                            </ProtectedRoute>
                        } />
                        <Route path="classes" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <ClassManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="subjects" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SubjectManagement />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
