import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

export default function Properties() {
  const [locationInput, setLocationInput] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [filters, setFilters] = useState({ location: '', max_price: '' })
  const [properties, setProperties] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function loadProperties() {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        if (filters.location) params.set('location', filters.location)
        if (filters.max_price) params.set('max_price', filters.max_price)
        const query = params.toString() ? `?${params.toString()}` : ''
        const data = await apiRequest(`/properties${query}`)
        setProperties(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProperties()
  }, [filters])

  function search(event) {
    event.preventDefault()
    setFilters({ location: locationInput.trim(), max_price: priceInput.trim() })
  }

  return (
    <>
      <section className="page-heading">
        <h1>Find a place to stay</h1>
        <p>Simple short-term property listings for your next stay.</p>
      </section>

      <section className="panel">
        <form className="search-form" onSubmit={search}>
          <label>Location<input value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder="Example: Ahmedabad" /></label>
          <label>Maximum price per night (₹)<input type="number" min="1" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} placeholder="Example: 3000" /></label>
          <button type="submit">Search</button>
          <button type="button" className="secondary-button" onClick={() => { setLocationInput(''); setPriceInput(''); setFilters({ location: '', max_price: '' }) }}>Clear</button>
        </form>
      </section>

      {user?.role === 'host' && <p className="notice">You are signed in as a host. <Link to="/add-property">Add a property listing</Link>.</p>}
      {loading && <p>Loading properties...</p>}
      {error && <p className="message error">{error}</p>}
      {!loading && !error && properties.length === 0 && <section className="panel"><p>No properties found. Try another location or clear the filters.</p></section>}

      <section className="property-grid">
        {properties.map((property) => (
          <article className="property-card" key={property.id}>
            {property.image_url ? (
              <img className="property-image" src={property.image_url} alt={property.title} onError={(e) => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <div className="image-placeholder">No image added</div>
            )}
            <div className="card-content">
              <h2>{property.title}</h2>
              <p><strong>Location:</strong> {property.location}</p>
              <p><strong>Host:</strong> {property.host_name}</p>
              <p className="price">₹{Number(property.price_per_night).toLocaleString('en-IN')} / night</p>
              <Link className="text-link" to={`/properties/${property.id}`}>View details</Link>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
