import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api.js'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadBookings() {
    setLoading(true)
    setError('')
    try {
      setBookings(await apiRequest('/bookings/mine'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBookings() }, [])

  async function cancelBooking(bookingId) {
    const confirmed = window.confirm('Cancel this booking?')
    if (!confirmed) return
    setError('')
    setMessage('')
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, { method: 'PATCH' })
      setMessage('Booking cancelled.')
      await loadBookings()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="page-heading"><h1>My Bookings</h1><p>View your reservations and their status.</p></div>
      {error && <p className="message error">{error}</p>}
      {message && <p className="message success">{message}</p>}
      {loading && <p>Loading bookings...</p>}
      {!loading && bookings.length === 0 && <section className="panel"><p>You have not made a booking yet.</p><Link to="/">Find a property</Link></section>}
      <div className="booking-list">
        {bookings.map((booking) => (
          <article className="panel booking-card" key={booking.id}>
            <div>
              <h2>{booking.property_title}</h2>
              <p>{booking.property_location}</p>
              <p>Check-in: {booking.check_in}</p>
              <p>Check-out: {booking.check_out}</p>
              <p>Nights: {booking.nights}</p>
              <p>Total: <strong>₹{Number(booking.total_price).toLocaleString('en-IN')}</strong></p>
              <p>Status: <strong className={booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled'}>{booking.status}</strong></p>
            </div>
            <div className="booking-actions">
              <Link className="button-link" to={`/properties/${booking.property_id}`}>View property</Link>
              {booking.status === 'confirmed' && <button className="danger-button" onClick={() => cancelBooking(booking.id)}>Cancel booking</button>}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
