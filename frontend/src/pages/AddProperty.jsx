import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../api.js'

const emptyForm = {
  title: '',
  description: '',
  location: '',
  price_per_night: '',
  amenities: '',
  image_url: '',
}

export default function AddProperty() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(isEditing)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isEditing) return
    async function loadProperty() {
      try {
        const property = await apiRequest(`/properties/${id}`)
        setForm({
          title: property.title,
          description: property.description,
          location: property.location,
          price_per_night: String(property.price_per_night),
          amenities: (property.amenities || []).join(', '),
          image_url: property.image_url || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setPageLoading(false)
      }
    }
    loadProperty()
  }, [id, isEditing])

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const payload = {
      ...form,
      price_per_night: Number(form.price_per_night),
      amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
    }
    try {
      if (isEditing) {
        await apiRequest(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiRequest('/properties', { method: 'POST', body: JSON.stringify(payload) })
      }
      navigate('/my-properties')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return <p>Loading property details...</p>

  return (
    <section className="form-panel wide-form">
      <h1>{isEditing ? 'Edit Property' : 'Add a Property'}</h1>
      <p>Fill in the information guests will see.</p>
      {error && <p className="message error">{error}</p>}
      <form className="stack-form" onSubmit={handleSubmit}>
        <label>Property title<input name="title" value={form.title} onChange={updateField} minLength="3" maxLength="100" required /></label>
        <label>Description<textarea name="description" value={form.description} onChange={updateField} minLength="10" maxLength="1500" rows="4" required /></label>
        <label>Location<input name="location" value={form.location} onChange={updateField} required placeholder="Example: Ahmedabad" /></label>
        <label>Price per night (₹)<input name="price_per_night" type="number" min="1" step="0.01" value={form.price_per_night} onChange={updateField} required /></label>
        <label>Amenities (separate with commas)<input name="amenities" value={form.amenities} onChange={updateField} placeholder="Wi-Fi, Kitchen, Parking" /></label>
        <label>Image URL (optional)<input name="image_url" type="url" value={form.image_url} onChange={updateField} placeholder="https://example.com/property.jpg" /></label>
        <div className="button-row">
          <button disabled={loading}>{loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Property')}</button>
          <Link className="button-link secondary-link" to="/my-properties">Cancel</Link>
        </div>
      </form>
    </section>
  )
}
