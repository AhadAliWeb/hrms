import api from './axios'
export const getAuditLogs = () => api.get('/api/auditlog')
export const getAuditLogsByUser = (userId) => api.get(`/api/auditlog/user/${userId}`)
