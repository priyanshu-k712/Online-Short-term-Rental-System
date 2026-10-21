import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api.js'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'guest' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSuccess('Account created. You can now log in.')
      setTimeout(() => navigate('/login'), 900)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="form-panel">
      <h1>Create an account</h1>
      <p>Choose whether you want to rent a property or list one.</p>
      {error && <p className="message error">{error}</p>}
      {success && <p className="message success">{success}</p>}
      <form onSubmit={handleSubmit} className="stack-form">
        <label>Full name<input name="name" value={form.name} onChange={updateField} minLength="2" maxLength="80" required /></label>
        <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} required /></label>
        <label>Password (at least 8 characters)<input name="password" type="password" value={form.password} onChange={updateField} minLength="8" required /></label>
        <label>Account type
          <select name="role" value={form.role} onChange={updateField}>
            <option value="guest">Guest - I want to book properties</option>
            <option value="host">Host - I want to list properties</option>
          </select>
        </label>
        <button disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
      </form>
      <p>Already registered? <Link to="/login">Login here</Link>.</p>
    </section>
  )
}
