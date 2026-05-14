import api from './axios'
export const getAttendance = () => api.get('/api/attendance')
export const getAttendanceByEmployee = (id) => api.get(`/api/attendance/employee/${id}`)
export const createAttendance = (data) => api.post('/api/attendance', data)
export const updateAttendance = (id, data) => api.put(`/api/attendance/${id}`, data)
export const deleteAttendance = (id) => api.delete(`/api/attendance/${id}`)
