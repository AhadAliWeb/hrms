import api from './axios'
export const getLeaveBalances = () => api.get('/api/leavebalance')
export const getLeaveBalanceByEmployee = (employeeId, year) => api.get(`/api/leavebalance/employee/${employeeId}/year/${year}`)
export const createLeaveBalance = (data) => api.post('/api/leavebalance', data)
