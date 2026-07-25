/**
 * Google Apps Script for Moon Day Quiz Database Backend
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Replace the entire code with this script.
 * 4. Select `setupSheet` from the dropdown and click "Run" to initialize.
 * 5. Click "Deploy" (top right) -> "New deployment" -> Web App.
 * 6. Set Who has access: "Anyone".
 */

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  
  subSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  subSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#d9ead3");
  subSheet.setFrozenRows(1);
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
    
    result = { 
      status: "success", 
      message: "Score submitted successfully"
    };
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var sheet = sheets[0];
    for (var k = 0; k < sheets.length; k++) {
      if (sheets[k].getLastRow() > 1) {
        sheet = sheets[k];
        break;
      }
    }
    
    var MIN_ACCURACY_PERCENT = 45; // Minimum 45% accuracy
    var MAX_HUMAN_ATTEMPTS = 80;    // Max 80 questions in 2 mins
    
    var rows = sheet.getDataRange().getValues();
    var juniorFirstMap = {};
    var juniorBestMap = {};
    var seniorFirstMap = {};
    var seniorBestMap = {};
    
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!row || row.length < 8) continue;
      
      var name = String(row[1] || "").trim();
      if (!name || name.toLowerCase() === "name" || name.toLowerCase() === "full name") continue;
      
      var email = String(row[2] || "").toLowerCase().trim();
      var rawPhone = String(row[3] || "").replace(/[^0-9]/g, "");
      var nameKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      // Strict unique identification by Phone or Email
      var uniqueKey = "";
      if (rawPhone && rawPhone.length >= 7) {
        uniqueKey = "phone_" + rawPhone;
      } else if (email && email.indexOf("@") !== -1) {
        uniqueKey = "email_" + email;
      } else {
        uniqueKey = "name_" + nameKey;
      }
      
      var place = String(row[4] || "").trim();
      var category = String(row[5] || "").toLowerCase().trim();
      if (category !== "senior") category = "junior";
      
      var score = Number(row[6]) || 0;
      var attempted = Number(row[7]) || 1;
      if (attempted < 1) attempted = 1;
      
      var accuracy = Math.round((score / attempted) * 100);
      if (isNaN(accuracy) || accuracy > 100) accuracy = 100;
      
      // Filter out spammers
      if (accuracy < MIN_ACCURACY_PERCENT) continue;
      if (attempted > MAX_HUMAN_ATTEMPTS) continue;
      
      var entry = { 
        name: name, 
        place: place, 
        category: category, 
        score: score, 
        attempted: attempted,
        accuracy: accuracy,
        timestamp: row[0]
      };
      
      var firstMap = (category === "senior") ? seniorFirstMap : juniorFirstMap;
      var bestMap = (category === "senior") ? seniorBestMap : juniorBestMap;
      
      // 1st Attempt: Chronologically FIRST logged row ever for this unique key
      if (!firstMap[uniqueKey]) {
        firstMap[uniqueKey] = entry;
      }
      
      // Best Attempt: Keep highest score overall
      if (!bestMap[uniqueKey] || score > bestMap[uniqueKey].score || (score === bestMap[uniqueKey].score && accuracy > bestMap[uniqueKey].accuracy)) {
        bestMap[uniqueKey] = entry;
      }
    }
    
    function sortMap(map) {
      var list = Object.values(map);
      list.sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.attempted - b.attempted;
      });
      return list.slice(0, 20);
    }
    
    var result = {
      status: "success",
      leaderboard: {
        juniorFirst: sortMap(juniorFirstMap),
        juniorBest: sortMap(juniorBestMap),
        seniorFirst: sortMap(seniorFirstMap),
        seniorBest: sortMap(seniorBestMap),
        junior: sortMap(juniorFirstMap),
        senior: sortMap(seniorBestMap)
      }
    };
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
