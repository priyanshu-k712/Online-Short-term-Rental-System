import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api.js'

export default function MyProperties() {
  const [properties, setProperties] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadProperties() {
    setLoading(true)
    setError('')
    try {
      setProperties(await apiRequest('/properties/mine'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProperties() }, [])

  async function deleteProperty(propertyId) {
    const confirmed = window.confirm('Are you sure you want to delete this property?')
    if (!confirmed) return
    setError('')
    setMessage('')
    try {
      await apiRequest(`/properties/${propertyId}`, { method: 'DELETE' })
      setMessage('Property deleted.')
      await loadProperties()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="page-heading row-heading">
        <div><h1>My Properties</h1><p>Manage the properties you have listed.</p></div>
        <Link className="button-link" to="/add-property">Add Property</Link>
      </div>
      {error && <p className="message error">{error}</p>}
      {message && <p className="message success">{message}</p>}
      {loading && <p>Loading your properties...</p>}
      {!loading && properties.length === 0 && <section className="panel"><p>You have not added a property yet.</p><Link to="/add-property">Add your first property</Link></section>}
      <section className="property-grid">
        {properties.map((property) => (
          <article className="property-card" key={property.id}>
            {property.image_url ? <img className="property-image" src={property.image_url} alt={property.title} onError={(e) => { e.currentTarget.style.display = 'none' }} /> : <div className="image-placeholder">No image added</div>}
            <div className="card-content">
              <h2>{property.title}</h2>
              <p>{property.location}</p>
              <p className="price">₹{Number(property.price_per_night).toLocaleString('en-IN')} / night</p>
              <div className="button-row">
                <Link className="button-link" to={`/my-properties/${property.id}/edit`}>Edit</Link>
                <button className="danger-button" onClick={() => deleteProperty(property.id)}>Delete</button>
                <Link className="text-link" to={`/properties/${property.id}`}>View</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
