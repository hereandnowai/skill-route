
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Firebase has been removed from the application.
// Gemini API key is expected to be in process.env.API_KEY as per prompt.
// Services will attempt to read process.env.API_KEY directly.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);