/**
 * Google Apps Script for Moon Day Quiz Database Backend
 * 
 * INSTRUCTIONS:
 * 1. Create a new Google Sheet.
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any code in the editor and paste this code.
 * 4. Run the `setupSheet` function once by selecting it from the dropdown and clicking "Run" (to authorize and set up headers).
 * 5. Click "Deploy" (top right) -> "New deployment".
 * 6. Select type "Web app".
 * 7. Set:
 *    - Description: "Moon Day Quiz API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (this is CRITICAL for it to work without login).
 * 8. Click "Deploy", copy the Web App URL, and paste it into `js/config.js` as the `GOOGLE_SHEETS_URL`.
 */

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Set up Submissions sheet
  var subSheet = ss.getSheetByName("Submissions") || ss.insertSheet("Submissions");
  var headers = [
    "Timestamp", 
    "Name", 
    "Email", 
    "Phone", 
    "Place/Organization", 
    "Category (Junior/Senior)", 
    "Score (Correct Answers)", 
    "Questions Attempted", 
    "Accuracy (%)",
    "Time Remaining (s)",
    "Cheated? (Yes/No)",
    "Cheat Actions Count",
    "User Agent"
  ];
  
  // Clear any existing headers and write new ones
  subSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  subSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#d9ead3");
  subSheet.setFrozenRows(1);
  
  Logger.log("Setup complete! Please deploy this script as a Web App with access set to 'Anyone'.");
}

function doPost(e) {
  var result = { status: "error", message: "Unknown error" };
  
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data received" }))
                            .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Submissions");
    
    if (!sheet) {
      sheet = ss.insertSheet("Submissions");
      setupSheet();
    }
    
    var timestamp = new Date();
    var name = data.name || "Anonymous";
    var email = data.email || "";
    var phone = data.phone || "";
    var place = data.place || "";
    var category = data.category || "Junior";
    var score = Number(data.score) || 0;
    var attempted = Number(data.attempted) || 0;
    var timeRemaining = Number(data.timeRemaining) || 0;
    var cheated = data.cheated ? "Yes" : "No";
    var cheatCount = Number(data.cheatCount) || 0;
    var userAgent = data.userAgent || "";
    
    var accuracy = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    
    // Append row to sheet
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      place,
      category,
      score,
      attempted,
      accuracy + "%",
      timeRemaining,
      cheated,
      cheatCount,
      userAgent
    ]);
    
    // Fetch updated leaderboard to return to client immediately
    var leaderboard = getLeaderboard();
    
    result = { 
      status: "success", 
      message: "Score submitted successfully", 
      leaderboard: leaderboard 
    };
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var leaderboard = getLeaderboard();
  return ContentService.createTextOutput(JSON.stringify({ status: "success", leaderboard: leaderboard }))
                        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper to fetch top scores from the sheet
 * Groups into Junior and Senior leaderboards, sorted by Score (descending) and then Timestamp (ascending)
 */
function getLeaderboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Submissions");
  var leaderboard = { junior: [], senior: [] };
  
  if (!sheet) return leaderboard;
  
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return leaderboard; // Only headers
  
  var entries = [];
  // Start from index 1 to skip header row
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    entries.push({
      timestamp: row[0],
      name: row[1],
      place: row[4],
      category: (row[5] || "").toLowerCase(),
      score: Number(row[6]) || 0,
      attempted: Number(row[7]) || 0,
      cheated: row[10] === "Yes"
    });
  }
  
  // Filter out entries that cheated, if desired. Let's keep non-cheated scores on the leaderboard
  var validEntries = entries.filter(function(entry) {
    return !entry.cheated;
  });
  
  // Sort: highest score first, then quickest (earlier timestamp)
  validEntries.sort(function(a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  
  // Extract top 10 for Junior
  var juniorTop = validEntries.filter(function(e) { return e.category === "junior"; }).slice(0, 10);
  // Extract top 10 for Senior
  var seniorTop = validEntries.filter(function(e) { return e.category === "senior"; }).slice(0, 10);
  
  leaderboard.junior = juniorTop.map(function(e) {
    return { name: e.name, place: e.place, score: e.score, attempted: e.attempted };
  });
  
  leaderboard.senior = seniorTop.map(function(e) {
    return { name: e.name, place: e.place, score: e.score, attempted: e.attempted };
  });
  
  return leaderboard;
}
