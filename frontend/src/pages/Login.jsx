import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveLogin } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      saveLogin(result)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="form-panel">
      <h1>Login</h1>
      <p>Log in to continue to StaySimple.</p>
      {error && <p className="message error">{error}</p>}
      <form onSubmit={handleSubmit} className="stack-form">
        <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p>Do not have an account? <Link to="/register">Register here</Link>.</p>
    </section>
  )
}
