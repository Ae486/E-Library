import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Borrowings from './pages/Borrowings'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Feedback from './pages/Feedback'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/borrowings" element={<Borrowings />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
