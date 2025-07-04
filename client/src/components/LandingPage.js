import React from 'react';
import { gapi } from 'gapi-script';
import './LandingPage.css';

const CLIENT_ID = '1025583778510-nhiumsp7ohboveaj8lcbqmstfopup17q.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAWhQF4XMLansrLQRNk3Cx0kwQALO2Rnf8';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

const LandingPage = ({ onSignIn, navigateTo, isSignedIn }) => {
  const handleSignIn = () => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: [DISCOVERY_DOC],
      }).then(() => {
        gapi.auth2.getAuthInstance().signIn().then(() => {
          onSignIn();
        });
      });
    });
  };

  return (
    <div className="landing-container">
      <div className="welcome-section">
        <h2 className="welcome-title">Welcome to Event Management App</h2>
        <p className="welcome-description">
          A powerful tool to manage your events using Google Sheets and Google Calendar.
          Organize, track, and manage all your events in one place with our intuitive interface.
        </p>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">📋</div>
            <h3>Google Sheets Integration</h3>
            <p>View and manage events stored in Google Sheets</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📅</div>
            <h3>Google Calendar Integration</h3>
            <p>Create, view, and manage events in your Google Calendar</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔄</div>
            <h3>Real-time Updates</h3>
            <p>Changes are reflected immediately across all platforms</p>
          </div>
        </div>
        
        <button className="sign-in-button" onClick={handleSignIn}>
          <span className="button-icon">G</span>
          <span className="button-text">Sign in with Google</span>
          <span className="button-glow"></span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;