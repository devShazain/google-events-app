import React, { useState } from 'react';
import './App.css';
import SheetEvents from './components/SheetEvents';
import GoogleCalendar from './components/GoogleCalendar';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const navigateTo = (view) => {
    setCurrentView(view);
  };

  const renderHome = () => (
    <div className="home-container">
      <div className="app-description">
        <p>Welcome to the Event Management App! This application helps you manage events using Google Sheets and Google Calendar. Create, view, and organize your events all in one place.</p>
      </div>
      
      <div className="cards-container">
        <div className="feature-card sheets-card" onClick={() => navigateTo('sheets')}>
          <div className="card-icon">📋</div>
          <h3>Google Sheets Events</h3>
          <p>View and manage events stored in Google Sheets</p>
          <button className="card-btn">Manage Sheet Events</button>
        </div>
        
        <div className="feature-card calendar-card" onClick={() => navigateTo('calendar')}>
          <div className="card-icon">📅</div>
          <h3>Google Calendar Events</h3>
          <p>Create and view events in your Google Calendar</p>
          <button className="card-btn">Manage Calendar Events</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="app-header">
        <span className="app-icon">📆</span>
        <h1 className="app-title">Event Management App for Google Sheets And Google Calendar</h1>
      </header>
      
      {currentView === 'home' && renderHome()}
      {currentView === 'sheets' && <SheetEvents onBack={() => navigateTo('home')} />}
      {currentView === 'calendar' && <GoogleCalendar onBack={() => navigateTo('home')} />}
    </div>
  );
}

export default App;
