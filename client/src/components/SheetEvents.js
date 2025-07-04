    import React, { useEffect, useState } from 'react';
    import './SheetEvents.css';
    import { gapi } from 'gapi-script';

    const SheetEvents = ({ onBack }) => {
        const [events, setEvents] = useState([]);
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(true);
        const [form, setForm] = useState({
            name: '',
            date: '',
            time: '',
            description: ''
        });
        const [showForm, setShowForm] = useState(false);

        const SPREADSHEET_ID = '142ofxNSx4iqQfNmyWqQndI8U5fuIVkI0rmwO4c69xB8';
        const API_KEY = 'AIzaSyAWhQF4XMLansrLQRNk3Cx0kwQALO2Rnf8';
        const RANGE = 'Sheet1!A2:D';

        const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

        const fetchEvents = () => {
            setLoading(true);
            fetch(SHEET_URL)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                .then((data) => {
                    const rows = data.values || [];
                    const formatted = rows.map((row, index) => ({
                        id: index,
                        name: row[0] || 'Unnamed',
                        date: row[1] || 'No date',
                        time: row[2] || 'No time',
                        description: row[3] || 'No description',
                    }));
                    setEvents(formatted);
                    setError(null);
                })
                .catch((err) => {
                    console.error('Error fetching data:', err);
                    setError('Failed to load events. Please try again later.');
                    setEvents([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        useEffect(() => {
            fetchEvents();
        }, []);

        const addEvent = async (e) => {
            e.preventDefault();
            setError(null);

            // Validate form
            if (!form.name || !form.date || !form.time) {
                setError('Please fill in all required fields');
                return;
            }

            try {
                // Prepare the values to append
                const values = [[form.name, form.date, form.time, form.description]];
                
                // Use the Google Sheets API to append the values
                await gapi.client.sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: 'Sheet1!A:D',
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    resource: {
                        values: values
                    }
                });

                // Clear the form
                setForm({
                    name: '',
                    date: '',
                    time: '',
                    description: ''
                });

                // Refresh the events list
                fetchEvents();
                setShowForm(false);
                alert('✅ Event added successfully!');
            } catch (err) {
                console.error('Error adding event:', err);
                setError(`Failed to add event: ${err.message}`);
            }
        };

        const deleteEvent = async (index) => {
            try {
                // Get the actual row number (add 2 because our data starts at A2)
                const rowToDelete = index + 2;

                // Delete the row using the Google Sheets API
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: SPREADSHEET_ID,
                    resource: {
                        requests: [{
                            deleteDimension: {
                                range: {
                                    sheetId: 0, // Assuming it's the first sheet
                                    dimension: 'ROWS',
                                    startIndex: rowToDelete - 1, // 0-based index
                                    endIndex: rowToDelete // exclusive end index
                                }
                            }
                        }]
                    }
                });

                // Refresh the events list
                fetchEvents();
                alert('✅ Event deleted successfully!');
            } catch (err) {
                console.error('Error deleting event:', err);
                setError(`Failed to delete event: ${err.message}`);
            }
        };

        const toggleForm = () => {
            setShowForm(!showForm);
            setError(null);
        };

        return (
            <div className="sheet-events-container">
                <div className="sheet-header">
                    <h2 className="section-title">📋 Google Sheet Events</h2>
                    <div className="sheet-actions">
                        <button className="add-event-btn" onClick={toggleForm}>
                            <span className="btn-icon">{showForm ? '❌' : '➕'}</span> 
                            {showForm ? 'Cancel' : 'Add Event'}
                        </button>
                        <button className="refresh-btn" onClick={fetchEvents}>
                            <span className="btn-icon">🔄</span> Refresh
                        </button>
                        <button className="back-btn" onClick={onBack}>
                            <span className="btn-icon">⬅️</span> Back
                        </button>
                    </div>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                {showForm && (
                    <div className="sheet-form-container">
                        <h3 className="form-title">Add New Event</h3>
                        <form onSubmit={addEvent} className="sheet-form">
                            <div className="form-group">
                                <label htmlFor="event-name">Event Name</label>
                                <input
                                    id="event-name"
                                    placeholder="Enter event name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                            
                            <div className="form-group">
                                <label htmlFor="event-time">Time</label>
                                <input
                                    id="event-time"
                                    type="time"
                                    value={form.time}
                                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="event-description">Description</label>
                                <textarea
                                    id="event-description"
                                    placeholder="Enter event description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                            
                            <button type="submit" className="add-event-btn">
                                <span className="btn-icon">➕</span> Add to Google Sheet
                            </button>
                        </form>
                    </div>
                )}
                
                {loading && <p className="loading-message">Loading events...</p>}
                {!loading && !error && (!events || events.length === 0) && (
                    <p className="no-events-message">No events found.</p>
                )}
                
                {events && events.length > 0 && (
                    <div className="events-table">
                        <div className="table-header">
                            <div className="header-cell">Event Name</div>
                            <div className="header-cell">Date</div>
                            <div className="header-cell">Time</div>
                            <div className="header-cell">Description</div>
                            <div className="header-cell">Actions</div>
                        </div>
                        
                        <div className="events-list">
                            {events.map((event, index) => (
                                <div key={index} className="event-card" style={{"--index": index}}>
                                    <div className="event-cell event-name">{event.name}</div>
                                    <div className="event-cell event-date">{event.date}</div>
                                    <div className="event-cell event-time">{event.time}</div>
                                    <div className="event-cell event-description">{event.description}</div>
                                    <div className="event-cell event-actions">
                                        <button 
                                            className="delete-btn" 
                                            onClick={() => deleteEvent(index)}
                                            title="Delete Event"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default SheetEvents;

