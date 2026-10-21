import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Properties from './pages/Properties.jsx'
import PropertyDetails from './pages/PropertyDetails.jsx'
import MyProperties from './pages/MyProperties.jsx'
import AddProperty from './pages/AddProperty.jsx'
import MyBookings from './pages/MyBookings.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Properties />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/my-properties" element={<ProtectedRoute role="host"><MyProperties /></ProtectedRoute>} />
          <Route path="/add-property" element={<ProtectedRoute role="host"><AddProperty /></ProtectedRoute>} />
          <Route path="/my-properties/:id/edit" element={<ProtectedRoute role="host"><AddProperty /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute role="guest"><MyBookings /></ProtectedRoute>} />
          <Route path="*" element={<section className="panel"><h2>Page not found</h2><p>The page you opened does not exist.</p></section>} />
        </Routes>
      </main>
      <footer className="footer">StaySimple college project · Online Short-Term Property Rental System</footer>
    </>
  )
}
