import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    registerInitial: (data) => api.post('/auth/register/initial', data),
};

// Schedule API
export const scheduleAPI = {
    getMySchedule: () => api.get('/schedule/week'),
    getClassSchedule: (classGroupId) => api.get(`/schedule/class/${classGroupId}`),
    getTeacherSchedule: (teacherId) => api.get(`/schedule/teacher/${teacherId}`),
    createSchedule: (data) => api.post('/schedule', data),
    generateSchedule: (data) => api.post('/schedule/generate', data),
    deleteSchedule: (id) => api.delete(`/schedule/${id}`),
};

// Attendance API
export const attendanceAPI = {
    getMyAttendance: () => api.get('/attendance'),
    getMyAttendanceByRange: (startDate, endDate) =>
        api.get(`/attendance/range?startDate=${startDate}&endDate=${endDate}`),
    getMyStats: () => api.get('/attendance/stats'),
    getStudentAttendance: (studentId) => api.get(`/attendance/student/${studentId}`),
    markAttendance: (data) => api.post('/attendance', data),
    getScheduleAttendance: (scheduleId, date) =>
        api.get(`/attendance/schedule/${scheduleId}?date=${date}`),
};

// Grades API
export const gradesAPI = {
    getMyGrades: () => api.get('/grades'),
    getMyGradesBySubject: (subjectId) => api.get(`/grades/subject/${subjectId}`),
    getMyAverages: () => api.get('/grades/averages'),
    getStudentGrades: (studentId) => api.get(`/grades/student/${studentId}`),
    createGrade: (data) => api.post('/grades', data),
    deleteGrade: (id) => api.delete(`/grades/${id}`),
};

// Announcements API
export const announcementsAPI = {
    getMyAnnouncements: () => api.get('/announcements'),
    getAllAnnouncements: () => api.get('/announcements/all'),
    createAnnouncement: (data) => api.post('/announcements', data),
    deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
};

// Admin API
export const adminAPI = {
    getAllUsers: () => api.get('/admin/users'),
    getAllStudents: () => api.get('/admin/students'),
    getStudentsByClass: (classGroupId) => api.get(`/admin/students/class/${classGroupId}`),
    getUnassignedStudents: () => api.get('/admin/students/unassigned'),
    updateStudentClass: (studentId, classGroupId) => api.put(`/admin/students/${studentId}/class`, { classGroupId }),
    bulkAssignStudents: (studentIds, classGroupId) => api.put('/admin/students/bulk-assign', { studentIds, classGroupId }),

    getAllTeachers: () => api.get('/admin/teachers'),
    updateTeacherSubjects: (teacherId, subjectIds) => api.put(`/admin/teachers/${teacherId}/subjects`, { subjectIds }),

    getAllClassGroups: () => api.get('/admin/class-groups'),
    createClassGroup: (data) => api.post('/admin/class-groups', data),
    updateClassGroup: (id, data) => api.put(`/admin/class-groups/${id}`, data),
    deleteClassGroup: (id) => api.delete(`/admin/class-groups/${id}`),

    getAllSubjects: () => api.get('/admin/subjects'),
    createSubject: (data) => api.post('/admin/subjects', data),
    updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
    deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
};

export default api;
