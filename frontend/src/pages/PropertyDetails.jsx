import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

function todayText() {
  const today = new Date()
  const offset = today.getTimezoneOffset()
  return new Date(today.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export default function PropertyDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    async function loadProperty() {
      setLoading(true)
      setError('')
      try {
        const data = await apiRequest(`/properties/${id}`)
        setProperty(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProperty()
  }, [id])

  const nights = checkIn && checkOut && checkOut > checkIn
    ? Math.round((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000)
    : 0
  const estimatedTotal = property && nights > 0 ? nights * Number(property.price_per_night) : 0

  async function makeBooking(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBookingLoading(true)
    try {
      const result = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({ property_id: id, check_in: checkIn, check_out: checkOut }),
      })
      setMessage(`Booking confirmed. Reference: ${result.id.slice(-8)}. Total: ₹${Number(result.total_price).toLocaleString('en-IN')}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <p>Loading property...</p>
  if (error && !property) return <section className="panel"><p className="message error">{error}</p><Link to="/">Back to properties</Link></section>
  if (!property) return null

  return (
    <section className="details-layout">
      <div className="panel">
        {property.image_url && <img className="details-image" src={property.image_url} alt={property.title} onError={(e) => { e.currentTarget.style.display = 'none' }} />}
        <h1>{property.title}</h1>
        <p><strong>Location:</strong> {property.location}</p>
        <p><strong>Host:</strong> {property.host_name}</p>
        <p>{property.description}</p>
        <p><strong>Price:</strong> ₹{Number(property.price_per_night).toLocaleString('en-IN')} per night</p>
        <h3>Amenities</h3>
        {property.amenities?.length ? <ul>{property.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}</ul> : <p>No amenities added.</p>}
        <Link to="/">Back to properties</Link>
      </div>

      <aside className="panel booking-panel">
        <h2>Book this property</h2>
        {user?.role === 'guest' && (
          <form className="stack-form" onSubmit={makeBooking}>
            <label>Check-in<input type="date" min={todayText()} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required /></label>
            <label>Check-out<input type="date" min={checkIn || todayText()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required /></label>
            <p>Nights: {nights}</p>
            <p><strong>Estimated total: ₹{estimatedTotal.toLocaleString('en-IN')}</strong></p>
            <p className="small-text">This demonstration does not collect payment.</p>
            <button disabled={bookingLoading}>{bookingLoading ? 'Booking...' : 'Confirm booking'}</button>
          </form>
        )}
        {!user && <p>Please <Link to="/login">log in</Link> with a guest account to make a booking.</p>}
        {user?.role === 'host' && <p>Host accounts can manage listings. Log in with a guest account to make a booking.</p>}
        {error && <p className="message error">{error}</p>}
        {message && <p className="message success">{message} <Link to="/bookings">View bookings</Link></p>}
      </aside>
    </section>
  )
}
