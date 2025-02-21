/* eslint-disable @typescript-eslint/no-explicit-any */
// @/lib/services/googleSheets.ts

import { google } from "googleapis";

interface SpreadsheetError extends Error {
  code?: string;
  details?: string;
}

// Validate required environment variables
const validateEnvVariables = () => {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing required Google Sheets API credentials");
  }
};

// Initialize Google Sheets client
const initializeGoogleSheets = () => {
  validateEnvVariables();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });

  return google.sheets({ version: "v4", auth });
};

export async function createSpreadsheet(title: string, data: any[][]) {
  try {
    const sheets = initializeGoogleSheets();

    // Create new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
          locale: "en_US",
          timeZone: "UTC",
        },
      },
    });

    if (!spreadsheet.data.spreadsheetId) {
      throw new Error(
        "Failed to create spreadsheet: No spreadsheet ID returned"
      );
    }

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Update spreadsheet with data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values: data },
    });

    // Set permissions to anyone with link can view
    const drive = google.drive({
      version: "v3",
      auth: sheets.context._options.auth,
    });
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: "reader",
        type: "anyone",
        allowFileDiscovery: false,
      },
    });

    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
  } catch (error) {
    const e = error as SpreadsheetError;
    console.error("Spreadsheet creation error:", {
      message: e.message,
      code: e.code,
      details: e.details,
    });
    throw new Error(
      `Failed to create spreadsheet: ${e.message || "Unknown error"}`
    );
  }
}