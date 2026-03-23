import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
// Ensure to add `.env` usage for the credentials or standard template setup.
// Using standard Vercel environment variables. Next.js/Vercel handles `process.env.*` automatically.

// Update just trying to trigger Vercel redeployment

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { matches } = req.body;
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return res.status(400).json({ error: 'No matches provided.' });
  }

  try {
    // Check for valid environment credentials
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GOOGLE_SHEET_ID
    ) {
      console.error('Missing Google Service Account Env Vars');
      return res
        .status(500)
        .json({ error: 'Server is missing Google Sheets credentials.' });
    }

    // Authenticate with Google
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // handle newlines in Vercel env
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth,
    );
    await doc.loadInfo();

    // We assume the target sheet is "Matches" or the first sheet
    let sheet = doc.sheetsByTitle['Matches'];
    if (!sheet) {
      sheet = doc.sheetsByIndex[0]; // fallback
    }

    // Convert the payload structure from local DB to flat array that spreadsheet expects
    // Assuming user wants to dump the flattened payload or we dump raw JSON if they haven't specified headers?
    // Let's flatten the payload using its keys.

    // We should make sure the headers contain all the keys.
    const rowsToAdd = matches.map(m => {
      // m.payload already contains all the form data mapped by `code`.
      // We also inject match metadata.
      return {
        ...m.payload,
        teamNumber: m.teamNumber,
        matchNumber: m.matchNumber,
        scouter: m.scouter,
        timestamp: new Date(m.timestamp).toISOString(),
      };
    });

    // Check if we need to update headers
    const headersNeeded = new Set<string>();
    rowsToAdd.forEach(row => {
      Object.keys(row).forEach(k => headersNeeded.add(k));
    });

    const existingHeaders = [...sheet.headerValues];
    const missingHeaders = Array.from(headersNeeded).filter(
      h => !existingHeaders.includes(h),
    );

    if (missingHeaders.length > 0) {
      await sheet.setHeaderRow([...existingHeaders, ...missingHeaders]);
    }

    // Batch insertion
    await sheet.addRows(rowsToAdd);

    return res.status(200).json({ success: true, count: rowsToAdd.length });
  } catch (error: any) {
    console.error('Sheets Sync Error:', error);
    return res
      .status(500)
      .json({ error: error.message || 'Error syncing to Google Sheets' });
  }
}
