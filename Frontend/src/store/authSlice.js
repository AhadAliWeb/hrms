import { createSlice } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'

const getInitialState = () => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = jwtDecode(token)
      return {
        token,
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || '',
        userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.userId || '',
        username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.username || '',
        employeeId: decoded.employeeId || '',
        isAuthenticated: true,
      }
    }
  } catch {}
  return { token: null, role: '', userId: '', username: '', isAuthenticated: false }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    login: (state, action) => {
      const token = action.payload
      try {
        const decoded = jwtDecode(token)
        state.token = token
        state.role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || ''
        state.userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.userId || ''
        state.username = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.username || '',
        state.employeeId = decoded.employeeId || '',
        state.isAuthenticated = true
        localStorage.setItem('token', token)
      } catch (e) {
        console.error('JWT decode error', e)
      }
    },
    logout: (state) => {
      state.token = null
      state.role = ''
      state.userId = ''
      state.username = ''
      state.isAuthenticated = false
      state.employeeId = ''
      localStorage.clear()
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
