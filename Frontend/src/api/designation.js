import api from './axios'
export const getDesignations = () => api.get('/api/designation')
export const createDesignation = (data) => api.post('/api/designation', data)
export const updateDesignation = (id, data) => api.put(`/api/designation/${id}`, data)
export const deleteDesignation = (id) => api.delete(`/api/designation/${id}`)
