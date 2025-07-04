import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import './GoogleCalendar.css';

const CLIENT_ID = '1025583778510-nhiumsp7ohboveaj8lcbqmstfopup17q.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAWhQF4XMLansrLQRNk3Cx0kwQALO2Rnf8';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

const GoogleCalendar = ({ onBack }) => {
    const [signedIn, setSignedIn] = useState(false);
    const [events, setEvents] = useState([]);
    const [form, setForm] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [gapiInitialized, setGapiInitialized] = useState(false);

    useEffect(() => {
        function start() {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                scope: SCOPES,
                discoveryDocs: [DISCOVERY_DOC],
            }).then(() => {
                // Set gapiInitialized to true when the API is fully loaded
                setGapiInitialized(true);

                // Listen for sign-in state changes
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

                // Handle the initial sign-in state
                updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            }).catch(error => {
                console.error('Error initializing GAPI client', error);
                setError('Failed to initialize Google API. Please try again later.');
            });
        }

        // Load the API client and auth2 library
        gapi.load('client:auth2', start);
    }, []);

    // Update UI based on sign-in status changes
    const updateSignInStatus = (isSignedIn) => {
        setSignedIn(isSignedIn);
        if (isSignedIn) {
            listEvents();
        }
    };

    const signIn = () => {
        gapi.auth2.getAuthInstance().signIn().then(
            () => {
                console.log('Sign-in successful');
                // No need to call updateSignInStatus here as the listener will handle it
            },
            (error) => {
                console.error('Error signing in', error);
                setError(`Failed to sign in: ${error.error || error.details || 'Unknown error'}`);
            }
        );
    };

    const signOut = () => gapi.auth2.getAuthInstance().signOut();

    const listEvents = async () => {
        if (!gapiInitialized) {
            setError('');
            return;
        }

        try {
            const response = await gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            setEvents(response.result.items);
        } catch (err) {
            console.error('Error listing events:', err);
            setError(`Failed to list events: ${err.message}`);
        }
    };

    const createEvent = async (e) => {
        e.preventDefault();
        setError('');

        // Check if Google API is initialized
        if (!gapiInitialized) {
            setError('Google API is not initialized yet. Please try again.');
            return;
        }

        try {
            // Validate time format
            if (!form.startTime.match(/^\d{2}:\d{2}$/) || !form.endTime.match(/^\d{2}:\d{2}$/)) {
                setError('Please enter time in HH:MM format (e.g., 14:30)');
                return;
            }

            // Make sure date is valid
            if (!form.date) {
                setError('Please enter a valid date');
                return;
            }

            // Create valid date objects
            const startDateTime = new Date(`${form.date}T${form.startTime}:00`);
            const endDateTime = new Date(`${form.date}T${form.endTime}:00`);

            // Check if dates are valid
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                setError('Invalid date or time format');
                return;
            }

            // Check if end time is after start time
            if (endDateTime <= startDateTime) {
                setError('End time must be after start time');
                return;
            }

            const event = {
                summary: form.title,
                description: form.description,
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'Asia/Karachi',
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'Asia/Karachi',
                },
            };

            await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            listEvents();
            alert('✅ Event created successfully! Check your Google Calendar.');

            // Clear form
            setForm({
                title: '',
                date: '',
                startTime: '',
                endTime: '',
                description: '',
            });
        } catch (err) {
            console.error('Error creating event:', err);
            setError(`Failed to create event: ${err.message}`);
        }
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h2 className="section-title">📅 Google Calendar</h2>
                {signedIn && (
                    <div className="calendar-actions">
                        <button className="refresh-btn" onClick={listEvents}>
                            <span className="btn-icon">🔄</span> Refresh
                        </button>
                        <button className="back-btn" onClick={onBack}>
                            <span className="btn-icon">⬅️</span> Back
                        </button>
                    </div>
                )}
            </div>

            {!signedIn ? (
                <div className="sign-in-container">
                    <p>Sign in to access your Google Calendar</p>
                    <button className="google-sign-in-btn" onClick={signIn}>
                        <span className="google-icon">G</span>
                        Sign in with Google
                    </button>
                </div>
            ) : (
                <div className="calendar-content">
                    <button className="sign-out-btn" onClick={signOut}>
                        <span className="btn-icon">🚪</span> Sign Out
                    </button>

                    <div className="calendar-form-container">
                        <h3 className="form-title">Create Event</h3>
                        {error && <p className="error-message">{error}</p>}

                        <form onSubmit={createEvent} className="calendar-form">
                            <div className="form-group">
                                <label htmlFor="event-title">Title</label>
                                <input
                                    id="event-title"
                                    placeholder="Enter event title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="event-date">Date</label>
                                <input
                                    id="event-date"
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label htmlFor="event-start-time">Start Time</label>
                                    <input
                                        id="event-start-time"
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group half">
                                    <label htmlFor="event-end-time">End Time</label>
                                    <input
                                        id="event-end-time"
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="event-description">Description</label>
                                <textarea
                                    id="event-description"
                                    placeholder="Enter event description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="add-event-btn">
                                <span className="btn-icon">➕</span> Add to Google Calendar
                            </button>
                        </form>
                    </div>

                    <div className="upcoming-events">
                        <h4 className="events-title">Upcoming Events</h4>
                        {events.length === 0 ? (
                            <p className="no-events">No upcoming events found</p>
                        ) : (
                            <ul className="events-list">
                                {events.map((e) => (
                                    <li key={e.id} className="event-item">
                                        <div className="event-header">
                                            <span className="event-title">{e.summary}</span>
                                            <span className="event-date">{new Date(e.start.dateTime).toLocaleDateString()}</span>
                                        </div>
                                        <div className="event-time">
                                            {new Date(e.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(e.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {e.description && <p className="event-description">{e.description}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleCalendar;
