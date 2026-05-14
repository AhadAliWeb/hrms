import api from './axios'
export const getEmployees = () => api.get('/api/employee')
export const getEmployee = (id) => api.get(`/api/employee/${id}`)
export const myEmployeeProfile = () => api.get('/api/employee/me')
export const createEmployee = (data) => api.post('/api/employee', data)
export const updateEmployee = (id, data) => api.put(`/api/employee/${id}`, data)
export const deleteEmployee = (id) => api.delete(`/api/employee/${id}`)
export const changeDesignation = (id, newDesignationId) => api.put(`/api/employee/${id}/change-designation/${newDesignationId}`)
