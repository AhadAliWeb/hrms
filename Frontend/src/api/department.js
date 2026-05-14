import api from './axios'
export const getDepartments = () => api.get('/api/department')
export const createDepartment = (data) => api.post('/api/department', data)
export const updateDepartment = (id, data) => api.put(`/api/department/${id}`, data)
export const deleteDepartment = (id) => api.delete(`/api/department/${id}`)
