import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">StaySimple</Link>
      <nav className="nav-links">
        <Link to="/">Properties</Link>
        {user?.role === 'host' && <Link to="/my-properties">My Properties</Link>}
        {user?.role === 'host' && <Link to="/add-property">Add Property</Link>}
        {user?.role === 'guest' && <Link to="/bookings">My Bookings</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && <span className="nav-user">{user.name} ({user.role})</span>}
        {user && <button className="small-button" onClick={handleLogout}>Logout</button>}
      </nav>
    </header>
  )
}
