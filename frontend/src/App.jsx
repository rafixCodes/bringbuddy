import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

const emptyTripForm = {
  departureCity: '',
  departureCountry: '',
  destinationCity: '',
  destinationCountry: '',
  travelDate: '',
  luggageCapacityKg: '',
  pricePerKg: '',
  allowedCategories: '',
  status: 'draft'
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const [user, setUser] = useState(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    profilePhoto: ''
  })

  const [profileMessage, setProfileMessage] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [trips, setTrips] = useState([])
  const [tripsLoading, setTripsLoading] = useState(false)
  const [tripMessage, setTripMessage] = useState('')

  const [showTripModal, setShowTripModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [savingTrip, setSavingTrip] = useState(false)
  const [tripForm, setTripForm] = useState(emptyTripForm)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true)

        // Temporary login for feature testing.
        // Replace this with the team's authentication token after merge.
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'Omor@gmail.com',
            password: '123456'
          })
        })

        const loginData = await loginResponse.json()

        if (!loginResponse.ok) {
          throw new Error(loginData.message || 'Login failed')
        }

        const authToken = loginData.token
        setToken(authToken)

        const profileResponse = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        })

        const profileData = await profileResponse.json()

        if (!profileResponse.ok) {
          throw new Error(
            profileData.message || 'Failed to load profile'
          )
        }

        setUser(profileData.user)

        setProfileForm({
          name: profileData.user.name || '',
          phone: profileData.user.phone || '',
          profilePhoto: profileData.user.profilePhoto || ''
        })

        await loadTrips(authToken)
      } catch (error) {
        console.error('Application loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  const loadTrips = async (authToken = token) => {
    if (!authToken) return

    try {
      setTripsLoading(true)

      const response = await fetch(`${API_URL}/trips`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load trips')
      }

      setTrips(data.trips || [])
    } catch (error) {
      console.error(error)
      setTripMessage(error.message)
    } finally {
      setTripsLoading(false)
    }
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target

    setProfileForm((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const handleProfileUpdate = async (event) => {
    event.preventDefault()

    try {
      setSavingProfile(true)
      setProfileMessage('')

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update profile'
        )
      }

      setUser(data.user)
      setProfileMessage('Profile updated successfully!')
    } catch (error) {
      setProfileMessage(error.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleTripChange = (event) => {
    const { name, value } = event.target

    setTripForm((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const openCreateTripModal = () => {
    setEditingTrip(null)
    setTripMessage('')
    setTripForm(emptyTripForm)
    setShowTripModal(true)
  }

  const openEditTripModal = (trip) => {
    setEditingTrip(trip)
    setTripMessage('')

    setTripForm({
      departureCity: trip.departureCity || '',
      departureCountry: trip.departureCountry || '',
      destinationCity: trip.destinationCity || '',
      destinationCountry: trip.destinationCountry || '',
      travelDate: trip.travelDate
        ? trip.travelDate.substring(0, 10)
        : '',
      luggageCapacityKg: trip.luggageCapacityKg || '',
      pricePerKg: trip.pricePerKg || '',
      allowedCategories:
        trip.allowedCategories?.join(', ') || '',
      status: trip.status || 'draft'
    })

    setShowTripModal(true)
  }

  const closeTripModal = () => {
    if (savingTrip) return

    setShowTripModal(false)
    setEditingTrip(null)
    setTripForm(emptyTripForm)
  }

  const handleTripSubmit = async (event) => {
    event.preventDefault()

    try {
      setSavingTrip(true)
      setTripMessage('')

      const payload = {
        departureCity: tripForm.departureCity,
        departureCountry: tripForm.departureCountry,
        destinationCity: tripForm.destinationCity,
        destinationCountry: tripForm.destinationCountry,
        travelDate: tripForm.travelDate,
        luggageCapacityKg: Number(
          tripForm.luggageCapacityKg
        ),
        pricePerKg: Number(tripForm.pricePerKg),
        allowedCategories: tripForm.allowedCategories
          .split(',')
          .map((category) => category.trim())
          .filter(Boolean),
        status: tripForm.status
      }

      const url = editingTrip
        ? `${API_URL}/trips/${editingTrip._id}`
        : `${API_URL}/trips`

      const response = await fetch(url, {
        method: editingTrip ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${editingTrip ? 'update' : 'create'} trip`
        )
      }

      await loadTrips(token)

      setTripMessage(
        editingTrip
          ? 'Trip updated successfully!'
          : 'Trip created successfully!'
      )

      setShowTripModal(false)
      setEditingTrip(null)
      setTripForm(emptyTripForm)
    } catch (error) {
      setTripMessage(error.message)
    } finally {
      setSavingTrip(false)
    }
  }

  const handleDeleteTrip = async (tripId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this trip?'
    )

    if (!confirmed) return

    try {
      setTripMessage('')

      const response = await fetch(
        `${API_URL}/trips/${tripId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to delete trip'
        )
      }

      setTrips((previous) =>
        previous.filter((trip) => trip._id !== tripId)
      )

      setTripMessage('Trip deleted successfully!')
    } catch (error) {
      setTripMessage(error.message)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Not specified'

    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const displayName = user?.name || 'Traveler'
  const displayRole = user?.role || 'traveler'
  const avatarLetter =
    displayName.charAt(0).toUpperCase() || 'T'

  const completedTrips = trips.filter(
    (trip) => trip.status === 'completed'
  ).length

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="loadingLogo">B</div>
        <h2>Loading BringBuddy...</h2>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon">B</div>

          <div>
            <h2>BringBuddy</h2>
            <span>Travel. Carry. Connect.</span>
          </div>
        </div>

        <nav className="navMenu">
          <button
            className={
              activePage === 'dashboard' ? 'active' : ''
            }
            onClick={() => setActivePage('dashboard')}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activePage === 'profile' ? 'active' : ''
            }
            onClick={() => {
              setActivePage('profile')
              setProfileMessage('')
            }}
          >
            <span>♙</span>
            My Profile
          </button>

          <button
            className={
              activePage === 'trips' ? 'active' : ''
            }
            onClick={() => {
              setActivePage('trips')
              loadTrips()
            }}
          >
            <span>✈</span>
            My Trips
          </button>
        </nav>

        <div className="sidebarFooter">
          <div className="userAvatar">
            {avatarLetter}
          </div>

          <div>
            <strong>{displayName}</strong>
            <p>
              {displayRole.charAt(0).toUpperCase() +
                displayRole.slice(1)}
            </p>
          </div>
        </div>
      </aside>

      <main className="mainContent">
        <header className="topbar">
          <div>
            <h1>
              {activePage === 'dashboard' &&
                `Welcome back, ${displayName} 👋`}

              {activePage === 'profile' && 'My Profile'}

              {activePage === 'trips' && 'My Trips'}
            </h1>

            <p>
              {activePage === 'dashboard' &&
                'Manage your profile and upcoming travel plans.'}

              {activePage === 'profile' &&
                'View and update your personal information.'}

              {activePage === 'trips' &&
                'Create and manage your travel opportunities.'}
            </p>
          </div>

          <div className="topAvatar">
            {avatarLetter}
          </div>
        </header>

        {activePage === 'dashboard' && (
          <>
            <section className="statsGrid">
              <div className="statCard">
                <div className="statIcon">✈</div>

                <div>
                  <p>Total Trips</p>
                  <h2>{trips.length}</h2>
                </div>
              </div>

              <div className="statCard">
                <div className="statIcon">✓</div>

                <div>
                  <p>Completed</p>
                  <h2>{completedTrips}</h2>
                </div>
              </div>

              <div className="statCard">
                <div className="statIcon">★</div>

                <div>
                  <p>Trust Score</p>
                  <h2>
                    {user?.travelerInfo?.trustScore || 0}
                  </h2>
                </div>
              </div>
            </section>

            <section className="dashboardGrid">
              <div className="contentCard">
                <div className="cardHeader">
                  <h2>Quick Actions</h2>
                  <p>Manage your BringBuddy account</p>
                </div>

                <div className="actionGrid">
                  <button
                    onClick={() =>
                      setActivePage('profile')
                    }
                  >
                    <span className="actionIcon">♙</span>

                    <div>
                      <strong>Manage Profile</strong>
                      <p>
                        View and update your information
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setActivePage('trips')
                    }
                  >
                    <span className="actionIcon">✈</span>

                    <div>
                      <strong>Manage Trips</strong>
                      <p>
                        Create, edit and manage your trips
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="contentCard profileSummary">
                <div className="largeAvatar">
                  {avatarLetter}
                </div>

                <h2>{displayName}</h2>

                <span className="roleBadge">
                  {displayRole.charAt(0).toUpperCase() +
                    displayRole.slice(1)}
                </span>

                <p>
                  Ready to carry and connect across the
                  world.
                </p>

                <button
                  onClick={() =>
                    setActivePage('profile')
                  }
                >
                  View Profile
                </button>
              </div>
            </section>
          </>
        )}

        {activePage === 'profile' && (
          <section className="contentCard profilePage">
            <div className="profileHeading">
              <div className="largeAvatar">
                {avatarLetter}
              </div>

              <div>
                <h2>Personal Information</h2>
                <p>
                  Keep your profile information up to date.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate}>
              <div className="formGrid">
                <div className="formGroup">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Email Address</label>

                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>

                <div className="formGroup">
                  <label>Phone Number</label>

                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="formGroup">
                  <label>Role</label>

                  <input
                    type="text"
                    value={
                      displayRole
                        .charAt(0)
                        .toUpperCase() +
                      displayRole.slice(1)
                    }
                    disabled
                  />
                </div>

                <div className="formGroup">
                  <label>Profile Photo URL</label>

                  <input
                    type="text"
                    name="profilePhoto"
                    value={profileForm.profilePhoto}
                    onChange={handleProfileChange}
                    placeholder="Enter profile photo URL"
                  />
                </div>
              </div>

              {profileMessage && (
                <p className="formMessage">
                  {profileMessage}
                </p>
              )}

              <button
                type="submit"
                className="primaryButton"
                disabled={savingProfile}
              >
                {savingProfile
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </form>
          </section>
        )}

        {activePage === 'trips' && (
          <>
            <div className="pageActions">
              <div>
                <h2>Your Travel Plans</h2>
                <p>
                  Create and manage trips available for
                  parcel carrying.
                </p>
              </div>

              <button
                className="primaryButton"
                onClick={openCreateTripModal}
              >
                + Create New Trip
              </button>
            </div>

            {tripMessage && (
              <div className="tripMessage">
                {tripMessage}
              </div>
            )}

            {tripsLoading ? (
              <section className="contentCard emptyTrips">
                <h3>Loading trips...</h3>
              </section>
            ) : trips.length === 0 ? (
              <section className="contentCard emptyTrips">
                <div className="emptyTripIcon">✈</div>
                <h2>No trips yet</h2>
                <p>
                  Create your first travel opportunity and
                  start carrying with BringBuddy.
                </p>

                <button
                  className="primaryButton"
                  onClick={openCreateTripModal}
                >
                  Create Your First Trip
                </button>
              </section>
            ) : (
              <div className="tripsList">
                {trips.map((trip) => (
                  <section
                    className="tripCard"
                    key={trip._id}
                  >
                    <div className="tripTop">
                      <span
                        className={`statusBadge status-${trip.status}`}
                      >
                        {trip.status}
                      </span>

                      <span>
                        {formatDate(trip.travelDate)}
                      </span>
                    </div>

                    <div className="route">
                      <div>
                        <span>FROM</span>
                        <h2>{trip.departureCity}</h2>
                        <p>
                          {trip.departureCountry}
                        </p>
                      </div>

                      <div className="routeLine">
                        <span>✈</span>
                      </div>

                      <div>
                        <span>TO</span>
                        <h2>{trip.destinationCity}</h2>
                        <p>
                          {trip.destinationCountry}
                        </p>
                      </div>
                    </div>

                    <div className="tripDetails">
                      <div>
                        <span>Luggage Capacity</span>
                        <strong>
                          {trip.luggageCapacityKg} kg
                        </strong>
                      </div>

                      <div>
                        <span>Available Space</span>
                        <strong>
                          {trip.remainingCapacityKg} kg
                        </strong>
                      </div>

                      <div>
                        <span>Price per Kg</span>
                        <strong>
                          ${trip.pricePerKg}
                        </strong>
                      </div>
                    </div>

                    {trip.allowedCategories?.length >
                      0 && (
                      <div className="categories">
                        <span className="categoriesLabel">
                          Allowed:
                        </span>

                        {trip.allowedCategories.map(
                          (category) => (
                            <span
                              className="categoryBadge"
                              key={category}
                            >
                              {category}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    <div className="tripActions">
                      <button
                        className="editButton"
                        onClick={() =>
                          openEditTripModal(trip)
                        }
                      >
                        Edit Trip
                      </button>

                      <button
                        className="deleteButton"
                        onClick={() =>
                          handleDeleteTrip(trip._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showTripModal && (
        <div
          className="modalOverlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeTripModal()
            }
          }}
        >
          <div className="tripModal">
            <div className="modalHeader">
              <div>
                <h2>
                  {editingTrip
                    ? 'Edit Trip'
                    : 'Create New Trip'}
                </h2>

                <p>
                  {editingTrip
                    ? 'Update your travel information.'
                    : 'Add your travel details and available luggage capacity.'}
                </p>
              </div>

              <button
                type="button"
                className="closeModalButton"
                onClick={closeTripModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTripSubmit}>
              <div className="formGrid">
                <div className="formGroup">
                  <label>Departure City</label>
                  <input
                    type="text"
                    name="departureCity"
                    value={tripForm.departureCity}
                    onChange={handleTripChange}
                    placeholder="e.g. Dhaka"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Departure Country</label>
                  <input
                    type="text"
                    name="departureCountry"
                    value={
                      tripForm.departureCountry
                    }
                    onChange={handleTripChange}
                    placeholder="e.g. Bangladesh"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Destination City</label>
                  <input
                    type="text"
                    name="destinationCity"
                    value={
                      tripForm.destinationCity
                    }
                    onChange={handleTripChange}
                    placeholder="e.g. London"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Destination Country</label>
                  <input
                    type="text"
                    name="destinationCountry"
                    value={
                      tripForm.destinationCountry
                    }
                    onChange={handleTripChange}
                    placeholder="e.g. United Kingdom"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Travel Date</label>
                  <input
                    type="date"
                    name="travelDate"
                    value={tripForm.travelDate}
                    onChange={handleTripChange}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Luggage Capacity (kg)</label>
                  <input
                    type="number"
                    name="luggageCapacityKg"
                    value={
                      tripForm.luggageCapacityKg
                    }
                    onChange={handleTripChange}
                    min="1"
                    placeholder="20"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Price per Kg ($)</label>
                  <input
                    type="number"
                    name="pricePerKg"
                    value={tripForm.pricePerKg}
                    onChange={handleTripChange}
                    min="0"
                    step="0.01"
                    placeholder="15"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Status</label>

                  <select
                    name="status"
                    value={tripForm.status}
                    onChange={handleTripChange}
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>

                    <option value="full">
                      Full
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                <div className="formGroup fullWidth">
                  <label>
                    Allowed Categories
                  </label>

                  <input
                    type="text"
                    name="allowedCategories"
                    value={
                      tripForm.allowedCategories
                    }
                    onChange={handleTripChange}
                    placeholder="Clothes, Documents, Electronics"
                  />

                  <small>
                    Separate multiple categories with
                    commas.
                  </small>
                </div>
              </div>

              <div className="modalActions">
                <button
                  type="button"
                  className="cancelButton"
                  onClick={closeTripModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primaryButton"
                  disabled={savingTrip}
                >
                  {savingTrip
                    ? 'Saving...'
                    : editingTrip
                      ? 'Update Trip'
                      : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App