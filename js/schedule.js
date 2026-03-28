/* ============================================================
   js/schedule.js
   Loads schedule data from CSV and team names from Teams.MD,
   then builds the schedule/results table on pages/schedule.html.

   NOTE: fetch() requires the page to be served through a web
   server (e.g. VS Code Live Server). It will not work when you
   open the HTML file directly from the file system (file://).
   ============================================================ */

/* Paths are relative to the HTML page (pages/schedule.html),
   so data files are one directory up. */
const CSV_PATH   = '../data/Sched26.csv';
const TEAMS_PATH = '../data/Teams.MD';

/* Short month names used when formatting dates for display. */
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];


/* ------------------------------------------------------------
   init()
   Entry point. Fetches both files in parallel, then builds
   the table. Shows an error message if either fetch fails.
   ------------------------------------------------------------ */
async function init() {
  try {
    /* Promise.all fires both fetches at the same time instead
       of waiting for the first to finish before starting the second. */
    const [csvText, teamsText] = await Promise.all([
      fetch(CSV_PATH).then(res => res.text()),
      fetch(TEAMS_PATH).then(res => res.text())
    ]);

    const teams   = parseTeams(teamsText);   // { BR: "Blackrock CC", ... }
    const matches = parseCSV(csvText);       // array of row objects

    buildTable(matches, teams);

  } catch (err) {
    showError(err);
  }
}


/* ------------------------------------------------------------
   parseTeams(markdown)
   Reads the markdown table in Teams.MD and returns a lookup
   object mapping team codes to full names.

   Input line example:  | BR | Blackrock CC |
   Output:              { BR: "Blackrock CC", ... }
   ------------------------------------------------------------ */
function parseTeams(markdown) {
  const lookup = {};

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();

    /* Skip blank lines and the separator row (|---|) */
    if (!trimmed || trimmed.includes('---')) continue;

    /* Split on pipe, trim each cell, remove empty strings that
       come from the leading and trailing pipes. */
    const cells = trimmed.split('|').map(s => s.trim()).filter(Boolean);

    /* Need exactly two cells: code and name.
       Also skip the header row whose first cell is "Team Code". */
    if (cells.length < 2 || cells[0] === 'Team Code') continue;

    lookup[cells[0]] = cells[1];
  }

  return lookup;
}


/* ------------------------------------------------------------
   parseCSV(text)
   Parses a CSV string into an array of objects.
   The first line is treated as the header row.
   All values are trimmed to handle accidental whitespace in
   the source file (e.g. the "35, 5/31/2026" row).

   Example output row:
     { MatchID: "1", Date: "5/2/2026", Day: "Sat",
       Time: "10:00 AM", Home: "TL", Away: "MCC",
       HomePoints: "", AwayPoints: "" }
   ------------------------------------------------------------ */
function parseCSV(text) {
  const lines = text.trim().split('\n');

  /* First line is the header — build column name array */
  const headers = lines[0].split(',').map(s => s.trim());

  /* Remaining lines are data rows */
  return lines.slice(1).map(line => {
    const values = line.split(',').map(s => s.trim());
    const row = {};
    headers.forEach((header, i) => {
      /* Use empty string as fallback if a column is missing */
      row[header] = values[i] !== undefined ? values[i] : '';
    });
    return row;
  });
}


/* ------------------------------------------------------------
   parseDate(dateStr)
   Converts "M/D/YYYY" into a JavaScript Date object.
   We parse it manually rather than passing the string directly
   to new Date() because date string parsing is inconsistent
   across browsers.
   ------------------------------------------------------------ */
function parseDate(dateStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); /* month is 0-indexed in JS */
}


/* ------------------------------------------------------------
   formatDate(dateStr)
   Converts "5/2/2026" → "May 2, 2026" for display.
   ------------------------------------------------------------ */
function formatDate(dateStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}


/* ------------------------------------------------------------
   buildTable(matches, teams)
   Sorts matches by date and inserts a <tr> for each one into
   the #schedule-body element.

   Completed matches (both points filled in) show the points.
   The winning team's points cell gets the "winner" class
   (bold + dark green) so it stands out visually.
   ------------------------------------------------------------ */
function buildTable(matches, teams) {
  const tbody = document.getElementById('schedule-body');

  /* Sort chronologically — the CSV is mostly in order already
     but sorting ensures correctness regardless of file edits. */
  matches.sort((a, b) => parseDate(a.Date) - parseDate(b.Date));

  for (const match of matches) {
    const tr = document.createElement('tr');

    /* Look up full team names; fall back to the raw code if not found */
    const homeName = teams[match.Home] || match.Home;
    const awayName = teams[match.Away] || match.Away;

    /* A match is complete when both HomePoints and AwayPoints are non-empty */
    const isComplete = match.HomePoints !== '' && match.AwayPoints !== '';

    /* Parse to numbers only when complete — used to determine winner */
    const homePoints = isComplete ? Number(match.HomePoints) : null;
    const awayPoints = isComplete ? Number(match.AwayPoints) : null;

    /* --- Build each cell with textContent (safer than innerHTML) --- */

    /* Date */
    const tdDate = document.createElement('td');
    tdDate.textContent = formatDate(match.Date);
    tr.appendChild(tdDate);

    /* Time */
    const tdTime = document.createElement('td');
    tdTime.textContent = match.Time;
    tr.appendChild(tdTime);

    /* Home Team — bold if home won */
    const tdHome = document.createElement('td');
    tdHome.textContent = homeName;
    if (isComplete && homePoints > awayPoints) {
      tdHome.classList.add('winner');
    }
    tr.appendChild(tdHome);

    /* Away Team — bold if away won */
    const tdAway = document.createElement('td');
    tdAway.textContent = awayName;
    if (isComplete && awayPoints > homePoints) {
      tdAway.classList.add('winner');
    }
    tr.appendChild(tdAway);

    /* Home Points — blank if unplayed, bold green if home won */
    const tdHomePoints = document.createElement('td');
    tdHomePoints.classList.add('points');
    if (isComplete) {
      tdHomePoints.textContent = match.HomePoints;
      if (homePoints > awayPoints) {
        /* Home team won — highlight their score */
        tdHomePoints.classList.add('winner');
      }
    }
    tr.appendChild(tdHomePoints);

    /* Away Points — blank if unplayed, bold green if away won */
    const tdAwayPoints = document.createElement('td');
    tdAwayPoints.classList.add('points');
    if (isComplete) {
      tdAwayPoints.textContent = match.AwayPoints;
      if (awayPoints > homePoints) {
        /* Away team won — highlight their score */
        tdAwayPoints.classList.add('winner');
      }
    }
    tr.appendChild(tdAwayPoints);

    tbody.appendChild(tr);
  }
}


/* ------------------------------------------------------------
   showError(err)
   Replaces the table with a readable error message.
   The most common cause is opening the page via file:// instead
   of through a local web server.
   ------------------------------------------------------------ */
function showError(err) {
  const container = document.getElementById('schedule-container');
  container.innerHTML =
    '<p class="error-message">' +
      'Could not load schedule data. ' +
      'Open this page through a local web server ' +
      '(e.g. the VS Code <strong>Live Server</strong> extension) ' +
      'rather than directly from the file system.' +
    '</p>';
  console.error('Schedule load error:', err);
}


/* Run once the page's HTML is fully parsed. */
document.addEventListener('DOMContentLoaded', init);
