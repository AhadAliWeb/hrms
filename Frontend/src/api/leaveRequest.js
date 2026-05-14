import api from './axios'
export const getLeaveRequests = () => api.get('/api/leaverequest')
export const approveLeaveRequest = (id) => api.put(`/api/leaverequest/${id}/approve`)
export const rejectLeaveRequest = (id) => api.put(`/api/leaverequest/${id}/reject`)
export const deleteLeaveRequest = (id) => api.delete(`/api/leaverequest/${id}`)
export const createLeaveRequest = (data) => api.post("/api/leaverequest", data)
export const getLeaveRequestsByEmployee = () => api.get('/api/leaverequest/me')