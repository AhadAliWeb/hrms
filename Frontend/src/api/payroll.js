import api from './axios'
export const getPayroll = () => api.get('/api/payroll')
export const createPayroll = (data) => api.post('/api/payroll', data)
export const updatePayroll = (id, data) => api.put(`/api/payroll/${id}`, data)
export const deletePayroll = (id) => api.delete(`/api/payroll/${id}`)
export const generatePayslip = (employeeId, month, year) =>
  api.get(
    `/api/payroll/generate-payslip?employeeId=${employeeId}&month=${month}&year=${year}`,
    {
      responseType: 'blob'
    }
  )
