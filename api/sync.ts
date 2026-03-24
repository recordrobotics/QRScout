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
    let sheet = doc.sheetsByTitle['Data (Entry & Sorting)'];
    if (!sheet) {
      sheet = doc.sheetsByIndex[1]; // fallback
    }
    try {
      await sheet.loadHeaderRow(3);
    } catch (error) {
      console.log('Headers missing on row 3.');
    }
    // Convert the payload structure from local DB to flat array that spreadsheet expects
    // Assuming user wants to dump the flattened payload or we dump raw JSON if they haven't specified headers?
    // Let's flatten the payload using its keys.

    // We should make sure the headers contain all the keys.
    // Map the data exactly to the Google Sheet headers
    const rowsToAdd = matches.map(m => {
      return {
        // Setup & Prematch
        'Scouter Initials': m.scouter || '',
        'Match Number': m.matchNumber || '',
        'Team and Robot': m.robot || m.teamNumber || '', // config.json says "robot"
        'No Show': m.noShow || false,

        // Autonomous
        'Climbed Auto': m.autoClimbed || '',
        'Where Climbed Auto': m.autoClimbPos || '',
        'Fuel Scored (Auto)': m.autoFuelScored || 0, // It is a counter, so fallback to 0

        // Teleop
        'Alliance won auto?': m.allianceWonAuto || false,
        'Mechanical Issue?': m.mechIssue || false,
        'Died?': m.died || false,
        'Tipped/Fell Over': m.tipped || false,
        'Fuel Scored (Teleop)': m.teleopFuelScored || 0, // Counter fallback to 0
        'Bump / Trench': m.crossAbility || '',

        // Endgame
        Climbed: m.climbed || '',
        'Where Climbed': m.climbPos || '',

        // Postmatch
        'Scored How?': m.scoredHow || '',
        'Defended during match?': m.robotDefended || false, // Matches config description
        'Defense Skill': m.defSkill || 0,
        'Intake Effectiveness': m.intakeEff || 1, // Default from your config
        'Yellow/Red Card': m.yc || '',
        Comments: m.co || '',
      };
    });

    // Push the data directly. We completely skip trying to rewrite the headers.
    await sheet.addRows(rowsToAdd);
    console.log(
      'Successfully synced ' + rowsToAdd + ' matches to Google Sheets.',
    );
    return res.status(200).json({ success: true, count: rowsToAdd.length });
  } catch (error: any) {
    console.error('Sheets Sync Error:', error);
    return res
      .status(500)
      .json({ error: error.message || 'Error syncing to Google Sheets' });
  }
}
