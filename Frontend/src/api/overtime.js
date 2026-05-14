import api from './axios'
export const getOvertime = () => api.get('/api/overtime')
export const getOvertimeByEmployee = (employeeId) => api.get(`/api/overtime/employee/${employeeId}`)
export const createOvertime = (data) => api.post('/api/overtime', data)
export const approveOvertime = (id) => api.put(`/api/overtime/${id}/approve`)
export const rejectOvertime = (id) => api.put(`/api/overtime/${id}/reject`)
export const deleteOvertime = (id) => api.delete(`/api/overtime/${id}`)
