/**
 * ==============================================================================
 * MADHAVBAUG AYURVEDIC CRAMP RELIEF ROLL-ON - GOOGLE APPS SCRIPT WEBHOOK CODE
 * With 24-Hour Duplicate Phone Number Prevention
 * ==============================================================================
 * Google Sheets Setup Guide:
 * 
 * 1. Open Google Sheets (create a new sheet titled "Madhavbaug Cramp Relief Roll-On Leads")
 * 2. Click "Extensions" -> "Apps Script"
 * 3. Delete any default code in Code.gs, paste this entire file contents
 * 4. Click "Save" icon
 * 5. Click "Deploy" (top right) -> "Manage deployments" -> edit to New version OR "New deployment"
 * 6. Under "Select type" (gear icon), choose "Web app"
 * 7. Description: "Madhavbaug Cramp Relief Leads Webhook with Duplicate Prevention"
 * 8. Execute as: "Me" (your Google account)
 * 9. Who has access: "Anyone"
 * 10. Click "Deploy" and authorize permissions
 * 11. Copy the generated Web App URL and paste it into assets/js/main.js (GOOGLE_SHEETS_WEBHOOK_URL)
 * 
 * Active Webhook URL:
 * https://script.google.com/macros/s/AKfycbxlwbY8ZiK-nis2CAFu_VI2UwMTui3Ige95fKxCUfIQASMi-NnCXMK1QxNENDCznnsrtw/exec
 * ==============================================================================
 */

function parseLeadDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal;
  if (typeof dateVal === "string") {
    var parts = dateVal.split(/[\/\s:]/);
    if (parts.length >= 6) {
      return new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4], parts[5]);
    }
    var d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData.contents;
    var data;

    try {
      data = JSON.parse(rawData);
    } catch (parseErr) {
      data = e.parameter;
    }

    // Append header if sheet is new
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Order ID",
        "Name",
        "Contact Number",
        "Delivery Address",
        "City",
        "State",
        "Pincode",
        "Package",
        "Price",
        "Payment Mode",
        "Device / User Agent"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#E6F4EA");
    }

    var phone = data.phone || data.contact || "N/A";
    var cleanPhone = String(phone).replace(/\D/g, "").slice(-10);

    // ========================================================================
    // 24-HOUR DUPLICATE PREVENTION CHECK IN SHEET
    // ========================================================================
    var lastRow = sheet.getLastRow();
    var now = new Date();
    var oneDayAgoMs = 24 * 60 * 60 * 1000;

    if (cleanPhone.length === 10 && lastRow > 1) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var contactColIdx = 4;
      var timeColIdx = 1;

      for (var h = 0; h < headers.length; h++) {
        var hName = String(headers[h]).toLowerCase();
        if (hName.indexOf("contact") !== -1 || hName.indexOf("mobile") !== -1 || hName.indexOf("phone") !== -1) {
          contactColIdx = h + 1;
        }
        if (hName.indexOf("timestamp") !== -1 || hName.indexOf("date") !== -1 || hName.indexOf("time") !== -1) {
          timeColIdx = h + 1;
        }
      }

      var maxCol = Math.max(contactColIdx, timeColIdx);
      var rows = sheet.getRange(2, 1, lastRow - 1, maxCol).getValues();

      for (var i = rows.length - 1; i >= 0; i--) {
        var existingPhone = String(rows[i][contactColIdx - 1] || "").replace(/\D/g, "").slice(-10);
        if (existingPhone === cleanPhone) {
          var rowDate = parseLeadDate(rows[i][timeColIdx - 1]);
          if (!rowDate || isNaN(rowDate.getTime()) || (now.getTime() - rowDate.getTime() < oneDayAgoMs)) {
            return ContentService
              .createTextOutput(JSON.stringify({
                status: "already_submitted",
                isDuplicate: true,
                message: "You have already submitted an order with this contact number. Please wait 24 hours to re-order."
              }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }

    var timestamp = new Date();
    var formattedDate = Utilities.formatDate(timestamp, "Asia/Kolkata", "dd/MM/yyyy HH:mm:ss");
    var orderId = data.orderId || ("CRM-" + Math.floor(100000 + Math.random() * 900000));

    var name = data.name || "N/A";
    var address = data.address || "N/A";
    var city = data.city || "N/A";
    var state = data.state || "N/A";
    var pincode = data.pincode || "N/A";
    var packageSelected = data.package || data.selectedPack || "Pack of 3 (3x 10ml Roll-On Bottles)";
    var price = data.price || "₹699";
    var paymentMode = "Cash On Delivery (COD)";
    var userAgent = data.userAgent || "Web / Mobile";

    sheet.appendRow([
      formattedDate,
      orderId,
      name,
      phone,
      address,
      city,
      state,
      pincode,
      packageSelected,
      price,
      paymentMode,
      userAgent
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        orderId: orderId,
        message: "Order placed successfully on COD!"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.checkContact) {
    var contactToCheck = String(e.parameter.checkContact).replace(/\D/g, "").slice(-10);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var isDuplicate = false;

    if (contactToCheck.length === 10 && lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, Math.min(sheet.getLastColumn(), 5)).getValues();
      var now = new Date();
      var oneDayAgoMs = 24 * 60 * 60 * 1000;

      for (var i = rows.length - 1; i >= 0; i--) {
        var rowContact = String(rows[i][3] || "").replace(/\D/g, "").slice(-10);
        if (rowContact === contactToCheck) {
          var rowTime = parseLeadDate(rows[i][0]);
          if (!rowTime || isNaN(rowTime.getTime()) || (now.getTime() - rowTime.getTime() < oneDayAgoMs)) {
            isDuplicate = true;
            break;
          }
        }
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        contact: contactToCheck,
        isDuplicate: isDuplicate,
        message: isDuplicate ? "You have already submitted the form. Wait for 24hr to resubmit." : "Available"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "online",
      product: "Madhavbaug Ayurvedic Cramp Relief Roll-On",
      version: "1.1.0"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
