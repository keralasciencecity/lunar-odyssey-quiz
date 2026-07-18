# Moon Day Online Quiz 2026 🚀🌕

An interactive, moon-themed online speed quiz application developed for **Science City Kottayam** and **Aastro Kerala (Kottayam Chapter)** to celebrate Moon Day (July 20).

## Live Demo & GitHub Pages Deployment

To host this quiz on GitHub Pages:
1. Push this repository to your GitHub account (e.g., `https://github.com/your-username/moonday-quiz`).
2. Go to the repository **Settings** -> **Pages**.
3. Under **Build and deployment**, set the source to **Deploy from a branch** and select the `main` or `master` branch.
4. Click **Save**. Your site will be live at `https://your-username.github.io/moonday-quiz/` in a few minutes!

---

## 📊 Features

1. **Stunning Space Telemetry Theme**: Deep dark backgrounds with glowing celestial colors, an interactive particle starfield, scanline grids, and a retro cockpit feel.
2. **Dual Age Categories**:
   - **Junior Category (15 & Under)**: Focused on basic space facts, Apollo 11 history, and Indian lunar missions (Chandrayaan).
   - **Senior Category (16 & Above)**: Covers advanced astrophysics, orbital mechanics, and detailed history of lunar probes.
3. **Paced Speed Quiz**: Exactly **2 minutes (120 seconds)** to answer as many random questions as possible from a pool of 100 questions.
4. **Anti-Cheat & Tab Disruption Sensor**:
   - Detects tab switching (`visibilitychange`) and browser window defocusing (`blur`).
   - Warns on the first violation.
   - Automatically disqualifies or flags the participant on the second violation.
   - Prevents copy-pasting, text selection, and standard developer tool shortcuts.
5. **Gamified Pilot ID Badge**: Renders a high-resolution Mission Credentials ID Badge on an HTML5 canvas customized with the pilot's name, dynamic rank (Cadet, Navigator, Explorer, Commander), custom rank icon, a vector schematic of the Pragyan rover, a simulated barcode, and a holographic mission patch. Ready to download and share on WhatsApp!
6. **Google Sheets Database Integration**: Logs all registration entries, test performance metrics, and anti-cheat telemetry to a Google Sheet automatically, with a local `localStorage` fallback.

---

## 🛠️ Setup: Connecting Google Sheets

Since this is a static frontend website, data storage is achieved securely through a **Google Apps Script Web App** acting as a serverless database backend.

### Step 1: Create the Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a blank spreadsheet. Name it something like `Moon Day Quiz Submissions`.
2. Do not worry about column headers; the setup script will create them automatically.

### Step 2: Add the Apps Script Code
1. In the Google Sheet menu, click **Extensions** -> **Apps Script**.
2. Erase any default code in `Code.gs`.
3. Open the [google_apps_script.js](file:///google_apps_script.js) file from this project, copy its entire contents, and paste it into the Apps Script editor.
4. Click the **Save** floppy icon.

### Step 3: Run Setup
1. In the toolbar of the Apps Script editor, make sure the dropdown select has `setupSheet` selected.
2. Click **Run**.
3. It will ask for permissions to manage your spreadsheet. Click **Review Permissions**, select your Google account, click **Advanced** -> **Go to Untitled project (unsafe)**, and click **Allow**.
4. Go back to your Google Sheet; you will see that a sheet named **Submissions** has been created with custom column headers and styling!

### Step 4: Deploy as a Web App
1. Click the blue **Deploy** button (top right) -> **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Moon Day Quiz API`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` (It is crucial that this is set to **Anyone** so the static frontend can send data without asking users to log in with Google accounts).
4. Click **Deploy**.
5. Copy the **Web App URL** generated in the dialog box (it will look like `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 5: Update the Frontend Config
1. In your local project directory, open [js/config.js](file:///js/config.js).
2. Paste your copied Web App URL inside the quotes for `GOOGLE_SHEETS_URL`:
   ```javascript
   GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
3. Save the file and push the changes to GitHub. Your live site will now sync scores directly to your Google Sheet!

---

## 📁 File Structure

- [index.html](file:///index.html) - Main markup containing screen sections.
- [styles.css](file:///styles.css) - Moon day theme stylesheets and HUD layouts.
- [js/config.js](file:///js/config.js) - App configuration and sheets link.
- [js/questions.js](file:///js/questions.js) - Database of 100 questions.
- [js/app.js](file:///js/app.js) - Main application controller.
- [google_apps_script.js](file:///google_apps_script.js) - Code for Google Sheets interface.
