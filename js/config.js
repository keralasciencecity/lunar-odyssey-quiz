// Configuration for the Moon Day Quiz
const CONFIG = {
  // Enter your deployed Google Apps Script URL here:
  // e.g. "https://script.google.com/macros/s/.../exec"
  GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/AKfycbw6u4mpbU2Sb5kfx2Gx4X4WNFvMuU2ZHavD73nbzI6tKqQH5bh1RLONJvSMWfcy9J5U/exec", 

  QUIZ_DURATION_SECONDS: 120, // 2 minutes
  
  EVENT_TITLE: "Moon Day Quiz - 2026",
  ORGANIZERS: [
    {
      name: "Science City Kottayam",
      role: "Organizer"
    },
    {
      name: "Aastro Kerala, Kottayam Chapter",
      role: "Co-organizer"
    }
  ],

  // Debug settings: set to true to bypass form validation or print console logs
  DEBUG_MODE: false
};

window.QUIZ_CONFIG = CONFIG;
