import api from './axios'
export const getLeaveTypes = () => api.get('/api/leavetype')
export const createLeaveType = (data) => api.post('/api/leavetype', data)
export const updateLeaveType = (id, data) => api.put(`/api/leavetype/${id}`, data)
export const deleteLeaveType = (id) => api.delete(`/api/leavetype/${id}`)
